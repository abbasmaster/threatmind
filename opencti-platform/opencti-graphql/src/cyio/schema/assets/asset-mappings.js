// generated from the ontology files for the object
const assetNameContext = {
  id: 'http://darklight.ai/ns/common#id',
  entity_type: 'http://darklight.ai/ns/common#object_type',
  asset_id: 'http://scap.nist.gov/ns/asset-identification#asset_id',
  asset_tag: 'http://scap.nist.gov/ns/asset-identification#asset_tag',
  asset_type: 'http://scap.nist.gov/ns/asset-identification#asset_type',
  baseline_configuration_name: 'http://scap.nist.gov/ns/asset-identification#baseline_configuration_name',
  bios_id: 'http://scap.nist.gov/ns/asset-identification#bios_id',
  cpe_identifier: 'http://scap.nist.gov/ns/asset-identification#cpe_identifier',
  default_gateway: 'http://scap.nist.gov/ns/asset-identification#default_gateway',
  description: 'http://scap.nist.gov/ns/asset-identification#description',
  fqdn: 'http://scap.nist.gov/ns/asset-identification#fqdn',
  function: 'http://scap.nist.gov/ns/asset-identification#function',
  hostname: 'http://scap.nist.gov/ns/asset-identification#hostname',
  implementation_point: 'http://scap.nist.gov/ns/asset-identification#implementation_point',
  installation_id: 'http://scap.nist.gov/ns/asset-identification#installation_id',
  installed_hardware: 'http://scap.nist.gov/ns/asset-identification#installed_hardware',
  installed_operating_system: 'http://scap.nist.gov/ns/asset-identification#installed_operating_system',
  installed_software: 'http://scap.nist.gov/ns/asset-identification#installed_software',
  ip_address: 'http://scap.nist.gov/ns/asset-identification#ip_address',
  is_publicly_accessible: 'http://scap.nist.gov/ns/asset-identification#is_publicly_accessible',
  is_scanned: 'http://scap.nist.gov/ns/asset-identification#is_scanned',
  is_virtual: 'http://scap.nist.gov/ns/asset-identification#is_virtual',
  last_scanned: 'http://scap.nist.gov/ns/asset-identification#last_scanned',
  license_key: 'http://scap.nist.gov/ns/asset-identification#license_key',
  locations: 'http://scap.nist.gov/ns/asset-identification#locations',
  mac_address: 'http://scap.nist.gov/ns/asset-identification#mac_address',
  model: 'http://scap.nist.gov/ns/asset-identification#model',
  motherboard_id: 'http://scap.nist.gov/ns/asset-identification#motherboard_id',
  name: 'http://scap.nist.gov/ns/asset-identification#name',
  netbios_name: 'http://scap.nist.gov/ns/asset-identification#netbios_name',
  network_address_range: 'http://scap.nist.gov/ns/asset-identification#network_address_range',
  network_id: 'http://scap.nist.gov/ns/asset-identification#network_id',
  network_name: 'http://scap.nist.gov/ns/asset-identification#network_name',
  operational_status: 'http://scap.nist.gov/ns/asset-identification#operational_status',
  patch_level: 'http://scap.nist.gov/ns/asset-identification#patch_level',
  ports: 'http://scap.nist.gov/ns/asset-identification#ports',
  release_date: 'http://scap.nist.gov/ns/asset-identification#release_date',
  responsible_parties: 'http://scap.nist.gov/ns/asset-identification#responsible_parties',
  serial_number: 'http://scap.nist.gov/ns/asset-identification#serial_number',
  service_software: 'http://scap.nist.gov/ns/asset-identification#service_software',
  software_identifier: 'http://scap.nist.gov/ns/asset-identification#software_identifier',
  system_name: 'http://scap.nist.gov/ns/asset-identification#system_name',
  uri: 'http://scap.nist.gov/ns/asset-identification#uri',
  vendor_name: 'http://scap.nist.gov/ns/asset-identification#vendor_name',
  version: 'http://scap.nist.gov/ns/asset-identification#version',
  vlan_id: 'http://scap.nist.gov/ns/asset-identification#vlan_id',
};

const objectTypeMapping = {
  // object-type: GraphQL-Type
  account: 'AccountAsset',
  appliance: 'ApplianceAsset',
  'application-software': 'ApplicationSoftwareAsset',
  asset: 'Asset',
  circuit: 'CircuitAsset',
  'computer-account': 'ComputerAccountAsset',
  'computing-device': 'ComputingDeviceAsset',
  data: 'DataAsset',
  database: 'DatabaseAsset',
  'directory-server': 'DirectoryServerAsset',
  'dns-server': 'DnsServerAsset',
  'documentary-asset': 'DocumentaryAsset',
  'email-server': 'EmailServerAsset',
  embedded: 'HardwareAsset',
  firewall: 'FirewallAsset',
  guidance: 'GuidanceAsset',
  hardware: 'HardwareAsset',
  hypervisor: 'SoftwareAsset',
  'ip-addr-range': 'IpAddressRange',
  'ipv4-addr': 'IpV4Address',
  'ipv6-addr': 'IpV6Address',
  'it-asset': 'ItAsset',
  laptop: 'LaptopAsset',
  'load-balancer': 'NetworkDeviceAsset',
  location: 'AssetLocation',
  'mac-addr': 'MACAddress',
  'mobile-device': 'MobileDeviceAsset',
  'network-device': 'NetworkDeviceAsset',
  network: 'NetworkAsset',
  'operating-system': 'OperatingSystemAsset',
  'physical-device': 'PhysicalDeviceAsset',
  plan: 'PlanAsset',
  policy: 'PolicyAsset',
  'port-range': 'PortRange',
  port: 'PortInfo',
  printer: 'NetworkAsset',
  procedure: 'ProcedureAsset',
  'responsible-party': 'ResponsibleParty',
  router: 'RouterAsset',
  server: 'ServerAsset',
  'service-account': 'ServiceAccountAsset',
  service: 'ServiceAsset',
  software: 'SoftwareAsset',
  standard: 'StandardAsset',
  'storage-array': 'StorageArrayAsset',
  switch: 'SwitchAsset',
  system: 'SystemAsset',
  'user-account': 'UserAccountAsset',
  validation: 'ValidationAsset',
  'void-device': 'VoIPDevice',
  'voip-handset': 'VoIPHandsetAsset',
  'voip-router': 'VoIPRouterAsset',
  'web-server': 'WebServerAsset',
  website: 'WebsiteAsset',
  'web-site': 'WebsiteAsset',
  workstation: 'WorkstationAsset',
};

const assetSingularizeSchema = {
  singularizeVariables: {
    '': false, // so there is an object as the root instead of an array
    id: true,
    iri: true,
    object_type: true,
    entity_type: true,
    abstract: true,
    administrative_area: true,
    asset_id: true,
    asset_tag: true,
    asset_type: true,
    authors: false,
    baseline_configuration_name: true,
    bios_id: true,
    city: true,
    collected: true,
    color: true,
    connected_to_network: true,
    content: true,
    count: true,
    country: true,
    country_code: true,
    cpe_identifier: true,
    created: true,
    deadline: true,
    default_gateway: true,
    description: true,
    end_date: true,
    ending_ip_address: true,
    event_start: true,
    event_end: true,
    expires: true,
    external_id: true,
    fqdn: true,
    function: true,
    hostname: true,
    implementation_point: true,
    installation_id: true,
    installed_hardware: false,
    installed_operating_system: false, // should be true
    installed_os_name: true, // true
    installed_software: false,
    ip_address: false,
    ip_address_value: true,
    is_publicly_accessible: true,
    is_scanned: true,
    is_virtual: true,
    label_name: true,
    last_modified: true,
    last_scanned: true,
    license_key: true,
    locations: false,
    mac_address: false,
    mac_address_value: true,
    media_type: true,
    model: true,
    modified: true,
    motherboard_id: true,
    name: true,
    netbios_name: true,
    network_address_range: true,
    network_id: true,
    network_name: true,
    on_date: true,
    operational_status: true,
    patch_level: true,
    port_number: true,
    ports: false,
    postal_code: true,
    published: true,
    reference_purpose: true,
    release_date: true,
    responsible_parties: false,
    serial_number: true,
    service_software: true,
    software_identifier: true,
    source_name: true,
    start_date: true,
    starting_ip_address: true,
    street_address: true,
    system_name: true,
    uri: false,
    url: true,
    valid_from: true,
    valid_until: true,
    vendor_name: true,
    version: true,
    vlan_id: true,
    hw_installed_on: false,
    hw_installed_on_id: false,
    hw_installed_on_name: false,
    os_installed_on: false,
    os_installed_on_id: false,
    os_installed_on_name: false,
    sw_installed_on: false,
    sw_installed_on_id: false,
    sw_installed_on_name: false,
  },
};

export { assetNameContext, assetSingularizeSchema, objectTypeMapping };
