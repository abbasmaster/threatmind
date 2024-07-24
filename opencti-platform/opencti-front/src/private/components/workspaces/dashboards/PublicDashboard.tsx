import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import Tooltip from '@mui/material/Tooltip';
import { ViewListOutlined } from '@mui/icons-material';
import { graphql } from 'react-relay';
import { PublicDashboardsListQuery, PublicDashboardsListQuery$variables } from '@components/workspaces/dashboards/__generated__/PublicDashboardsListQuery.graphql';
import { PublicDashboardsFragment$data } from '@components/workspaces/dashboards/__generated__/PublicDashboardsFragment.graphql';
import { useFormatter } from '../../../../components/i18n';
import { emptyFilterGroup, useBuildEntityTypeBasedFilterContext } from '../../../../utils/filters/filtersUtils';
import DataTable from '../../../../components/dataGrid/DataTable';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import useQueryLoading from '../../../../utils/hooks/useQueryLoading';
import { usePaginationLocalStorage } from '../../../../utils/hooks/useLocalStorage';
import { DataTableVariant } from '../../../../components/dataGrid/dataTableTypes';
import ItemStatus from '../../../../components/ItemStatus';

const publicDashboardFragment = graphql`
  fragment PublicDashboard on PublicDashboard {
    id
    uri_key
    enabled
    name
    owner {
      name
    }
    user_id
    created_at
    updated_at
    parent_types
    dashboard_id
    private_manifest
    allowed_markings {
      id
      definition
      definition_type
      x_opencti_color
      x_opencti_order
    }
  }
`;
export const publicDashboardsFragment = graphql`
  fragment PublicDashboardsFragment on Query
  @argumentDefinitions(
    search: { type: "String" }
    count: { type: "Int", defaultValue: 25 }
    cursor: { type: "ID" }
    orderBy: { type: "PublicDashboardsOrdering", defaultValue: name }
    orderMode: { type: "OrderingMode", defaultValue: asc }
    filters: { type: "FilterGroup" }
  )
  @refetchable(queryName: "PublicDashboardsRefetchQuery") {
    publicDashboards(
      search: $search
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    ) @connection(key: "Pagination_publicDashboards") {
      edges {
        node {
          ...PublicDashboard
        }
      }
      pageInfo {
        endCursor
        hasNextPage
        globalCount
      }
    }
  }
`;
const publicDashboardsListQuery = graphql`
  query PublicDashboardsListQuery(
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: PublicDashboardsOrdering
    $orderMode: OrderingMode
    $filters: FilterGroup)
  {
    ...PublicDashboardsFragment
    @arguments(
      search: $search
      count: $count
      cursor: $cursor
      orderBy: $orderBy
      orderMode: $orderMode
      filters: $filters
    )
  }
`;
const LOCAL_STORAGE_KEY = 'PublicDashboard';

const PublicDashboardComponent = () => {
  const { t_i18n } = useFormatter();
  const initialValues = {
    searchTerm: '',
    sortBy: 'name',
    orderAsc: true,
    openExports: false,
    filters: emptyFilterGroup,
  };
  const { viewStorage, helpers, paginationOptions } = usePaginationLocalStorage<PublicDashboardsListQuery$variables>(
    LOCAL_STORAGE_KEY,
    initialValues,
  );
  const contextFilters = useBuildEntityTypeBasedFilterContext('PublicDashboard', viewStorage.filters);
  const queryPaginationOptions = {
    ...paginationOptions,
    filters: contextFilters,
  } as unknown as PublicDashboardsListQuery$variables;

  const queryRef = useQueryLoading<PublicDashboardsListQuery>(
    publicDashboardsListQuery,
    queryPaginationOptions,
  );
  // const { isFeatureEnable } = useHelper();
  // const dataTableEnabled = isFeatureEnable('DATA_TABLES');

  const dataColumns = {
    name: {
      id: 'name',
      flexSize: 15,
      label: 'Public Dashboard name',
    },
    // private_manifest: {
    //   id: 'private manifest',
    //   flexSize: 10,
    //   label: 'Original dashboard',
    //   isSortable: true,
    //   render: ({ private_manifest }) => (
    //     <Tooltip title={private_manifest}>{private_manifest}</Tooltip>
    //   ),
    // },
    allowed_markings: {
      id: 'allowed_markings',
      flexSize: 10,
      label: 'Max markings shared',
    },
    enabled: {
      id: 'enabled',
      flexSize: 10,
      label: 'Link enabled',
      isSortable: true,
      render: ({ status, enabled }, { variant }) => (
        <ItemStatus
          status={status}
          variant={variant === DataTableVariant.default ? 'inList' : 'inLine'}
          disabled={!enabled}
        />
      ),
    },
    owner: {
      id: 'owner',
      flexSize: 10,
      label: 'Shared by',
      isSortable: true,
      render: ({ owner }) => owner?.name ?? '-',
    },
  };
  return (
    <>
      <Breadcrumbs variant="list" elements={[{ label: t_i18n('Dashboards') }, { label: t_i18n('Public Dashboards'), current: true }]}/>
      {queryRef && (
      <DataTable
        dataColumns={dataColumns}
        resolvePath={(data: PublicDashboardsFragment$data) => {
          return data.publicDashboards?.edges?.map((n) => n?.node);
        }}
        storageKey={LOCAL_STORAGE_KEY}
        initialValues={initialValues}
        toolbarFilters={contextFilters}
        preloadedPaginationProps={{
          linesQuery: publicDashboardsListQuery,
          linesFragment: publicDashboardsFragment,
          queryRef,
          setNumberOfElements: helpers.handleSetNumberOfElements,
        }}
        lineFragment={publicDashboardFragment}
        exportContext={{ entity_type: 'PublicDashboard' }}
        additionalHeaderButtons={[
          <ToggleButton key="cards" value="lines" aria-label="lines">
            <Tooltip title={t_i18n('Lines view')}>
              <ViewListOutlined color="primary" fontSize="small"/>
            </Tooltip>
          </ToggleButton>,
        ]}
      />
      )}
    </>
  );
};

export default PublicDashboardComponent;
