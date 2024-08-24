import { type BasicStoreEntityIngestionTaxii, ENTITY_TYPE_INGESTION_TAXII } from './ingestion-types';
import { createEntity, deleteElementById, patchAttribute, updateAttribute } from '../../database/middleware';
import { listAllEntities, listEntitiesPaginated, storeLoadById } from '../../database/middleware-loader';
import { BUS_TOPICS } from '../../config/conf';
import { publishUserAction } from '../../listener/UserActionListener';
import { notify } from '../../database/redis';
import { ABSTRACT_INTERNAL_OBJECT } from '../../schema/general';
import type { AuthContext, AuthUser } from '../../types/user';
import { type EditInput, type IngestionTaxiiAddInput } from '../../generated/graphql';
import { verifyIngestionAuthenticationContent } from './ingestion-common';
import { registerConnectorForIngestion, unregisterConnectorForIngestion } from './ingestion';

export const findById = (context: AuthContext, user: AuthUser, ingestionId: string) => {
  return storeLoadById<BasicStoreEntityIngestionTaxii>(context, user, ingestionId, ENTITY_TYPE_INGESTION_TAXII);
};

export const findAllPaginated = async (context: AuthContext, user: AuthUser, opts = {}) => {
  return listEntitiesPaginated<BasicStoreEntityIngestionTaxii>(context, user, [ENTITY_TYPE_INGESTION_TAXII], opts);
};

export const findAllTaxiiIngestions = async (context: AuthContext, user: AuthUser, opts = {}) => {
  return listAllEntities<BasicStoreEntityIngestionTaxii>(context, user, [ENTITY_TYPE_INGESTION_TAXII], opts);
};

export const addIngestion = async (context: AuthContext, user: AuthUser, input: IngestionTaxiiAddInput) => {
  if (input.authentication_value) {
    verifyIngestionAuthenticationContent(input.authentication_type, input.authentication_value);
  }
  const { element, isCreation } = await createEntity(context, user, input, ENTITY_TYPE_INGESTION_TAXII, { complete: true });
  if (isCreation) {
    await registerConnectorForIngestion(context, 'TAXII', element);
    await publishUserAction({
      user,
      event_type: 'mutation',
      event_scope: 'create',
      event_access: 'administration',
      message: `creates taxii ingestion \`${input.name}\``,
      context_data: { id: element.id, entity_type: ENTITY_TYPE_INGESTION_TAXII, input }
    });
  }
  return element;
};

export const patchTaxiiIngestion = async (context: AuthContext, user: AuthUser, id: string, patch: object) => {
  const patched = await patchAttribute(context, user, id, ENTITY_TYPE_INGESTION_TAXII, patch);
  return patched.element;
};

export const ingestionEditField = async (context: AuthContext, user: AuthUser, ingestionId: string, input: EditInput[]) => {
  if (input.some(((editInput) => editInput.key === 'authentication_value'))) {
    const ingestionConfiguration = await findById(context, user, ingestionId);
    const authenticationValueField = input.find(((editInput) => editInput.key === 'authentication_value'));
    if (authenticationValueField && authenticationValueField.value[0]) {
      verifyIngestionAuthenticationContent(ingestionConfiguration.authentication_type, authenticationValueField.value[0]);
    }
  }
  const { element } = await updateAttribute(context, user, ingestionId, ENTITY_TYPE_INGESTION_TAXII, input);
  await registerConnectorForIngestion(context, 'TAXII', element);
  await publishUserAction({
    user,
    event_type: 'mutation',
    event_scope: 'update',
    event_access: 'administration',
    message: `updates \`${input.map((i) => i.key).join(', ')}\` for taxii ingestion \`${element.name}\``,
    context_data: { id: ingestionId, entity_type: ENTITY_TYPE_INGESTION_TAXII, input }
  });
  return notify(BUS_TOPICS[ABSTRACT_INTERNAL_OBJECT].EDIT_TOPIC, element, user);
};

export const ingestionDelete = async (context: AuthContext, user: AuthUser, ingestionId: string) => {
  const deleted = await deleteElementById(context, user, ingestionId, ENTITY_TYPE_INGESTION_TAXII);
  await unregisterConnectorForIngestion(context, deleted);
  await publishUserAction({
    user,
    event_type: 'mutation',
    event_scope: 'delete',
    event_access: 'administration',
    message: `deletes taxii ingestion \`${deleted.name}\``,
    context_data: { id: ingestionId, entity_type: ENTITY_TYPE_INGESTION_TAXII, input: deleted }
  });
  return ingestionId;
};
