import canonicalize  from '../../utils/canonicalize.js';
import {v5 as uuid5, v4 as uuid4} from 'uuid';

export const DARKLIGHT_NS = 'd85ba5b6-609e-58bf-a973-ca109f868e86';
export const OASIS_SCO_NS = '00abedb4-aa42-466c-9c01-fed23315a9b7';
export const OASIS_NS = 'ba6cce09-c787-5a25-a707-f52be5734460';
export const FIRST_NS = '941e7013-5670-5552-895c-e97149d1b61c';
export const OSCAL_NS = 'b2b5f319-6363-57ec-9557-3c271fe709c7';
export const FEDRAMP_NS = '4a6eb7bc-ed64-527a-a762-5e6f92b3c94f';

// converts string to Pascal case (aka UpperCamelCase)
export function toPascalCase(string) {
  return `${string}`
    .replace(new RegExp(/[-_]+/, 'g'), ' ')
    .replace(new RegExp(/[^\w\s]/, 'g'), '')
    .replace(
      new RegExp(/\s+(.)(\w*)/, 'g'),
      ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
    )
    .replace(new RegExp(/\w/), s => s.toUpperCase());
}

// Generates a deterministic ID value based on a JSON structure and a namespace
export function generateId( materials, namespace ) {
  if (materials !== undefined ) {
    if (namespace === undefined) {
      throw new TypeError('namespace must be supplied when providing materials', 'utils.js', 10 );
    }

    return uuid5( canonicalize( materials ), namespace);
  } else if ((materials === undefined || materials.length == 0) && namespace === undefined ) {
    return uuid4()
  } else {
    throw new TypeError('materials and namespace must be supplied', 'utils.js', 28 );
  }
}

// Used as part of sorting to compare values within an object
export function compareValues( key, order = 'asc') {
  return function innerSort(a, b) {
    if (!a.hasOwnProperty(key) && !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0;
    }

    let comparison = 0;
    if (!a.hasOwnProperty(key) && b.hasOwnProperty(key)) comparison = -1;
    if (a.hasOwnProperty(key) && !b.hasOwnProperty(key)) comparison = 1;

    if (comparison === 0 ) {
      const varA = (typeof a[key] === 'string')
        ? a[key].toUpperCase() : a[key];
      const varB = (typeof b[key] === 'string')
        ? b[key].toUpperCase() : b[key];

      if (varA > varB) {
        comparison = 1;
      } else if (varA < varB) {
        comparison = -1;
      }
    }

  return (
      (order === 'desc') ? (comparison * -1) : comparison
    );
  };
}

// determines if object matches filters
export function filterValues( item, filters, filterMode = 'or') {
  let filterMatch = false ;
  if (filters.length === 1 && filters[0] === null) return true;
  for (let filter of filters ) {
    if (filter === undefined || filter === null) continue;
    if (!item.hasOwnProperty(filter.key)) {
      continue
    }

    let match = false ;
    for ( let filterValue of filter.values ) {
      if (match && filter.filterMode == 'or')
        continue ;

      // GraphQL doesn't allow '_', so need to replace
      // TODO: Need to only do for asset types??
      // * CPE ID would break
      filterValue = filterValue.replace('_', '-');
      
      let itemValues;
      if (item[filter.key] instanceof Array) {
        itemValues = item[filter.key];
      } else {
        itemValues = [item[filter.key]];
      }

      let itemValue;
      for (let value of itemValues) {
        if (typeof value === 'object') {
          if (value instanceof Date) itemValue = value.toISOString();
          if (value instanceof Number) itemValue = value.toString();
          if (value instanceof String) itemValue = value.toString();
        } else {
          if (typeof value === 'number') itemValue = value.toString();
          if (typeof value === 'string') itemValue = value;  
        }  

        switch( filter.operator ) {
          case FilterOps.MATCH:
            if (itemValue === filterValue) {
              match = true
            }
            break;
          case FilterOps.NE:
            if (itemValue != filterValue) {
              match = true
            }
            break;
          case FilterOps.LT:
            if (itemValue < filterValue) {
              match = true
            }
            break;
          case FilterOps.LTE:
            if (itemValue <= filterValue) {
              match = true
            }
            break;
          case FilterOps.GT:
            if (itemValue > filterValue) {
              match = true
            }
            break;
          case FilterOps.GTE:
            if (itemValue >= filterValue) {
              match = true
            }
            break;
          case FilterOps.WILDCARD:
          case FilterOps.EQ:
          default:
              if (itemValue == filterValue) {
              match = true
            }
            break;
        }
      }
    }

    if (match && filterMode == 'or') {
      filterMatch = match ;
      break;
    }
    if (match && filterMode == 'and') filterMatch = match;
    if (!match && filterMode == 'and') return match ;
  }

  return filterMatch
}

export const FilterOps = {
  MATCH: 'match',
  WILDCARD: 'wildcard',
  GT: 'gt',
  LT: 'lt',
  GTE: 'gte',
  LTE: 'lte',
  EQ: 'eq',
  NE: 'ne'
}

export const UpdateOps = {
  ADD: 'add',
  REPLACE: 'replace',
  REMOVE: 'remove'
}

export const byIdClause = (id) => `?iri <http://darklight.ai/ns/common#id> "${id}" .`;
export const optionalizePredicate = (predicate) => `OPTIONAL { ${predicate} . } `;
export const parameterizePredicate = (iri, value, predicate, binding) => (`${iri || "?iri"} ${predicate} ` + ((value === undefined || value == null) ? `?${binding}` : value ))

export const buildSelectVariables = (predicateMap, selects) => {
  const predicateMatches = selects.filter((s) => predicateMap.hasOwnProperty(s));
  const selectionClause = predicateMatches.map((s) => `?${s}`).join(" ")
  const predicates = predicateMatches.map((s) => predicateMap[s]?.optional()).join(" \n")
  return {selectionClause, predicates}
}

export const updateQuery = (iri, type, input, predicateMap) => {
  let deletePredicates = [], insertPredicates = [], replaceBindingPredicates = [], replacementPredicate;
  for(const {key, value, operation} of input) {
    if (!predicateMap.hasOwnProperty(key)) {
      console.error(`[CYIO] UNKNOWN-FIELD Unknown field '${key}' for object ${iri}`);        
      continue;
    }
    let itr;
    for(itr of value) {
      if (key === 'description' || key === 'statement') {
        // escape any special characters (e.g., newline)
        if (key === 'description') {
          if (itr.includes('\n')) itr = itr.replace(/\n/g, '\\n');
          if (itr.includes('\"')) itr = itr.replace(/\"/g, '\\"');
          if (itr.includes("\'")) itr = itr.replace(/\'/g, "\\'");
        }
        if (key === 'statement') {
          if (itr.includes('\n')) itr = itr.replace(/\n/g, '\\n');
          if (itr.includes('\"')) itr = itr.replace(/\"/g, '\\"');
          if (itr.includes("\'")) itr = itr.replace(/\'/g, "\\'");
        }
      }
      const predicate = predicateMap[key].binding(`<${iri}>`, itr) + ' .';
      switch (operation) {
        case UpdateOps.ADD:
          if (insertPredicates.includes(predicate)) continue;
          insertPredicates.push(predicate);
          break;
        case UpdateOps.REMOVE:
          if (deletePredicates.includes(predicate)) continue;
          deletePredicates.push(predicate);
          break;
        case UpdateOps.REPLACE:
        default:    // replace is the default behavior when the operation is not supplied.
          replacementPredicate = predicateMap[key].binding(`<${iri}>`) + ' .';
          if (!insertPredicates.includes(predicate)) insertPredicates.push(predicate);
          if (!replaceBindingPredicates.includes(replacementPredicate)) replaceBindingPredicates.push(replacementPredicate)
          break;
        }
    }
  }
  return `
DELETE {
  GRAPH ?g {
    ${deletePredicates.join('\n      ')}
    ${replaceBindingPredicates.join('\n      ')}
  }
} INSERT {
  GRAPH ?g {
    ${insertPredicates.join('\n      ')}
  }
} WHERE {
  GRAPH ?g {
    <${iri}> a <${type}> .
    ${replaceBindingPredicates.join('\n      ')}
  }
}
  `;
}
