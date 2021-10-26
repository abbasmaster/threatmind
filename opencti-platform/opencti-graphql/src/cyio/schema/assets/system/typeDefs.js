import gql from 'graphql-tag' ;

const typeDefs = gql`
  "Defines identifying information about an instance of an information system."
  type SystemAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset {
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
    # Asset
    asset_id: String
    name: String!
    description: String
    locations: [AssetLocation]
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # ItAsset
    asset_tag: String
    asset_type: AssetType!
    serial_number: String
    vendor_name: String
    version: String
    release_date: DateTime
    implementation_point: ImplementationPoint!
    operational_status: OperationalStatus!
    # responsible_parties: [ResponsibleParty]
    # SystemAsset
    system_name: String
    function: String
    baseline_configuration_name: String
    connected_to_network: NetworkAsset
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
  }

  "Defines identifying information about an instance of a system that stores, organizes and provides access to directory information in order to unify network resources."
  type DirectoryServerAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset {
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
    # Asset
    asset_id: String
    name: String!
    description: String
    locations: [AssetLocation]
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # ItAsset
    asset_tag: String
    asset_type: AssetType!
    serial_number: String
    vendor_name: String
    version: String
    release_date: DateTime
    implementation_point: ImplementationPoint!
    operational_status: OperationalStatus!
    # responsible_parties: [ResponsibleParty]
    # SystemAsset
    system_name: String
    function: String
    baseline_configuration_name: String
    connected_to_network: NetworkAsset
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
  }

  "Defines identifying information about an instance of a system that resolves domain names to internet protocol (IP) addresses."
  type DnsServerAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset {
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
    # Asset
    asset_id: String
    name: String!
    description: String
    locations: [AssetLocation]
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # ItAsset
    asset_tag: String
    asset_type: AssetType!
    serial_number: String
    vendor_name: String
    version: String
    release_date: DateTime
    implementation_point: ImplementationPoint!
    operational_status: OperationalStatus!
    # responsible_parties: [ResponsibleParty]
    # SystemAsset
    system_name: String
    function: String
    baseline_configuration_name: String
    connected_to_network: NetworkAsset
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
  }

  "Defines identifying information about an instance of a system that sends and receives electronic mail messages."
  type EmailServerAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset {
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
    # Asset
    asset_id: String
    name: String!
    description: String
    locations: [AssetLocation]
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # ItAsset
    asset_tag: String
    asset_type: AssetType!
    serial_number: String
    vendor_name: String
    version: String
    release_date: DateTime
    implementation_point: ImplementationPoint!
    operational_status: OperationalStatus!
    # responsible_parties: [ResponsibleParty]
    # SystemAsset
    system_name: String
    function: String
    baseline_configuration_name: String
    connected_to_network: NetworkAsset
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
  }

  "Defines identifying information about an instance of a system that delivers content or services to end users over the Internet or an intranet."
  type WebServerAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset {
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
    # Asset
    asset_id: String
    name: String!
    description: String
    locations: [AssetLocation]
    external_references( first: Int ): CyioExternalReferenceConnection
    notes( first: Int ): CyioNoteConnection
    # ItAsset
    asset_tag: String
    asset_type: AssetType!
    serial_number: String
    vendor_name: String
    version: String
    release_date: DateTime
    implementation_point: ImplementationPoint!
    operational_status: OperationalStatus!
    # responsible_parties: [ResponsibleParty]
    # SystemAsset
    system_name: String
    function: String
    baseline_configuration_name: String
    connected_to_network: NetworkAsset
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
  }
`;

export default typeDefs ;