import {
  aliases,
  created,
  createdAt,
  creators,
  entityLocationType,
  entityType,
  files,
  iAliasedIds,
  internalId,
  lang,
  modified,
  revoked,
  specVersion,
  standardId,
  updatedAt,
  xOpenctiAliases,
  xOpenctiStixIds
} from '../schema/attribute-definition';
import { xOpenctiLinkedTo } from '../schema/stixRefRelationship';

export const INTERNAL_ATTRIBUTES = [
  internalId.name,
  standardId.name,
  xOpenctiStixIds.name,
  creators.name,
  entityType.name,
  specVersion.name,
  createdAt.name,
  updatedAt.name,
  created.name,
  modified.name,
  files.name,
  lang.name,
  revoked.name,
  xOpenctiAliases.name,
  aliases.name,
  iAliasedIds.name,
  'x_opencti_graph_data',
  'x_opencti_workflow_id',
  entityLocationType.name,
  'external_id',
  'i_inference_weight',
  'relationship_type',
  'x_mitre_permissions_required',
  'x_mitre_detection',
  'x_mitre_id',
  'content_mapping',
  'casetemplate',
  'x_opencti_threat_hunting',
  'x_opencti_log_sources',
  'x_opencti_firstname',
  'x_opencti_lastname',
  'identity_class',
  'default_dashboard',
  'default_hidden_types',
  'x_opencti_base_score',
  'x_opencti_base_severity',
  'x_opencti_attack_vector',
  'x_opencti_integrity_impact',
  'x_opencti_availability_impact',
  'x_opencti_confidentiality_impact',

];

export const INTERNAL_REFS = [
  xOpenctiLinkedTo.inputName,
  'objectOrganization'
];
