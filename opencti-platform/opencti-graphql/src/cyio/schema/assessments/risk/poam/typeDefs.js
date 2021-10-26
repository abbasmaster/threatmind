import gql from 'graphql-tag' ;

const typeDefs = gql`
  # declares the query entry-points for this type
  extend type Query {
    poam( id: ID ): POAM
    poamItem( id: ID ): POAMItem
    poamItems(
      first: Int
      offset: Int
      orderedBy: POAMItemsOrdering
      orderMode: OrderingMode
      filters: [POAMItemsFiltering]
      filterMode: FilterMode
      search: String
    ): POAMItemConnection
  }

  # declares the mutation entry-points for this type
  extend type Mutation {
    # POAM
    createPOAM(input: POAMAddInput): POAM
    deletePOAM(id: ID!): String!
    editPOAM(id: ID!, input: [EditInput]!, commitMessage: String): POAM
    # POAM Item
    createPOAMItem(input: POAMItemAddInput): POAMItem
    deletePOAMItem(id: ID!): String!
    editPOAMItem(id: ID!, input: [EditInput]!, commitMessage: String): POAMItem

  }

## POAM
#
  type POAM implements BasicObject & LifecycleObject & CoreObject & OscalObject &  Model {
    # BasicObject
    "Uniquely identifies this object."
    id: ID!
    "Identifies the identifier defined by the standard."
    standard_id: String!
    "Identifies the type of the Object."
    entity_type: String!
    "Identifies the parent types of this object."
    parent_types: [String]!
    # CoreObject
    "Indicates the date and time at which the object was originally created."
    created: DateTime!
    "Indicates the date and time that this particular version of the object was last modified."
    modified: DateTime!
    "Identifies a set of terms used to describe this object. The terms are user-defined or trust-group defined."
    labels: [String]
    # OscalObject
    "Identifies a list of CyioExternalReferences, each of which refers to information external to the data model. This property is used to provide one or more URLs, descriptions, or IDs to records in other systems."
    external_references( first: Int ): CyioExternalReferenceConnection
    "Identifies one or more references to additional commentary on the Model."
    notes( first: Int ): CyioNoteConnection
    "Identifies one or more relationships to other entities."
    relationships(
      first: Int
      offset: Int
      orderedBy: OscalRelationshipsOrdering
      orderMode: OrderingMode
      filters: [OscalRelationshipsFiltering]
      filterMode: FilterMode
      search: String 
    ): OscalRelationshipConnection
    # Metadata
    "Identifies the name given to the document."
    name: String!
    "Identifies the date and time the document was published."
    published: DateTime
    "Identifies the date and time the document as last modified."
    last_modified: DateTime!
    "Identifies the current version of the document."
    version: String!
    "Identifies the OSCAL model version the document was authored against."
    oscal_version: String!
    "Identifies a list of revisions to the containing document."
    revisions: [Revision]
    "Identifies references to previous versions of this document."
    document_ids: [ID]
    "Identifies one or more references to a function assumed or expected to be assumed by a party in a specific situation."
    roles( first: Int ): OscalRoleConnection
    "Identifies one or more references to a location."
    locations( first: Int ): OscalLocationConnection
    "Identifies one or more references to a responsible entity which is either a person or an organization."
    parties( first: Int ): OscalPartyConnection
    "Identifies one or more references to a set of organizations or persons that have responsibility for performing a referenced role in the context of the containing object."
    responsible_parties( first: Int ): OscalResponsiblePartyConnection
    # POAM Item
    system_id: String
    "Identifies the identification system from which the provided identifier was assigned."
    system_identifier_type: String!
    "Identifies components and inventory-items to be defined within the POA&M for circumstances where no OSCAL-based SSP exists, or is not delivered with the POA&M."
    local_definitions: POAMLocalDefinition
    "Identifies one or more individual observations."
    observations( first: Int ): ObservationConnection
    "Identifies one or more individual observations."
    risks( first: Int ): RiskConnection
    "Identifies one ore more POAM Items that bind a specific Risk to the associated Observations."
    poam_items( first: Int ): POAMItemConnection
    # Backmatter
    "Identifies one or more Resources that are associated with this POAM."
    resources( first: Int ): OscalResourceConnection
  }

  input POAMAddInput {
    "Identifies a set of terms used to describe this object. The terms are user-defined or trust-group defined."
    labels: [String]
    "Identifies the name given to the document."
    name: String!
    "Identifies the date and time the document was published."
    published: DateTime
    "Identifies the date and time the document as last modified."
    last_modified: DateTime!
    "Identifies the current version of the document."
    version: String!
    "Identifies the OSCAL model version the document was authored against."
    oscal_version: String!
    "Identifies a list of revisions to the containing document."
    revisions: [RevisionAddInput]
    "Identifies references to previous versions of this document."
    document_ids: [ID]
    # POAM Item
    system_id: String
    "Identifies the identification system from which the provided identifier was assigned."
    system_identifier_type: String!
  }

  "Defines identifying information about a POAM Item"
  type POAMItem implements BasicObject & LifecycleObject & CoreObject & OscalObject {
    # BasicObject
    "Uniquely identifies this object."
    id: ID!
    "Identifies the identifier defined by the standard."
    standard_id: String!
    "Identifies the type of the Object."
    entity_type: String!
    "Identifies the parent types of this object."
    parent_types: [String]!
    # CoreObject
    "Indicates the date and time at which the object was originally created."
    created: DateTime!
    "Indicates the date and time that this particular version of the object was last modified."
    modified: DateTime!
    "Identifies a set of terms used to describe this object. The terms are user-defined or trust-group defined."
    labels: [String]
    # OscalObject
    "Identifies a list of CyioExternalReferences, each of which refers to information external to the data model. This property is used to provide one or more URLs, descriptions, or IDs to records in other systems."
    external_references( first: Int ): CyioExternalReferenceConnection
    "Identifies one or more references to additional commentary on the Model."
    notes( first: Int ): CyioNoteConnection
    "Identifies one or more relationships to other entities."
    relationships(
      first: Int
      offset: Int
      orderedBy: OscalRelationshipsOrdering
      orderMode: OrderingMode
      filters: [OscalRelationshipsFiltering]
      filterMode: FilterMode
      search: String 
    ): OscalRelationshipConnection
    # Finding
    "Identifies the name for this POA&M item."
    name: String!
    "Identifies a human-readable description of the POA&M item."
    description: String!
    "Identifies one or more sources of the finding, such as a tool, interviewed person, or activity."
    origins: [Origin]
    # "Identifies an assessor's conclusions regarding the degree to which an objective is satisfied."
    # target: FindingTarget
    # "Identifies a reference to the implementation statement in the SSP to which this finding is related."
    # implementation_statement: ImplementationStatement
    "Relates the finding to a set of referenced observations that were used to determine the finding."
    related_observations( first: Int ): ObservationConnection
    "Relates the finding to a set of referenced risks that were used to determine the finding."
    related_risks( first: Int ): RiskConnection
    # POAM Item
    "Indicates the risk has been excepted"
    accepted_risk: Boolean
  }

  input POAMItemAddInput {
    "Identifies a set of terms used to describe this object. The terms are user-defined or trust-group defined."
    labels: [String]
    "Identifies the name for this POA&M item."
    name: String!
    "Identifies a human-readable description of the POA&M item."
    description: String!
    # POAM Item
    "Indicates the risk has been excepted"
    accepted_risk: Boolean
  }

  # Pagination Types
  type POAMItemConnection {
    pageInfo: PageInfo!
    edges: [POAMItemEdge]
  }
  type POAMItemEdge {
    cursor: String!
    node: POAMItem!
  }
  # Filtering Types
  input POAMItemsFiltering {
    key: POAMItemsFilter!
    values: [String]!
    operator: String
    filterMode: FilterMode
  }

  enum POAMItemsOrdering {
    name
    created
    modified
    labels
    accepted_risk
  }

  enum POAMItemsFilter {
    name
    created
    modified
    labels
    accepted_risk
  }

## POAM Local Definition
#
  type POAMLocalDefinition {
    components( first: Int ): ComponentConnection
    inventory_items( first: Int ): InventoryItemConnection
    notes( first: Int ): CyioNoteConnection
  }

`;

export default typeDefs ;
