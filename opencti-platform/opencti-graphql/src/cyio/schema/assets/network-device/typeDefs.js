import gql from 'graphql-tag' ;

const typeDefs = gql`
  "Defines identifying information about a network device."
  type NetworkDeviceAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset {
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
    function: String
    cpe_identifier: String
    installation_id: String
    installed_hardware: [ComputingDeviceAsset!]!
    installed_operatingSystemAsset: OperatingSystemAsset!
    model: String
    motherboard_id: String
    baseline_configuration_name: String
    # NetworkAsset Device
    connected_to_network: NetworkAsset
    default_gateway: String
    ip_address: [IpAddress!]!
    mac_address: [MAC!]!
    vlan_id: String
    uri: String
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
    ports: [PortInfo!]!
  }

  "Defines identifying information about a network appliance device."
  type ApplianceAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset  {
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
    function: String
    cpe_identifier: String
    installation_id: String
    installed_hardware: [ComputingDeviceAsset!]!
    installed_operatingSystemAsset: OperatingSystemAsset!
    model: String
    motherboard_id: String
    baseline_configuration_name: String
    # NetworkAsset Device
    connected_to_network: NetworkAsset
    default_gateway: String
    ip_address: [IpAddress!]!
    mac_address: [MAC!]!
    vlan_id: String
    uri: String
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
    ports: [PortInfo!]!
  }

  "Defines identifying information about a network firewall device."
  type FirewallAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset {
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
    function: String
    cpe_identifier: String
    installation_id: String
    installed_hardware: [ComputingDeviceAsset!]!
    installed_operatingSystemAsset: OperatingSystemAsset!
    model: String
    motherboard_id: String
    baseline_configuration_name: String
    # NetworkAsset Device
    connected_to_network: NetworkAsset
    default_gateway: String
    ip_address: [IpAddress!]!
    mac_address: [MAC!]!
    vlan_id: String
    uri: String
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
    ports: [PortInfo!]!
  }

  "Defines identifying information about a network router device."
  type RouterAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset {
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
    function: String
    cpe_identifier: String
    installation_id: String
    installed_hardware: [ComputingDeviceAsset!]!
    installed_operatingSystemAsset: OperatingSystemAsset!
    model: String
    motherboard_id: String
    baseline_configuration_name: String
    # NetworkAsset Device
    connected_to_network: NetworkAsset
    default_gateway: String
    ip_address: [IpAddress!]!
    mac_address: [MAC!]!
    vlan_id: String
    uri: String
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
    ports: [PortInfo!]!
  }

  "Defines identifying information about a storage array device."
  type StorageArrayAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset {
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
    function: String
    cpe_identifier: String
    installation_id: String
    installed_hardware: [ComputingDeviceAsset!]!
    installed_operatingSystemAsset: OperatingSystemAsset!
    model: String
    motherboard_id: String
    baseline_configuration_name: String
    # NetworkAsset Device
    connected_to_network: NetworkAsset
    default_gateway: String
    ip_address: [IpAddress!]!
    mac_address: [MAC!]!
    vlan_id: String
    uri: String
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
    ports: [PortInfo!]!
  }

  "Defines identifying information about a network switch device."
  type SwitchAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset {
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
    function: String
    cpe_identifier: String
    installation_id: String
    installed_hardware: [ComputingDeviceAsset!]!
    installed_operatingSystemAsset: OperatingSystemAsset!
    model: String
    motherboard_id: String
    baseline_configuration_name: String
    # NetworkAsset Device
    connected_to_network: NetworkAsset
    default_gateway: String
    ip_address: [IpAddress!]!
    mac_address: [MAC!]!
    vlan_id: String
    uri: String
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
    ports: [PortInfo!]!
  }

  "Defines identifying information about a Voice over IP handset or phone device."
  type VoIPHandsetAsset implements BasicObject & LifecycleObject & CoreObject & Asset & ItAsset {
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
    function: String
    cpe_identifier: String
    installation_id: String
    installed_hardware: [ComputingDeviceAsset!]!
    installed_operatingSystemAsset: OperatingSystemAsset!
    model: String
    motherboard_id: String
    baseline_configuration_name: String
    # NetworkAsset Device
    connected_to_network: NetworkAsset
    default_gateway: String
    ip_address: [IpAddress!]!
    mac_address: [MAC!]!
    vlan_id: String
    uri: String
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
    ports: [PortInfo!]!
  }

  "Defines identifying information about a VoIP router device."
  type VoIPRouterAsset implements BasicObject & LifecycleObject & CoreObject& Asset & ItAsset {
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
    function: String
    cpe_identifier: String
    installation_id: String
    installed_hardware: [ComputingDeviceAsset!]!
    installed_operatingSystemAsset: OperatingSystemAsset!
    model: String
    motherboard_id: String
    baseline_configuration_name: String
    # NetworkAsset Device
    connected_to_network: NetworkAsset
    default_gateway: String
    ip_address: [IpAddress!]!
    mac_address: [MAC!]!
    vlan_id: String
    uri: String
    is_publicly_accessible: Boolean
    is_scanned: Boolean
    is_virtual: Boolean
    ports: [PortInfo!]!
  }
`;

export default typeDefs ;
