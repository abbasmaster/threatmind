import { addCountry, findAll, findById, batchRegion } from '../domain/country';
import {
  stixDomainObjectEditContext,
  stixDomainObjectCleanContext,
  stixDomainObjectEditField,
  stixDomainObjectAddRelation,
  stixDomainObjectDeleteRelation,
  stixDomainObjectDelete,
} from '../domain/stixDomainObject';
import { RELATION_CREATED_BY, RELATION_OBJECT_LABEL, RELATION_OBJECT_MARKING } from '../schema/stixMetaRelationship';
import { REL_INDEX_PREFIX } from '../schema/general';
import { initBatchLoader } from '../database/grakn';

const batchRegionLoader = initBatchLoader(batchRegion);

const countryResolvers = {
  Query: {
    country: (_, { id }) => findById(id),
    countries: (_, args) => findAll(args),
  },
  Country: {
    region: (country) => batchRegionLoader.load(country.id),
  },
  Mutation: {
    countryEdit: (_, { id }, { user }) => ({
      delete: () => stixDomainObjectDelete(user, id),
      fieldPatch: ({ input }) => stixDomainObjectEditField(user, id, input),
      contextPatch: ({ input }) => stixDomainObjectEditContext(user, id, input),
      contextClean: () => stixDomainObjectCleanContext(user, id),
      relationAdd: ({ input }) => stixDomainObjectAddRelation(user, id, input),
      relationDelete: ({ toId, relationship_type: relationshipType }) =>
        stixDomainObjectDeleteRelation(user, id, toId, relationshipType),
    }),
    countryAdd: (_, { input }, { user }) => addCountry(user, input),
  },
};

export default countryResolvers;
