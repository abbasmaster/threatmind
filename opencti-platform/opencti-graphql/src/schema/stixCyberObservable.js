import * as R from 'ramda';
import {
  ABSTRACT_STIX_CYBER_OBSERVABLE,
  ABSTRACT_STIX_CYBER_OBSERVABLE_HASHED_OBSERVABLE,
  REL_INDEX_PREFIX,
  schemaTypes,
} from './general';
import {
  RELATION_CREATED_BY,
  RELATION_EXTERNAL_REFERENCE,
  RELATION_OBJECT,
  RELATION_OBJECT_LABEL,
  RELATION_OBJECT_MARKING,
} from './stixMetaRelationship';
import { RELATION_RELATED_TO } from './stixCoreRelationship';

export const ENTITY_AUTONOMOUS_SYSTEM = 'Autonomous-System';
export const ENTITY_DIRECTORY = 'Directory';
export const ENTITY_DOMAIN_NAME = 'Domain-Name';
export const ENTITY_EMAIL_ADDR = 'Email-Addr';
export const ENTITY_EMAIL_MESSAGE = 'Email-Message';
export const ENTITY_EMAIL_MIME_PART_TYPE = 'Email-Mime-Part-Type';
export const ENTITY_HASHED_OBSERVABLE_ARTIFACT = 'Artifact';
export const ENTITY_HASHED_OBSERVABLE_STIX_FILE = 'StixFile'; // Because File already used
export const ENTITY_HASHED_OBSERVABLE_X509_CERTIFICATE = 'X509-Certificate';
export const ENTITY_IPV4_ADDR = 'IPv4-Addr';
export const ENTITY_IPV6_ADDR = 'IPv6-Addr';
export const ENTITY_MAC_ADDR = 'Mac-Addr';
export const ENTITY_MUTEX = 'Mutex';
export const ENTITY_NETWORK_TRAFFIC = 'Network-Traffic';
export const ENTITY_PROCESS = 'Process';
export const ENTITY_SOFTWARE = 'Software';
export const ENTITY_URL = 'Url';
export const ENTITY_USER_ACCOUNT = 'User-Account';
export const ENTITY_WINDOWS_REGISTRY_KEY = 'Windows-Registry-Key';
export const ENTITY_WINDOWS_REGISTRY_VALUE_TYPE = 'Windows-Registry-Value-Type';
export const ENTITY_X509_V3_EXTENSIONS_TYPE = 'X509-V3-Extensions-Type';
export const ENTITY_X_OPENCTI_CRYPTOGRAPHIC_KEY = 'X-OpenCTI-Cryptographic-Key';
export const ENTITY_X_OPENCTI_CRYPTOGRAPHIC_WALLET = 'X-OpenCTI-Cryptocurrency-Wallet';
export const ENTITY_X_OPENCTI_HOSTNAME = 'X-OpenCTI-Hostname';
export const ENTITY_X_OPENCTI_TEXT = 'X-OpenCTI-Text';
export const ENTITY_X_OPENCTI_USER_AGENT = 'X-OpenCTI-User-Agent';

const STIX_CYBER_OBSERVABLES_HASHED_OBSERVABLES = [
  ENTITY_HASHED_OBSERVABLE_ARTIFACT,
  ENTITY_HASHED_OBSERVABLE_STIX_FILE,
  ENTITY_HASHED_OBSERVABLE_X509_CERTIFICATE,
];
schemaTypes.register(ABSTRACT_STIX_CYBER_OBSERVABLE_HASHED_OBSERVABLE, STIX_CYBER_OBSERVABLES_HASHED_OBSERVABLES);
const STIX_CYBER_OBSERVABLES = [
  ENTITY_AUTONOMOUS_SYSTEM,
  ENTITY_DIRECTORY,
  ENTITY_DOMAIN_NAME,
  ENTITY_EMAIL_ADDR,
  ENTITY_EMAIL_MESSAGE,
  ENTITY_EMAIL_MIME_PART_TYPE,
  ENTITY_HASHED_OBSERVABLE_ARTIFACT,
  ENTITY_HASHED_OBSERVABLE_STIX_FILE,
  ENTITY_HASHED_OBSERVABLE_X509_CERTIFICATE,
  ENTITY_X509_V3_EXTENSIONS_TYPE,
  ENTITY_IPV4_ADDR,
  ENTITY_IPV6_ADDR,
  ENTITY_MAC_ADDR,
  ENTITY_MUTEX,
  ENTITY_NETWORK_TRAFFIC,
  ENTITY_PROCESS,
  ENTITY_SOFTWARE,
  ENTITY_URL,
  ENTITY_USER_ACCOUNT,
  ENTITY_WINDOWS_REGISTRY_KEY,
  ENTITY_WINDOWS_REGISTRY_VALUE_TYPE,
  ENTITY_X_OPENCTI_CRYPTOGRAPHIC_KEY,
  ENTITY_X_OPENCTI_CRYPTOGRAPHIC_WALLET,
  ENTITY_X_OPENCTI_HOSTNAME,
  ENTITY_X_OPENCTI_USER_AGENT,
  ENTITY_X_OPENCTI_TEXT,
];
schemaTypes.register(ABSTRACT_STIX_CYBER_OBSERVABLE, STIX_CYBER_OBSERVABLES);

export const isStixCyberObservableHashedObservable = (type) =>
  R.includes(type, STIX_CYBER_OBSERVABLES_HASHED_OBSERVABLES);
export const isStixCyberObservable = (type) =>
  R.includes(type, STIX_CYBER_OBSERVABLES) || type === ABSTRACT_STIX_CYBER_OBSERVABLE;

export const stixCyberObservableOptions = {
  StixCyberObservablesOrdering: {
    objectMarking: `${REL_INDEX_PREFIX}${RELATION_OBJECT_MARKING}.definition`,
    objectLabel: `${REL_INDEX_PREFIX}${RELATION_OBJECT_LABEL}.value`,
  },
  StixCyberObservablesFilter: {
    createdBy: `${REL_INDEX_PREFIX}${RELATION_CREATED_BY}.internal_id`,
    markedBy: `${REL_INDEX_PREFIX}${RELATION_OBJECT_MARKING}.internal_id`,
    labelledBy: `${REL_INDEX_PREFIX}${RELATION_OBJECT_LABEL}.internal_id`,
    relatedTo: `${REL_INDEX_PREFIX}${RELATION_RELATED_TO}.internal_id`,
    objectContained: `${REL_INDEX_PREFIX}${RELATION_OBJECT}.internal_id`,
    hasExternalReference: `${REL_INDEX_PREFIX}${RELATION_EXTERNAL_REFERENCE}.internal_id`,
  },
};

export const stixCyberObservablesAttributes = {
  [ENTITY_AUTONOMOUS_SYSTEM]: ['number', 'name', 'rir'],
  [ENTITY_DIRECTORY]: ['path', 'path_enc', 'ctime', 'mtime', 'atime'],
  [ENTITY_DOMAIN_NAME]: ['value'],
  [ENTITY_EMAIL_ADDR]: ['value', 'display_name'],
  [ENTITY_EMAIL_MESSAGE]: [
    'is_multipart',
    'attribute_date',
    'content_type',
    'message_id',
    'subject',
    'received_lines',
    'body',
  ],
  [ENTITY_EMAIL_MIME_PART_TYPE]: ['body', 'content_type', 'content_disposition'],
  [ENTITY_HASHED_OBSERVABLE_ARTIFACT]: ['hashes', 'payload_bin', 'url', 'encryption_algorithm', 'decryption_key'],
  [ENTITY_HASHED_OBSERVABLE_STIX_FILE]: [
    'hashes',
    'extensions',
    'size',
    'name',
    'name_enc',
    'magic_number_hex',
    'ctime',
    'mtime',
    'atime',
  ],
  [ENTITY_HASHED_OBSERVABLE_X509_CERTIFICATE]: [
    'is_self_signed',
    'version',
    'serial_number',
    'signature_algorithm',
    'issuer',
    'validity_not_before',
    'validity_not_after',
    'subject',
    'subject_public_key_algorithm',
    'subject_public_key_modulus',
    'subject_public_key_exponent',
  ],
  [ENTITY_IPV4_ADDR]: ['value'],
  [ENTITY_IPV6_ADDR]: ['value'],
  [ENTITY_MAC_ADDR]: ['value'],
  [ENTITY_MUTEX]: ['name'],
  [ENTITY_NETWORK_TRAFFIC]: [
    'extensions',
    'start',
    'end',
    'is_active',
    'src_port',
    'dst_port',
    'protocols',
    'src_byte_count',
    'dst_byte_count',
    'src_packets',
    'dst_packets',
  ],
  [ENTITY_PROCESS]: ['extensions', 'is_hidden', 'pid', 'created_time', 'cwd', 'command_line', 'environment_variables'],
  [ENTITY_SOFTWARE]: ['name', 'cpe', 'swid', 'languages', 'vendor', 'version'],
  [ENTITY_URL]: ['value'],
  [ENTITY_USER_ACCOUNT]: [
    'extensions',
    'user_id',
    'credential',
    'account_login',
    'account_type',
    'display_name',
    'is_service_account',
    'is_privileged',
    'can_escalate_privs',
    'is_disabled',
    'account_created',
    'account_expires',
    'credential_last_changed',
    'account_first_login',
    'account_last_login',
  ],
  [ENTITY_WINDOWS_REGISTRY_KEY]: ['attribute_key', 'modified_time', 'number_of_subkeys'],
  [ENTITY_WINDOWS_REGISTRY_VALUE_TYPE]: ['name', 'data', 'data_type'],
  [ENTITY_X509_V3_EXTENSIONS_TYPE]: [
    'basic_constraints',
    'name_constraints',
    'policy_constraints',
    'key_usage',
    'extended_key_usage',
    'subject_key_identifier',
    'authority_key_identifier',
    'subject_alternative_name',
    'issuer_alternative_name',
    'subject_directory_attributes',
    'crl_distribution_points',
    'inhibit_any_policy',
    'private_key_usage_period_not_before',
    'private_key_usage_period_not_after',
    'certificate_policies',
    'policy_mappings',
  ],
  [ENTITY_X_OPENCTI_CRYPTOGRAPHIC_KEY]: ['value'],
  [ENTITY_X_OPENCTI_CRYPTOGRAPHIC_WALLET]: ['value'],
  [ENTITY_X_OPENCTI_HOSTNAME]: ['value'],
  [ENTITY_X_OPENCTI_TEXT]: ['value'],
  [ENTITY_X_OPENCTI_USER_AGENT]: ['value'],
};
R.forEachObjIndexed((value, key) => schemaTypes.registerAttributes(key, value), stixCyberObservablesAttributes);
