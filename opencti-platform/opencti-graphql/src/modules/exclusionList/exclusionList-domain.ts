import { Readable } from 'stream';
import { BUS_TOPICS, isFeatureEnabled } from '../../config/conf';
import { type FileUploadData, uploadToStorage } from '../../database/file-storage-helper';
import { deleteFile } from '../../database/file-storage';
import { createInternalObject, deleteInternalObject } from '../../domain/internalObject';
import { listEntitiesPaginated, storeLoadById } from '../../database/middleware-loader';
import type { AuthContext, AuthUser } from '../../types/user';
import { type BasicStoreEntityExclusionList, ENTITY_TYPE_EXCLUSION_LIST, type StoreEntityExclusionList } from './exclusionList-types';
import { type EditInput, type ExclusionListContentAddInput, type ExclusionListFileAddInput, type QueryExclusionListsArgs } from '../../generated/graphql';
import { notify, redisUpdateExclusionListStatus } from '../../database/redis';
import { FunctionalError } from '../../config/errors';
import { updateAttribute } from '../../database/middleware';
import { publishUserAction } from '../../listener/UserActionListener';

const filePath = 'exclusionLists';

const isExclusionListEnabled = isFeatureEnabled('EXCLUSION_LIST');

export const findById = (context: AuthContext, user: AuthUser, id: string) => {
  return storeLoadById<BasicStoreEntityExclusionList>(context, user, id, ENTITY_TYPE_EXCLUSION_LIST);
};

export const findAll = (context: AuthContext, user: AuthUser, args: QueryExclusionListsArgs) => {
  return listEntitiesPaginated<BasicStoreEntityExclusionList>(context, user, [ENTITY_TYPE_EXCLUSION_LIST], args);
};

const storeAndCreateExclusionList = async (context: AuthContext, user: AuthUser, input: ExclusionListContentAddInput | ExclusionListFileAddInput, file: FileUploadData) => {
  const fullFile = await file;
  const exclusionFile = { ...fullFile, filename: `${input.name}.txt` };
  const { upload } = await uploadToStorage(context, user, filePath, exclusionFile, {});

  const exclusionListToCreate = {
    name: input.name,
    description: input.description,
    enabled: true,
    exclusion_list_entity_types: input.exclusion_list_entity_types,
    file_id: upload.id
  };

  const createdExclusionList = createInternalObject<StoreEntityExclusionList>(context, user, exclusionListToCreate, ENTITY_TYPE_EXCLUSION_LIST);
  await redisUpdateExclusionListStatus({ last_refresh_ask_date: (new Date()).toString() });
  return createdExclusionList;
};

export const addExclusionListContent = async (context: AuthContext, user: AuthUser, input: ExclusionListContentAddInput) => {
  if (!isExclusionListEnabled) throw new Error('Feature not yet available');
  const file = {
    createReadStream: () => Readable.from(Buffer.from(input.content, 'utf-8')),
    filename: `${input.name}.txt`,
    mimetype: 'text/plain',
  };

  return storeAndCreateExclusionList(context, user, input, file);
};
export const addExclusionListFile = async (context: AuthContext, user: AuthUser, input: ExclusionListFileAddInput) => {
  if (!isExclusionListEnabled) throw new Error('Feature not yet available');
  return storeAndCreateExclusionList(context, user, input, input.file);
};

export const fieldPatchExclusionList = async (context: AuthContext, user: AuthUser, id: string, input: EditInput[]) => {
  const exclusionList = await findById(context, user, id);
  if (!exclusionList) {
    throw FunctionalError(`Exclusion list ${id} cannot be found`);
  }

  const { element } = await updateAttribute(context, user, id, ENTITY_TYPE_EXCLUSION_LIST, input);
  await redisUpdateExclusionListStatus({ last_refresh_ask_date: (new Date()).toString() });
  await publishUserAction({
    user,
    event_type: 'mutation',
    event_scope: 'update',
    event_access: 'administration',
    message: `updates \`${input.map((i) => i.key).join(', ')}\` for exclusion list \`${element.name}\``,
    context_data: { id, entity_type: ENTITY_TYPE_EXCLUSION_LIST, input }
  });
  return notify(BUS_TOPICS[ENTITY_TYPE_EXCLUSION_LIST].EDIT_TOPIC, element, user);
};

export const deleteExclusionList = async (context: AuthContext, user: AuthUser, exclusionListId: string) => {
  if (!isExclusionListEnabled) throw new Error('Feature not yet available');
  const exclusionList = await findById(context, user, exclusionListId);
  await deleteFile(context, user, exclusionList.file_id);
  const deletedExclusionList = deleteInternalObject(context, user, exclusionListId, ENTITY_TYPE_EXCLUSION_LIST);
  await redisUpdateExclusionListStatus({ last_refresh_ask_date: (new Date()).toString() });
  return deletedExclusionList;
};
