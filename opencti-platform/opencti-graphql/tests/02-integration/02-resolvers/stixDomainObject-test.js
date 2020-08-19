import gql from 'graphql-tag';
import { queryAsAdmin } from '../../utils/testQuery';

const LIST_QUERY = gql`
  query stixDomainObjects(
    $first: Int
    $after: ID
    $orderBy: StixDomainObjectsOrdering
    $orderMode: OrderingMode
    $filters: [StixDomainObjectsFiltering]
    $filterMode: FilterMode
    $search: String
  ) {
    stixDomainObjects(
      first: $first
      after: $after
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
      filterMode: $filterMode
      search: $search
    ) {
      edges {
        node {
          id
          ... on Report {
            name
            description
          }
        }
      }
    }
  }
`;

const READ_QUERY = gql`
  query stixDomainObject($id: String!) {
    stixDomainObject(id: $id) {
      id
      standard_id
      toStix
      editContext {
        focusOn
        name
      }
      ... on Report {
        name
        description
      }
    }
  }
`;

describe('StixDomainObject resolver standard behavior', () => {
  let stixDomainObjectInternalId;
  const stixDomainObjectStixId = 'report--34c9875d-8206-4f4b-bf17-f58d9cf7ebec';
  it('should stixDomainObject created', async () => {
    const CREATE_QUERY = gql`
      mutation StixDomainObjectAdd($input: StixDomainObjectAddInput) {
        stixDomainObjectAdd(input: $input) {
          id
          standard_id
          objectLabel {
            edges {
              node {
                id
              }
            }
          }
          ... on Report {
            name
            description
          }
        }
      }
    `;
    // Create the stixDomainObject
    const STIX_DOMAIN_ENTITY_TO_CREATE = {
      input: {
        name: 'StixDomainObject',
        type: 'Report',
        stix_id: stixDomainObjectStixId,
        description: 'StixDomainObject description',
        objectLabel: ['TrickBot', 'COVID-19'],
      },
    };
    const stixDomainObject = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: STIX_DOMAIN_ENTITY_TO_CREATE,
    });
    expect(stixDomainObject).not.toBeNull();
    expect(stixDomainObject.data.stixDomainObjectAdd).not.toBeNull();
    expect(stixDomainObject.data.stixDomainObjectAdd.name).toEqual('StixDomainObject');
    expect(stixDomainObject.data.stixDomainObjectAdd.objectLabel.edges.length).toEqual(2);
    stixDomainObjectInternalId = stixDomainObject.data.stixDomainObjectAdd.id;
  });
  it('should stixDomainObject loaded by internal id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: stixDomainObjectInternalId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.stixDomainObject).not.toBeNull();
    expect(queryResult.data.stixDomainObject.id).toEqual(stixDomainObjectInternalId);
    expect(queryResult.data.stixDomainObject.toStix.length).toBeGreaterThan(5);
  });
  it('should stixDomainObject loaded by stix id', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: stixDomainObjectStixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.stixDomainObject).not.toBeNull();
    expect(queryResult.data.stixDomainObject.id).toEqual(stixDomainObjectInternalId);
  });
  it('should list stixDomainObjects', async () => {
    const queryResult = await queryAsAdmin({ query: LIST_QUERY, variables: { first: 10 } });
    expect(queryResult.data.stixDomainObjects.edges.length).toEqual(10);
  });
  it('should stixDomainObjects number to be accurate', async () => {
    const NUMBER_QUERY = gql`
      query stixDomainObjectsNumber {
        stixDomainObjectsNumber {
          total
        }
      }
    `;
    const queryResult = await queryAsAdmin({ query: NUMBER_QUERY });
    expect(queryResult.data.stixDomainObjectsNumber.total).toEqual(37);
  });
  it('should timeseries stixDomainObjects to be accurate', async () => {
    const TIMESERIES_QUERY = gql`
      query stixDomainObjectsTimeSeries(
        $type: String
        $field: String!
        $operation: StatsOperation!
        $startDate: DateTime!
        $endDate: DateTime!
        $interval: String!
      ) {
        stixDomainObjectsTimeSeries(
          type: $type
          field: $field
          operation: $operation
          startDate: $startDate
          endDate: $endDate
          interval: $interval
        ) {
          date
          value
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: TIMESERIES_QUERY,
      variables: {
        field: 'created',
        operation: 'count',
        startDate: '2020-01-01T00:00:00+00:00',
        endDate: '2021-01-01T00:00:00+00:00',
        interval: 'month',
      },
    });
    expect(queryResult.data.stixDomainObjectsTimeSeries.length).toEqual(13);
    expect(queryResult.data.stixDomainObjectsTimeSeries[1].value).toEqual(12);
    expect(queryResult.data.stixDomainObjectsTimeSeries[2].value).toEqual(5);
  });
  it('should update stixDomainObject', async () => {
    const UPDATE_QUERY = gql`
      mutation StixDomainObjectEdit($id: ID!, $input: EditInput!) {
        stixDomainObjectEdit(id: $id) {
          fieldPatch(input: $input) {
            id
            ... on Report {
              name
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: UPDATE_QUERY,
      variables: { id: stixDomainObjectInternalId, input: { key: 'name', value: ['StixDomainObject - test'] } },
    });
    expect(queryResult.data.stixDomainObjectEdit.fieldPatch.name).toEqual('StixDomainObject - test');
  });
  it('should context patch stixDomainObject', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation StixDomainObjectEdit($id: ID!, $input: EditContext) {
        stixDomainObjectEdit(id: $id) {
          contextPatch(input: $input) {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: stixDomainObjectInternalId, input: { focusOn: 'description' } },
    });
    expect(queryResult.data.stixDomainObjectEdit.contextPatch.id).toEqual(stixDomainObjectInternalId);
  });
  it('should stixDomainObject editContext to be accurate', async () => {
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: stixDomainObjectInternalId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.stixDomainObject).not.toBeNull();
    expect(queryResult.data.stixDomainObject.id).toEqual(stixDomainObjectInternalId);
    expect(queryResult.data.stixDomainObject.editContext[0].focusOn).toEqual('description');
  });
  it('should context clean stixDomainObject', async () => {
    const CONTEXT_PATCH_QUERY = gql`
      mutation StixDomainObjectEdit($id: ID!) {
        stixDomainObjectEdit(id: $id) {
          contextClean {
            id
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: CONTEXT_PATCH_QUERY,
      variables: { id: stixDomainObjectInternalId },
    });
    expect(queryResult.data.stixDomainObjectEdit.contextClean.id).toEqual(stixDomainObjectInternalId);
  });
  it('should add relation in stixDomainObject', async () => {
    const RELATION_ADD_QUERY = gql`
      mutation StixDomainObjectEdit($id: ID!, $input: StixMetaRelationshipAddInput!) {
        stixDomainObjectEdit(id: $id) {
          relationAdd(input: $input) {
            id
            from {
              ... on StixDomainObject {
                objectMarking {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: RELATION_ADD_QUERY,
      variables: {
        id: stixDomainObjectInternalId,
        input: {
          toId: 'marking-definition--78ca4366-f5b8-4764-83f7-34ce38198e27',
          relationship_type: 'object-marking',
        },
      },
    });
    expect(queryResult.data.stixDomainObjectEdit.relationAdd.from.objectMarking.edges.length).toEqual(1);
  });
  it('should delete relation in stixDomainObject', async () => {
    const RELATION_DELETE_QUERY = gql`
      mutation StixDomainObjectEdit($id: ID!, $toId: String!, $relationship_type: String!) {
        stixDomainObjectEdit(id: $id) {
          relationDelete(toId: $toId, relationship_type: $relationship_type) {
            id
            objectMarking {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    `;
    const queryResult = await queryAsAdmin({
      query: RELATION_DELETE_QUERY,
      variables: {
        id: stixDomainObjectInternalId,
        toId: 'marking-definition--78ca4366-f5b8-4764-83f7-34ce38198e27',
        relationship_type: 'object-marking',
      },
    });
    expect(queryResult.data.stixDomainObjectEdit.relationDelete.objectMarking.edges.length).toEqual(0);
  });
  it('should stixDomainObject deleted', async () => {
    const DELETE_QUERY = gql`
      mutation stixDomainObjectDelete($id: ID!) {
        stixDomainObjectEdit(id: $id) {
          delete
        }
      }
    `;
    // Delete the stixDomainObject
    await queryAsAdmin({
      query: DELETE_QUERY,
      variables: { id: stixDomainObjectInternalId },
    });
    // Verify is no longer found
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: stixDomainObjectStixId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult.data.stixDomainObject).toBeNull();
  });
});
