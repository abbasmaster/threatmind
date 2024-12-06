import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import gql from 'graphql-tag';
import { testContext } from '../../utils/testQuery';
import { queryAsAdminWithSuccess } from '../../utils/testQueryHelper';
import { ENTITY_DOMAIN_NAME, ENTITY_IPV4_ADDR } from '../../../src/schema/stixCyberObservable';
import { buildCacheFromAllExclusionLists } from '../../../src/database/exclusionListCache';
import { checkExclusionList, checkIpAddressLists } from '../../../src/utils/exclusionLists';

describe('Exclusion list cache build manager tests ', () => {
  const context = testContext;
  let exclusionListIPId = '';
  let exclusionListDomainId = '';
  const exclusionListIpValues = '127.0.0.1\n10.10.0.0/28\n2.2.2.2';
  const exclusionListDomainValues = 'google.com\nfiligran.io\nwww.test.net';

  const CREATE_CONTENT_MUTATION = gql`
        mutation exclusionListContentAdd($input: ExclusionListContentAddInput!) {
            exclusionListContentAdd(input: $input) {
                id
                file_id
            }
        }
    `;

  const DELETE_MUTATION = gql`
        mutation exclusionListDelete($id: ID!) {
            exclusionListDelete(id: $id)
        }
    `;
  beforeAll(async () => {
    const exclusionListIP = await queryAsAdminWithSuccess({
      query: CREATE_CONTENT_MUTATION,
      variables: {
        input: {
          name: 'test_ip_list',
          description: 'test_description',
          exclusion_list_entity_types: [ENTITY_IPV4_ADDR],
          content: exclusionListIpValues
        }
      }
    });
    exclusionListIPId = exclusionListIP.data?.exclusionListContentAdd.id;
    const exclusionListDomain = await queryAsAdminWithSuccess({
      query: CREATE_CONTENT_MUTATION,
      variables: {
        input: {
          name: 'test_domain_list',
          description: 'test_description',
          exclusion_list_entity_types: [ENTITY_DOMAIN_NAME],
          content: exclusionListDomainValues
        }
      }
    });
    exclusionListDomainId = exclusionListDomain.data?.exclusionListContentAdd.id;
  });
  afterAll(async () => {
    await queryAsAdminWithSuccess({
      query: DELETE_MUTATION,
      variables: {
        id: exclusionListIPId
      }
    });
    await queryAsAdminWithSuccess({
      query: DELETE_MUTATION,
      variables: {
        id: exclusionListDomainId
      }
    });
  });
  it('should build cache from current exclusion lists', async () => {
    const builtCache = await buildCacheFromAllExclusionLists(context);
    expect(builtCache).toBeDefined();
    expect(builtCache.length).toEqual(2);
    const ipCache = builtCache.filter((c) => c.id === exclusionListIPId);
    expect(ipCache.length).toEqual(1);
    expect(ipCache[0].types).toEqual([ENTITY_IPV4_ADDR]);
    expect(ipCache[0].values.length).toEqual(3);
    expect(checkIpAddressLists('127.0.0.1', ipCache)).toBeTruthy();
    expect(checkIpAddressLists('10.10.0.10', ipCache)).toBeTruthy();
    expect(checkIpAddressLists('2.2.2.2', ipCache)).toBeTruthy();
    const domainCache = builtCache.filter((c) => c.id === exclusionListDomainId);
    expect(domainCache.length).toEqual(1);
    expect(domainCache[0].types).toEqual([ENTITY_DOMAIN_NAME]);
    expect(domainCache[0].values.length).toEqual(3);
    expect(checkExclusionList('google.com', domainCache)).toBeTruthy();
    expect(checkExclusionList('filigran.io', domainCache)).toBeTruthy();
    expect(checkExclusionList('www.test.net', domainCache)).toBeTruthy();
  });
});
