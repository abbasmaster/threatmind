import { readFileSync } from 'node:fs';
import Redis, { Cluster, RedisOptions } from 'ioredis';
import Redlock from 'redlock';
import * as jsonpatch from 'fast-json-patch';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import * as R from 'ramda';
import type { ChainableCommander } from 'ioredis/built/utils/RedisCommander';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import type { ClusterOptions } from 'ioredis/built/cluster/ClusterOptions';
import conf, { booleanConf, configureCA, DEV_MODE, getStoppingState, logApp, } from '../config/conf';
import {
  EVENT_TYPE_CREATE,
  EVENT_TYPE_DELETE,
  EVENT_TYPE_MERGE,
  EVENT_TYPE_UPDATE,
  generateCreateMessage,
  generateDeleteMessage,
  generateMergeMessage,
  isEmptyField,
  isInferredIndex,
  waitInSec,
} from './utils';
import { INTERNAL_EXPORTABLE_TYPES, isStixExportableData } from '../schema/stixCoreObject';
import { DatabaseError, FunctionalError, UnsupportedError } from '../config/errors';
import { now, utcDate } from '../utils/format';
import { convertStoreToStix } from './stix-converter';
import type { StoreObject, StoreRelation } from '../types/store';
import type { AuthContext, AuthUser } from '../types/user';
import type {
  CreateEventOpts,
  DeleteEvent,
  Event,
  EventOpts,
  MergeEvent,
  StreamEvent,
  UpdateEvent,
  UpdateEventOpts
} from '../types/event';
import type { StixCoreObject } from '../types/stix-common';
import type { EditContext } from '../generated/graphql';
import { telemetry } from '../config/tracing';
import { filterEmpty } from '../types/type-utils';
import type { ClusterConfig } from '../manager/clusterManager';

export const REDIS_PREFIX = conf.get('redis:namespace') ? `${conf.get('redis:namespace')}:` : '';
const USE_SSL = booleanConf('redis:use_ssl', false);
const INCLUDE_INFERENCES = booleanConf('redis:include_inferences', false);
const REDIS_CA = conf.get('redis:ca').map((path: string) => readFileSync(path));
const REDIS_STREAM_NAME = `${REDIS_PREFIX}stream.opencti`;

export const EVENT_CURRENT_VERSION = '4';
const MAX_RETRY_COMMAND = 10;

const isStreamPublishable = (instance: StoreObject, opts: EventOpts) => {
  const isInferredInstance = isInferredIndex(instance._index);
  if (isInferredInstance && !INCLUDE_INFERENCES) return false;
  return opts.publishStreamEvent === undefined || opts.publishStreamEvent;
};

const redisOptions = (): RedisOptions => ({
  keyPrefix: REDIS_PREFIX,
  username: conf.get('redis:username'),
  password: conf.get('redis:password'),
  tls: USE_SSL ? { ...configureCA(REDIS_CA), servername: conf.get('redis:hostname') } : undefined,
  retryStrategy: /* istanbul ignore next */ (times) => {
    if (getStoppingState()) return null;
    return Math.min(times * 50, 2000);
  },
  lazyConnect: true,
  enableAutoPipelining: false,
  enableOfflineQueue: true,
  maxRetriesPerRequest: MAX_RETRY_COMMAND,
  showFriendlyErrorStack: DEV_MODE,
});

const clusterOptions = (): ClusterOptions => ({
  keyPrefix: REDIS_PREFIX,
  lazyConnect: true,
  enableAutoPipelining: false,
  enableOfflineQueue: true,
  redisOptions: redisOptions(),
  scaleReads: conf.get('redis:scale_reads') ?? 'all',
  showFriendlyErrorStack: DEV_MODE,
});

const createRedisClient = (provider: string, isCluster: boolean): Cluster | Redis => {
  let client: Cluster | Redis;
  if (isCluster) {
    const startupNodes = conf.get('redis:hostnames');
    client = new Redis.Cluster(startupNodes, clusterOptions());
  } else {
    const singleOptions = redisOptions();
    client = new Redis({ ...singleOptions, port: conf.get('redis:port'), host: conf.get('redis:hostname') });
  }
  client.on('close', () => logApp.info(`[REDIS] Redis '${provider}' client closed`));
  client.on('ready', () => logApp.info(`[REDIS] Redis '${provider}' client ready`));
  client.on('error', (err) => logApp.error(`[REDIS] Redis '${provider}' client error`, { error: err }));
  client.on('reconnecting', () => logApp.info(`[REDIS] '${provider}' Redis client reconnecting`));
  return client;
};

// Initialization of clients
const redisClients: {
  base: Cluster | Redis | undefined,
  lock: Cluster | Redis | undefined,
  pubsub?: RedisPubSub | undefined,
} = {
  base: undefined,
  lock: undefined,
  pubsub: undefined,
};
export const initializeRedisClients = () => {
  const isCluster = conf.get('redis:mode') === 'cluster';
  logApp.info(`[REDIS] Initializing redis (${isCluster ? 'cluster' : 'Single'} mode) clients`);
  redisClients.base = createRedisClient('Client base', isCluster);
  redisClients.lock = createRedisClient('Client lock', isCluster);
  const clientPublisher: Cluster | Redis = createRedisClient('Pubsub publisher', isCluster);
  const clientSubscriber: Cluster | Redis = createRedisClient('Pubsub subscriber', isCluster);
  redisClients.pubsub = new RedisPubSub({ publisher: clientPublisher as any, subscriber: clientSubscriber as any });
};
// endregion

// region pubsub
const getClientBase = (): Cluster | Redis => {
  if (!redisClients.base) {
    throw DatabaseError('[REDIS] Clients not initialized');
  }
  return redisClients.base;
};
const getClientLock = (): Cluster | Redis => {
  if (!redisClients.lock) {
    throw DatabaseError('[REDIS] Clients not initialized');
  }
  return redisClients.lock;
};
const getClientPubSub = (): RedisPubSub => {
  if (!redisClients.pubsub) {
    throw DatabaseError('[REDIS] Clients not initialized');
  }
  return redisClients.pubsub;
};
export const pubSubAsyncIterator = (topic: string) => {
  return getClientPubSub().asyncIterator(topic);
};
export const pubSubSubscription = async <T>(topic: string, onMessage: (message: T) => void) => {
  const subscription = await getClientPubSub().subscribe(topic, onMessage, { pattern: true });
  const unsubscribe = () => getClientPubSub().unsubscribe(subscription);
  return { topic, unsubscribe };
};
// endregion

// region basic operations
export const redisTx = async (client: Cluster | Redis, chain: (tx: ChainableCommander) => void) => {
  const tx = client.multi();
  try {
    await chain(tx);
    return await tx.exec();
  } catch (e) {
    throw DatabaseError('Redis Tx error', { error: e });
  }
};
const updateObjectRaw = async (tx: ChainableCommander, id: string, input: object) => {
  const data = R.flatten(R.toPairs(input));
  await tx.hset(id, data);
};
const updateObjectCounterRaw = async (tx: ChainableCommander, id: string, field: string, number: number) => {
  await tx.hincrby(id, field, number);
};
const delKeyWithList = async (keyId: string, listIds: string[]) => {
  const keyPromise = getClientBase().del(keyId);
  const listsPromise = listIds.map((listId) => getClientBase().zrem(listId, keyId));
  await Promise.all([keyPromise, ...listsPromise]);
};
const setKeyWithList = async (keyId: string, listIds: string[], keyData: any, expirationTime: number) => {
  const keyPromise = getClientBase().set(keyId, JSON.stringify(keyData), 'EX', expirationTime);
  const listsPromise = listIds.map((listId) => redisTx(getClientBase(), async (tx) => {
    // add/update the instance with its creation date in the ordered list of instances
    const time = new Date().getTime();
    tx.zadd(listId, time, keyId);
    // remove the too old keys from the list of instances
    tx.zremrangebyscore(listId, '-inf', time - (expirationTime * 1000));
  }));
  await Promise.all([keyPromise, ...listsPromise]);
  return keyData;
};
const keysFromList = async (listId: string, expirationTime?: number) => {
  if (expirationTime) {
    const time = new Date().getTime();
    await getClientBase().zremrangebyscore('platform-deletions', '-inf', time - (120 * 1000));
  }
  const instances = await getClientBase().zrange(listId, 0, -1);
  if (instances && instances.length > 0) {
    const instancesConfig = await Promise.all(instances.map((i) => getClientBase().get(i)
      .then((d) => (d ? { id: i, data: d } : null))));
    return instancesConfig.filter(filterEmpty).map((n) => {
      return { redis_key_id: n.id, ...JSON.parse(n.data) };
    });
  }
  return [];
};
// endregion

// region session
export const clearSessions = async () => {
  const contextIds = await getClientBase().zrange('platform_sessions', 0, -1);
  return Promise.all(contextIds.map((id) => getClientBase().del(id)));
};
export const getSession = async (key: string) => {
  const session = await getClientBase().get(key);
  return session ? JSON.parse(session) : undefined;
};
export const getSessionTtl = (key: string) => {
  return getClientBase().ttl(key);
};
export const setSession = (key: string, value: any, expirationTime: number) => {
  return setKeyWithList(key, ['platform_sessions'], value, expirationTime);
};
export const killSession = (key: string) => {
  return delKeyWithList(key, ['platform_sessions']);
};
export const getSessionKeys = () => {
  return getClientBase().zrange('platform_sessions', 0, -1);
};
export const getSessions = () => {
  return keysFromList('platform_sessions');
};
export const extendSession = async (sessionId: string, sess: any, extension: number) => {
  const sessionExtension = await getClientBase().multi()
    .set(sessionId, JSON.stringify(sess))
    .expire(sessionId, extension)
    .exec();
  if (sessionExtension) {
    const [, expireCommand] = Array.from(sessionExtension);
    return expireCommand[1];
  }
  return -1;
};
// endregion

export const redisIsAlive = async () => {
  try {
    await getClientBase().get('test-key');
    return true;
  } catch {
    throw DatabaseError('Redis seems down');
  }
};
export const getRedisVersion = async () => {
  const serverInfo = await getClientBase().call('INFO') as string;
  const versionString = serverInfo.split('\r\n')[1];
  return versionString.split(':')[1];
};

/* istanbul ignore next */
export const notify = (topic: string, instance: any, user: AuthUser) => {
  // Instance can be empty if user is currently looking for a deleted instance
  if (instance) {
    getClientPubSub().publish(topic, { instance, user });
  }
  return instance;
};

// region user context (clientContext)
const FIVE_MINUTES = 5 * 60;
export const setEditContext = async (user: AuthUser, instanceId: string, input: EditContext) => {
  const data = R.assoc('name', user.user_email, input);
  const listIds = [`context:instance:${instanceId}`, `context:user:${user.id}`];
  return setKeyWithList(`edit:${instanceId}:${user.id}`, listIds, data, FIVE_MINUTES);
};
export const fetchEditContext = async (instanceId: string) => {
  return keysFromList(`context:instance:${instanceId}`, FIVE_MINUTES);
};
export const delEditContext = async (user: AuthUser, instanceId: string) => {
  const listIds = [`context:instance:${instanceId}`, `context:user:${user.id}`];
  return delKeyWithList(`edit:${instanceId}:${user.id}`, listIds);
};
export const delUserContext = async (user: AuthUser) => {
  const contextIds = await getClientBase().zrange(`context:user:${user.id}`, 0, -1);
  return Promise.all(contextIds.map((id) => getClientBase().del(id)));
};
// endregion

// region locking (clientContext)
export const redisAddDeletions = async (internalIds: Array<string>) => {
  const ids = Array.isArray(internalIds) ? internalIds : [internalIds];
  await redisTx(getClientLock(), async (tx) => {
    const time = new Date().getTime();
    // remove the too old keys from the list of instances
    tx.zremrangebyscore('platform-deletions', '-inf', time - (120 * 1000));
    // add/update the instance with its creation date in the ordered list of instances
    tx.zadd('platform-deletions', time, ...ids);
  });
};
export const redisFetchLatestDeletions = async () => {
  const time = new Date().getTime();
  await getClientLock().zremrangebyscore('platform-deletions', '-inf', time - (120 * 1000));
  return getClientLock().zrange('platform-deletions', 0, -1);
};
const checkParticipantsDeletion = async (participantIds: Array<string>) => {
  const latestDeletions = await redisFetchLatestDeletions();
  const deletedParticipantsIds = participantIds.filter((x) => latestDeletions.includes(x));
  if (deletedParticipantsIds.length > 0) {
    // noinspection ExceptionCaughtLocallyJS
    throw FunctionalError('Cant update an element based on deleted dependencies', { deletedParticipantsIds });
  }
};
export const lockResource = async (resources: Array<string>, automaticExtension = true) => {
  let timeout: NodeJS.Timeout | undefined;
  const locks = R.uniq(resources).map((id) => `{locks}:${id}`);
  const automaticExtensionThreshold = conf.get('app:concurrency:extension_threshold');
  const retryCount = conf.get('app:concurrency:retry_count');
  const retryDelay = conf.get('app:concurrency:retry_delay');
  const retryJitter = conf.get('app:concurrency:retry_jitter');
  const maxTtl = conf.get('app:concurrency:max_ttl');
  const redlock = new Redlock([getClientLock()], { retryCount, retryDelay, retryJitter });
  // Get the lock
  const lock = await redlock.acquire(locks, maxTtl); // Force unlock after maxTtl
  let expiration = Date.now() + maxTtl;
  const extend = async () => {
    try {
      await lock.extend(maxTtl);
      expiration = Date.now() + maxTtl;
      if (automaticExtension) {
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        queue();
      }
    } catch (e) {
      logApp.debug('[REDIS] Failed to extend resource', { locks });
    }
  };
  const queue = () => {
    const timeToWait = expiration - Date.now() - automaticExtensionThreshold;
    timeout = setTimeout(() => extend(), timeToWait);
  };
  if (automaticExtension) {
    queue();
  }
  // If lock succeed we need to be sure that delete occurred just before the resolution/lock
  await checkParticipantsDeletion(resources);
  // Return the lock and capable actions
  return {
    extend,
    unlock: async () => {
      // First clear the auto extends if needed
      if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }
      // Then unlock in redis
      try {
        // Only try to unlock if redis connection is ready
        if (getClientLock().status === 'ready') {
          await lock.release();
        }
      } catch (e) {
        logApp.warn('[REDIS] Failed to unlock resource', { locks });
      }
    },
  };
};
// endregion

// region opencti stream
const streamTrimming = conf.get('redis:trimming') || 0;
const mapJSToStream = (event: any) => {
  const cmdArgs: Array<string> = [];
  Object.keys(event).forEach((key) => {
    const value = event[key];
    if (value !== undefined) {
      cmdArgs.push(key);
      cmdArgs.push(JSON.stringify(value));
    }
  });
  return cmdArgs;
};
const pushToStream = async (context: AuthContext, user: AuthUser, client: Cluster | Redis, instance: StoreObject, event: Event, opts: EventOpts) => {
  if (isStreamPublishable(instance, opts)) {
    const pushToStreamFn = async () => {
      if (streamTrimming) {
        await client.call('XADD', REDIS_STREAM_NAME, 'MAXLEN', '~', streamTrimming, '*', ...mapJSToStream(event));
      } else {
        await client.call('XADD', REDIS_STREAM_NAME, '*', ...mapJSToStream(event));
      }
    };
    telemetry(context, user, 'INSERT STREAM', {
      [SemanticAttributes.DB_NAME]: 'stream_engine',
    }, pushToStreamFn);
  }
};

// Merge
interface MergeImpacts {
  updatedRelations: Array<string>;
  dependencyDeletions: Array<StoreObject>;
}
const buildMergeEvent = (user: AuthUser, previous: StoreObject, instance: StoreObject, sourceEntities: Array<StoreObject>, impacts: MergeImpacts): MergeEvent => {
  const message = generateMergeMessage(instance, sourceEntities);
  const { updatedRelations, dependencyDeletions } = impacts;
  const previousStix = convertStoreToStix(previous) as StixCoreObject;
  const currentStix = convertStoreToStix(instance) as StixCoreObject;
  return {
    version: EVENT_CURRENT_VERSION,
    type: EVENT_TYPE_MERGE,
    scope: INTERNAL_EXPORTABLE_TYPES.includes(instance.entity_type) ? 'internal' : 'external',
    message,
    origin: user.origin,
    data: currentStix,
    context: {
      patch: jsonpatch.compare(previousStix, currentStix),
      reverse_patch: jsonpatch.compare(currentStix, previousStix),
      sources: R.map((s) => convertStoreToStix(s) as StixCoreObject, sourceEntities),
      deletions: R.map((s) => convertStoreToStix(s) as StixCoreObject, dependencyDeletions),
      shifts: updatedRelations,
    }
  };
};
export const storeMergeEvent = async (
  context: AuthContext,
  user: AuthUser,
  initialInstance: StoreObject,
  mergedInstance: StoreObject,
  sourceEntities: Array<StoreObject>,
  impacts: MergeImpacts,
  opts: EventOpts,
) => {
  try {
    const event = buildMergeEvent(user, initialInstance, mergedInstance, sourceEntities, impacts);
    await pushToStream(context, user, getClientBase(), mergedInstance, event, opts);
    return event;
  } catch (e) {
    throw DatabaseError('Error in store merge event', { error: e });
  }
};
// Update
const buildUpdateEvent = (user: AuthUser, previous: StoreObject, instance: StoreObject, message: string, opts: UpdateEventOpts): UpdateEvent => {
  // Build and send the event
  const stix = convertStoreToStix(instance) as StixCoreObject;
  const previousStix = convertStoreToStix(previous) as StixCoreObject;
  const patch = jsonpatch.compare(previousStix, stix);
  const previousPatch = jsonpatch.compare(stix, previousStix);
  if (patch.length === 0 || previousPatch.length === 0) {
    throw UnsupportedError('Update event must contains a valid previous patch');
  }
  if (patch.length === 1 && patch[0].path === '/modified') {
    throw UnsupportedError('Update event must contains more operation than just modified/updated_at value');
  }
  return {
    version: EVENT_CURRENT_VERSION,
    type: EVENT_TYPE_UPDATE,
    scope: INTERNAL_EXPORTABLE_TYPES.includes(instance.entity_type) ? 'internal' : 'external',
    message,
    origin: user.origin,
    data: stix,
    commit: opts.commit,
    context: {
      patch,
      reverse_patch: previousPatch
    }
  };
};
export const storeUpdateEvent = async (context: AuthContext, user: AuthUser, previous: StoreObject, instance: StoreObject, message: string, opts: UpdateEventOpts = {}) => {
  try {
    if (isStixExportableData(instance)) {
      const event = buildUpdateEvent(user, previous, instance, message, opts);
      await pushToStream(context, user, getClientBase(), instance, event, opts);
      return event;
    }
    return undefined;
  } catch (e) {
    throw DatabaseError('Error in store update event', { error: e });
  }
};
// Create
export const buildCreateEvent = (user: AuthUser, instance: StoreObject, message: string): Event => {
  const stix = convertStoreToStix(instance) as StixCoreObject;
  return {
    version: EVENT_CURRENT_VERSION,
    type: EVENT_TYPE_CREATE,
    scope: INTERNAL_EXPORTABLE_TYPES.includes(instance.entity_type) ? 'internal' : 'external',
    message,
    origin: user.origin,
    data: stix,
  };
};
export const storeCreateRelationEvent = async (context: AuthContext, user: AuthUser, instance: StoreRelation, opts: CreateEventOpts = {}) => {
  try {
    if (isStixExportableData(instance)) {
      const { withoutMessage = false } = opts;
      const message = withoutMessage ? '-' : generateCreateMessage(instance);
      const event = buildCreateEvent(user, instance, message);
      await pushToStream(context, user, getClientBase(), instance, event, opts);
      return event;
    }
    return undefined;
  } catch (e) {
    throw DatabaseError('Error in store create relation event', { error: e });
  }
};
export const storeCreateEntityEvent = async (context: AuthContext, user: AuthUser, instance: StoreObject, message: string, opts: CreateEventOpts = {}) => {
  try {
    if (isStixExportableData(instance)) {
      const event = buildCreateEvent(user, instance, message);
      await pushToStream(context, user, getClientBase(), instance, event, opts);
      return event;
    }
    return undefined;
  } catch (e) {
    throw DatabaseError('Error in store create entity event', { error: e });
  }
};

// Delete
export const buildDeleteEvent = async (
  user: AuthUser,
  instance: StoreObject,
  message: string,
  deletions: Array<StoreObject>,
): Promise<DeleteEvent> => {
  const stix = convertStoreToStix(instance) as StixCoreObject;
  return {
    version: EVENT_CURRENT_VERSION,
    type: EVENT_TYPE_DELETE,
    scope: INTERNAL_EXPORTABLE_TYPES.includes(instance.entity_type) ? 'internal' : 'external',
    message,
    origin: user.origin,
    data: stix,
    context: {
      deletions: R.map((s) => convertStoreToStix(s) as StixCoreObject, deletions)
    }
  };
};
export const storeDeleteEvent = async (context: AuthContext, user: AuthUser, instance: StoreObject, deletions: Array<StoreObject>, opts: EventOpts = {}) => {
  try {
    if (isStixExportableData(instance)) {
      const message = generateDeleteMessage(instance);
      const event = await buildDeleteEvent(user, instance, message, deletions);
      await pushToStream(context, user, getClientBase(), instance, event, opts);
      return event;
    }
    return undefined;
  } catch (e) {
    throw DatabaseError('Error in store delete event', { error: e });
  }
};
export const deleteStream = () => getClientBase().call('DEL', REDIS_STREAM_NAME);

const mapStreamToJS = ([id, data]: any): StreamEvent => {
  const count = data.length / 2;
  const obj: any = {};
  for (let i = 0; i < count; i += 1) {
    obj[data[2 * i]] = JSON.parse(data[2 * i + 1]);
  }
  return { id, event: obj.type, data: obj };
};
export const fetchStreamInfo = async () => {
  const res: any = await getClientBase().xinfo('STREAM', REDIS_STREAM_NAME);
  const info: any = R.fromPairs(R.splitEvery(2, res) as any);
  const firstId = info['first-entry'][0];
  const firstEventDate = utcDate(parseInt(firstId.split('-')[0], 10)).toISOString();
  const lastId = info['last-entry'][0];
  const lastEventDate = utcDate(parseInt(lastId.split('-')[0], 10)).toISOString();
  return { lastEventId: lastId, firstEventId: firstId, firstEventDate, lastEventDate, streamSize: info.length };
};

const processStreamResult = async (results: Array<any>, callback: any, withInternal: boolean) => {
  const streamData = R.map((r) => mapStreamToJS(r), results);
  const filteredEvents = streamData.filter((s) => {
    return withInternal ? true : (s.data.scope ?? 'external') === 'external';
  });
  const lastEventId = filteredEvents.length > 0 ? R.last(filteredEvents)?.id : `${new Date().getTime()}-0`;
  await callback(filteredEvents, lastEventId);
  return lastEventId;
};

export const STREAM_BATCH_TIME = 15000;
const MAX_RANGE_MESSAGES = 100;

export interface StreamProcessor {
  info: () => Promise<object>;
  start: (from: string | undefined) => Promise<void>;
  shutdown: () => Promise<void>;
}

export const createStreamProcessor = (user: AuthUser, provider: string, withInternal: boolean, callback: any): StreamProcessor => {
  let client: Cluster | Redis;
  let startEventId: string;
  let processingLoopPromise: Promise<void>;
  let streamListening = true;
  const processInfo = async () => {
    return fetchStreamInfo();
  };
  const processStep = async () => {
    // since previous call is async (and blocking) we should check if we are still running before processing the message
    if (!streamListening) {
      return false;
    }
    try {
      // Consume the data stream
      const streamResult = await client.call(
        'XREAD',
        'COUNT',
        MAX_RANGE_MESSAGES,
        'BLOCK',
        STREAM_BATCH_TIME,
        'STREAMS',
        REDIS_STREAM_NAME,
        startEventId
      ) as any[];
      // Process the event results
      if (streamResult && streamResult.length > 0) {
        const [, results] = streamResult[0];
        const lastElementId = await processStreamResult(results, callback, withInternal);
        startEventId = lastElementId || startEventId;
      } else {
        await processStreamResult([], callback, withInternal);
      }
    } catch (err) {
      logApp.error(`Error in redis streams read for ${provider}`, { error: err });
      await waitInSec(2);
    }
    return streamListening;
  };
  const processingLoop = async () => {
    while (streamListening) {
      if (!(await processStep())) {
        break;
      }
    }
  };
  return {
    info: async () => processInfo(),
    start: async (start = 'live') => {
      let fromStart = start;
      if (isEmptyField(fromStart)) {
        fromStart = 'live';
      }
      startEventId = fromStart === 'live' ? '$' : fromStart;
      const isCluster = conf.get('redis:mode') === 'cluster';
      logApp.info(`[STREAM] Starting stream processor at ${startEventId} for ${provider}`);
      client = await createRedisClient(provider, isCluster); // Create client for this processing loop
      processingLoopPromise = processingLoop();
    },
    shutdown: async () => {
      logApp.info(`[STREAM] Shutdown stream processor for ${provider}`);
      streamListening = false;
      if (processingLoopPromise) {
        await processingLoopPromise;
      }
      logApp.info('[STREAM] Stream processor current promise terminated');
      if (client) {
        await client.disconnect();
      }
    },
  };
};
// endregion

// region work handling
export const redisDeleteWorks = async (internalIds: Array<string>) => {
  const ids = Array.isArray(internalIds) ? internalIds : [internalIds];
  return Promise.all(ids.map((id) => getClientBase().del(id)));
};
export const redisGetWork = async (internalId: string) => {
  return getClientBase().hgetall(internalId);
};
export const redisUpdateWorkFigures = async (workId: string) => {
  const timestamp = now();
  const clientBase = getClientBase();
  if (workId.includes('_')) { // Handle a connector status.
    const [, connectorId] = workId.split('_');
    await clientBase.set(`work:${connectorId}`, workId);
  }
  await redisTx(clientBase, async (tx) => {
    await updateObjectCounterRaw(tx, workId, 'import_processed_number', 1);
    await updateObjectRaw(tx, workId, { import_last_processed: timestamp });
  });
  const updatedMetrics = await redisGetWork(workId);
  const { import_processed_number: pn, import_expected_number: en }: any = updatedMetrics;
  return { isComplete: parseInt(pn, 10) === parseInt(en, 10), total: pn, expected: en };
};
export const redisGetConnectorStatus = async (connectorId: string) => {
  return getClientBase().get(`work:${connectorId}`);
};
export const redisUpdateActionExpectation = async (user: AuthUser, workId: string, expectation: number) => {
  await redisTx(getClientBase(), async (tx) => {
    await updateObjectCounterRaw(tx, workId, 'import_expected_number', expectation);
  });
  return workId;
};
// endregion

// region cluster handling
const CLUSTER_LIST_KEY = 'platform_cluster';
const CLUSTER_NODE_EXPIRE = 2 * 60; // 2 minutes
export const registerClusterInstance = async (instanceId: string, instanceConfig: ClusterConfig) => {
  return setKeyWithList(instanceId, [CLUSTER_LIST_KEY], instanceConfig, CLUSTER_NODE_EXPIRE);
};
export const getClusterInstances = async () => {
  return keysFromList(CLUSTER_LIST_KEY, CLUSTER_NODE_EXPIRE);
};
// endregion
