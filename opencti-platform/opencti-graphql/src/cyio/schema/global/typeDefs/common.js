import gql from 'graphql-tag';

const common = gql`
  # declares the query entry-points for this type
  extend type Query {
    cyioNote(id: ID!): CyioNote
    cyioNoteList( 
      first: Int
      offset: Int
      orderedBy: CyioNotesOrdering
      orderMode: OrderingMode
      filters: [CyioNotesFiltering]
      filterMode: FilterMode
      search: String
    ): CyioNoteConnection
  }

  # declares the mutation entry-points for this type
  extend type Mutation {
    addReference(input: ReferenceAddInput): Boolean
    removeReference( input: ReferenceAddInput): Boolean
    createCyioNote(input: CyioNoteAddInput): CyioNote
    deleteCyioNote(id: ID!): String!
    editCyioNote(id: ID!, input: [EditInput]!, commitMessage: String): CyioNote
  }

#### Type Definitions

  # "Defines the identifying properties of a Basic object"
  # interface BasicObject {
  #   # BasicObject
  #   "Uniquely identifies this object."
  #   id: ID!
  #   "Identifies the identifier defined by the standard."
  #   standard_id: String!
  #   "Identifies the type of the Object."
  #   entity_type: String!
  #   "Identifies the parent types of this object."
  #   parent_types: [String]!
  # }

  "Identifies the identifying information about a lifecycle object"
  interface LifecycleObject {
    "Identities the date and time at which the object was originally created."
    created: DateTime!
    "Identifies the date and time at which the object was last modified."
    modified: DateTime!
  }

  "Defines the identifying information about a Core object"
  interface CoreObject {
    labels: [String]
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
  }

  "Reference input to add a reference between two different objects"
  input ReferenceAddInput {
    field_name: String!  # this is the name of the field
    from_id: ID!
    to_id: ID!
  }

  ############## CyioExternalReferences
  enum CyioExternalReferencesOrdering {
    source_name
    url
    hash
    external_id
    created
    modified
  }
  enum CyioExternalReferencesFilter {
    url
    source_name
    external_id
  }
  input CyioExternalReferencesFiltering {
    key: CyioExternalReferencesFilter!
    values: [String]
    operator: String
    filterMode: FilterMode
  }

  # Pagination Types
  type CyioExternalReferenceConnection {
    pageInfo: PageInfo!
    edges: [CyioExternalReferenceEdge]
  }
  type CyioExternalReferenceEdge {
    cursor: String!
    node: CyioExternalReference!
  }

  type CyioExternalReference implements BasicObject & LifecycleObject {
    # BasicObject
    "Uniquely identifies this object."
    id: ID!
    "Identifies the identifier defined by the standard."
    standard_id: String!
    "Identifies the type of the Object."
    entity_type: String!
    "Identifies the parent types of this object."
    parent_types: [String]!
    # LifecycleObject
    "Identities the date and time at which the object was originally created."
    created: DateTime!
    "Identifies the date and time at which the object was last modified."
    modified: DateTime!
    # CyioExternalReference
    source_name: String!
    description: String
    url: URL
    hashes: [HashInfo]
    external_id: String
    # OSCAL Link
    reference_purpose: ReferencePurposeType
    media_type: String
  }

  input CyioExternalReferenceAddInput {
    source_name: String!
    description: String
    url: URL
    hashes: [HashInfoAddInput]
    # OSCAL Link
    reference_purpose: ReferencePurposeType
    media_type: String
  }

  type HashInfo {
    algorithm: HashAlgorithm!
    value: String!
  }

  input HashInfoAddInput {
    algorithm: HashAlgorithm!
    value: String!
  }

  enum ReferencePurposeType {
    "Identifies a reference to an external resource."
    reference
    "Identifies the authoritative location for this file."
    canonical
    "Identifies an alternative location or format for this file."
    alternative
  }

  enum HashAlgorithm {
    "The SHA-224 algorithm as defined by NIST FIPS 180-4."
    SHA_224
    "The SHA-256 algorithm as defined by NIST FIPS 180-4."
    SHA_256
    "The SHA-384 algorithm as defined by NIST FIPS 180-4."
    SHA_384
    "The SHA-512 algorithm as defined by NIST FIPS 180-4."
    SHA_512
    "The SHA3-224 algorithm as defined by NIST FIPS 202."
    SHA3_224
    "The SHA3-256 algorithm as defined by NIST FIPS 202."
    SHA3_256
    "The SHA3-384 algorithm as defined by NIST FIPS 202."
    SHA3_384
    "The SHA3-512 algorithm as defined by NIST FIPS 202."
    SHA3_512
  }

  type CyioNote implements BasicObject {
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
    created: DateTime!
    modified: DateTime!
    labels: [String]
    external_references( first: Int ): CyioExternalReferenceConnection
    # CyioNote
    abstract: String
    content: String!
    authors: [String]
  }

  input CyioNoteAddInput {
    # CyioNote
    abstract: String
    content: String!
    authors: [String]
  }

  enum CyioNotesOrdering {
    created
    modified
    labels
  }

  enum CyioNotesFilter {
    abstract
    authors
    created
    modified
    labels
  }

  input CyioNotesFiltering {
    key: CyioNotesFilter!
    values: [String]!
    operator: String
    filterMode: FilterMode
  }

  # Pagination Types
  type CyioNoteConnection {
    pageInfo: PageInfo!
    edges: [CyioNoteEdge]
  }

  type CyioNoteEdge {
    cursor: String!
    node: CyioNote!
  }

  interface CyioLocation {
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
    created: DateTime!
    modified: DateTime!
    labels: [String]
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # CyioLocation
    name: String!
    description: String
  }
  
  input CyioLocationAddInput {
    labels: [String]
    # CyioLocation
    location_type: CyioLocationType
    name: String!
    description: String
  }

  interface CyioIdentity {
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
    created: DateTime!
    modified: DateTime!
    labels: [String]
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # CyioIdentity
    name: String!
    description: String
  }

  enum CyioLocationType {
    geo_location
    city
    country
    region
    civic_address
  }

  "Defines the set of Region names"
  enum RegionName {
    africa
    eastern_africa
    middle_africa
    norther_africa
    southern_africa
    western_africa
    americas
    caribbean
    central_america
    latin_america_caribbean
    norther_america
    south_america
    asia
    central_asia
    eastern_asia
    southern_asia
    south_eastern_asia
    western_asia
    europe
    eastern_europe
    northern_europe
    southern_europe
    western_europe
    oceania
    antarctica
    australia_new_zealand
    melanesia
    micronesia
    polynesia
  }


  type PageInfo {
    startCursor: String!
    endCursor: String!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    globalCount: Int!
  }
  
  enum OrderingMode {
    asc
    desc
  }

  enum FilterMode {
    and
    or
  }

  enum EditOperation {
    add
    replace
    remove
  }

  # Editing
  input EditInput {
    key: String!              # Field name to change
    value: [String]!          # Values to apply
    operation: EditOperation  # Undefined = REPLACE
  }

  enum OperationalStatus {
    operational
    under_development
    under_major_modification
    disposition
    other
  }

  enum ImplementationPoint {
    internal
    external
  }

  type CivicAddress {
    address_type: UsageType
    street_address: String
    city: String
    administrative_area: String
    country: String
    postal_code: PostalCode
  }

  input CivicAddressAddInput {
    address_type: UsageType
    street_address: String
    city: String
    administrative_area: String
    country: String
    postal_code: PostalCode
  }

  enum UsageType {
    home
    office
    mobile
  }

  type TelephoneNumber {
    usage_type: UsageType
    phone_number: PhoneNumber
  }

  input TelephoneNumberAddInput {
    usage_type: UsageType
    phone_number: PhoneNumber
  }

  type ContactInfo {
    email_addresses: [EmailAddress]
    telephone_numbers: [TelephoneNumber]
  }
`;

export default common;
