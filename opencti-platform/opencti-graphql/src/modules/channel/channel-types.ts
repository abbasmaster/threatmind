import type { BasicStoreEntity, StoreEntity } from '../../types/store';
import type { StixDomainObject, StixOpenctiExtensionSDO } from '../../types/stix-common';
import { STIX_EXT_OCTI } from '../../types/stix-extensions';

export const ENTITY_TYPE_CHANNEL = 'Channel';

// region Database types
export interface BasicStoreEntityChannel extends BasicStoreEntity {
  name: string;
  description: string;
  type: 'radio' | 'press';
}

export interface StoreEntityChannel extends StoreEntity {
  name: string;
  description: string;
  type: 'radio' | 'press';
}
// endregion

// region Stix type
export interface StixChannel extends StixDomainObject {
  name: string;
  description: string;
  type: 'radio' | 'press';
  aliases: Array<string>;
  extensions: {
    [STIX_EXT_OCTI] : StixOpenctiExtensionSDO
  };
}
// endregion
