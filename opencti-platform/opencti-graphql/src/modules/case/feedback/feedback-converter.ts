import { buildStixDomain, cleanObject } from '../../../database/stix-converter';
import { STIX_EXT_OCTI } from '../../../types/stix-extensions';
import { INPUT_OBJECTS } from '../../../schema/general';
import type { StixFeedback, StoreEntityFeedback } from './feedback-types';

const convertFeedbackToStix = (instance: StoreEntityFeedback): StixFeedback => {
  const feedback = buildStixDomain(instance);
  return {
    ...feedback,
    name: instance.name,
    description: instance.description,
    content: instance.content,
    content_mapping: instance.content_mapping,
    authorized_members: instance.authorized_members,
    rating: instance.rating,
    object_refs: (instance[INPUT_OBJECTS] ?? []).map((m) => m.standard_id),
    extensions: {
      [STIX_EXT_OCTI]: cleanObject({
        ...feedback.extensions[STIX_EXT_OCTI],
        extension_type: 'new-sdo',
      })
    }
  };
};

export default convertFeedbackToStix;
