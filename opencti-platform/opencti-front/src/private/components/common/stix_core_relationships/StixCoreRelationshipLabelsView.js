import React from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import { graphql } from 'react-relay';
import inject18n from '../../../../components/i18n';
import StixCoreObjectOrCoreRelationshipLabelsView
  from '../stix_core_objects_or_stix_relationships/StixCoreObjectOrCoreRelationshipLabelsView';
import { useIsEnforceReference } from '../../../../utils/hooks/useEntitySettings';

const stixCoreRelationshipMutationRelationsAdd = graphql`
  mutation StixCoreRelationshipLabelsViewRelationsAddMutation(
    $id: ID!
    $input: StixRefRelationshipsAddInput!
    $commitMessage: String
    $references: [String]
  ) {
    stixCoreRelationshipEdit(id: $id) {
      relationsAdd(
        input: $input
        commitMessage: $commitMessage
        references: $references
      ) {
        objectLabel {
          edges {
            node {
              id
              value
              color
            }
          }
        }
      }
    }
  }
`;

const stixCoreRelationshipMutationRelationsDelete = graphql`
  mutation StixCoreRelationshipLabelsViewRelationDeleteMutation(
    $id: ID!
    $toId: StixRef!
    $relationship_type: String!
    $commitMessage: String
    $references: [String]
  ) {
    stixCoreRelationshipEdit(id: $id) {
      relationDelete(
        toId: $toId
        relationship_type: $relationship_type
        commitMessage: $commitMessage
        references: $references
      ) {
        ... on StixCoreRelationship {
          objectLabel {
            edges {
              node {
                id
                value
                color
              }
            }
          }
        }
      }
    }
  }
`;

const StixCoreRelationshipLabelsView = (props) => {
  return <StixCoreObjectOrCoreRelationshipLabelsView {...props}
                                                     mutationRelationAdd={stixCoreRelationshipMutationRelationsAdd}
                                                     mutationRelationDelete={stixCoreRelationshipMutationRelationsDelete}
                                                     enableReferences={useIsEnforceReference('stix-core-relationship')}/>;
};

StixCoreRelationshipLabelsView.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func,
  id: PropTypes.string,
  labels: PropTypes.object,
};

export default compose(inject18n)(StixCoreRelationshipLabelsView);
