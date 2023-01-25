import * as R from 'ramda';
import {
  ABSTRACT_INTERNAL_OBJECT,
  ABSTRACT_STIX_DOMAIN_OBJECT,
  ABSTRACT_STIX_META_OBJECT,
  ABSTRACT_STIX_META_RELATIONSHIP,
  ENTITY_TYPE_CONTAINER,
  ENTITY_TYPE_IDENTITY,
  ENTITY_TYPE_LOCATION,
} from './general';
import { ENTITY_TYPE_CONTAINER_GROUPING } from '../modules/grouping/grouping-types';
import { ENTITY_TYPE_TAXII_COLLECTION, ENTITY_TYPE_WORK } from './internalObject';
import {
  aliases,
  AttributeDefinition,
  confidence,
  created,
  createdAt,
  entityLocationType,
  entityType,
  iAliasedIds,
  IcreatedAtDay,
  IcreatedAtMonth,
  IcreatedAtYear,
  internalId,
  lang,
  modified,
  revoked,
  specVersion,
  standardId,
  updatedAt,
  xOpenctiAliases,
  xOpenctiStixIds
} from './attribute-definition';
import { schemaAttributesDefinition } from './schema-attributes';

export const ATTRIBUTE_NAME = 'name';
export const ATTRIBUTE_ABSTRACT = 'abstract';
export const ATTRIBUTE_EXPLANATION = 'explanation';
export const ATTRIBUTE_DESCRIPTION = 'description';
export const ATTRIBUTE_ALIASES = 'aliases';
export const ATTRIBUTE_ALIASES_OPENCTI = 'x_opencti_aliases';
export const ATTRIBUTE_ADDITIONAL_NAMES = 'x_opencti_additional_names';

export const ENTITY_TYPE_ATTACK_PATTERN = 'Attack-Pattern';
export const ENTITY_TYPE_CAMPAIGN = 'Campaign';
export const ENTITY_TYPE_CONTAINER_NOTE = 'Note';
export const ENTITY_TYPE_CONTAINER_OBSERVED_DATA = 'Observed-Data';
export const ENTITY_TYPE_CONTAINER_OPINION = 'Opinion';
export const ENTITY_TYPE_CONTAINER_REPORT = 'Report';
export const ENTITY_TYPE_COURSE_OF_ACTION = 'Course-Of-Action';
export const ENTITY_TYPE_IDENTITY_INDIVIDUAL = 'Individual';
export const ENTITY_TYPE_IDENTITY_ORGANIZATION = 'Organization';
export const ENTITY_TYPE_IDENTITY_SECTOR = 'Sector';
export const ENTITY_TYPE_IDENTITY_SYSTEM = 'System';
export const ENTITY_TYPE_INDICATOR = 'Indicator';
export const ENTITY_TYPE_INFRASTRUCTURE = 'Infrastructure';
export const ENTITY_TYPE_INTRUSION_SET = 'Intrusion-Set';
export const ENTITY_TYPE_LOCATION_CITY = 'City';
export const ENTITY_TYPE_LOCATION_COUNTRY = 'Country';
export const ENTITY_TYPE_LOCATION_REGION = 'Region';
export const ENTITY_TYPE_LOCATION_POSITION = 'Position';
export const ENTITY_TYPE_MALWARE = 'Malware';
export const ENTITY_TYPE_THREAT_ACTOR = 'Threat-Actor';
export const ENTITY_TYPE_TOOL = 'Tool';
export const ENTITY_TYPE_VULNERABILITY = 'Vulnerability';
export const ENTITY_TYPE_INCIDENT = 'Incident';
export const ENTITY_TYPE_DATA_COMPONENT = 'Data-Component';
export const ENTITY_TYPE_DATA_SOURCE = 'Data-Source';

export const ENTITY_TYPE_RESOLVED_FILTERS = 'Resolved-Filters';

const STIX_DOMAIN_OBJECT_CONTAINERS: Array<string> = [
  ENTITY_TYPE_CONTAINER_NOTE,
  ENTITY_TYPE_CONTAINER_OBSERVED_DATA,
  ENTITY_TYPE_CONTAINER_OPINION,
  ENTITY_TYPE_CONTAINER_REPORT,
  ENTITY_TYPE_CONTAINER_GROUPING,
];

schemaAttributesDefinition.register(ENTITY_TYPE_CONTAINER, STIX_DOMAIN_OBJECT_CONTAINERS);
export const isStixDomainObjectContainer = (type: string): boolean => schemaAttributesDefinition.get(ENTITY_TYPE_CONTAINER).includes(type)
    || type === ENTITY_TYPE_CONTAINER;

const STIX_DOMAIN_OBJECT_SHAREABLE_CONTAINERS: Array<string> = [
  ENTITY_TYPE_CONTAINER_OBSERVED_DATA,
  ENTITY_TYPE_CONTAINER_GROUPING,
  ENTITY_TYPE_CONTAINER_REPORT,
];
export const isStixDomainObjectShareableContainer = (type: string): boolean => {
  return STIX_DOMAIN_OBJECT_SHAREABLE_CONTAINERS.includes(type);
};

const STIX_DOMAIN_OBJECT_IDENTITIES: Array<string> = [
  ENTITY_TYPE_IDENTITY_INDIVIDUAL,
  ENTITY_TYPE_IDENTITY_ORGANIZATION,
  ENTITY_TYPE_IDENTITY_SECTOR,
  ENTITY_TYPE_IDENTITY_SYSTEM,
];
schemaAttributesDefinition.register(ENTITY_TYPE_IDENTITY, STIX_DOMAIN_OBJECT_IDENTITIES);
export const isStixDomainObjectIdentity = (type: string): boolean => {
  return schemaAttributesDefinition.get(ENTITY_TYPE_IDENTITY).includes(type) || type === ENTITY_TYPE_IDENTITY;
};

const STIX_DOMAIN_OBJECT_LOCATIONS: Array<string> = [
  ENTITY_TYPE_LOCATION_CITY,
  ENTITY_TYPE_LOCATION_COUNTRY,
  ENTITY_TYPE_LOCATION_REGION,
  ENTITY_TYPE_LOCATION_POSITION,
];
schemaAttributesDefinition.register(ENTITY_TYPE_LOCATION, STIX_DOMAIN_OBJECT_LOCATIONS);
export const isStixDomainObjectLocation = (type: string): boolean => schemaAttributesDefinition.get(ENTITY_TYPE_LOCATION).includes(type)
  || type === ENTITY_TYPE_LOCATION;

const STIX_DOMAIN_OBJECTS: Array<string> = [
  ENTITY_TYPE_ATTACK_PATTERN,
  ENTITY_TYPE_CAMPAIGN,
  ENTITY_TYPE_CONTAINER_NOTE,
  ENTITY_TYPE_CONTAINER_OBSERVED_DATA,
  ENTITY_TYPE_CONTAINER_OPINION,
  ENTITY_TYPE_CONTAINER_REPORT,
  ENTITY_TYPE_COURSE_OF_ACTION,
  ENTITY_TYPE_IDENTITY_INDIVIDUAL,
  ENTITY_TYPE_IDENTITY_ORGANIZATION,
  ENTITY_TYPE_IDENTITY_SECTOR,
  ENTITY_TYPE_IDENTITY_SYSTEM,
  ENTITY_TYPE_INDICATOR,
  ENTITY_TYPE_INFRASTRUCTURE,
  ENTITY_TYPE_INTRUSION_SET,
  ENTITY_TYPE_LOCATION_CITY,
  ENTITY_TYPE_LOCATION_COUNTRY,
  ENTITY_TYPE_LOCATION_REGION,
  ENTITY_TYPE_LOCATION_POSITION,
  ENTITY_TYPE_MALWARE,
  ENTITY_TYPE_THREAT_ACTOR,
  ENTITY_TYPE_TOOL,
  ENTITY_TYPE_VULNERABILITY,
  ENTITY_TYPE_INCIDENT,
];
schemaAttributesDefinition.register(ABSTRACT_STIX_DOMAIN_OBJECT, STIX_DOMAIN_OBJECTS);

export const isStixDomainObject = (type: string): boolean => {
  return schemaAttributesDefinition.get(ABSTRACT_STIX_DOMAIN_OBJECT).includes(type)
    || isStixDomainObjectIdentity(type)
    || isStixDomainObjectLocation(type)
    || isStixDomainObjectContainer(type)
    || type === ABSTRACT_STIX_DOMAIN_OBJECT;
};

const STIX_DOMAIN_OBJECT_ALIASED: Array<string> = [
  ENTITY_TYPE_COURSE_OF_ACTION,
  ENTITY_TYPE_ATTACK_PATTERN,
  ENTITY_TYPE_CAMPAIGN,
  ENTITY_TYPE_INFRASTRUCTURE,
  ENTITY_TYPE_INTRUSION_SET,
  ENTITY_TYPE_MALWARE,
  ENTITY_TYPE_THREAT_ACTOR,
  ENTITY_TYPE_TOOL,
  ENTITY_TYPE_INCIDENT,
  ENTITY_TYPE_VULNERABILITY,
];
export const registerStixDomainAliased = (type: string) => {
  STIX_DOMAIN_OBJECT_ALIASED.push(type);
};
export const isStixObjectAliased = (type: string): boolean => {
  return STIX_DOMAIN_OBJECT_ALIASED.includes(type) || isStixDomainObjectIdentity(type) || isStixDomainObjectLocation(type);
};

export const resolveAliasesField = (type: string): AttributeDefinition => {
  // eslint-disable-next-line max-len
  if (type === ENTITY_TYPE_COURSE_OF_ACTION || type === ENTITY_TYPE_VULNERABILITY || type === ENTITY_TYPE_CONTAINER_GROUPING || isStixDomainObjectIdentity(type) || isStixDomainObjectLocation(type)) {
    return xOpenctiAliases;
  }
  return aliases;
};

export const STIX_ORGANIZATIONS_UNRESTRICTED = [
  ABSTRACT_INTERNAL_OBJECT,
  ABSTRACT_STIX_META_OBJECT,
  ABSTRACT_STIX_META_RELATIONSHIP,
  ENTITY_TYPE_IDENTITY,
  ENTITY_TYPE_LOCATION,
  ENTITY_TYPE_WORK, // Work is defined as an history object
  ENTITY_TYPE_TAXII_COLLECTION // TODO TaxiiCollection must be migrate to add according parent types
];

const stixDomainObjectsAttributes: { [k: string]: Array<AttributeDefinition> } = {
  [ENTITY_TYPE_ATTACK_PATTERN]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    aliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'x_mitre_platforms', type: 'string', mandatoryType: 'no', multiple: true, upsert: true, label: 'Platforms' },
    { name: 'x_mitre_permissions_required', type: 'string', mandatoryType: 'no', multiple: true, upsert: true },
    { name: 'x_mitre_detection', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'x_mitre_id', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true, label: 'External ID' },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_CAMPAIGN]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    aliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'first_seen', type: 'date', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'i_first_seen_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_first_seen_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_first_seen_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'last_seen', type: 'date', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'i_last_seen_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_last_seen_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_last_seen_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'objective', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_CONTAINER_NOTE]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    { name: 'abstract', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'attribute_abstract', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true, label: 'Abstract' },
    { name: 'content', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'authors', type: 'string', mandatoryType: 'no', multiple: true, upsert: false },
    { name: 'note_types', type: 'string', mandatoryType: 'customizable', multiple: true, upsert: true, label: 'Note types' },
    { name: 'likelihood', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
  ],
  [ENTITY_TYPE_CONTAINER_OBSERVED_DATA]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    { name: 'first_observed', type: 'date', mandatoryType: 'external', multiple: false, upsert: false, label: 'First observed' },
    { name: 'last_observed', type: 'date', mandatoryType: 'external', multiple: false, upsert: false, label: 'Last observed' },
    { name: 'objects', type: 'string', mandatoryType: 'external', multiple: false, upsert: false, label: 'Entities' },
    { name: 'number_observed', type: 'numeric', mandatoryType: 'customizable', multiple: false, upsert: false, label: 'Number observed' },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_CONTAINER_OPINION]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    { name: 'explanation', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },
    { name: 'authors', type: 'string', mandatoryType: 'no', multiple: true, upsert: false },
    { name: 'opinion', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_CONTAINER_REPORT]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'creator', type: 'runtime', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'report_types', type: 'string', mandatoryType: 'customizable', multiple: true, upsert: true, label: 'Report types' },
    { name: 'published', type: 'date', mandatoryType: 'external', multiple: false, upsert: false },
    { name: 'i_published_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_published_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_published_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_COURSE_OF_ACTION]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    xOpenctiAliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'x_mitre_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'x_opencti_threat_hunting', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'x_opencti_log_sources', type: 'string', mandatoryType: 'no', multiple: true, upsert: true },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_IDENTITY_INDIVIDUAL]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    xOpenctiAliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'contact_information', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'identity_class', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'roles', type: 'string', mandatoryType: 'no', multiple: true, upsert: false },
    { name: 'x_opencti_firstname', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_lastname', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_IDENTITY_ORGANIZATION]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    xOpenctiAliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'contact_information', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'identity_class', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'roles', type: 'string', mandatoryType: 'no', multiple: true, upsert: false },
    { name: 'x_opencti_organization_type', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: false, label: 'Organization type' },
    { name: 'x_opencti_reliability', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: false, label: 'Reliability' },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_IDENTITY_SECTOR]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    xOpenctiAliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'contact_information', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'identity_class', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'roles', type: 'string', mandatoryType: 'no', multiple: true, upsert: false },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_IDENTITY_SYSTEM]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    xOpenctiAliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'contact_information', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'identity_class', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'roles', type: 'string', mandatoryType: 'no', multiple: true, upsert: false },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_INDICATOR]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'pattern_type', type: 'string', mandatoryType: 'external', multiple: false, upsert: false, label: 'Pattern type' },
    { name: 'pattern_version', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'pattern', type: 'string', mandatoryType: 'external', multiple: false, upsert: false },
    { name: 'indicator_types', type: 'string', mandatoryType: 'customizable', multiple: true, upsert: true, label: 'Indicator types' },
    { name: 'valid_from', type: 'date', mandatoryType: 'customizable', multiple: false, upsert: true, label: 'Valid from' },
    { name: 'i_valid_from_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_valid_from_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_valid_from_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'valid_until', type: 'date', mandatoryType: 'customizable', multiple: false, upsert: true, label: 'Valid until' },
    { name: 'i_valid_until_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_valid_until_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_valid_until_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_score', type: 'numeric', mandatoryType: 'customizable', multiple: false, upsert: true, label: 'Score' },
    { name: 'x_opencti_detection', type: 'boolean', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'x_opencti_main_observable_type', type: 'string', mandatoryType: 'external', multiple: false, upsert: true, label: 'Main observable type' },
    { name: 'x_mitre_platforms', type: 'string', mandatoryType: 'customizable', multiple: true, upsert: true, label: 'Platforms' },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_INFRASTRUCTURE]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    aliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'infrastructure_types', type: 'string', mandatoryType: 'customizable', multiple: true, upsert: false, label: 'Infrastructure types' },
    { name: 'first_seen', type: 'date', mandatoryType: 'customizable', multiple: false, upsert: false, label: 'First seen' },
    { name: 'i_first_seen_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_first_seen_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_first_seen_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'last_seen', type: 'date', mandatoryType: 'customizable', multiple: false, upsert: false, label: 'Last seen' },
    { name: 'i_last_seen_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_last_seen_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_last_seen_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_INTRUSION_SET]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    aliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'first_seen', type: 'date', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'i_first_seen_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_first_seen_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_first_seen_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'last_seen', type: 'date', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'i_last_seen_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_last_seen_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_last_seen_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'goals', type: 'string', mandatoryType: 'no', multiple: true, upsert: true },
    { name: 'resource_level', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'primary_motivation', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'secondary_motivations', type: 'string', mandatoryType: 'no', multiple: true, upsert: true },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_LOCATION_CITY]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    xOpenctiAliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'latitude', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },
    { name: 'longitude', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },
    { name: 'precision', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    entityLocationType,

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_LOCATION_COUNTRY]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    xOpenctiAliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'latitude', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'longitude', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'precision', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    entityLocationType,

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_LOCATION_REGION]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    xOpenctiAliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'latitude', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'longitude', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'precision', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    entityLocationType,

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_LOCATION_POSITION]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    xOpenctiAliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'latitude', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },
    { name: 'longitude', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },
    { name: 'precision', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    entityLocationType,
    { name: 'street_address', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: false, label: 'Street address' },
    { name: 'postal_code', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: false, label: 'Postal code' },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_MALWARE]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    aliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'malware_types', type: 'string', mandatoryType: 'customizable', multiple: true, upsert: true, label: 'Malware types' },
    { name: 'is_family', type: 'boolean', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'first_seen', type: 'date', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'i_first_seen_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_first_seen_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_first_seen_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'last_seen', type: 'date', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'i_last_seen_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_last_seen_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_last_seen_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'architecture_execution_envs', type: 'string', mandatoryType: 'no', multiple: true, upsert: false },
    { name: 'implementation_languages', type: 'string', mandatoryType: 'no', multiple: true, upsert: false },
    { name: 'capabilities', type: 'string', mandatoryType: 'no', multiple: true, upsert: false },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_THREAT_ACTOR]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    aliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'threat_actor_types', type: 'string', mandatoryType: 'customizable', multiple: true, upsert: false, label: 'Threat actor types' },
    { name: 'first_seen', type: 'date', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'i_first_seen_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_first_seen_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_first_seen_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'last_seen', type: 'date', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'i_last_seen_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_last_seen_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'i_last_seen_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'goals', type: 'string', mandatoryType: 'no', multiple: true, upsert: true },
    { name: 'roles', type: 'string', mandatoryType: 'no', multiple: true, upsert: true },
    { name: 'sophistication', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'resource_level', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'primary_motivation', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'secondary_motivations', type: 'string', mandatoryType: 'no', multiple: true, upsert: true },
    { name: 'personal_motivations', type: 'string', mandatoryType: 'no', multiple: true, upsert: false },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_TOOL]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    aliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'tool_types', type: 'string', mandatoryType: 'customizable', multiple: true, upsert: false, label: 'Tool types' },
    { name: 'tool_version', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_VULNERABILITY]: [
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    xOpenctiAliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },
    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'x_opencti_base_score', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true, label: 'CVSS3 - Score' },
    { name: 'x_opencti_base_severity', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true, label: 'CVSS3 - Severity' },
    { name: 'x_opencti_attack_vector', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true, label: 'CVSS3 - Attack vector' },
    { name: 'x_opencti_integrity_impact', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'x_opencti_availability_impact', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },
    { name: 'x_opencti_confidentiality_impact', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },
    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }
  ],
  [ENTITY_TYPE_INCIDENT]: [
    // Check Name, type, mandatory, multiple, upsert
    internalId,
    standardId,
    xOpenctiStixIds,
    entityType,
    specVersion,

    createdAt,
    updatedAt,
    IcreatedAtDay,
    IcreatedAtMonth,
    IcreatedAtYear,

    revoked,
    confidence,
    lang,

    created,
    modified,

    aliases,
    iAliasedIds,

    { name: 'name', type: 'string', mandatoryType: 'external', multiple: false, upsert: true },

    { name: 'description', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'incident_type', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true, label: 'Incident type' },

    { name: 'severity', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'source', type: 'string', mandatoryType: 'customizable', multiple: false, upsert: true },

    { name: 'first_seen', type: 'date', mandatoryType: 'no', multiple: false, upsert: true },

    { name: 'i_first_seen_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },

    { name: 'i_first_seen_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },

    { name: 'i_first_seen_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },

    { name: 'last_seen', type: 'date', mandatoryType: 'no', multiple: false, upsert: true },

    { name: 'i_last_seen_day', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },

    { name: 'i_last_seen_month', type: 'date', mandatoryType: 'no', multiple: false, upsert: false },

    { name: 'i_last_seen_year', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },

    { name: 'objective', type: 'string', mandatoryType: 'no', multiple: false, upsert: true },

    { name: 'x_opencti_graph_data', type: 'string', mandatoryType: 'no', multiple: false, upsert: false },

    { name: 'x_opencti_workflow_id', type: 'string', mandatoryType: 'no', multiple: false, upsert: false }

  ],
};
R.forEachObjIndexed((value, key) => schemaAttributesDefinition.registerAttributes(key as string, value), stixDomainObjectsAttributes);
