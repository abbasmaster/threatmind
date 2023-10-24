import { uniq } from 'ramda';
import { buildRefRelationKey, INPUT_LABELS, STIX_TYPE_RELATION, STIX_TYPE_SIGHTING } from '../schema/general';
import {
  RELATION_CREATED_BY,
  RELATION_OBJECT,
  RELATION_OBJECT_LABEL,
  RELATION_OBJECT_MARKING,
} from '../schema/stixRefRelationship';
import { RELATION_INDICATES } from '../schema/stixCoreRelationship';
import { isUserCanAccessStixElement, SYSTEM_USER } from './access';
import { STIX_EXT_OCTI, STIX_EXT_OCTI_SCO } from '../types/stix-extensions';
import { generateInternalType, getParentTypes } from '../schema/schemaUtils';
import { getEntitiesMapFromCache } from '../database/cache';
import { stixRefsExtractor } from '../schema/stixEmbeddedRelationship';
import { generateStandardId } from '../schema/identifier';
import { ENTITY_TYPE_RESOLVED_FILTERS } from '../schema/stixDomainObject';
import { extractStixRepresentative } from '../database/stix-representative';
import { schemaAttributesDefinition } from '../schema/schema-attributes';
import { schemaRelationsRefDefinition } from '../schema/schema-relationsRef';

// Resolutions
export const MARKING_FILTER = 'objectMarking';
export const CREATED_BY_FILTER = 'createdBy';
export const CREATOR_FILTER = 'creator_id';
export const ASSIGNEE_FILTER = 'objectAssignee';
export const PARTICIPANT_FILTER = 'objectParticipant';
export const OBJECT_CONTAINS_FILTER = 'objects';
export const IDS_FILTER = 'ids';
export const RELATION_FROM = 'fromId';
export const RELATION_TO = 'toId';
export const INSTANCE_FILTER = 'elementId';
export const NEGATION_FILTER_SUFFIX = '_not_eq';
export const RESOLUTION_FILTERS = [
  LABEL_FILTER,
  MARKING_FILTER,
  CREATED_BY_FILTER,
  ASSIGNEE_FILTER,
  PARTICIPANT_FILTER,
  OBJECT_CONTAINS_FILTER,
  RELATION_FROM,
  RELATION_TO,
  INSTANCE_FILTER,
];
export const ENTITY_FILTERS = [
  INSTANCE_FILTER,
  RELATION_FROM,
  RELATION_TO,
  CREATED_BY_FILTER,
  OBJECT_CONTAINS_FILTER,
];
// Values
export const LABEL_FILTER = INPUT_LABELS;
export const TYPE_FILTER = 'entity_type';
export const INDICATOR_FILTER = 'indicator_types';
export const SCORE_FILTER = 'x_opencti_score';
export const DETECTION_FILTER = 'x_opencti_detection';
export const SEVERITY_FILTER = 'severity';
export const PRIORITY_FILTER = 'priority';
export const WORKFLOW_FILTER = 'x_opencti_workflow_id';
export const CONFIDENCE_FILTER = 'confidence';
export const REVOKED_FILTER = 'revoked';
export const PATTERN_FILTER = 'pattern_type';
export const MAIN_OBSERVABLE_TYPE_FILTER = 'x_opencti_main_observable_type';
export const RELATION_FROM_TYPES = 'fromTypes';
export const RELATION_TO_TYPES = 'toTypes';

export const GlobalFilters = {
  createdBy: buildRefRelationKey(RELATION_CREATED_BY),
  markedBy: buildRefRelationKey(RELATION_OBJECT_MARKING),
  objectLabel: buildRefRelationKey(RELATION_OBJECT_LABEL),
  indicates: buildRefRelationKey(RELATION_INDICATES),
  objects: buildRefRelationKey(RELATION_OBJECT),
  creator: 'creator_id',
};

export const extractFilterIdsToResolve = (filters) => {
  const filterEntries = Object.entries(filters);
  return filterEntries
    .filter(([key]) => RESOLUTION_FILTERS
      .map((r) => [r, r + NEGATION_FILTER_SUFFIX])
      .flat()
      .includes(key))
    .map(([, values]) => values.map((v) => v.id))
    .flat();
};

// build a map ([id]: StixObject) with the resolved filters accessible for a user
export const resolvedFiltersMapForUser = async (context, user, filters) => {
  const resolveUserMap = new Map();
  const resolvedMap = await getEntitiesMapFromCache(context, SYSTEM_USER, ENTITY_TYPE_RESOLVED_FILTERS);
  const filterEntries = Object.entries(filters);
  for (let index = 0; index < filterEntries.length; index += 1) {
    const [, rawValues] = filterEntries[index];
    for (let vIndex = 0; vIndex < rawValues.length; vIndex += 1) {
      const v = rawValues[vIndex];
      if (resolvedMap.has(v.id)) {
        const stixInstance = resolvedMap.get(v.id);
        const isUserHasAccessToElement = await isUserCanAccessStixElement(context, user, stixInstance);
        if (isUserHasAccessToElement) {
          resolveUserMap.set(stixInstance.id, stixInstance);
        }
      }
    }
  }
  return resolveUserMap;
};

const convertFiltersFrontendFormatContent = async (context, user, mainFilterGroup, resolvedMap) => {
  const adaptedFilters = [];
  const adaptedFilterGroups = [];
  const { filters = [] } = mainFilterGroup;
  const { filterGroups = [] } = mainFilterGroup;
  for (let index = 0; index < filterGroups.length; index += 1) {
    const group = filterGroups[index];
    const adaptedGroup = await convertFiltersFrontendFormatContent(context, user, group, resolvedMap);
    adaptedFilterGroups.push(adaptedGroup);
  }
  for (let index = 0; index < filters.length; index += 1) {
    const filter = filters[index];
    // Remap the format of specific keys
    const rawValues = filter.values;
    const values = [];
    for (let vIndex = 0; vIndex < rawValues.length; vIndex += 1) {
      const id = rawValues[vIndex];
      if (resolvedMap.has(id)) {
        const stixInstance = resolvedMap.get(id);
        const isUserHasAccessToElement = await isUserCanAccessStixElement(context, user, stixInstance);
        const value = extractStixRepresentative(stixInstance);
        // add id if user has access to the element
        values.push({ id: isUserHasAccessToElement ? id : '<invalid access>', value });
        // add standard id if user has access to the element
        values.push({ id: isUserHasAccessToElement ? stixInstance.id : '<invalid access>', value });
      } else {
        values.push({ id, value: 'deprecated' }); // TODO
      }
    }
    adaptedFilters.push({ ...filter, values });
  }
  return (mainFilterGroup
    ? {
      mode: mainFilterGroup.mode,
      filters: adaptedFilters,
      filterGroups: adaptedFilterGroups,
    }
    : undefined);
};

export const convertFiltersFrontendFormat = async (context, user, filterGroup) => {
  // Grab all values that are internal_id that needs to be converted to standard_ids
  const resolvedMap = await getEntitiesMapFromCache(context, SYSTEM_USER, ENTITY_TYPE_RESOLVED_FILTERS);
  const adaptedFilterGroup = await convertFiltersFrontendFormatContent(context, user, filterGroup, resolvedMap);
  return adaptedFilterGroup;
};

const convertFiltersToQueryOptionsContent = (adaptedFilters, field = 'updated_at', after = undefined, before = undefined) => {
  if (!adaptedFilters) {
    return {
      mode: 'and',
      filters: [],
      filterGroups: [],
    };
  }
  const queryFilters = [];
  const queryFilterGroups = [];
  const { filters, filterGroups } = adaptedFilters;
  if (filterGroups && filterGroups.length > 0) {
    for (let index = 0; index < filterGroups.length; index += 1) {
      const currentGroup = filterGroups[index];
      const newFilters = convertFiltersToQueryOptionsContent(currentGroup);
      queryFilterGroups.push(newFilters);
    }
  }
  for (let index = 0; index < filters.length; index += 1) {
    // eslint-disable-next-line prefer-const
    let { key, operator, values, mode } = filters[index];
    queryFilters.push({ key: GlobalFilters[key] || key, values: values.map((v) => v.id), operator, mode });
  }
  if (after) {
    queryFilters.push({ key: field, values: [after], operator: 'gte' });
  }
  if (before) {
    queryFilters.push({ key: field, values: [before], operator: 'lte' });
  }
  return {
    mode: adaptedFilters.mode,
    filters: queryFilters,
    filterGroups: queryFilterGroups,
  };
};

export const convertFiltersToQueryOptions = async (context, user, filters, opts = {}) => {
  const { after, before, defaultTypes = [], field = 'updated_at', orderMode = 'asc' } = opts;
  const types = [...defaultTypes];
  let adaptedFilters;
  if (filters) {
    adaptedFilters = await convertFiltersFrontendFormat(context, user, filters);
  }
  const finalFilters = convertFiltersToQueryOptionsContent(adaptedFilters, field, after, before);
  return { types, orderMode, orderBy: [field, 'internal_id'], filters: finalFilters };
};

export const testRelationFromFilter = (stix, extractedIds, operator) => {
  if (stix.type === STIX_TYPE_RELATION) {
    const idFromFound = extractedIds.includes(stix.source_ref);
    // If source is available but must not be
    if (operator === 'not_eq' && idFromFound) {
      return false;
    }
    // If source is not available but must be
    if (operator === 'eq' && !idFromFound) {
      return false;
    }
  } else if (stix.type === STIX_TYPE_SIGHTING) {
    const isFromFound = extractedIds.includes(stix.sighting_of_ref);
    // If source is available but must not be
    if (operator === 'not_eq' && isFromFound) {
      return false;
    }
    // If source is not available but must be
    if (operator === 'eq' && !isFromFound) {
      return false;
    }
  } else {
    return false;
  }
  return true;
};

export const testRelationToFilter = (stix, extractedIds, operator) => {
  if (stix.type === STIX_TYPE_RELATION) {
    const idToFound = extractedIds.includes(stix.target_ref);
    // If target is available but must not be
    if (operator === 'not_eq' && idToFound) {
      return false;
    }
    // If target is not available but must be
    if (operator === 'eq' && !idToFound) {
      return false;
    }
  } else if (stix.type === STIX_TYPE_SIGHTING) {
    const idsFromFound = extractedIds.some((r) => stix.where_sighted_refs.includes(r));
    // If target is available but must not be
    if (operator === 'not_eq' && idsFromFound) {
      return false;
    }
    // If target is not available but must be
    if (operator === 'eq' && !idsFromFound) {
      return false;
    }
  } else {
    return false;
  }
  return true;
};

export const testRefsFilter = (stix, extractedIds, operator) => {
  const refs = stixRefsExtractor(stix, generateStandardId);
  const isRefFound = extractedIds.some((r) => refs.includes(r));
  // If ref is available but must not be
  if (operator === 'not_eq' && isRefFound) {
    return false;
  }
  // If ref is not available but must be
  if (operator === 'eq' && !isRefFound) {
    return false;
  }
  return true;
};

const testObjectsFilter = (stix, extractedIds, operator) => {
  const instanceObjects = [...(stix.object_refs ?? []), ...(stix.extensions?.[STIX_EXT_OCTI]?.object_refs_inferred ?? [])];
  const isRefFound = extractedIds.some((r) => instanceObjects.includes(r));
  // If ref is available but must not be
  if (operator === 'not_eq' && isRefFound) {
    return false;
  }
  // If ref is not available but must be
  if (operator === 'eq' && !isRefFound) {
    return false;
  }
  return true;
};

export const isMatchNumeric = (values, operator, instanceValue) => {
  const { id } = values.at(0) ?? {};
  const numeric = parseInt(id, 10);
  let found;
  switch (operator) {
    case 'lt':
      found = instanceValue < numeric;
      break;
    case 'lte':
      found = instanceValue <= numeric;
      break;
    case 'gt':
      found = instanceValue > numeric;
      break;
    case 'gte':
      found = instanceValue >= numeric;
      break;
    default:
      found = instanceValue === numeric;
  }
  return found;
};

export const isStixMatchFilters = async (context, user, stix, adaptedFilters, useSideEventMatching = false) => {
  // We can start checking the user can access the stix (marking + segregation).
  const isUserHasAccessToElement = await isUserCanAccessStixElement(context, user, stix);
  if (!isUserHasAccessToElement) {
    return false;
  }
  // User is granted, but we still need to apply filters if needed
  for (let index = 0; index < adaptedFilters.length; index += 1) {
    const { key, operator, values } = adaptedFilters[index];
    if (values.length > 0) {
      // Markings filtering
      if (key === MARKING_FILTER) {
        const instanceMarkings = stix.object_marking_refs || [];
        const ids = values.map((v) => v.id);
        const isMarkingAvailable = ids.some((r) => instanceMarkings.includes(r));
        // If marking is available but must not be
        if (operator === 'not_eq' && isMarkingAvailable) {
          return false;
        }
        // If marking is not available but must be
        if (operator === 'eq' && !isMarkingAvailable) {
          return false;
        }
      }
      // Entity type filtering
      if (key === TYPE_FILTER) {
        const instanceType = stix.extensions?.[STIX_EXT_OCTI]?.type ?? generateInternalType(stix);
        const instanceAllTypes = [instanceType, ...getParentTypes(instanceType)];
        const isTypeAvailable = values.some((v) => instanceAllTypes.includes(v.id));
        // If entity type is available but must not be
        if (operator === 'not_eq' && isTypeAvailable) {
          return false;
        }
        // If entity type is not available but must be
        if (operator === 'eq' && !isTypeAvailable) {
          return false;
        }
      }
      // Entity filtering
      if (key === INSTANCE_FILTER) {
        const instanceId = stix.extensions?.[STIX_EXT_OCTI]?.id;
        const extractedIds = values.map((v) => v.id);
        const isIdAvailable = instanceId && extractedIds.includes(instanceId);
        if (!useSideEventMatching) {
          // If entity is available but must not be
          if (operator === 'not_eq' && isIdAvailable) {
            return false;
          }
          // If entity is not available but must be
          if (operator === 'eq' && !isIdAvailable) {
            return false;
          }
        } else { // side events only
          if (operator === 'not_eq') {
            return false; // no application
          }
          // If entity is not available but must be
          // test on relationships target/source and on objects
          if (operator === 'eq'
            && !testRelationFromFilter(stix, extractedIds, operator)
            && !testRelationToFilter(stix, extractedIds, operator)
            && !testRefsFilter(stix, extractedIds, operator)
          ) {
            return false;
          }
        }
      }
      // Indicator type filtering
      if (key === INDICATOR_FILTER) {
        const indicators = stix.indicator_types ?? [];
        // Need lowercase because in frontend, using "runtimeAttribute" based on keyword which is always lowercased
        const extractedValues = values.map((v) => v.value.toLowerCase());
        const isTypeAvailable = extractedValues.some((r) => indicators.includes(r.toLowerCase()));
        // If indicator type is available but must not be
        if (operator === 'not_eq' && isTypeAvailable) {
          return false;
        }
        // If indicator type is not available but must be
        if (operator === 'eq' && !isTypeAvailable) {
          return false;
        }
      }
      // Workflow filtering
      if (key === WORKFLOW_FILTER) {
        const workflowId = stix.extensions[STIX_EXT_OCTI].workflow_id;
        const isWorkflowAvailable = workflowId && values.map((v) => v.id).includes(workflowId);
        // If workflow is available but must not be
        if (operator === 'not_eq' && isWorkflowAvailable) {
          return false;
        }
        // If workflow is not available but must be
        if (operator === 'eq' && !isWorkflowAvailable) {
          return false;
        }
      }
      // CreatedBy filtering
      if (key === CREATED_BY_FILTER) {
        const ids = values.map((v) => v.id);
        const createdBy = stix.created_by_ref ?? stix.extensions?.[STIX_EXT_OCTI_SCO]?.created_by_ref;
        const isCreatedByAvailable = createdBy && ids.includes(createdBy);
        // If creator is available but must not be
        if (operator === 'not_eq' && isCreatedByAvailable) {
          return false;
        }
        // If creator is not available but must be
        if (operator === 'eq' && !isCreatedByAvailable) {
          return false;
        }
      }
      // Technical creator filter
      if (key === CREATOR_FILTER) {
        const creators = stix.extensions[STIX_EXT_OCTI]?.creator_ids ?? [];
        const extractedValues = values.map((v) => v.id);
        const isCreatorAvailable = extractedValues.some((r) => creators.includes(r));
        // If creator is available but must not be
        if (operator === 'not_eq' && isCreatorAvailable) {
          return false;
        }
        // If creator is not available but must be
        if (operator === 'eq' && !isCreatorAvailable) {
          return false;
        }
      }
      // Assignee filtering
      if (key === ASSIGNEE_FILTER) {
        const assignees = stix.extensions[STIX_EXT_OCTI]?.assignee_ids ?? [];
        const extractedValues = values.map((v) => v.id);
        const isAssigneeAvailable = extractedValues.some((r) => assignees.includes(r));
        // If assignee is available but must not be
        if (operator === 'not_eq' && isAssigneeAvailable) {
          return false;
        }
        // If assignee is not available but must be
        if (operator === 'eq' && !isAssigneeAvailable) {
          return false;
        }
      }
      // Labels filtering
      if (key === LABEL_FILTER) {
        // Handle no label filtering
        const isNoLabelRequire = values.map((v) => v.id).includes(null);
        if (operator === 'not_eq' && isNoLabelRequire && (stix.labels ?? []).length === 0) {
          return false;
        }
        if (operator === 'eq' && isNoLabelRequire && (stix.labels ?? []).length > 0) {
          return false;
        }
        // Get only required labels
        const labels = values.map((v) => (v.id ? v.value : null)).filter((v) => v !== null);
        if (labels.length > 0) {
          const dataLabels = [...(stix.labels ?? []), ...(stix.extensions?.[STIX_EXT_OCTI_SCO]?.labels ?? [])];
          const isLabelAvailable = labels.some((r) => dataLabels.includes(r));
          // If label is available but must not be
          if (operator === 'not_eq' && isLabelAvailable) {
            return false;
          }
          // If label is not available but must be
          if (operator === 'eq' && !isLabelAvailable) {
            return false;
          }
        }
      }
      // Revoked filtering
      if (key === REVOKED_FILTER) {
        const { id } = values.at(0) ?? {};
        const isRevoked = (id === 'true') === stix.revoked;
        if (!isRevoked) {
          return false;
        }
      }
      //  Detection filtering
      if (key === DETECTION_FILTER) {
        const { id } = values.at(0) ?? {};
        const isDetection = (id === 'true') === stix.extensions?.[STIX_EXT_OCTI]?.detection;
        if (!isDetection) {
          return false;
        }
      }
      if (key === SEVERITY_FILTER) {
        const severity = stix[SEVERITY_FILTER];
        // no-severity is a filter { id: '', value '' } ; we use null to track it below
        // comparison is case-insensitive (P2 or p2 for instance)
        const ids = values.map((v) => (v.id ? v.id.toLowerCase() : null));
        const isSeverityAvailable = severity ? ids.includes(severity.toLowerCase()) : ids.includes(null);
        // If available but must not be
        if (operator === 'not_eq' && isSeverityAvailable) {
          return false;
        }
        // If not available but must be
        if (operator === 'eq' && !isSeverityAvailable) {
          return false;
        }
      }
      if (key === PRIORITY_FILTER) {
        const priority = stix[PRIORITY_FILTER];
        const ids = values.map((v) => (v.id ? v.id.toLowerCase() : null));
        const isPriorityAvailable = priority ? ids.includes(priority.toLowerCase()) : ids.includes(null);
        // If available but must not be
        if (operator === 'not_eq' && isPriorityAvailable) {
          return false;
        }
        // If not available but must be
        if (operator === 'eq' && !isPriorityAvailable) {
          return false;
        }
      }
      // Numeric filtering
      if (key === SCORE_FILTER) {
        const instanceValue = stix[SCORE_FILTER] ?? stix.extensions?.[STIX_EXT_OCTI]?.score ?? stix.extensions?.[STIX_EXT_OCTI_SCO]?.score;
        if (!isMatchNumeric(values, operator, instanceValue)) {
          return false;
        }
      }
      if (key === CONFIDENCE_FILTER) {
        const instanceValue = stix[CONFIDENCE_FILTER];
        if (!isMatchNumeric(values, operator, instanceValue)) {
          return false;
        }
      }
      // Pattern type filtering
      if (key === PATTERN_FILTER) {
        const currentPattern = stix.pattern_type;
        // Need lowercase because in frontend, using "runtimeAttribute" based on keyword which is always lowercased
        const isPatternFound = values.map((v) => v.id.toLowerCase()).includes(currentPattern?.toLowerCase());
        // If pattern is available but must not be
        if (operator === 'not_eq' && isPatternFound) {
          return false;
        }
        // If pattern is not available but must be
        if (operator === 'eq' && !isPatternFound) {
          return false;
        }
      }
      // Main Observable Filter filtering
      if (key === MAIN_OBSERVABLE_TYPE_FILTER) {
        const currentMainObservableType = stix.extensions?.[STIX_EXT_OCTI]?.main_observable_type;
        // Need lowercase because in frontend, using "runtimeAttribute" based on keyword which is always lowercased
        const isMainObservableTypeFound = values.map((v) => v.id.toLowerCase()).includes(currentMainObservableType?.toLowerCase());
        // If main observable type is available but must not be
        if (operator === 'not_eq' && isMainObservableTypeFound) {
          return false;
        }
        // If main observable type is not available but must be
        if (operator === 'eq' && !isMainObservableTypeFound) {
          return false;
        }
      }
      // object Refs filtering
      if (key === OBJECT_CONTAINS_FILTER) {
        if (!testObjectsFilter(stix, values.map((v) => v.id), operator)) {
          return false;
        }
      }
      // region specific for relationships
      if (key === RELATION_FROM) { // 'fromId'
        if (!testRelationFromFilter(stix, values.map((v) => v.id), operator)) {
          return false;
        }
      }
      if (key === RELATION_TO) { // 'toId'
        if (!testRelationToFilter(stix, values.map((v) => v.id), operator)) {
          return false;
        }
      }
      if (key === RELATION_FROM_TYPES) { // fromTypes
        if (stix.type === STIX_TYPE_RELATION) {
          const sourceType = stix.extensions[STIX_EXT_OCTI].source_type;
          const sourceAllTypes = [sourceType, ...getParentTypes(sourceType)];
          const isTypeAvailable = values.some((v) => sourceAllTypes.includes(v.id));
          // If source type is available but must not be
          if (operator === 'not_eq' && isTypeAvailable) {
            return false;
          }
          // If source type is not available but must be
          if (operator === 'eq' && !isTypeAvailable) {
            return false;
          }
        } else if (stix.type === STIX_TYPE_SIGHTING) {
          const sourceType = stix.extensions[STIX_EXT_OCTI].sighting_of_type;
          const sourceAllTypes = [sourceType, ...getParentTypes(sourceType)];
          const isTypeAvailable = values.some((v) => sourceAllTypes.includes(v.id));
          // If source type is available but must not be
          if (operator === 'not_eq' && isTypeAvailable) {
            return false;
          }
          // If source type is not available but must be
          if (operator === 'eq' && !isTypeAvailable) {
            return false;
          }
        } else {
          return false;
        }
      }
      if (key === RELATION_TO_TYPES) { // toTypes
        if (stix.type === STIX_TYPE_RELATION) {
          const targetType = stix.extensions[STIX_EXT_OCTI].target_type;
          const targetAllTypes = [targetType, ...getParentTypes(targetType)];
          const isTypeAvailable = values.some((v) => targetAllTypes.includes(v.id));
          // If source type is available but must not be
          if (operator === 'not_eq' && isTypeAvailable) {
            return false;
          }
          // If source type is not available but must be
          if (operator === 'eq' && !isTypeAvailable) {
            return false;
          }
        } else if (stix.type === STIX_TYPE_SIGHTING) {
          const targetTypes = stix.extensions[STIX_EXT_OCTI].where_sighted_types;
          const targetAllTypes = targetTypes.map((t) => [t, ...getParentTypes(t)]).flat();
          const isTypeAvailable = values.some((v) => targetAllTypes.includes(v.id));
          // If source type is available but must not be
          if (operator === 'not_eq' && isTypeAvailable) {
            return false;
          }
          // If source type is not available but must be
          if (operator === 'eq' && !isTypeAvailable) {
            return false;
          }
        } else {
          return false;
        }
      }
      // endregion
    }
  }
  return true;
};

export const addFilter = (filterGroup, newKey, newValues, operator = 'eq') => {
  return {
    mode: filterGroup?.mode ?? 'and',
    filters: [
      {
        key: Array.isArray(newKey) ? newKey : [newKey],
        values: Array.isArray(newValues) ? newValues : [newValues],
        operator,
        mode: 'or'
      },
      ...(filterGroup?.filters ?? [])
    ],
    filterGroups: filterGroup?.filterGroups ?? [],
  };
};

export const removeFilter = (filterGroup, filterKeys) => {
  const keysToRemove = Array.isArray(filterKeys) ? filterKeys : [filterKeys];
  return {
    mode: filterGroup?.mode ?? 'and',
    filters: filterGroup?.filters.filter((f) => !keysToRemove.includes(f.key)),
    filterGroups: filterGroup?.filterGroups ?? [],
  };
};

export const extractFilterKeys = (filters) => {
  let keys = filters.filters?.map((f) => f.key).flat() ?? []; // TODO remove filters.filters can be null when filter format refacto done
  if (filters.filterGroups && filters.filterGroups.length > 0) {
    keys = keys.concat(filters.filterGroups.map((group) => extractFilterKeys(group)).flat());
  }
  return keys;
};

// extract all the ids from a filter group / all the ids corresponding to a specific key if key is specified
export const extractFilterIds = (filters, key = null) => {
  let ids = key
    ? filters.filters?.filter((f) => f.key.includes(key)).map((f) => f.values).flat() ?? []
    : filters.filters?.map((f) => f.values).flat() ?? [];
  if (filters.filterGroups && filters.filterGroups.length > 0) {
    ids = ids.concat(filters.filterGroups.map((group) => extractFilterIds(group, key)).flat());
  }
  return uniq(ids);
};

export const checkedAndConvertedFilters = (filters, entityTypes) => {
  if (filters?.filters && entityTypes.length > 0) { // TODO replace by filters && XX
    const keys = extractFilterKeys(filters);
    // check filters keys correspond to the entity types
    // correct keys are keys in AT LEAST one of the entity types schema definition
    if (keys.length > 0) {
      let incorrectKeys = keys;
      entityTypes.forEach((type) => {
        const availableAttributes = schemaAttributesDefinition.getAttributeNames(type);
        const availableRelations = schemaRelationsRefDefinition.getInputNames(type);
        const availableKeys = availableAttributes.concat(availableRelations).concat(['rel_object.internal_id', 'rel_object.*', 'rel_related-to.*', 'connections']);
        // TODO remove hardcode when all the enum are removed, don't remove 'connections' (it's for nested filters)
        console.log('availableKeys', availableKeys);
        keys.forEach((k) => {
          if (availableKeys.includes(k)) {
            incorrectKeys = incorrectKeys.filter((n) => n !== k);
          }
        });
      });
      if (incorrectKeys.length > 0) {
        throw Error(`incorrect filter keys: ${incorrectKeys}`); // TODO remove filter keys that are not correct when dev finished
      }
    }
    const newFilters = [];
    // translate the filter keys on relation refs
    filters.filters.forEach((f) => {
      const key = Array.isArray(f.key) ? f.key[0] : f.key;
      console.log('entityTypes', entityTypes);
      const databaseName = schemaRelationsRefDefinition.getDatabaseName(key);
      console.log('key', key);
      console.log('databaseName', databaseName);
      if (databaseName) {
        const newKey = buildRefRelationKey(databaseName);
        newFilters.push({ ...f, key: newKey });
      } else {
        newFilters.push(f);
      }
    });
    return {
      mode: filters.mode,
      filters: newFilters,
      filterGroups: filters.filterGroups,
    };
  }
  return undefined;
};

export const isNotEmptyFilters = (filters) => {
  return filters && ((filters.filters && filters.filters.length > 0) || (filters.filterGroups && filters.filterGroups.length > 0));
};
