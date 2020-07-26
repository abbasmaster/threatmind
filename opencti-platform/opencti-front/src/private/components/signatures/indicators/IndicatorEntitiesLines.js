import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { interval } from 'rxjs';
import { pathOr } from 'ramda';
import { createPaginationContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import ListLinesContent from '../../../../components/list_lines/ListLinesContent';
import {
  IndicatorEntityLine,
  IndicatorEntityLineDummy,
} from './IndicatorEntityLine';
import { TEN_SECONDS } from '../../../../utils/Time';

const interval$ = interval(TEN_SECONDS);

const nbOfRowsToLoad = 50;

class IndicatorEntitiesLines extends Component {
  componentDidMount() {
    this.subscription = interval$.subscribe(() => {
      this.props.relay.refetchConnection(25);
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    const {
      initialLoading,
      dataColumns,
      relay,
      entityLink,
      paginationOptions,
      displayRelation,
      entityId,
    } = this.props;
    return (
      <ListLinesContent
        initialLoading={initialLoading}
        loadMore={relay.loadMore.bind(this)}
        hasMore={relay.hasMore.bind(this)}
        isLoading={relay.isLoading.bind(this)}
        dataList={pathOr(
          [],
          ['stixCoreRelationships', 'edges'],
          this.props.data,
        )}
        globalCount={pathOr(
          nbOfRowsToLoad,
          ['stixCoreRelationships', 'pageInfo', 'globalCount'],
          this.props.data,
        )}
        LineComponent={
          <IndicatorEntityLine
            displayRelation={displayRelation}
            entityId={entityId}
          />
        }
        DummyLineComponent={
          <IndicatorEntityLineDummy displayRelation={displayRelation} />
        }
        dataColumns={dataColumns}
        nbOfRowsToLoad={nbOfRowsToLoad}
        paginationOptions={paginationOptions}
        entityLink={entityLink}
      />
    );
  }
}

IndicatorEntitiesLines.propTypes = {
  classes: PropTypes.object,
  paginationOptions: PropTypes.object,
  dataColumns: PropTypes.object.isRequired,
  entityId: PropTypes.string,
  data: PropTypes.object,
  relay: PropTypes.object,
  stixCoreRelationships: PropTypes.object,
  initialLoading: PropTypes.bool,
  entityLink: PropTypes.string,
  displayRelation: PropTypes.bool,
};

export const indicatorEntitiesLinesQuery = graphql`
  query IndicatorEntitiesLinesPaginationQuery(
    $fromId: String
    $inferred: Boolean
    $relationship_type: String
    $firstSeenStart: DateTime
    $firstSeenStop: DateTime
    $lastSeenStart: DateTime
    $lastSeenStop: DateTime
    $weights: [Int]
    $search: String
    $count: Int!
    $cursor: ID
    $orderBy: StixCoreRelationshipsOrdering
    $orderMode: OrderingMode
  ) {
    ...IndicatorEntitiesLines_data
      @arguments(
        fromId: $fromId
        inferred: $inferred
        relationship_type: $relationship_type
        firstSeenStart: $firstSeenStart
        firstSeenStop: $firstSeenStop
        lastSeenStart: $lastSeenStart
        lastSeenStop: $lastSeenStop
        weights: $weights
        search: $search
        count: $count
        cursor: $cursor
        orderBy: $orderBy
        orderMode: $orderMode
      )
  }
`;

export default createPaginationContainer(
  IndicatorEntitiesLines,
  {
    data: graphql`
      fragment IndicatorEntitiesLines_data on Query
        @argumentDefinitions(
          fromId: { type: "String" }
          inferred: { type: "Boolean" }
          relationship_type: { type: "String" }
          firstSeenStart: { type: "DateTime" }
          firstSeenStop: { type: "DateTime" }
          lastSeenStart: { type: "DateTime" }
          lastSeenStop: { type: "DateTime" }
          weights: { type: "[Int]" }
          search: { type: "String" }
          count: { type: "Int", defaultValue: 25 }
          cursor: { type: "ID" }
          orderBy: {
            type: "StixCoreRelationshipsOrdering"
            defaultValue: "start_time"
          }
          orderMode: { type: "OrderingMode" }
        ) {
        stixCoreRelationships(
          fromId: $fromId
          inferred: $inferred
          relationship_type: $relationship_type
          firstSeenStart: $firstSeenStart
          firstSeenStop: $firstSeenStop
          lastSeenStart: $lastSeenStart
          lastSeenStop: $lastSeenStop
          weights: $weights
          search: $search
          first: $count
          after: $cursor
          orderBy: $orderBy
          orderMode: $orderMode
        ) @connection(key: "Pagination_stixCoreRelationships") {
          edges {
            node {
              ...IndicatorEntityLine_node
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            globalCount
          }
        }
      }
    `,
  },
  {
    direction: 'forward',
    getConnectionFromProps(props) {
      return props.data && props.data.stixCoreRelationships;
    },
    getFragmentVariables(prevVars, totalCount) {
      return {
        ...prevVars,
        count: totalCount,
      };
    },
    getVariables(props, { count, cursor }, fragmentVariables) {
      return {
        fromId: fragmentVariables.fromId,
        toTypes: fragmentVariables.toTypes,
        inferred: fragmentVariables.inferred,
        relationship_type: fragmentVariables.relationship_type,
        firstSeenStart: fragmentVariables.firstSeenStart,
        firstSeenStop: fragmentVariables.firstSeenStop,
        lastSeenStart: fragmentVariables.lastSeenStart,
        lastSeenStop: fragmentVariables.lastSeenStop,
        weights: fragmentVariables.weights,
        search: fragmentVariables.search,
        count,
        cursor,
        orderBy: fragmentVariables.orderBy,
        orderMode: fragmentVariables.orderMode,
      };
    },
    query: indicatorEntitiesLinesQuery,
  },
);
