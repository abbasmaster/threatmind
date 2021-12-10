import { assetSingularizeSchema as singularizeSchema, objectTypeMapping } from '../asset-mappings.js';
import {compareValues, filterValues, updateQuery} from '../../utils.js';
import { 
  getSelectSparqlQuery,
  getReducer,
  deleteMultipleAssetsQuery,
  removeMultipleAssetsFromInventoryQuery,
  deleteAssetQuery,
  removeAssetFromInventoryQuery,
  insertLocationQuery,
  selectLocationQuery,
  selectAllLocations,
  deleteLocationQuery,
  locationPredicateMap
} from './sparql-query.js';

const assetCommonResolvers = {
  Query: {
    assetList: async ( _, args, context, info  ) => { 
      var sparqlQuery = getSelectSparqlQuery('ASSET', context.selectMap.getNode("node") );
      var reducer = getReducer('ASSET');
      const response = await context.dataSources.Stardog.queryAll( 
        context.dbName, 
        sparqlQuery,
        singularizeSchema,
        // args.first,       // limit
        // args.offset,      // offset
        args.filter       // filter
      )
      if (Array.isArray(response) && response.length > 0) {
        // build array of edges
        const edges = [];
        let limit = (args.first === undefined ? response.length : args.first) ;
        let offset = (args.offset === undefined ? 0 : args.offset) ;
        let assetList ;
        if (args.orderedBy !== undefined ) {
          assetList = response.sort(compareValues(args.orderedBy, args.orderMode ));
        } else {
          assetList = response;
        }

        // for each asset in the result set
        for (let asset of assetList) {
          // skip down past the offset
          if ( offset ) {
            offset--
            continue
          }

          // filter out non-matching entries if a filter is to be applied
          if ('filters' in args && args.filters.length > 0) {
            if (!filterValues(asset, args.filters, args.filterMode) ) {
              continue
            }
          }

          // if haven't reached limit to be returned
          if ( limit ) {
            let edge = {
              cursor: asset.iri,
              node: reducer( asset ),
            }
            edges.push( edge )
            limit-- ;
          }
        }
        return {
          pageInfo: {
            startCursor: edges[0].cursor,
            endCursor: edges[edges.length-1].cursor,
            hasNextPage: (args.first > assetList.length),
            hasPreviousPage: (args.offset > 0),
            globalCount: assetList.length,
          },
          edges: edges,
        }
      } else {
        return [];
      }
    },
    asset: async ( _, args, context, info ) => {
      var sparqlQuery = getSelectSparqlQuery('ASSET', context.selectMap.getNode('asset'),args.id);
      var reducer = getReducer('ASSET');
      const response = await context.dataSources.Stardog.queryById( context.dbName, sparqlQuery, singularizeSchema )
      if (response === undefined ) return null;
      const first = response[0];
      if (first === undefined) return null;
      return( reducer( first ) );
    },
    itAssetList: async ( _, args, context, info  ) => { 
      var sparqlQuery = getSelectSparqlQuery('IT-ASSET', context.selectMap.getNode("node") );
      var reducer = getReducer('IT-ASSET');
      const response = await context.dataSources.Stardog.queryAll( 
        context.dbName, 
        sparqlQuery,
        singularizeSchema,
        // args.first,       // limit
        // args.offset,      // offset
        args.filter       // filter
      )
      if (Array.isArray(response) && response.length > 0) {
        // build array of edges
        const edges = [];
        let limit = (args.first === undefined ? response.length : args.first) ;
        let offset = (args.offset === undefined ? 0 : args.offset) ;
        let assetList ;
        if (args.orderedBy !== undefined ) {
          assetList = response.sort(compareValues(args.orderedBy, args.orderMode ));
        } else {
          assetList = response;
        }

        // for each asset in the result set
        for (let asset of assetList) {
          // skip down past the offset
          if ( offset ) {
            offset--
            continue
          }

          // filter out non-matching entries if a filter is to be applied
          if ('filters' in args && args.filters.length > 0) {
            if (!filterValues(asset, args.filters, args.filterMode) ) {
              continue
            }
          }

          // if haven't reached limit to be returned
          if ( limit ) {
            let edge = {
              cursor: asset.iri,
              node: reducer( asset ),
            }
            edges.push( edge )
            limit-- ;
          }
        }
        return {
          pageInfo: {
            startCursor: edges[0].cursor,
            endCursor: edges[edges.length-1].cursor,
            hasNextPage: (args.first > assetList.length),
            hasPreviousPage: (args.offset > 0),
            globalCount: assetList.length,
          },
          edges: edges,
        }
      } else {
        return [];
      }
    },
    itAsset: async ( _, args, context, info ) => {
      var sparqlQuery = getSelectSparqlQuery('IT-ASSET', context.selectMap.getNode('itAsset'),args.id);
      var reducer = getReducer('IT-ASSET');
      const response = await context.dataSources.Stardog.queryById( context.dbName, sparqlQuery, singularizeSchema )
      if (response === undefined ) return null;
      const first = response[0];
      if (first === undefined) return null;
      return( reducer( first ) );
    },
    assetLocationList: async (_, args, context) => {
      const { dbName } = context;
      const query = selectAllLocations(context.selectMap.getNode("node"));
      const response = await context.dataSources.Stardog.queryAll(dbName, query, singularizeSchema, args.filter);
      if (Array.isArray(response) && response.length > 0) {
        const edges = [];
        const reducer = getReducer("ASSET-LOCATION");
        let limit = (args.first === undefined ? response.length : args.first) ;
        let offset = (args.offset === undefined ? 0 : args.offset) ;
        let locationList ;
        if (args.orderedBy !== undefined ) {
          locationList = response.sort(compareValues(args.orderedBy, args.orderMode ));
        } else {
          locationList = response;
        }

        // for each asset in the result set
        for (let location of locationList) {
          // skip down past the offset
          if (offset) {
            offset--
            continue
          }

          // filter out non-matching entries if a filter is to be applied
          if ('filters' in args && args.filters.length > 0) {
            if (!filterValues(location, args.filters, args.filterMode) ) {
              continue
            }
          }

          // if haven't reached limit to be returned
          if (limit) {
            let edge = {
              cursor: location.iri,
              node: reducer(location),
            }
            edges.push(edge)
            limit--;
          }
        }
        return {
          pageInfo: {
            startCursor: edges[0].cursor,
            endCursor: edges[edges.length-1].cursor,
            hasNextPage: (args.first > locationList.length),
            hasPreviousPage: (args.offset > 0),
            globalCount: locationList.length,
          },
          edges: edges,
        }
      } else {
        return [];
      }
    },
    assetLocation: async (_, {id}, context) => {
      const { dbName } = context;
      const query = selectLocationQuery(id, context.selectMap.getNode("assetLocation"));
      const response = await context.dataSources.Stardog.queryById(dbName, query, singularizeSchema);
      if(response === undefined || response.length === 0) return null;
      const reducer = getReducer("ASSET-LOCATION");
      return reducer(response[0]);
    }
  },
  Mutation: {
    deleteAsset: async (_, {id}, context) => {
      const dbName = context.dbName;
      const dq = deleteAssetQuery(id);
      await context.dataSources.Stardog.delete(dbName, dq);
      const ra = removeAssetFromInventoryQuery(id);
      await context.dataSources.Stardog.delete(dbName, ra);
    },
    deleteAssets: async (_, { ids }, context) => {
      const dbName = context.dbName;
      const dq = deleteMultipleAssetsQuery(ids);
      await context.dataSources.Stardog.delete(dbName, dq);
      const ra = removeMultipleAssetsFromInventoryQuery(ids);
      await context.dataSources.Stardog.delete(dbName, ra);
    },
    createAssetLocation: async (_, {input}, context) => {
      const { dbName } = context;
      const {id, query} = insertLocationQuery(input);
      await context.dataSources.Stardog.create(dbName, query);
      const select = selectLocationQuery(id, context.selectMap.getNode("createAssetLocation"));
      const result = await context.dataSources.Stardog.queryById(dbName, select, singularizeSchema);
      const reducer = getReducer("ASSET-LOCATION");
      return reducer(result[0]);
    },
    deleteAssetLocation: async (_, {id}, context) => {
      const { dbName } = context;
      const query = deleteLocationQuery(id);
      await context.dataSources.Stardog.delete(dbName, query);
      return id;
    },
    editAssetLocation: async (_, {id, input}, context) => {
      const { dbName } = context;
      const query = updateQuery(
          `http://darklight.ai/ns/common#CivicLocation-${id}`,
          "http://darklight.ai/ns/common#CivicLocation",
          input,
          locationPredicateMap
      )
      await context.dataSources.Stardog.edit(dbName, query);
      const select = selectLocationQuery(id, context.selectMap.getNode("editAssetLocation"));
      const result = await context.dataSources.Stardog.queryById(dbName, select, singularizeSchema);
      const reducer = getReducer("ASSET-LOCATION");
      return reducer(result[0]);
    }
  },
  // Map enum GraphQL values to data model required values
  AssetType: {
    account: 'account',
    appliance: 'appliance',
    application_software: 'application-software',
    circuit: 'circuit',
    computer_account: 'computer-account',
    compute_device: 'compute-device',
    data: 'data',
    database: 'database',
    directory_server: 'directory-server',
    dns_server: 'dns-server',
    email_server: 'email-server',
    embedded: 'embedded',
    firewall: 'firewall',
    guidance: 'guidance',
    hypervisor: 'hypervisor',
    load_balancer: 'load-balancer',
    network_device: 'network-device',
    network: 'network',
    operating_system: 'operating-system',
    pbx: 'pbx',
    physical_device: 'physical-device',
    plan: 'plan',
    policy: 'policy',
    printer: 'printer',
    procedure: 'procedure',
    router: 'router',
    server: 'server',
    service_account: 'service-account',
    service: 'service',
    software: 'software',
    standard: 'standard',
    storage_array: 'storage-array',
    switch: 'switch',
    system: 'system',
    user_account: 'user-account',
    validation: 'validation',
    voip_device: 'voip-device',
    voip_handset: 'voip-handset',
    voip_router: 'voip-router',
    web_server: 'web-server',
    web_site: 'web-site',
    workstation: 'workstation',
  },
  Asset: {
    __resolveType: ( item ) => {
      return objectTypeMapping[item.entity_type];
    },
    locations: ( parent, ) => {
    },
    external_references: ( parent, ) => {
    },
    notes: ( parent, ) => {
    },
  },
  AssetLocation: {
    __resolveType: ( item ) => {
      return objectTypeMapping[item.entity_type]
    }
  },
  HardwareAsset: {
    __resolveType: ( item ) => {
      return objectTypeMapping[item.entity_type];
    }
  },
  ItAsset: {
    __resolveType: ( item ) => {
      return objectTypeMapping[item.entity_type];
    }
  },
  AssetKind: {
    __resolveType: ( item ) => {
      return objectTypeMapping[item.entity_type];
    }
  },
  HardwareKind: {
    __resolveType: ( item ) => {
      return objectTypeMapping[item.entity_type];
    }
  },
  ItAssetKind: {
    __resolveType: ( item ) => {
      return objectTypeMapping[item.entity_type];
    }
  },
  IpAddress: {
    __resolveType: ( item ) => {
      return objectTypeMapping[item.entity_type];
    },
  },
  PortRange: {
    __resolveType: ( item ) => {
      return objectTypeMapping[item.entity_type];
    }
  },
};

export default assetCommonResolvers;
