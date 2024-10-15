import { SEMATTRS_DB_NAME, SEMATTRS_DB_OPERATION } from '@opentelemetry/semantic-conventions';
import { convertIpv4ToBinary, convertIpv6ToBinary, getIsRange } from '../utils/dataPrep';
import type { ExclusionListProperties, IpAddrListType } from './exclusionList/constants';
import type { BasicStoreIdentifier, StoreEntity, StoreRelation } from '../types/store';
import { logApp } from '../config/conf';
import { UnsupportedError } from '../config/errors';
import { telemetry } from '../config/tracing';
import type { AuthContext, AuthUser } from '../types/user';
import type { StixId, StixObject } from '../types/stix-common';
import { ENTITY_TYPE_CONNECTOR, ENTITY_TYPE_GROUP, ENTITY_TYPE_ROLE, ENTITY_TYPE_STREAM_COLLECTION, ENTITY_TYPE_USER } from '../schema/internalObject';
import { ENTITY_TYPE_RESOLVED_FILTERS } from '../schema/stixDomainObject';
import { ENTITY_TYPE_TRIGGER } from '../modules/notification/notification-types';
import { convertStoreToStix } from './stix-converter';
import { ENTITY_TYPE_PLAYBOOK } from '../modules/playbook/playbook-types';
import { type BasicStoreEntityPublicDashboard, ENTITY_TYPE_PUBLIC_DASHBOARD } from '../modules/publicDashboard/publicDashboard-types';
import { wait } from './utils';
import * as exclusionList from './exclusionList/index';
import { exclusionListEntityType } from './exclusionList/constants';

const STORE_ENTITIES_LINKS: Record<string, string[]> = {
  // Filters must be reset depending on stream and triggers modifications
  [ENTITY_TYPE_STREAM_COLLECTION]: [ENTITY_TYPE_RESOLVED_FILTERS],
  [ENTITY_TYPE_TRIGGER]: [ENTITY_TYPE_RESOLVED_FILTERS],
  [ENTITY_TYPE_PLAYBOOK]: [ENTITY_TYPE_RESOLVED_FILTERS],
  [ENTITY_TYPE_CONNECTOR]: [ENTITY_TYPE_RESOLVED_FILTERS],
  // Users must be reset depending on roles and groups modifications
  [ENTITY_TYPE_ROLE]: [ENTITY_TYPE_USER],
  [ENTITY_TYPE_GROUP]: [ENTITY_TYPE_USER],
};

const STORE_EXCLUSION_LIST = [
  exclusionList.vpnIpv4List,
  exclusionList.vpnIpv6List,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsHostNameList,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV4List,
  exclusionList.publicDnsV6List,
  exclusionList.openaiGptBotList,
  exclusionList.captivePortalsList,
  exclusionList.bankWebsiteList,
  exclusionList.googleBotList,
];

// const STORE_TEST = [exclusionList.googleBotList];
const STORE_TEST_2 = [exclusionList.vpnIpv4List];

const STORE_EXCLUSION_LIST_BINARY = [];

const convertIpaddr = (list) => {
  const initialeValue: IpAddrListType = { ipv4: [], ipv6: [] };

  const qsd = list.reduce((acc: IpAddrListType, ip) => {
    const ipAddress = ip.split('/')[0];
    const isIpv6 = ipAddress.indexOf(':') !== -1;
    const isIpv4 = ipAddress.indexOf('.') !== -1;
    if (!isIpv4 && !isIpv6) return acc;
    const isRange = getIsRange(ip);
    const ipAddressRangeValue = ip.split('/')?.[1] ?? '0';
    if (isIpv4) {
      const result = convertIpv4ToBinary(ipAddress, isRange, parseInt(ipAddressRangeValue, 10));
      return { ...acc, ipv4: [...acc.ipv4, result] };
    }
    if (isIpv6) {
      const result = convertIpv6ToBinary(ipAddress, isRange, parseInt(ipAddressRangeValue, 10));
      return { ...acc, ipv6: [...acc.ipv6, result] };
    }
  }, initialeValue);
  console.log('qsd : ', qsd);

  // const aze = list.map((ip) => {
  //   const ipAddress = ip.split('/')[0];
  //   const isIpv6 = ipAddress.indexOf(':') !== -1;
  //   const isIpv4 = ipAddress.indexOf('.') !== -1;
  //   if (!isIpv4 && !isIpv6) return ip;
  //   return ip;
  //   const isRange = getIsRange(ip);
  //   const ipAddressRangeValue = ip.split('/')?.[1] ?? '0';
  //   // if (isIpv6) return convertIpv6ToBinary(ipAddress, isRange, parseInt(ipAddressRangeValue, 10));
  //   if (isIpv4) {
  //     return convertIpv4ToBinary(ipAddress, isRange, parseInt(ipAddressRangeValue, 10));
  //   }
  // });
  // console.log('aze : ', aze);
  return qsd;
};

const convertTest = () => {
  STORE_TEST_2.forEach((item) => {
    if (item.type.includes(exclusionListEntityType.IPV4_ADDR) || item.type.includes(exclusionListEntityType.IPV6_ADDR)) {
      const newList = convertIpaddr(item.list);
      STORE_EXCLUSION_LIST_BINARY.push({ ...item, list: newList });
      return;
    }
    STORE_EXCLUSION_LIST_BINARY.push(item);
  });
};

convertTest();

export const getExclusionListsFromCache = (): ExclusionListProperties[] | undefined => {
  if (!STORE_EXCLUSION_LIST.length) return undefined;
  return STORE_EXCLUSION_LIST;
};

export const getExclusionListByNameFromCache = (name: string): ExclusionListProperties | undefined => {
  if (!STORE_EXCLUSION_LIST.length) return undefined;
  return STORE_EXCLUSION_LIST.find((list) => list.name === name);
};

export const getExclusionListsByTypeFromCache = (exclusionListType: string): ExclusionListProperties[] => {
  return STORE_EXCLUSION_LIST.filter((list) => list.type.includes(exclusionListType));
};

export const getExclusionListsByTypeFromCache2 = (exclusionListType: string): ExclusionListProperties[] => {
  return STORE_EXCLUSION_LIST_BINARY.filter((list) => list.type.includes(exclusionListType));
};

const cache: any = {};

const buildStoreEntityMap = <T extends BasicStoreIdentifier>(entities: Array<T>) => {
  const entityById = new Map();
  for (let i = 0; i < entities.length; i += 1) {
    const entity = entities[i];
    const ids = [entity.internal_id, ...(entity.x_opencti_stix_ids ?? [])];
    if (entity.standard_id) {
      ids.push(entity.standard_id);
    }
    for (let index = 0; index < ids.length; index += 1) {
      const id = ids[index];
      entityById.set(id, entity);
    }
  }
  return entityById;
};

const buildStorePublicDashboardMap = <T extends BasicStoreEntityPublicDashboard>(entities: Array<T>) => {
  const entityByUriKey = new Map();
  for (let i = 0; i < entities.length; i += 1) {
    const entity = entities[i];
    const { uri_key } = entity;
    entityByUriKey.set(uri_key, entity);
  }
  return entityByUriKey;
};

export const writeCacheForEntity = (entityType: string, data: unknown) => {
  cache[entityType] = data;
};

export const resetCacheForEntity = (entityType: string) => {
  const types = [entityType, ...(STORE_ENTITIES_LINKS[entityType] ?? [])];
  types.forEach((type) => {
    if (cache[type]) {
      logApp.debug('Reset cache for entity', { type, entityType });
      cache[type].values = undefined;
    } else {
      // This entity type is not part of the caching system
    }
  });
};

export const dynamicCacheUpdater = (instance: StoreEntity | StoreRelation) => {
  // Dynamic update of filtering cache
  const currentFiltersValues = cache[ENTITY_TYPE_RESOLVED_FILTERS]?.values;
  if (currentFiltersValues?.has(instance.internal_id)) {
    const convertedInstance = convertStoreToStix(instance);
    currentFiltersValues.set(instance.internal_id, convertedInstance);
  }
};

// not exported because mixes 2 types
// (map or array according to the data type storage in the cache)
// use either getEntitiesMapFromCache or getEntitiesListFromCache in export
const getEntitiesFromCache = async <T extends BasicStoreIdentifier | StixObject>(
  context: AuthContext, user: AuthUser, type: string
): Promise<Array<T> | Map<string, T>> => {
  const getEntitiesFromCacheFn = async (): Promise<Array<T> | Map<string, T>> => {
    const fromCache = cache[type];
    if (!fromCache) {
      throw UnsupportedError('Cache configuration type not supported', { type });
    }
    if (!fromCache.values) {
      if (!fromCache.inProgress) {
        fromCache.inProgress = true;
        fromCache.values = await fromCache.fn();
        fromCache.inProgress = false;
      } else {
        await wait(100);
        return getEntitiesFromCache(context, user, type);
      }
    }
    return fromCache.values ?? (type === ENTITY_TYPE_RESOLVED_FILTERS ? new Map() : []);
  };
  return telemetry(context, user, `CACHE ${type}`, {
    [SEMATTRS_DB_NAME]: 'cache_engine',
    [SEMATTRS_DB_OPERATION]: 'select',
  }, getEntitiesFromCacheFn);
};

// get the list of the entities in the cache for a given type
export const getEntitiesListFromCache = async <T extends BasicStoreIdentifier | StixObject>(
  context: AuthContext, user: AuthUser, type: string
): Promise<Array<T>> => {
  if (type === ENTITY_TYPE_RESOLVED_FILTERS) {
    const map = await getEntitiesFromCache(context, user, type) as Map<string, T>;
    const result: T[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const value of map.values()) {
      result.push(value);
    }
    return result;
  }
  return await getEntitiesFromCache(context, user, type) as T[];
};

// get a map <id, instance> of the entities in the cache for a given type
export const getEntitiesMapFromCache = async <T extends BasicStoreIdentifier | StixObject>(
  context: AuthContext, user: AuthUser, type: string
): Promise<Map<string | StixId, T>> => {
  if (type === ENTITY_TYPE_RESOLVED_FILTERS) {
    return await getEntitiesFromCache(context, user, type) as Map<string, T>; // map of <standard_id, instance>
  }
  if (type === ENTITY_TYPE_PUBLIC_DASHBOARD) {
    const data = await getEntitiesFromCache(context, user, type) as BasicStoreEntityPublicDashboard[];
    return buildStorePublicDashboardMap(data); // map of <uri_key, instance>
  }
  const data = await getEntitiesFromCache(context, user, type) as BasicStoreIdentifier[];
  return buildStoreEntityMap(data); // map of <id, instance> for all the instance ids (internal_id, standard_id, stix ids)
};

export const getEntityFromCache = async <T extends BasicStoreIdentifier>(context: AuthContext, user: AuthUser, type: string): Promise<T> => {
  const data = await getEntitiesListFromCache<T>(context, user, type);
  return data[0];
};
