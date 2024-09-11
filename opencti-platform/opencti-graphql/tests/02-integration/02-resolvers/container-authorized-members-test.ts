import { describe, expect, it } from 'vitest';
import gql from 'graphql-tag';
import type { CaseIncident, EntitySettingEdge } from '../../../src/generated/graphql';
import {
  ADMIN_USER,
  adminQuery,
  editorQuery,
  getOrganizationIdByName,
  getUserIdByEmail,
  PLATFORM_ORGANIZATION,
  queryAsAdmin,
  securityQuery,
  TEST_ORGANIZATION,
  USER_EDITOR
} from '../../utils/testQuery';
import { queryAsUserIsExpectedForbidden } from '../../utils/testQueryHelper';
import { executionContext, SYSTEM_USER } from '../../../src/utils/access';
import { initCreateEntitySettings } from '../../../src/modules/entitySetting/entitySetting-domain';
import { ENTITY_TYPE_CONTAINER_CASE_INCIDENT } from '../../../src/modules/case/case-incident/case-incident-types';

const CREATE_QUERY = gql`
  mutation CaseIncidentAdd($input: CaseIncidentAddInput!) {
    caseIncidentAdd(input: $input){
      id
      standard_id
      name
      description
      authorized_members {
        id
        access_right
      }
      currentUserAccessRight
    }
  }
`;

const READ_QUERY = gql`
  query caseIncident($id: String!) {
    caseIncident(id: $id) {
      id
      standard_id
      name
      authorized_members {
        id
        access_right
      }
      currentUserAccessRight
    }
  }
`;

const DELETE_QUERY = gql`
  mutation CaseIncidentDelete($id: ID!) {
    caseIncidentDelete(id: $id)
  }
`;
const EDIT_AUTHORIZED_MEMBERS_QUERY = gql`
  mutation ContainerHeaderEditAuthorizedMembersMutation(
    $id: ID!
    $input: [MemberAccessInput!]
  ) {
    containerEdit(id: $id) {
      editAuthorizedMembers(input: $input) {
        authorized_members {
          id
          name
          entity_type
          access_right
        }
      }
    }
  }
`;

const PLATFORM_ORGANIZATION_QUERY = gql`
  mutation PoliciesFieldPatchMutation($id: ID!, $input: [EditInput]!) {
    settingsEdit(id: $id) {
      fieldPatch(input: $input) {
        platform_organization {
          id
          name
        }
        enterprise_edition
        id
      }
    }
  }
`;

const ORGANIZATION_SHARING_QUERY = gql`
  mutation StixCoreObjectSharingGroupAddMutation(
    $id: ID!
    $organizationId: ID!
  ) {
    stixCoreObjectEdit(id: $id) {
      restrictionOrganizationAdd(organizationId: $organizationId) {
        id
        objectOrganization {
          id
          name
        }
      }
    }
  }
`;

describe('Case Incident Response standard behavior with authorized_members activation from entity', () => {
  let caseIncident: CaseIncident;
  let userEditorId: string;
  // 1. On créé un case incident => on vérifie que l'editor y a accès, que les authorized members sont vide, que le user access right est admin
  it('should Case Incident Response created', async () => {
    // Create Case Incident Response
    const caseIncidentResponseCreateQueryResult = await queryAsAdmin({
      query: CREATE_QUERY,
      variables: {
        input: {
          name: 'Case Incident Response With Authorized Members from entity'
        }
      }
    });

    expect(caseIncidentResponseCreateQueryResult).not.toBeNull();
    expect(caseIncidentResponseCreateQueryResult?.data?.caseIncidentAdd.authorized_members).not.toBeUndefined();
    expect(caseIncidentResponseCreateQueryResult?.data?.caseIncidentAdd.authorized_members).toEqual([]); // authorized members not activated
    expect(caseIncidentResponseCreateQueryResult?.data?.caseIncidentAdd.currentUserAccessRight).toEqual('admin'); // CurrentUser should be admin if authorized members not activated
    caseIncident = caseIncidentResponseCreateQueryResult?.data?.caseIncidentAdd;
  });
  it('should Editor user access Case Incident Response', async () => {
    const caseIRQueryResult = await editorQuery({ query: READ_QUERY, variables: { id: caseIncident.id } });
    expect(caseIRQueryResult).not.toBeNull();
    expect(caseIRQueryResult?.data?.caseIncident).not.toBeUndefined();
    expect(caseIRQueryResult?.data?.caseIncident.id).toEqual(caseIncident.id);
  });
  // On essaye de modifier les authorized members avec le user editor => on vérifie qu'il n'a pas les droits et qu'il se prend une erreur forbidden
  it('should Editor user not edit authorized members if not in authorized members', async () => {
    userEditorId = await getUserIdByEmail(USER_EDITOR.email);
    const authorizedMembers = {
      id: caseIncident.id,
      input: [
        {
          id: userEditorId,
          access_right: 'view'
        },
      ]
    };
    await queryAsUserIsExpectedForbidden(USER_EDITOR.client, {
      query: EDIT_AUTHORIZED_MEMBERS_QUERY,
      variables: authorizedMembers,
    });
  });
  // On essaye de modifier les authorized members avec l'admin (seulement admin) => on vérifie que ça a bien fonctionné avec l'admin, et on vérifie que l'editor n'a pas accès au case incident
  it('should Admin user edit authorized members', async () => {
    // Activate Authorized members
    await queryAsAdmin({
      query: EDIT_AUTHORIZED_MEMBERS_QUERY,
      variables: {
        id: caseIncident?.id,
        input: [
          {
            id: ADMIN_USER.id,
            access_right: 'admin'
          }
        ]
      }
    });
    // Verify if authorized members have been edited
    const caseIncidentResponseUpdatedQueryResult = await queryAsAdmin({
      query: READ_QUERY,
      variables: { id: caseIncident.id }
    });
    expect(caseIncidentResponseUpdatedQueryResult).not.toBeNull();
    expect(caseIncidentResponseUpdatedQueryResult?.data?.caseIncident.authorized_members).not.toBeUndefined();
    expect(caseIncidentResponseUpdatedQueryResult?.data?.caseIncident.authorized_members).toEqual([
      {
        id: ADMIN_USER.id,
        access_right: 'admin'
      }
    ]);
  });
  it('should Editor user not access Case Incident Response', async () => {
    const caseIRQueryResult = await editorQuery({ query: READ_QUERY, variables: { id: caseIncident.id } });
    expect(caseIRQueryResult).not.toBeNull();
    expect(caseIRQueryResult?.data?.caseIncident).not.toBeUndefined();
    expect(caseIRQueryResult?.data?.caseIncident).toBeNull();
  });
  // On modifie les authorized members avec l'admin en ajoutant l'editor en view => on vérifie que l'editor a bien accès au case incident
  it('should Admin user edit authorized members: Editor has view access right', async () => {
    // Add Editor user in authorized members
    await queryAsAdmin({
      query: EDIT_AUTHORIZED_MEMBERS_QUERY,
      variables: {
        id: caseIncident.id,
        input: [
          {
            id: ADMIN_USER.id,
            access_right: 'admin'
          },
          {
            id: userEditorId,
            access_right: 'view'
          }
        ]
      }
    });
    // Verify if authorized members have been edited
    const caseIncidentResponseUpdatedQueryResult = await queryAsAdmin({
      query: READ_QUERY,
      variables: { id: caseIncident.id }
    });
    expect(caseIncidentResponseUpdatedQueryResult).not.toBeNull();
    expect(caseIncidentResponseUpdatedQueryResult?.data?.caseIncident.authorized_members).not.toBeUndefined();
    expect(caseIncidentResponseUpdatedQueryResult?.data?.caseIncident.authorized_members).toEqual([
      {
        id: ADMIN_USER.id,
        access_right: 'admin'
      },
      {
        id: userEditorId,
        access_right: 'view'
      }
    ]);
  });
  it('should Editor user access Case Incident Response', async () => {
    const caseIRQueryResult = await editorQuery({ query: READ_QUERY, variables: { id: caseIncident.id } });
    expect(caseIRQueryResult).not.toBeNull();
    expect(caseIRQueryResult?.data?.caseIncident).not.toBeUndefined();
    expect(caseIRQueryResult?.data?.caseIncident.id).toEqual(caseIncident.id);
  });
  // On essaye d'editer le case avec l'editor => forbidden parce qu'il a seulement l'accès en view
  it('should Editor user not edit case incident with view access right', async () => {
    const authorizedMembers = {
      id: caseIncident.id,
      input: [
        {
          id: userEditorId,
          access_right: 'admin'
        },
      ]
    };
    await queryAsUserIsExpectedForbidden(USER_EDITOR.client, {
      query: EDIT_AUTHORIZED_MEMBERS_QUERY,
      variables: authorizedMembers,
    });
  });
  // On modifie les authorized members avec l'admin en mettant l'editor en 'edit', et on vérifie qu'il peut bien éditer un case incident (description)
  it('should Admin user edit authorized members: Editor has edit access right', async () => {
    await queryAsAdmin({
      query: EDIT_AUTHORIZED_MEMBERS_QUERY,
      variables: {
        id: caseIncident.id,
        input: [
          {
            id: ADMIN_USER.id,
            access_right: 'admin'
          },
          {
            id: userEditorId,
            access_right: 'edit'
          }
        ]
      }
    });
    // Verify if authorized members have been edited
    const caseIncidentResponseUpdatedQueryResult = await queryAsAdmin({
      query: READ_QUERY,
      variables: { id: caseIncident.id }
    });
    expect(caseIncidentResponseUpdatedQueryResult).not.toBeNull();
    expect(caseIncidentResponseUpdatedQueryResult?.data?.caseIncident.authorized_members).not.toBeUndefined();
    expect(caseIncidentResponseUpdatedQueryResult?.data?.caseIncident.authorized_members).toEqual([
      {
        id: ADMIN_USER.id,
        access_right: 'admin'
      },
      {
        id: userEditorId,
        access_right: 'edit'
      }
    ]);
  });
  it('should Editor user edit case incident', async () => {
    const UPDATE_QUERY = gql`
      mutation CaseIncident($id: ID!, $input: [EditInput]!) {
        stixDomainObjectEdit(id: $id) {
          fieldPatch(input: $input) {
            id
            ... on Case {
              name
            }
          }
        }
      }
    `;
    const queryResult = await editorQuery({
      query: UPDATE_QUERY,
      variables: { id: caseIncident.id, input: { key: 'name', value: ['Case Incident Response - updated'] } },
    });
    expect(queryResult?.data?.stixDomainObjectEdit.fieldPatch.name).toEqual('Case Incident Response - updated');
  });
  // l'editor essaye de delete le case incident => forbidden parce qu'il a seulement l'accès en edit
  it('should Editor user not delete case incident with edit access right', async () => {
    await queryAsUserIsExpectedForbidden(USER_EDITOR.client, {
      query: DELETE_QUERY,
      variables: { id: caseIncident.id },
    });
  });
  // On modifie les authorized members avec l'admin en mettant l'editor en 'admin', et on delete le case avec l'editor
  it('should Admin user edit authorized members: Editor has admin access right', async () => {
    await queryAsAdmin({
      query: EDIT_AUTHORIZED_MEMBERS_QUERY,
      variables: {
        id: caseIncident.id,
        input: [
          {
            id: ADMIN_USER.id,
            access_right: 'admin'
          },
          {
            id: userEditorId,
            access_right: 'admin'
          }
        ]
      }
    });
    // Verify if authorized members have been edited
    const caseIncidentResponseUpdatedQueryResult = await queryAsAdmin({
      query: READ_QUERY,
      variables: { id: caseIncident.id }
    });
    expect(caseIncidentResponseUpdatedQueryResult).not.toBeNull();
    expect(caseIncidentResponseUpdatedQueryResult?.data?.caseIncident.authorized_members).not.toBeUndefined();
    expect(caseIncidentResponseUpdatedQueryResult?.data?.caseIncident.authorized_members).toEqual([
      {
        id: ADMIN_USER.id,
        access_right: 'admin'
      },
      {
        id: userEditorId,
        access_right: 'admin'
      }
    ]);
  });
  it('should Editor user Case Incident Response deleted', async () => {
    // Delete the case
    await editorQuery({
      query: DELETE_QUERY,
      variables: { id: caseIncident.id },
    });
    // Verify is no longer found
    const queryResult = await queryAsAdmin({ query: READ_QUERY, variables: { id: caseIncident.id } });
    expect(queryResult).not.toBeNull();
    expect(queryResult?.data?.caseIncident).toBeNull();
  });
});

describe('Case Incident Response standard behavior with authorized_members activated via settings', () => {
  let caseIncidentResponseAuthorizedMembersFromSettings: CaseIncident;
  let entitySettingIdCaseIncidentResponse: string;
  const ENTITY_SETTINGS_UPDATE_QUERY = gql`
    mutation entitySettingsEdit($ids: [ID!]!, $input: [EditInput!]!) {
      entitySettingsFieldPatch(ids: $ids, input: $input) {
        id
        target_type
        platform_entity_files_ref
        platform_hidden_type
        enforce_reference
        attributes_configuration
      }
    }
  `;
  it('should init entity settings', async () => {
    const ENTITY_SETTINGS_QUERY = gql`
      query entitySettings {
        entitySettings {
          edges {
            node {
              id
              target_type
              platform_entity_files_ref
              platform_hidden_type
              enforce_reference
            }
          }
        }
      }
    `;
    const context = executionContext('test');
    await initCreateEntitySettings(context, SYSTEM_USER);
    const queryResult = await adminQuery({ query: ENTITY_SETTINGS_QUERY });

    const entitySettingCaseIncidentResponse = queryResult.data?.entitySettings.edges
      .filter((entitySetting: EntitySettingEdge) => entitySetting.node.target_type === ENTITY_TYPE_CONTAINER_CASE_INCIDENT)[0];
    entitySettingIdCaseIncidentResponse = entitySettingCaseIncidentResponse?.node.id;
    expect(entitySettingIdCaseIncidentResponse).toBeTruthy();
  });
  it('should Case Incident Response created', async () => {
    // Activate authorized members for IR
    const authorizedMembersConfiguration = JSON.stringify([
      {
        name: 'authorized_members',
        default_values: [
          JSON.stringify({
            id: ADMIN_USER.id,
            access_right: 'admin'
          })
        ]
      }
    ]);
    const updateEntitySettingsResult = await adminQuery({
      query: ENTITY_SETTINGS_UPDATE_QUERY,
      variables: { ids: [entitySettingIdCaseIncidentResponse], input: { key: 'attributes_configuration', value: [authorizedMembersConfiguration] } },
    });
    expect(updateEntitySettingsResult.data?.entitySettingsFieldPatch?.[0]?.attributes_configuration).toEqual(authorizedMembersConfiguration);
    const caseIncidentResponseAuthorizedMembersData = await adminQuery({
      query: CREATE_QUERY,
      variables: {
        input: {
          name: 'Case Incident Response With Authorized Members via settings'
        }
      }
    });
    expect(caseIncidentResponseAuthorizedMembersData).not.toBeNull();
    expect(caseIncidentResponseAuthorizedMembersData?.data?.caseIncidentAdd.authorized_members).not.toBeUndefined();
    expect(caseIncidentResponseAuthorizedMembersData?.data?.caseIncidentAdd.authorized_members).toEqual([
      {
        id: ADMIN_USER.id,
        access_right: 'admin'
      }
    ]);
    caseIncidentResponseAuthorizedMembersFromSettings = caseIncidentResponseAuthorizedMembersData?.data?.caseIncidentAdd;
    // Clean
    const cleanAuthorizedMembersConfiguration = JSON.stringify([{ name: 'authorized_members', default_values: null }]);
    const cleanEntitySettingsResult = await adminQuery({
      query: ENTITY_SETTINGS_UPDATE_QUERY,
      variables: { ids: [entitySettingIdCaseIncidentResponse], input: { key: 'attributes_configuration', value: [cleanAuthorizedMembersConfiguration] } },
    });
    expect(cleanEntitySettingsResult.data?.entitySettingsFieldPatch?.[0]?.attributes_configuration).toEqual(cleanAuthorizedMembersConfiguration);
  });
  it('should Case Incident Response deleted', async () => {
    // Delete the case
    await adminQuery({
      query: DELETE_QUERY,
      variables: { id: caseIncidentResponseAuthorizedMembersFromSettings.id },
    });
    // Verify is no longer found
    const queryResult = await adminQuery({ query: READ_QUERY, variables: { id: caseIncidentResponseAuthorizedMembersFromSettings.id } });
    expect(queryResult).not.toBeNull();
    expect(queryResult?.data?.caseIncident).toBeNull();
  });
});

describe('Case Incident Response and organization sharing standard behavior without platform organization', () => {
  let caseIrId: string;
  let organizationId: string;
  let settingsInternalId: string;
  // 1. On créé un case incident et on le partage à une orga différente de l'orga de editor
  it('should Case Incident Response created', async () => {
    // Create Case Incident Response
    const caseIRCreateQueryResult = await adminQuery({
      query: CREATE_QUERY,
      variables: {
        input: {
          name: 'Case IR without platform Orga'
        }
      }
    });

    expect(caseIRCreateQueryResult).not.toBeNull();
    expect(caseIRCreateQueryResult?.data?.caseIncidentAdd.authorized_members).not.toBeUndefined();
    expect(caseIRCreateQueryResult?.data?.caseIncidentAdd.authorized_members).toEqual([]); // authorized members not activated
    caseIrId = caseIRCreateQueryResult?.data?.caseIncidentAdd.id;
  });
  it('should EE activated', async () => {
    // Get settings ID
    const SETTINGS_READ_QUERY = gql`
      query settings {
        settings {
          id
          platform_organization {
            id
            name
          }
        }
      }
    `;
    const queryResult = await adminQuery({ query: SETTINGS_READ_QUERY, variables: {} });
    settingsInternalId = queryResult.data?.settings?.id;

    // Set plateform organization
    const EEqueryResult = await adminQuery({
      query: PLATFORM_ORGANIZATION_QUERY,
      variables: {
        id: settingsInternalId,
        input: [
          { key: 'enterprise_edition', value: new Date().getTime() },
        ]
      }
    });
    expect(EEqueryResult).not.toBeNull();
    expect(EEqueryResult?.data?.settingsEdit.fieldPatch.enterprise_edition).not.toBeUndefined();
  });
  it('should share Case Incident Response with Organization', async () => {
    // Get organization id
    organizationId = await getOrganizationIdByName(PLATFORM_ORGANIZATION.name);
    const organizationSharingQueryResult = await adminQuery({
      query: ORGANIZATION_SHARING_QUERY,
      variables: { id: caseIrId, organizationId }
    });
    expect(organizationSharingQueryResult).not.toBeNull();
    expect(organizationSharingQueryResult?.data?.stixCoreObjectEdit.restrictionOrganizationAdd).not.toBeNull();
    expect(organizationSharingQueryResult?.data?.stixCoreObjectEdit.restrictionOrganizationAdd.objectOrganization[0].name).toEqual(PLATFORM_ORGANIZATION.name);
  });
  // 2. On vérifie qu'editor a bien accès au case incident
  it('should Editor user from different organization access Case Incident Response', async () => {
    const caseIRQueryResult = await editorQuery({ query: READ_QUERY, variables: { id: caseIrId } });
    expect(caseIRQueryResult).not.toBeNull();
    expect(caseIRQueryResult?.data?.caseIncident).not.toBeUndefined();
    expect(caseIRQueryResult?.data?.caseIncident.id).toEqual(caseIrId);
  });
  // 3. On vérifie qu'un user faisant partie de l'orga a bien accès au case aussi
  it('should Security user from shared organization access Case Incident Response', async () => {
    const caseIRQueryResult = await securityQuery({ query: READ_QUERY, variables: { id: caseIrId } });
    expect(caseIRQueryResult).not.toBeNull();
    expect(caseIRQueryResult?.data?.caseIncident).not.toBeUndefined();
    expect(caseIRQueryResult?.data?.caseIncident.id).toEqual(caseIrId);
  });
  // 4. On delete le case avec l'admin
  it('should Case Incident Response deleted', async () => {
    // Delete the case
    await adminQuery({
      query: DELETE_QUERY,
      variables: { id: caseIrId },
    });
    // Verify is no longer found
    const queryResult = await adminQuery({ query: READ_QUERY, variables: { id: caseIrId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult?.data?.caseIncident).toBeNull();
  });
  it('should EE deactivated', async () => {
    const platformOrganization = await adminQuery({
      query: PLATFORM_ORGANIZATION_QUERY,
      variables: { id: settingsInternalId,
        input: [
          { key: 'enterprise_edition', value: [] },
        ] }
    });
    expect(platformOrganization).not.toBeNull();
    expect(platformOrganization?.data?.settingsEdit.fieldPatch.enterprise_edition).toBeNull();
  });
});

describe('Case Incident Response and organization sharing standard behavior with platform organization', () => {
  let platformOrganizationId: string;
  let testOrganizationId: string;
  let caseIrId: string;
  let userEditorId: string;
  let settingsInternalId: string;
  // 1. 'should plateform organization sharing and EE activated' => OK avec PlaformOrganization
  it('should plateform organization sharing and EE activated', async () => {
    // Get organization id
    platformOrganizationId = await getOrganizationIdByName(PLATFORM_ORGANIZATION.name);

    // Get settings ID
    const SETTINGS_READ_QUERY = gql`
      query settings {
        settings {
          id
          platform_organization {
            id
            name
          }
        }
      }
    `;
    const queryResult = await adminQuery({ query: SETTINGS_READ_QUERY, variables: {} });
    settingsInternalId = queryResult.data?.settings?.id;

    // Set plateform organization
    const platformOrganization = await adminQuery({
      query: PLATFORM_ORGANIZATION_QUERY,
      variables: {
        id: settingsInternalId,
        input: [
          { key: 'platform_organization', value: platformOrganizationId },
          { key: 'enterprise_edition', value: new Date().getTime() },
        ]
      }
    });

    expect(platformOrganization).not.toBeNull();
    expect(platformOrganization?.data?.settingsEdit.fieldPatch.platform_organization).not.toBeUndefined();
    expect(platformOrganization?.data?.settingsEdit.fieldPatch.enterprise_edition).not.toBeUndefined();
    expect(platformOrganization?.data?.settingsEdit.fieldPatch.platform_organization.name).toEqual(PLATFORM_ORGANIZATION.name);
  });
  // 2. 'should Case Incident Response created' => OK
  it('should Case Incident Response created', async () => {
    // Create Case Incident Response
    const caseIRCreateQueryResult = await adminQuery({
      query: CREATE_QUERY,
      variables: {
        input: {
          name: 'Case IR with platform orga'
        }
      }
    });

    expect(caseIRCreateQueryResult).not.toBeNull();
    expect(caseIRCreateQueryResult?.data?.caseIncidentAdd).not.toBeUndefined();
    caseIrId = caseIRCreateQueryResult?.data?.caseIncidentAdd.id;
  });
  // 3. On vérifie que editor n'a pas accès au case incident parce que editor fait partie de l'orga TestOrganization ('should not access Case Incident Response out of his organization')
  it('should Editor user not access Case Incident Response', async () => {
    const caseIRQueryResult = await editorQuery({ query: READ_QUERY, variables: { id: caseIrId } });
    expect(caseIRQueryResult).not.toBeNull();
    expect(caseIRQueryResult.data?.caseIncident).toBeNull();
  });
  // 4. 'should Authorized Members activated' avec editor en view => OK
  it('should Admin user Authorized Members activated', async () => {
    userEditorId = await getUserIdByEmail(USER_EDITOR.email);
    await queryAsAdmin({
      query: EDIT_AUTHORIZED_MEMBERS_QUERY,
      variables: {
        id: caseIrId,
        input: [
          {
            id: ADMIN_USER.id,
            access_right: 'admin'
          },
          {
            id: userEditorId,
            access_right: 'view'
          }
        ]
      }
    });
    // Verify if authorized members have been edited
    const caseIRUpdatedQueryResult = await adminQuery({
      query: READ_QUERY,
      variables: { id: caseIrId }
    });
    expect(caseIRUpdatedQueryResult).not.toBeNull();
    expect(caseIRUpdatedQueryResult?.data?.caseIncident.authorized_members).not.toBeUndefined();
    expect(caseIRUpdatedQueryResult?.data?.caseIncident.authorized_members).toEqual([
      {
        id: ADMIN_USER.id,
        access_right: 'admin'
      },
      {
        id: userEditorId,
        access_right: 'view'
      }
    ]);
  });
  // 5. 'should access Case Incident Response out of her organization if authorized members activated' => OK
  it('should Editor user access Case Incident Response out of her organization if authorized members activated', async () => {
    const caseIRQueryResult = await editorQuery({ query: READ_QUERY, variables: { id: caseIrId } });
    expect(caseIRQueryResult).not.toBeNull();
    expect(caseIRQueryResult?.data?.caseIncident).not.toBeUndefined();
    expect(caseIRQueryResult?.data?.caseIncident.id).toEqual(caseIrId);
  });
  // 6. On enlève les authorized members, et on vérifie que l'editor n'as plus accès au case
  it('should Admin user deactivate authorized members', async () => {
    await queryAsAdmin({
      query: EDIT_AUTHORIZED_MEMBERS_QUERY,
      variables: {
        id: caseIrId,
        input: null
      }
    });
    // Verify Editor user has no more access to Case incident
    const caseIRQueryResult = await editorQuery({ query: READ_QUERY, variables: { id: caseIrId } });
    expect(caseIRQueryResult).not.toBeNull();
    expect(caseIRQueryResult.data?.caseIncident).toBeNull();
  });
  // 7. On share le case à la platform orga "Test" dont fait partie l'editor, et on vérifie que l'editor y a accès maintenant
  it('should share Case Incident Response with Organization', async () => {
    // Get organization id
    testOrganizationId = await getOrganizationIdByName(TEST_ORGANIZATION.name);
    const organizationSharingQueryResult = await adminQuery({
      query: ORGANIZATION_SHARING_QUERY,
      variables: { id: caseIrId, organizationId: testOrganizationId }
    });
    expect(organizationSharingQueryResult).not.toBeNull();
    expect(organizationSharingQueryResult?.data?.stixCoreObjectEdit.restrictionOrganizationAdd).not.toBeNull();
    expect(organizationSharingQueryResult?.data?.stixCoreObjectEdit.restrictionOrganizationAdd.objectOrganization[0].name).toEqual(TEST_ORGANIZATION.name);

    // Verify Editor user has access to Case incident
    const caseIRQueryResult = await editorQuery({ query: READ_QUERY, variables: { id: caseIrId } });
    expect(caseIRQueryResult).not.toBeNull();
    expect(caseIRQueryResult?.data?.caseIncident).not.toBeUndefined();
    expect(caseIRQueryResult?.data?.caseIncident.id).toEqual(caseIrId);
  });
  // 'should plateform organization sharing and EE deactivated' => OK
  it('should plateform organization sharing and EE deactivated', async () => {
    // Remove plateform organization
    const platformOrganization = await adminQuery({
      query: PLATFORM_ORGANIZATION_QUERY,
      variables: { id: settingsInternalId,
        input: [
          { key: 'platform_organization', value: [] },
          { key: 'enterprise_edition', value: [] },
        ] }
    });
    expect(platformOrganization).not.toBeNull();
    expect(platformOrganization?.data?.settingsEdit.fieldPatch.platform_organization).toBeNull();
  });
  // 'should Case Incident Response deleted' => OK
  it('should Case Incident Response deleted', async () => {
    // Delete the case
    await adminQuery({
      query: DELETE_QUERY,
      variables: { id: caseIrId },
    });
    // Verify is no longer found
    const queryResult = await adminQuery({ query: READ_QUERY, variables: { id: caseIrId } });
    expect(queryResult).not.toBeNull();
    expect(queryResult?.data?.caseIncident).toBeNull();
  });
});
