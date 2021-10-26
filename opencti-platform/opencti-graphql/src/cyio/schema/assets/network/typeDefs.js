import gql from 'graphql-tag' ;

const typeDefs = gql`
  # Query Extensions
  extend type Query {
    networkAssetList(
        first: Int
        offset: Int
        orderedBy: NetworkAssetOrdering
        orderMode: OrderingMode
        filters: [NetworkAssetFiltering]
        filterMode: FilterMode
        search: String
      ): NetworkAssetConnection
    networkAsset(id: ID!): NetworkAsset
  }

  extend type Mutation {
    createNetworkAsset(input: NetworkAssetAddInput): NetworkAsset
    deleteNetworkAsset(id: ID!): String!
    editNetworkAsset(id: ID!, input: [EditInput]!, commitMessage: String): NetworkAsset
  }

  # Query Types
  "Defines identifying information about a network."
  type NetworkAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset {
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
    # NetworkAsset
    network_id: String!
    network_name: String!
    network_address_range: IpAddressRange
  }

  # Mutation Types
  input NetworkAssetAddInput {
    labels: [String]
    # Asset
    asset_id: String
    name: String!
    description: String
    # ItAsset
    asset_tag: String
    asset_type: AssetType!
    serial_number: String
    vendor_name: String
    version: String
    release_date: DateTime
    implementation_point: ImplementationPoint!
    operational_status: OperationalStatus!
    # NetworkAsset
    network_id: String!
    network_name: String!
    network_ipv4_address_range: IpV4AddressRangeAddInput
    network_ipv6_address_range: IpV6AddressRangeAddInput
  }

  input NetworkAssetFiltering {
    key: NetworkAssetFilter!
    values: [String]
    operator: String
    filterMode: FilterMode 
  }

  # Pagination Types
  type NetworkAssetConnection {
    pageInfo: PageInfo!
    edges: [NetworkAssetEdge]
  }

  type NetworkAssetEdge {
    cursor: String!
    node: NetworkAsset!
  }

  enum NetworkAssetOrdering {
    name
    asset_type
    asset_id
    ip_address
    installed_operating_system
    network_id
    labels
  }

  enum NetworkAssetFilter {
    name
    asset_type
    asset_id
    ip_address
    installed_operating_system
    network_id
    labels
  }

`;

export default typeDefs ;