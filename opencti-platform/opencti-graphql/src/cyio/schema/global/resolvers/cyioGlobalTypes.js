import { globalSingularizeSchema as singularizeSchema } from '../global-mappings.js';
import { compareValues, updateQuery, filterValues } from '../../utils.js';
import { UserInputError } from "apollo-server-express";
import {objectMap} from '../global-utils.js';
import { 
  getReducer,
  selectAddressQuery, 
  selectAllAddresses, 
  selectAllPhoneNumbers,
  selectPhoneNumberQuery,
} from "./sparql-query.js";

const cyioGlobalTypeResolvers = {
  Query: {
    civicAddresses: async (_, args, { dbName, dataSources, selectMap }) => {
      const sparqlQuery = selectAllAddresses(selectMap.getNode("node"), args.filters);
      let response;
      try {
        response = await dataSources.Stardog.queryAll({
          dbName,
          sparqlQuery,
          queryId: "Select Address List",
          singularizeSchema
        });
      } catch (e) {
        console.log(e)
        throw e
      }

      if (response === undefined) return null;
      if (Array.isArray(response) && response.length > 0) {
        const edges = [];
        const reducer = getReducer("ADDRESS");
        let limit = (args.limit === undefined ? response.length : args.limit);
        let offset = (args.offset === undefined ? 0 : args.offset);
        let addrList;
        if (args.orderedBy !== undefined) {
          addrList = response.sort(compareValues(args.orderedBy, args.orderMode));
        } else {
          addrList = response;
        }

        if (offset > addrList.length) return null;

        // for each Role in the result set
        for (let addr of addrList) {
          // skip down past the offset
          if (offset) {
            offset--
            continue
          }

          if (addr.id === undefined || addr.id == null) {
            console.log(`[DATA-ERROR] object ${addr.iri} is missing required properties; skipping object.`);
            continue;
          }

          // filter out non-matching entries if a filter is to be applied
          if ('filters' in args && args.filters != null && args.filters.length > 0) {
            if (!filterValues(addr, args.filters, args.filterMode)) {
              continue
            }
          }

          // if haven't reached limit to be returned
          if (limit) {
            let edge = {
              cursor: addr.iri,
              node: reducer(addr),
            }
            edges.push(edge)
            limit--;
          }
        }
        if (edges.length === 0 ) return null;
        return {
          pageInfo: {
            startCursor: edges[0].cursor,
            endCursor: edges[edges.length - 1].cursor,
            hasNextPage: (args.limit > addrList.length),
            hasPreviousPage: (args.offset > 0),
            globalCount: addrList.length,
          },
          edges: edges,
        }
      } else {
        // Handle reporting Stardog Error
        if (typeof (response) === 'object' && 'body' in response) {
          throw new UserInputError(response.statusText, {
            error_details: (response.body.message ? response.body.message : response.body),
            error_code: (response.body.code ? response.body.code : 'N/A')
          });
        } else {
          return null;
        }
      }
    },
    civicAddress: async (_, {id}, { dbName, dataSources, selectMap }) => {
      const sparqlQuery = selectAddressQuery(id, selectMap.getNode("civicAddress"));
      let response;
      try {
          response = await dataSources.Stardog.queryById({
          dbName,
          sparqlQuery,
          queryId: "Select OSCAL Civic Address",
          singularizeSchema
          });
      } catch (e) {
          console.log(e)
          throw e
      }

      if (response === undefined) return null;
      if (Array.isArray(response) && response.length > 0) {
          const reducer = getReducer("ADDRESS");
          return reducer(response[0]);
      } else {
        // Handle reporting Stardog Error
        if (typeof (response) === 'object' && 'body' in response) {
        throw new UserInputError(response.statusText, {
            error_details: (response.body.message ? response.body.message : response.body),
            error_code: (response.body.code ? response.body.code : 'N/A')
        });
        } else {
        return null;
        }
      }
    },
    telephoneNumbers: async (_, args, { dbName, dataSources, selectMap }) => {
      const sparqlQuery = selectAllPhoneNumbers(selectMap.getNode("node"), args.filters);
      let response;
      try {
        response = await dataSources.Stardog.queryAll({
          dbName,
          sparqlQuery,
          queryId: "Select Telephone Number List",
          singularizeSchema
        });
      } catch (e) {
        console.log(e)
        throw e
      }

      if (response === undefined) return null;
      if (Array.isArray(response) && response.length > 0) {
        const edges = [];
        const reducer = getReducer("PHONE-NUMBER");
        let limit = (args.limit === undefined ? response.length : args.limit);
        let offset = (args.offset === undefined ? 0 : args.offset);
        let phoneList;
        if (args.orderedBy !== undefined) {
          phoneList = response.sort(compareValues(args.orderedBy, args.orderMode));
        } else {
          phoneList = response;
        }

        if (offset > phoneList.length) return null;

        // for each Role in the result set
        for (let phoneNumber of phoneList) {
          // skip down past the offset
          if (offset) {
            offset--
            continue
          }

          if (phoneNumber.id === undefined || phoneNumber.id == null) {
            console.log(`[DATA-ERROR] object ${phoneNumber.iri} is missing required properties; skipping object.`);
            continue;
          }

          // filter out non-matching entries if a filter is to be applied
          if ('filters' in args && args.filters != null && args.filters.length > 0) {
            if (!filterValues(phoneNumber, args.filters, args.filterMode)) {
              continue
            }
          }

          // if haven't reached limit to be returned
          if (limit) {
            let edge = {
              cursor: phoneNumber.iri,
              node: reducer(phoneNumber),
            }
            edges.push(edge)
            limit--;
          }
        }
        if (edges.length === 0 ) return null;
        return {
          pageInfo: {
            startCursor: edges[0].cursor,
            endCursor: edges[edges.length - 1].cursor,
            hasNextPage: (args.limit > phoneList.length),
            hasPreviousPage: (args.offset > 0),
            globalCount: phoneList.length,
          },
          edges: edges,
        }
      } else {
        // Handle reporting Stardog Error
        if (typeof (response) === 'object' && 'body' in response) {
          throw new UserInputError(response.statusText, {
            error_details: (response.body.message ? response.body.message : response.body),
            error_code: (response.body.code ? response.body.code : 'N/A')
          });
        } else {
          return null;
        }
      }
    },
    telephoneNumber: async (_, {id}, { dbName, dataSources, selectMap }) => {
      const sparqlQuery = selectPhoneNumberQuery(id, selectMap.getNode("telephoneNumber"));
      let response;
      try {
          response = await dataSources.Stardog.queryById({
          dbName,
          sparqlQuery,
          queryId: "Select OSCAL Telephone Number",
          singularizeSchema
          });
      } catch (e) {
          console.log(e)
          throw e
      }

      if (response === undefined) return null;
      if (Array.isArray(response) && response.length > 0) {
          const reducer = getReducer("PHONE-NUMBER");
          return reducer(response[0]);
      } else {
        // Handle reporting Stardog Error
        if (typeof (response) === 'object' && 'body' in response) {
        throw new UserInputError(response.statusText, {
            error_details: (response.body.message ? response.body.message : response.body),
            error_code: (response.body.code ? response.body.code : 'N/A')
        });
        } else {
        return null;
        }
      }
    },
  },
  Mutation: {
    addReference: async ( _, {input}, {dbName, selectMap, dataSources} ) => {
      // if the types are not supplied, just return false - this will be removed when the field are required
      if (input.from_type === undefined || input.to_type === undefined) throw new UserInputError(`Source and target types must be supplied`);

      // Validate source (from) and target (to) are valid types
      if (!objectMap.hasOwnProperty(input.from_type)) {
        let found = false;
        for (let [key, value] of Object.entries(objectMap)) {
          // check for alternate key
          if (value.alternateKey != undefined && input.from_type == value.alternateKey) {
            input.from_type = key;
            found = true;
            break;
          }
          // check if the GraphQL type name was supplied
          if (input.from_type == value.graphQLType) {
            input.from_type = key;
            found = true;
            break;
          }
        }
        if (!found) throw new UserInputError(`Unknown source type '${input.from_type}'`);
      }
      if (!objectMap.hasOwnProperty(input.to_type)) {
        let found = false;
        for (let [key, value] of Object.entries(objectMap)) {
          // check for alternate key
          if (value.alternateKey != undefined && input.to_type == value.alternateKey) {
            input.to_type = key;
            found = true;
            break;
          }
          // check if the GraphQL type name was supplied
          if (input.to_type == value.graphQLType) {
            input.to_type = key;
            found = true;
            break;
          }
        }
        if (!found) throw new UserInputError(`Unknown source type '${input.to_type}'`);
      }

      // Validate field is defined on the source (from)
      const predicateMap = objectMap[input.from_type].predicateMap;
      if (!predicateMap.hasOwnProperty(input.field_name)) throw new UserInputError(`Field '${input.field_name}' is not defined for the source entity.`);
      const predicate = predicateMap[input.field_name].predicate;

      // construct the IRIs for source (from) and target (to)
      let from_type = input.from_type;
      while (objectMap[from_type].parent !== undefined) {
        from_type = objectMap[from_type].parent;
      }
      let to_type = input.to_type;
      while (objectMap[to_type].parent !== undefined) {
        to_type = objectMap[to_type].parent;
      }
      const sourceIri = `<${objectMap[from_type].iriTemplate}-${input.from_id}>`;
      const targetIri = `<${objectMap[to_type].iriTemplate}-${input.to_id}>`;

      const query = `
      INSERT DATA {
        GRAPH ${sourceIri} {
          ${sourceIri} ${predicate} ${targetIri} .
        }
      }
      `;
      let response;
      try {
       response = await dataSources.Stardog.create({
          dbName,
          sparqlQuery: query,
          queryId: "Create reference"
        });
      } catch (e) {
        console.log(e)
        throw e
      }

      if (response === undefined) return false;
      return true
    },
    removeReference: async ( _, {input}, {dbName, selectMap, dataSources} ) => {
      // if the types are not supplied, just return false - this will be removed when the field are required
      if (input.from_type === undefined || input.to_type === undefined) throw new UserInputError(`Source and target types must be supplied`);

      // Validate source (from) and target (to) are valid types
      if (!objectMap.hasOwnProperty(input.from_type)) {
        let found = false;
        for (let [key, value] of Object.entries(objectMap)) {
          // check for alternate key
          if (value.alternateKey != undefined && input.from_type == value.alternateKey) {
            input.from_type = key;
            found = true;
            break;
          }
          // check if the GraphQL type name was supplied
          if (input.from_type == value.graphQLType) {
            input.from_type = key;
            found = true;
            break;
          }
        }
        if (!found) throw new UserInputError(`Unknown source type '${input.from_type}'`);
      }
      if (!objectMap.hasOwnProperty(input.to_type)) {
        let found = false;
        for (let [key, value] of Object.entries(objectMap)) {
          // check for alternate key
          if (value.alternateKey != undefined && input.to_type == value.alternateKey) {
            input.from_type = key;
            found = true;
            break;
          }
          // check if the GraphQL type name was supplied
          if (input.to_type == value.graphQLType) {
            input.to_type = key;
            found = true;
            break;
          }
        }
        if (!found) throw new UserInputError(`Unknown source type '${input.to_type}'`);
      }

      // Validate field value is defined on the source (from)
      const predicateMap = objectMap[input.from_type].predicateMap;
      if (!predicateMap.hasOwnProperty(input.field_name)) throw new UserInputError(`Field '${input.field_name}' is not defined for the source entity.`);
      const predicate = predicateMap[input.field_name].predicate;

      // construct the IRIs for source (from) and target (to)
      let from_type = input.from_type;
      while (objectMap[from_type].parent !== undefined) {
        from_type = objectMap[from_type].parent;
      }
      let to_type = input.to_type;
      while (objectMap[to_type].parent !== undefined) {
        to_type = objectMap[to_type].parent;
      }
      const sourceIri = `<${objectMap[from_type].iriTemplate}-${input.from_id}>`;
      const targetIri = `<${objectMap[to_type].iriTemplate}-${input.to_id}>`;

      const query = `
      DELETE DATA {
        GRAPH ${sourceIri} {
          ${sourceIri} ${predicate} ${targetIri} .
        }
      }
      `;
      let response;
      try {
       response = await dataSources.Stardog.delete({
          dbName,
          sparqlQuery: query,
          queryId: "Remove reference"
        });
      } catch (e) {
        console.log(e)
        throw e
      }

      if (response === undefined) return false;
      return true
    },
  },
  // Map enum GraphQL values to data model required values
  OperationalStatus: {
    under_development : 'under-development',
    under_major_modification: 'under-major-modifications',
  },
  CyioLocationType: {
    geo_location: 'geo-location',
    civic_address: 'civic-address',
  },
  RegionName: {
    africa: 'africa',
    eastern_africa: 'eastern-africa',
    middle_africa: 'middle-africa',
    northern_africa: 'northern-africa',
    southern_africa: 'southern-africa',
    western_africa: 'western-africa',
    americas: 'americas',
    caribbean: 'caribbean',
    central_america: 'central-america',
    latin_america_caribbean: 'latin-america-caribbean',
    northern_america: 'northern-america',
    south_america: 'south-america',
    asia: 'asia',
    central_asia: 'central-asia',
    eastern_asia: 'eastern-asia',
    southern_asia: 'southern-asia',
    south_eastern_asia: 'south-eastern-asia',
    western_asia: 'western-asia',
    europe: 'europe',
    eastern_europe: 'eastern-europe',
    northern_europe: 'northern-europe',
    southern_europe: 'southern-europe',
    western_europe: 'western-europe',
    oceania: 'oceania',
    antarctica: 'antarctica',
    australia_new_zealand: 'australia-new-zealand',
    melanesia: 'melanesia',
    micronesia: 'micronesia',
    polynesia: 'polynesia',
  },
}

export default cyioGlobalTypeResolvers;