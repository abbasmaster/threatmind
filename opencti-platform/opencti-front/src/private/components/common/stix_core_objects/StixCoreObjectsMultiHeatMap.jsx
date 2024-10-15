import React from 'react';
import { graphql } from 'react-relay';
import { QueryRenderer } from '../../../../relay/environment';
import { useFormatter } from '../../../../components/i18n';
import { monthsAgo, now } from '../../../../utils/Time';
import { removeEntityTypeAllFromFilterGroup } from '../../../../utils/filters/filtersUtils';
import WidgetNoData from '../../../../components/dashboard/WidgetNoData';
import WidgetContainer from '../../../../components/dashboard/WidgetContainer';
import WidgetMultiHeatMap from '../../../../components/dashboard/WidgetMultiHeatMap';
import Loader, { LoaderVariant } from '../../../../components/Loader';

const stixCoreObjectsMultiHeatMapTimeSeriesQuery = graphql`
  query StixCoreObjectsMultiHeatMapTimeSeriesQuery(
    $startDate: DateTime!
    $endDate: DateTime!
    $interval: String!
    $timeSeriesParameters: [StixCoreObjectsTimeSeriesParameters]
  ) {
    stixCoreObjectsMultiTimeSeries(
      startDate: $startDate
      endDate: $endDate
      interval: $interval
      timeSeriesParameters: $timeSeriesParameters
    ) {
      data {
        date
        value
      }
    }
  }
`;

const StixCoreObjectsMultiHeatMap = ({
  variant,
  height,
  startDate,
  endDate,
  dataSelection,
  parameters = {},
  withExportPopover = false,
  isReadOnly = false,
}) => {
  const { t_i18n } = useFormatter();
  const renderContent = () => {
    const timeSeriesParameters = dataSelection.map((selection) => {
      return {
        field:
          selection.date_attribute && selection.date_attribute.length > 0
            ? selection.date_attribute
            : 'created_at',
        types: ['Stix-Core-Object'],
        filters: removeEntityTypeAllFromFilterGroup(selection.filters),
      };
    });
    return (
      <QueryRenderer
        query={stixCoreObjectsMultiHeatMapTimeSeriesQuery}
        variables={{
          startDate: startDate ?? monthsAgo(12),
          endDate: endDate ?? now(),
          interval: parameters.interval ?? 'day',
          timeSeriesParameters,
        }}
        render={({ props }) => {
          if (props && props.stixCoreObjectsMultiTimeSeries) {
            const chartData = dataSelection
              .map((selection, i) => ({
                name: selection.label || t_i18n('Number of entities'),
                data: props.stixCoreObjectsMultiTimeSeries[i].data.map(
                  (entry) => ({
                    x: new Date(entry.date),
                    y: entry.value,
                  }),
                ),
              }))
              .sort((a, b) => b.name.localeCompare(a.name));
            const allValues = props.stixCoreObjectsMultiTimeSeries
              .map((n) => n.data.map((o) => o.value))
              .flat();
            const maxValue = Math.max(...allValues);
            const minValue = Math.min(...allValues);

            return (
              <WidgetMultiHeatMap
                data={chartData}
                minValue={minValue}
                maxValue={maxValue}
                isStacked={parameters.stacked}
                withExport={withExportPopover}
                readonly={isReadOnly}
              />
            );
          }
          if (props) {
            return <WidgetNoData />;
          }
          return <Loader variant={LoaderVariant.inElement} />;
        }}
      />
    );
  };
  return (
    <WidgetContainer
      height={height}
      title={parameters.title ?? t_i18n('Entities history')}
      variant={variant}
    >
      {renderContent()}
    </WidgetContainer>
  );
};

export default StixCoreObjectsMultiHeatMap;
