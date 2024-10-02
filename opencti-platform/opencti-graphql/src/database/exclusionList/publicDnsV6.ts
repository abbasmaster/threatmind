import { exclusionListEntityType, type ExclusionListProperties } from './constants';

const list = [
  '2001:148f:fffe::1',
  '2001:148f:ffff::1',
  '2001:1608:10:25::1c04:b12f',
  '2001:1608:10:25::9249:d69b',
  '2001:19f0:5:3bd7:5400:4ff:fe05:da83',
  '2001:19f0:7402:1574:5400:2ff:fe66:2cff',
  '2001:19f0:9002:de4:5400:4ff:fe08:7de3',
  '2001:19f0:b400:1d8c:5400:4ff:fe11:b15a',
  '2001:1a68::d911:2244',
  '2001:1bc0::ffff:aaaa:2',
  '2001:1bc0::ffff:bbbb:2',
  '2001:418:3ff::1:53',
  '2001:418:3ff::53',
  '2001:41d0:1:de53::1',
  '2001:41d0:700:13cb:141:95:6:51',
  '2001:41d0:700:537::',
  '2001:428:101:100:205:171:3:65',
  '2001:468:c80:2101:0:100:0:22',
  '2001:468:c80:4101:0:100:0:42',
  '2001:470:0:45::2',
  '2001:470:1f07:ed6::',
  '2001:470:1f11:2bb::b23',
  '2001:470:1f15:b80::53',
  '2001:470:1f2a:1de::2',
  '2001:470:20::2',
  '2001:470:23:4bd::2',
  '2001:470:71:1c::d',
  '2001:4860:4860::64',
  '2001:4860:4860::6464',
  '2001:4860:4860::8844',
  '2001:4860:4860::8888',
  '2001:4870:6082:3::100',
  '2001:4870:6082:3::5',
  '2001:4b8:2:101::602',
  '2001:4b8:3:201::902',
  '2001:4ba0:ffa4:1ce::',
  '2001:4ba0:ffa4:3f7::',
  '2001:550:1:1::d',
  '2001:550:1:2::d',
  '2001:550:5a00:5eb::db5:f001',
  '2001:678:6d4:5080::3dea:109',
  '2001:678:e68:f000::',
  '2001:678:f68:70:5054:ff:fe57:4a07',
  '2001:67c:21ec::53',
  '2001:67c:2b0::1',
  '2001:67c:2b0::2',
  '2001:738:6001:b0b0::1000',
  '2001:780:250::beaf',
  '2001:840:100::',
  '2001:878:0:e000:82:e1:f4:a6',
  '2001:8b0:978:f4a4::1',
  '2001:8d8:1801:86e7::1',
  '2001:8d8:820:3a00::b:c47',
  '2001:910:800::12',
  '2001:910:800::40',
  '2001:978:1:2::d',
  '2001:b000:168::1',
  '2001:bc8:1830:b07::1',
  '2001:bc8:628:a0f::1',
  '2001:bc8:62c:379::1',
  '2001:bc8:670:112::1',
  '2001:dc8:0:2::106',
  '2001:dc8:1:2::106',
  '2001:de2::1',
  '2001:de4::101',
  '2001:df0:27b::226',
  '2400:6180:0:d0::5f6e:4001',
  '2400:8902::f03c:91ff:feda:c514',
  '2402:2c00:1688:162:1643:4989:f51c:7392',
  '2402:d0c0:16:a1e6:0:b893:bf7:dd',
  '2402:d0c0:18:c8ff:0:b893:bf7:dd',
  '2402:d0c0:22:6cd0:4:4:4:5b81',
  '2403:cfc0:1004:369::5b21',
  '2403:cfc0:1114:10e::a',
  '2404:9400:1:0:216:3eff:fef0:180a',
  '2406:4300:bae:6b08::1',
  '2407:6ac0:3:5:1234:e34e:72e4:1',
  '2407:9440:1:5::3',
  '2409::1',
  '2600:4c00:80:8::a',
  '2602:2a8:811:10::a',
  '2602:2b7:d01:c295::b:18',
  '2602:fb94:1:39::a',
  '2602:fba1:100::71:1',
  '2602:fba1:a00::100:1',
  '2602:fba1:d00::23:1',
  '2602:fc24:12:9873::ab1',
  '2602:fc24:18:33f2::ab1',
  '2602:fc24:19:74b0:5285::12',
  '2602:fcc0:2222:0:ff24:a2c7:19c:1',
  '2602:fe54:22:57::5bd:134',
  '2602:fea7:e0c:e:bff:6:70:194c',
  '2602:ff75:7:b79::b4b4',
  '2604:a880:0:1010::b:4001',
  '2604:bf00:210:12::2',
  '2604:ffc0::',
  '2605:6400:20:2258:7acb:91ff:2098:a9',
  '2606:1a40:1::',
  '2606:1a40:1::1',
  '2606:1a40:1::2',
  '2606:1a40:1::3',
  '2606:1a40:1::32',
  '2606:1a40:1::33',
  '2606:1a40:1::34',
  '2606:1a40:1::35',
  '2606:1a40:1::36',
  '2606:1a40:1::37',
  '2606:1a40:1::38',
  '2606:1a40:1::4',
  '2606:1a40:1::5',
  '2606:1a40::',
  '2606:1a40::1',
  '2606:1a40::2',
  '2606:1a40::3',
  '2606:1a40::32',
  '2606:1a40::33',
  '2606:1a40::34',
  '2606:1a40::35',
  '2606:1a40::36',
  '2606:1a40::37',
  '2606:1a40::38',
  '2606:1a40::4',
  '2606:1a40::5',
  '2606:4700:4700::1111',
  '2606:4700:4700::1113',
  '2606:4700:4700::64',
  '2606:4700:4700::6400',
  '2606:65c0:40:4:5f3:54c4:8d10:9b98',
  '2606:6680:19:1::4fb4:71a7',
  '2606:6680:29:1::5859:a37b',
  '2606:6680:35:1::506d:8ce2',
  '2606:6680:45:1::f78c:9b0',
  '2606:6680:53:1::846a:bd79',
  '2606:6680:6:1::3ea9:3ce6',
  '2606:a8c0:3:202::a',
  '2607:1e40:1:10a4::19:ca84',
  '2607:5300:203:7f27:5054:ff:fe45:85b5',
  '2607:5300:203:7f27:5054:ff:fe57:4a07',
  '2607:5300:61:c67::11',
  '2607:f130:0:145::7569:1026',
  '2610:a1:1018::1',
  '2610:a1:1018::5',
  '2610:a1:1019::1',
  '2610:a1:1019::2',
  '2610:a1:1019::5',
  '2620:0:ccc::2',
  '2620:0:ccd::2',
  '2620:10a:80bb::20',
  '2620:119:35::35',
  '2620:74:1b::1:1',
  '2620:74:1c::2:2',
  '2620:fe::11',
  '2620:fe::9',
  '2620:fe::fe',
  '2620:fe::fe:10',
  '2620:fe::fe:11',
  '2620:fe::fe:9',
  '2a00:5a60::1:ff',
  '2a00:5a60::ad1:ff',
  '2a00:5a60::ad2:ff',
  '2a00:6800:3:4bd::1',
  '2a00:6a00:ad1:806::83',
  '2a00:6a00:ad1:806::86',
  '2a00:f48:1003:1::759d:c751',
  '2a00:f826:8:1::254',
  '2a00:f826:8:2::195',
  '2a00:fbe0:1:3802::3',
  '2a01:238:4231:5200::1',
  '2a01:4f8:13a:250b::30',
  '2a01:4f8:141:316d::117',
  '2a01:4f8:151:34aa::198',
  '2a01:4f8:172:1d2a::2',
  '2a01:4f8:1c17:4df8::1',
  '2a01:4f8:c17:739a::2',
  '2a01:6ee0:1::241:1',
  '2a01:8740:1:40::8a25',
  '2a01:9e00::54',
  '2a02:200:1:11::100',
  '2a02:200:1:12::100',
  '2a02:27a8:feed::81',
  '2a02:27ac::1249',
  '2a02:27ad::201',
  '2a02:2970:1002::18',
  '2a02:6b8:0:1::feed:a11',
  '2a02:6b8:0:1::feed:bad',
  '2a02:6b8:0:1::feed:ff',
  '2a02:6b8::feed:bad',
  '2a02:6b8::feed:ff',
  '2a02:7b40:6deb:4526::3',
  '2a02:88:1:e:807::101',
  '2a02:88:1:e:807::99',
  '2a02:bf8:aaaa::10',
  '2a02:bf8:aaaa::11',
  '2a02:c205:3001:4558::1',
  '2a03:4000:17:9ca:8860:f2ff:feb0:cbfe',
  '2a03:4000:24:361::6e73:32',
  '2a03:4000:4d:c92:88c0:96ff:fec6:b9d',
  '2a03:4000:55:d1d::',
  '2a03:4000:5c:51:24b9:51ff:fe80:f3a7',
  '2a03:4000:6:e5fc::1',
  '2a03:90c0:9992::1',
  '2a03:90c0:999d::1',
  '2a03:94e0:1804::1',
  '2a03:b0c0:1:e0::487:1001',
  '2a03:b0c0:2:d0::cf0:c001',
  '2a03:c7c0:52:2641:180::13',
  '2a03:d780:0:196::3e84:56af',
  '2a03:e2c0:73e:a::13',
  '2a04:52c0:101:75::75',
  '2a04:6f00:4::17a',
  '2a05:4140:700:e::a',
  '2a05:9406::ae1',
  '2a05:dfc7:5353::53',
  '2a06:1280:bee1:2::ee12:208',
  '2a06:1c40:3::13',
  '2a06:a006:d1d1::116',
  '2a06:f901:4001:100::2d6c:736a',
  '2a06:f902:4001:100:9000:9000:39a4:5feb',
  '2a06:f902:8001:100::1757:e617',
  '2a07:a8c0::',
  '2a07:a8c0::76:4378',
  '2a07:a8c1::',
  '2a07:a8c1::76:4378',
  '2a09:5302:ffff::ac9',
  '2a09::',
  '2a09::1',
  '2a09:b280:fe00:24::a',
  '2a0a:51c0::7fe',
  '2a0a:6040:973d::a',
  '2a0c:2500:572:1354::cafe',
  '2a0c:8fc0:1749:66:18::16',
  '2a0c:8fc0:c3e5::1000',
  '2a0c:8fc1:6441::412:ab34',
  '2a0c:8fc1:8004:553::145a:bbf9',
  '2a0c:8fc1:88::32:64:128',
  '2a0c:8fc3:6402::1:984',
  '2a0c:8fc3:8002::2216',
  '2a0c:a9c7:8::1',
  '2a0c:b840:2:162:1808:0:1c:9b6c',
  '2a0c:b9c0:f:451d::1',
  '2a0d:2a00:1::2',
  '2a0d:2a00:2::2',
  '2a0d:5600:33:3::3',
  '2a0d:8140:0:13:2915:af:0:18',
  '2a0d:8480:1:f9::',
  '2a0d:8480::fd4',
  '2a0d:f302:110:6517::bb4:214',
  '2a0e:1d80:21:9cc2::1',
  '2a0e:1d80:27:6289::1',
  '2a0e:2000::2000',
  '2a0f:4a80:0:5::6734',
  '2a0f:5707:aa81:5e3c::1',
  '2a0f:5707:ab80:334e:2:2:2cd2:a8bc',
  '2a0f:ca81:133b:3cb5::b1b1:641',
  '2a0f:fc80::',
  '2a0f:fc80::9',
  '2a0f:fc81::',
  '2a0f:fc81::9',
  '2a10:50c0::1:ff',
  '2a10:50c0::2:ff',
  '2a10:50c0::ad1:ff',
  '2a10:50c0::ad2:ff',
  '2a10:50c0::bad1:ff',
  '2a11::',
  '2a11:b244::244',
  '2a12:1fc0:0:c::3',
  '2a12:e342:200::2:1819',
  '2c0f:e8f8:2000:233::a39b:7123',
  '2c0f:f530::d00:188'
];
export const publicDnsV6List: ExclusionListProperties = {
  name: 'publicDnsV6List',
  type: [exclusionListEntityType.IPV6_ADDR],
  list,
  actions: null,
};
