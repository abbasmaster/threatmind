import { WorkMessages } from './ConnectorWorks';
import { getMainRepresentative } from '../../../../utils/defaultRepresentatives';
import { fetchQuery, graphql } from 'react-relay';
import { environment } from '../../../../relay/environment';
import { parseWorkErrorsQuery$data } from '@components/data/connectors/__generated__/parseWorkErrorsQuery.graphql';

const parseWorkErrorsQuery = graphql`
  query parseWorkErrorsQuery($ids: [Any!]!) {
    stixObjectOrStixRelationships(
      filters: {
        mode: or
        filterGroups: []
        filters: [
          {
            key: "standard_id"
            values: $ids
            mode: or
          }
        ]
      }
    ) {
      edges {
        node {
          ... on StixCoreObject {
            id
            standard_id
            entity_type
            representative {
              main
            }
          }
          ... on StixRelationship {
            id
            standard_id
            entity_type
            representative {
              main
            }
            from {
              ... on StixCoreObject {
                id
                standard_id
                entity_type
                representative {
                  main
                }
              }
              ... on StixRelationship {
                id
                standard_id
                entity_type
                representative {
                  main
                }
              }
            }
            to {
              ... on StixCoreObject {
                id
                standard_id
                entity_type
                representative {
                  main
                }
              }
              ... on StixRelationship {
                id
                standard_id
                entity_type
                representative {
                  main
                }
              }
            }
          }
        }
      }
    }
  }
`;

type ResolvedEntity = NonNullable<NonNullable<NonNullable<parseWorkErrorsQuery$data['stixObjectOrStixRelationships']>['edges']>[number]>['node'];

type ErrorLevel = 'Critical' | 'Warning' | 'Unclassified';

export interface FullParsedWorkMessage {
  isParsed: true,
  level: ErrorLevel,
  parsedError: {
    category: string,
    message: string,
    entity: ResolvedEntity,
  }
  rawError: NonNullable<WorkMessages>[number],
}

export interface PartialParsedWorkMessage {
  isParsed: false,
  level: 'Unclassified',
  rawError: NonNullable<WorkMessages>[number],
}

export type ParsedWorkMessage = FullParsedWorkMessage | PartialParsedWorkMessage;

const criticalErrorTypes = [
  'MULTIPLE_REFERENCES_ERROR',
  'UNSUPPORTED_ERROR',
  'DATABASE_ERROR',
  'INTERNAL_SERVER_ERROR',
];

const warningErrorTypes = [
  'VALIDATION_ERROR',
  'MULTIPLE_ENTITIES_ERROR',
  'ACL_ERROR',
  'MISSING_REFERENCE_ERROR',
];

// Create custom error object from stringified error
const parseWorkErrors = async (errorsList: WorkMessages): Promise<ParsedWorkMessage[]> => {
  const ids: string[] = [];

  const getLevel = (type: string): ErrorLevel => {
    if (criticalErrorTypes.includes(type)) return 'Critical';
    if (warningErrorTypes.includes(type)) return 'Warning';
    return 'Unclassified';
  };

  const parsedList: ParsedWorkMessage[] = (errorsList ?? []).flatMap((error) => {
    if (!error) return [];
    // Try/Catch to prevent JSON.parse Exception
    try {
      const source = JSON.parse(error.source ?? '');
      const message = JSON.parse((error.message ?? '').replace(/'/g, '"'));
      const entityId = source.id;
      const parsedError = {
        category: message.name,
        message: message.error_message,
        entity: {
          standard_id: entityId,
          representative: { main: getMainRepresentative(source, entityId) },
          entity_type: source.type,
        },
      };
      ids.push(entityId);
      return {
        isParsed: true,
        level: getLevel(message.name ?? ''),
        parsedError,
        rawError: error,
      };
    } catch (_) {
      return {
        isParsed: false,
        level: 'Unclassified',
        rawError: error,
      };
    }
  });

  const entities = await fetchQuery(
    environment,
    parseWorkErrorsQuery,
    { ids }
  )
    .toPromise()
    .then((data) => {
      return ((data as parseWorkErrorsQuery$data)?.stixObjectOrStixRelationships?.edges ?? []).map((n) => n?.node);
    });

  parsedList.map((error) => {
    if (error.isParsed) {
      const findEntity = entities.find((entity) => entity?.standard_id === error.parsedError.entity.standard_id);
      if (findEntity) error.parsedError.entity = findEntity;
    }
  });

  return parsedList;
};

export default parseWorkErrors;
