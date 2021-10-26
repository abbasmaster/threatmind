import gql from 'graphql-tag' ;

const typeDefs = gql`
  "Defines identifying information about an individual finding."
  type Finding implements BasicObject & LifecycleObject & CoreObject & OscalObject {
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
    related_observations(first: Int): ObservationConnection
    "Relates the finding to a set of referenced risks that were used to determine the finding."
    related_risks(first: Int): RiskConnection
  }
`;

export default typeDefs ;
