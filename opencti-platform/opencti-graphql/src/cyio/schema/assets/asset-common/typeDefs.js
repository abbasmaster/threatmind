import gql from 'graphql-tag' ;

const typeDefs = gql`
  extend type Query {
    asset(id: ID!): Asset
    assetList(
      first: Int
      offset: Int
      orderedBy: AssetsOrdering
      orderMode: OrderingMode
      filters: [AssetsFiltering]
      filterMode: FilterMode
      search: String
    ): AssetConnection
    assetLocation(id: ID!): AssetLocation
    assetLocationList(
      first: Int
      offset: Int
      orderedBy: AssetLocationsOrdering
      orderMode: OrderingMode
      filters: [AssetLocationsFiltering]
      filterMode: FilterMode
      search: String
    ): AssetLocationConnection 
    data(id: ID!): DataAsset
    dataList(
      first: Int
      offset: Int
      orderedBy: DatumOrdering
      orderMode: OrderingMode
      filters: [DatumFiltering]
      filterMode: FilterMode
      search: String
    ): DataConnection
    documentaryAsset(id: ID!): DocumentaryAsset
    documentaryAssetList(
      first: Int
      offset: Int
      orderedBy: DocumentaryAssetsOrdering
      orderMode: OrderingMode
      filters: [DocumentaryAssetsFiltering]
      filterMode: FilterMode
      search: String
    ): DocumentaryAssetConnection
    itAsset(id: ID!): ItAsset
    itAssetList(
      first: Int
      offset: Int
      orderedBy: ItAssetsOrdering
      orderMode: OrderingMode
      filters: [ItAssetsFiltering]
      filterMode: FilterMode
      search: String
    ): ItAssetConnection
    hardware(id: ID!): HardwareAsset
    hardwareList(
      first: Int
      offset: Int
      orderedBy: HardwareAssetsOrdering
      orderMode: OrderingMode
      filters: [HardwareAssetsFiltering]
      filterMode: FilterMode
      search: String
    ): HardwareAssetConnection
  }

  extend type Mutation {
    deleteAsset(id:ID!): ID
    deleteAssets(id:[ID]!): [ID]
    createAssetLocation(input: AssetLocationAddInput): AssetLocation
    deleteAssetLocation(id: ID!): String!
    editAssetLocation(id: ID!, input: [EditInput]!, commitMessage: String): AssetLocation
  }

  # ENUMERATIONS
  "Defines the types of assets."
  enum AssetType {
      operating_system
      database
      web_server
      dns_server
      email_server
      directory_server
      pbx
      firewall
      router
      switch
      storage_array
      appliance
      application_software
      network_device
      circuit
      compute_device
      workstation
      server
      network
      service
      software
      physical_device
      system
      web_site
      voip_handset
      voip_router
  }

  "Defines network protocols"
  enum NetworkAssetProtocol {
      TCP
      UDP
      ICMP
      TLS
      SSL
      DHCP
      DNS
      HTTP
      HTTPS
      NFS
      POP3
      SMTP
      SNMP
      FTP
      NTP
      IRC
      Telnet
      SSH
      TFTP
      IMAP
      ARP
      NetBIOS
      SOAP
      IP
      IPSEC
      IPX
      NAT
      OSPF
      RDP
      RIP
      RPC
      SPX
      SMB
      SOCKS
  }

#####  AssetLocation 
##
  type AssetLocation implements BasicObject & LifecycleObject & CoreObject & CyioLocation {
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
    # AssetLocation
    name: String!
    description: String
    street_address: String
    city: String
    administrative_area: String
    country: String
    postal_code: PostalCode
  }
  
  input AssetLocationAddInput {
    labels: [String]
    # AssetLocation
    name: String!
    description: String
    street_address: String
    city: String
    administrative_area: String
    country: String
    postal_code: PostalCode
  }

# Pagination Types
  type AssetLocationConnection {
    pageInfo: PageInfo!
    edges: [AssetLocationEdge]
  }
  type AssetLocationEdge {
    cursor: String!
    node: AssetLocation!
  }
  # Filtering Types
  input AssetLocationsFiltering {
    key: AssetLocationsFilter!
    values: [String]!
    operator: String
    filterMode: FilterMode
  }
  enum AssetLocationsOrdering {
    created
    modified
    labels
    city
    administrative_area
    country
    postal_code
  }
  enum AssetLocationsFilter {
    created
    modified
    labels
    city
    administrative_area
    country
    postal_code
  }

#####  Asset 
##
  "An abstract interface that defines identifying information about an asset in it generic form as something of value."
  interface Asset {
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
  }

  # Pagination Types
  type AssetConnection {
    pageInfo: PageInfo!
    edges: [AssetEdge]
  }
  type AssetEdge {
    cursor: String!
    node: Asset!
  }
  # Filtering Types
  input AssetsFiltering {
    key: AssetsFilter!
    values: [String]!
    operator: String
    filterMode: FilterMode
  }
  enum AssetsOrdering {
    created
    modified
    labels
    asset_id
    name
  }
  enum AssetsFilter {
    created
    modified
    labels
    asset_id
  }

#####  ItAsset
##
  "An abstract interface that defines identifying information about an asset that is technology-based, such as hardware, software, and networking."
  interface ItAsset {
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
  }

  # Pagination Types
  type ItAssetConnection {
    pageInfo: PageInfo!
    edges: [ItAssetEdge]
  }
  type ItAssetEdge {
    cursor: String!
    node: ItAsset!
  }
  # Filtering Types
  input ItAssetsFiltering {
    key: ItAssetsFilter!
    values: [String]!
    operator: String
    filterMode: FilterMode
  }
  enum ItAssetsOrdering {
    created
    modified
    labels
    asset_id
    name
    asset_tag
    asset_type
    serial_number
    vendor_name
    version
    release_date
    implementation_point
    operational_status
  }
  enum ItAssetsFilter {
    created
    modified
    labels
    asset_id
    asset_tag
    asset_type
    serial_number
    vendor_name
    version
    release_date
    implementation_point
    operational_status
  }

#####  Documentary Asset 
##
  "An abstract interface that defines identifying information about a documentary asset, such as policies, procedures."
  interface DocumentaryAsset {
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
    # DocumentaryAsset
    release_date: DateTime!
  }

  # Pagination Types
  type DocumentaryAssetConnection {
    pageInfo: PageInfo!
    edges: [DocumentaryAssetEdge]
  }
  type DocumentaryAssetEdge {
    cursor: String!
    node: Asset!
  }
  # Filtering Types
  input DocumentaryAssetsFiltering {
    key: DocumentaryAssetsFilter!
    values: [String]!
    operator: String
    filterMode: FilterMode
  }
  enum DocumentaryAssetsOrdering {
    created
    modified
    labels
    asset_id
    name
    release_date
  }
  enum DocumentaryAssetsFilter {
    created
    modified
    labels
    asset_id
    release_date
  }

#####  Data 
##
  "An abstract interface that defines identifying information about an instance of data."
  interface DataAsset {
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
    # Data
  }

  # Pagination Types
  type DataConnection {
    pageInfo: PageInfo!
    edges: [DataEdge]
  }
  type DataEdge {
    cursor: String!
    node: DataAsset!
  }
  # Filtering Types
  input DatumFiltering {
    key: DatumFilter!
    values: [String]!
    operator: String
    filterMode: FilterMode
  }
  enum DatumOrdering {
    created
    modified
    labels
    asset_id
    name
  }
  enum DatumFilter {
    created
    modified
    labels
    asset_id
  }

#####  HardwareAsset
##
  interface HardwareAsset {
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
    # HardwareAsset
    cpe_identifier: String
    installation_id: String
    installed_hardware: [ComputingDeviceAsset!]!
    installed_operating_system: OperatingSystemAsset!
    model: String
    motherboard_id: String
    baseline_configuration_name: String
    function: String
  }

  # Pagination Types
  type HardwareAssetConnection {
    pageInfo: PageInfo!
    edges: [HardwareAssetEdge]
  }
  type HardwareAssetEdge {
    cursor: String!
    node: HardwareAsset!
  }
  # Filtering Types
  input HardwareAssetsFiltering {
    key: HardwareAssetsFilter!
    values: [String]!
    operator: String
    filterMode: FilterMode
  }
  enum HardwareAssetsOrdering {
    created
    modified
    labels
    asset_id
    name
    asset_tag
    asset_type
    serial_number
    vendor_name
    version
    release_date
    implementation_point
    operational_status
    cpe_identifier
    installation_id
    model
    motherboard_id
    baseline_configuration_name
  }
  enum HardwareAssetsFilter {
    created
    modified
    labels
    asset_id
    name
    asset_tag
    asset_type
    serial_number
    vendor_name
    version
    release_date
    implementation_point
    operational_status
    cpe_identifier
    installation_id
    model
    motherboard_id
    baseline_configuration_name
}

  "Captures identifying information about an account.  The Account class is an extension to NIST-7693 that was \\\"missing\\\". The relationship with other Account classes from other ontologies will likely be established here."
  interface AccountAsset {
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
  }

  type IpAddressRange {
      starting_ip_address: IpAddress!
      ending_ip_address: IpAddress!
  }

  input IpV4AddressRangeAddInput {
      starting_ip_address: IpV4AddressAddInput!
      ending_ip_address: IpV4AddressAddInput!
  }

  input IpV6AddressRangeAddInput {
      starting_ip_address: IpV6AddressAddInput!
      ending_ip_address: IpV6AddressAddInput!
  }

  # interface IpAddress {
  #     id: ID!
  #     entity_type: String!
  # }
  union IpAddress = IpV4Address | IpV6Address

  type IpV4Address implements BasicObject {
    # BasicObject
    "Uniquely identifies this object."
    id: ID!
    "Identifies the identifier defined by the standard."
    standard_id: String!
    "Identifies the type of the Object."
    entity_type: String!
    "Identifies the parent types of this object."
    parent_types: [String]!
    # IpV4Address
    ip_address_value: IPv4!
  }

  type IpV6Address implements BasicObject {
    # BasicObject
    "Uniquely identifies this object."
    id: ID!
    "Identifies the identifier defined by the standard."
    standard_id: String!
    "Identifies the type of the Object."
    entity_type: String!
    "Identifies the parent types of this object."
    parent_types: [String]!
    # IpV6Address
    ip_address_value: IPv6!
  }

  input IpV4AddressAddInput {
      # IpV4Address
      ip_address_value: IPv4!
  } 

  input IpV6AddressAddInput {
      # IpV6Address
      ip_address_value: IPv6!
  }

  "Defines identifying information about a network port."
  type PortInfo {
      port_number: Port
      protocols: [NetworkAssetProtocol]
  }

  input PortInfoAddInput {
      port_number: Port
      protocols: [NetworkAssetProtocol]
  }

  type StartEndPortRange {
      starting_port: Port
      ending_port: Port
      protocols: [NetworkAssetProtocol]
  }
  
  union PortRange = PortInfo | StartEndPortRange
`;

export default typeDefs ;