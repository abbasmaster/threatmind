import { addIngestion, findAllPaginated, findById, ingestionDelete, ingestionEditField, } from './ingestion-taxii-domain';
import type { Resolvers } from '../../generated/graphql';

const ingestionTaxiiResolvers: Resolvers = {
  Query: {
    ingestionTaxii: (_, { id }, context) => findById(context, context.user, id),
    ingestionTaxiis: (_, args, context) => findAllPaginated(context, context.user, args),
  },
  Mutation: {
    ingestionTaxiiAdd: (_, { input }, context) => {
      return addIngestion(context, context.user, input);
    },
    ingestionTaxiiDelete: (_, { id }, context) => {
      return ingestionDelete(context, context.user, id);
    },
    ingestionTaxiiFieldPatch: (_, { id, input }, context) => {
      return ingestionEditField(context, context.user, id, input);
    },
  },
};

export default ingestionTaxiiResolvers;
