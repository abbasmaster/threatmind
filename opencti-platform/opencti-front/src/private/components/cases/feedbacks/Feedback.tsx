import React, { FunctionComponent } from 'react';
import { graphql, useFragment } from 'react-relay';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import FeedbackDetails from './FeedbackDetails';
import FeedbackPopover from './FeedbackPopover';
import ContainerHeader from '../../common/containers/ContainerHeader';
import StixDomainObjectOverview from '../../common/stix_domain_objects/StixDomainObjectOverview';
import ContainerStixObjectsOrStixRelationships from '../../common/containers/ContainerStixObjectsOrStixRelationships';
import Security from '../../../../utils/Security';
import { KNOWLEDGE_KNUPDATE } from '../../../../utils/hooks/useGranted';
import FeedbackEdition from './FeedbackEdition';
import StixCoreObjectExternalReferences from '../../analyses/external_references/StixCoreObjectExternalReferences';
import StixCoreObjectLatestHistory from '../../common/stix_core_objects/StixCoreObjectLatestHistory';
import { Feedback_case$key } from './__generated__/Feedback_case.graphql';
import { authorizedMembersToOptions } from '../../../../utils/authorizedMembers';

const useStyles = makeStyles(() => ({
  gridContainer: {
    marginBottom: 20,
  },
  container: {
    margin: 0,
  },
}));

const feedbackFragment = graphql`
  fragment Feedback_case on Feedback {
    id
    name
    standard_id
    entity_type
    x_opencti_stix_ids
    created
    modified
    created_at
    rating
    revoked
    description
    confidence
    currentUserAccessRight
    authorizedMembers {
      id
      name
      entity_type
      access_right
    }
    createdBy {
      ... on Identity {
        id
        name
        entity_type
        x_opencti_reliability
      }
    }
    creators {
      id
      name
    }
    objectMarking {
      edges {
        node {
          id
          definition_type
          definition
          x_opencti_order
          x_opencti_color
        }
      }
    }
    objectLabel {
      edges {
        node {
          id
          value
          color
        }
      }
    }
    objectAssignee {
      edges {
        node {
          id
          name
          entity_type
        }
      }
    }
    x_opencti_stix_ids
    status {
      id
      order
      template {
        name
        color
      }
    }
    workflowEnabled
    ...FeedbackDetails_case
    ...ContainerHeader_container
    ...ContainerStixObjectsOrStixRelationships_container
  }
`;

// Mutation to edit authorized members of a feedback
const feedbackAuthorizedMembersMutation = graphql`
  mutation FeedbackAuthorizedMembersMutation(
    $id: ID!
    $input: [MemberAccessInput!]
  ) {
    feedbackEditAuthorizedMembers(id: $id, input: $input) {
      authorizedMembers {
        id
        name
        entity_type
        access_right
      }
    }
  }
`;

interface FeedbackProps {
  data: Feedback_case$key;
}

const FeedbackComponent: FunctionComponent<FeedbackProps> = ({ data }) => {
  const classes = useStyles();
  const feedbackData = useFragment(feedbackFragment, data);

  const canManage = feedbackData.currentUserAccessRight === 'admin';
  const canEdit = canManage || feedbackData.currentUserAccessRight === 'edit';

  return (
    <div className={classes.container}>
      <ContainerHeader
        container={feedbackData}
        PopoverComponent={<FeedbackPopover id={feedbackData.id} />}
        enableSuggestions={false}
        disableSharing
        enableQuickSubscription
        enableManageAuthorizedMembers={canManage}
        authorizedMembersMutation={feedbackAuthorizedMembersMutation}
        authorizedMembers={authorizedMembersToOptions(feedbackData.authorizedMembers)}
      />
      <Grid
        container={true}
        spacing={3}
        classes={{ container: classes.gridContainer }}
      >
        <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
          <FeedbackDetails feedbackData={feedbackData} />
        </Grid>
        <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
          <StixDomainObjectOverview
            stixDomainObject={feedbackData}
            displayAssignees={true}
            displayConfidence={false}
          />
        </Grid>
        <Grid item={true} xs={12} style={{ marginTop: 30 }}>
          <ContainerStixObjectsOrStixRelationships
            isSupportParticipation={false}
            container={feedbackData}
          />
        </Grid>
        <Grid item={true} xs={6} style={{ marginTop: 30 }}>
          <StixCoreObjectExternalReferences
            stixCoreObjectId={feedbackData.id}
          />
        </Grid>
        <Grid item={true} xs={6} style={{ marginTop: 30 }}>
          <StixCoreObjectLatestHistory stixCoreObjectId={feedbackData.id} />
        </Grid>
      </Grid>
      <Security needs={[KNOWLEDGE_KNUPDATE]} hasAccess={canEdit}>
        <FeedbackEdition feedbackId={feedbackData.id} />
      </Security>
    </div>
  );
};

export default FeedbackComponent;
