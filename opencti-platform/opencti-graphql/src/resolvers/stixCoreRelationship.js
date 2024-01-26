import { withFilter } from 'graphql-subscriptions';
import { BUS_TOPICS } from '../config/conf';
import {
  addStixCoreRelationship,
  findAll,
  findById,
  stixCoreRelationshipAddRelation,
  stixCoreRelationshipAddRelations,
  stixCoreRelationshipCleanContext,
  stixCoreRelationshipDelete,
  stixCoreRelationshipDeleteByFromAndTo,
  stixCoreRelationshipDeleteRelation,
  stixCoreRelationshipEditContext,
  stixCoreRelationshipEditField,
  stixCoreRelationshipsDistribution,
  stixCoreRelationshipsExportAsk,
  stixCoreRelationshipsMultiTimeSeries,
  stixCoreRelationshipsNumber
} from '../domain/stixCoreRelationship';
import { fetchEditContext, pubSubAsyncIterator } from '../database/redis';
import withCancel from '../graphql/subscriptionWrapper';
import { batchLoader, stixLoadByIdStringify, timeSeriesRelations } from '../database/middleware';
import { ABSTRACT_STIX_CORE_RELATIONSHIP } from '../schema/general';
import { elBatchIds } from '../database/engine';
import { findById as findStatusById, getTypeStatuses } from '../domain/status';
import { batchCreators } from '../domain/user';
import { stixCoreRelationshipOptions } from '../schema/stixCoreRelationship';
import { addOrganizationRestriction, removeOrganizationRestriction } from '../domain/stix';
import {
  batchInternalRels,
  batchMarkingDefinitions,
  casesPaginated,
  containersPaginated,
  externalReferencesPaginated,
  notesPaginated,
  opinionsPaginated,
  reportsPaginated,
  stixCoreObjectsExportPush
} from '../domain/stixCoreObject';
import { numberOfContainersForObject } from '../domain/container';
import { paginatedForPathWithEnrichment } from '../modules/internal/document/document-domain';
import { RELATION_CREATED_BY, RELATION_GRANTED_TO, RELATION_KILL_CHAIN_PHASE, RELATION_OBJECT_LABEL } from '../schema/stixRefRelationship';

const loadByIdLoader = batchLoader(elBatchIds);
const relBatchLoader = batchLoader(batchInternalRels);
const markingDefinitionsLoader = batchLoader(batchMarkingDefinitions);
const creatorsLoader = batchLoader(batchCreators);

const stixCoreRelationshipResolvers = {
  Query: {
    stixCoreRelationship: (_, { id }, context) => findById(context, context.user, id),
    stixCoreRelationships: (_, args, context) => findAll(context, context.user, args),
    stixCoreRelationshipsTimeSeries: (_, args, context) => timeSeriesRelations(context, context.user, args),
    stixCoreRelationshipsMultiTimeSeries: (_, args, context) => stixCoreRelationshipsMultiTimeSeries(context, context.user, args),
    stixCoreRelationshipsDistribution: (_, args, context) => stixCoreRelationshipsDistribution(context, context.user, args),
    stixCoreRelationshipsNumber: (_, args, context) => stixCoreRelationshipsNumber(context, context.user, args),
    stixCoreRelationshipsExportFiles: (_, { exportContext, first }, context) => {
      const path = `export/${exportContext.entity_type}${exportContext.entity_id ? `/${exportContext.entity_id}` : ''}`;
      const opts = { first, entity_id: exportContext.entity_id, entity_type: exportContext.entity_type };
      return paginatedForPathWithEnrichment(context, context.user, path, exportContext.entity_id, opts);
    },
  },
  StixCoreRelationshipsOrdering: stixCoreRelationshipOptions.StixCoreRelationshipsOrdering,
  StixCoreRelationship: {
    // region batch loaded through rel de-normalization. Cant be ordered of filtered
    from: (rel, _, context) => (rel.from ? rel.from : loadByIdLoader.load({ id: rel.fromId, type: rel.fromType }, context, context.user)),
    to: (rel, _, context) => (rel.to ? rel.to : loadByIdLoader.load({ id: rel.toId, type: rel.toType }, context, context.user)),
    // region batch loaded through rel de-normalization. Cant be ordered of filtered
    creators: (rel, _, context) => creatorsLoader.load(rel.creator_id, context, context.user),
    createdBy: (rel, _, context) => relBatchLoader.load({ element: rel, type: RELATION_CREATED_BY }, context, context.user),
    objectOrganization: (rel, _, context) => relBatchLoader.load({ element: rel, type: RELATION_GRANTED_TO }, context, context.user),
    objectLabel: (rel, _, context) => relBatchLoader.load({ element: rel, type: RELATION_OBJECT_LABEL }, context, context.user),
    killChainPhases: (rel, _, context) => relBatchLoader.load({ element: rel, type: RELATION_KILL_CHAIN_PHASE }, context, context.user),
    objectMarking: (rel, _, context) => markingDefinitionsLoader.load(rel, context, context.user),
    // endregion
    // region inner listing - cant be batch loaded
    externalReferences: (rel, args, context) => externalReferencesPaginated(context, context.user, rel.id, args),
    containers: (rel, args, context) => containersPaginated(context, context.user, rel.id, args),
    reports: (rel, args, context) => reportsPaginated(context, context.user, rel.id, args),
    cases: (rel, args, context) => casesPaginated(context, context.user, rel.id, args),
    notes: (rel, args, context) => notesPaginated(context, context.user, rel.id, args),
    opinions: (rel, args, context) => opinionsPaginated(context, context.user, rel.id, args),
    // endregion
    editContext: (rel) => fetchEditContext(rel.id),
    toStix: (rel, _, context) => stixLoadByIdStringify(context, context.user, rel.id),
    status: (entity, _, context) => (entity.x_opencti_workflow_id ? findStatusById(context, context.user, entity.x_opencti_workflow_id) : null),
    workflowEnabled: async (entity, _, context) => {
      const statusesEdges = await getTypeStatuses(context, context.user, ABSTRACT_STIX_CORE_RELATIONSHIP);
      return statusesEdges.edges.length > 0;
    },
    // Figures
    containersNumber: (rel, args, context) => numberOfContainersForObject(context, context.user, { ...args, objectId: rel.id }),
  },
  Mutation: {
    stixCoreRelationshipEdit: (_, { id }, context) => ({
      delete: () => stixCoreRelationshipDelete(context, context.user, id),
      fieldPatch: ({ input, commitMessage, references }) => {
        return stixCoreRelationshipEditField(context, context.user, id, input, { commitMessage, references });
      },
      contextPatch: ({ input }) => stixCoreRelationshipEditContext(context, context.user, id, input),
      contextClean: () => stixCoreRelationshipCleanContext(context, context.user, id),
      relationAdd: ({ input }) => stixCoreRelationshipAddRelation(context, context.user, id, input),
      relationsAdd: ({ input, commitMessage, references }) => stixCoreRelationshipAddRelations(context, context.user, id, input, { commitMessage, references }),
      // eslint-disable-next-line max-len
      relationDelete: ({ toId, relationship_type: relationshipType, commitMessage, references }) => stixCoreRelationshipDeleteRelation(context, context.user, id, toId, relationshipType, { commitMessage, references }),
      restrictionOrganizationAdd: ({ organizationId }) => addOrganizationRestriction(context, context.user, id, organizationId),
      restrictionOrganizationDelete: ({ organizationId }) => removeOrganizationRestriction(context, context.user, id, organizationId),
    }),
    stixCoreRelationshipAdd: (_, { input }, context) => addStixCoreRelationship(context, context.user, input),
    stixCoreRelationshipsExportAsk: (_, args, context) => stixCoreRelationshipsExportAsk(context, context.user, args),
    stixCoreRelationshipsExportPush: (_, { entity_id, entity_type, file, listFilters }, context) => {
      return stixCoreObjectsExportPush(context, context.user, entity_id, entity_type, file, listFilters);
    },
    stixCoreRelationshipDelete: (_, { fromId, toId, relationship_type: relationshipType }, context) => {
      return stixCoreRelationshipDeleteByFromAndTo(context, context.user, fromId, toId, relationshipType);
    },
  },
  Subscription: {
    stixCoreRelationship: {
      resolve: /* v8 ignore next */ (payload) => payload.instance,
      subscribe: /* v8 ignore next */ (_, { id }, context) => {
        stixCoreRelationshipEditContext(context, context.user, id);
        const filtering = withFilter(
          () => pubSubAsyncIterator(BUS_TOPICS[ABSTRACT_STIX_CORE_RELATIONSHIP].EDIT_TOPIC),
          (payload) => {
            if (!payload) return false; // When disconnected, an empty payload is dispatched.
            return payload.user.id !== context.user.id && payload.instance.id === id;
          }
        )(_, { id }, context);
        return withCancel(filtering, () => {
          stixCoreRelationshipCleanContext(context, context.user, id);
        });
      },
    },
  },
};

export default stixCoreRelationshipResolvers;
