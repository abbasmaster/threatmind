import React, { useMemo, SyntheticEvent } from 'react';
import Skeleton from '@mui/material/Skeleton';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import { KeyboardArrowRightOutlined } from '@mui/icons-material';
import makeStyles from '@mui/styles/makeStyles';
import { createStyles } from '@mui/styles';
import { useNavigate } from 'react-router-dom';
import { useDataTableContext } from '../dataTableUtils';
import type { DataTableCellProps, DataTableLineProps } from '../dataTableTypes';
import { DataTableColumn, DataTableVariant } from '../dataTableTypes';
import type { Theme } from '../../Theme';
import { getMainRepresentative } from '../../../utils/defaultRepresentatives';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles<Theme, { cell?: DataTableColumn, navigable?: boolean }>((theme) => createStyles({
  cellContainer: ({ cell }) => ({
    display: 'flex',
    width: `calc(var(--col-${cell?.id}-size) * 1px)`,
    height: '50px',
    alignItems: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  cellPadding: {
    display: 'flex',
    paddingLeft: 10,
    paddingRight: 10,
    width: 'fill-available',
    alignItems: 'center',
    gap: 3,
    fontSize: '13px',
  },
  dummyContainer: {
    display: 'flex',
    gap: 8,
  },
  row: ({ navigable }) => ({
    display: 'flex',
    borderBottom: `1px solid ${theme.palette.background.accent}`,
    '&:hover': navigable ? {
      backgroundColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, .1)'
          : 'rgba(0, 0, 0, .1)',
    } : {},
  }),
}));

export const DataTableLineDummy = () => {
  const classes = useStyles({});
  const { effectiveColumns } = useDataTableContext();

  const lines = useMemo(() => (
    <>
      {effectiveColumns.map((column) => (
        <Skeleton
          key={column.id}
          variant="text"
          height={50}
          style={{ width: `calc(var(--col-${column.id}-size) * 1px)` }}
        />
      ))}
    </>
  ), [effectiveColumns]);
  return (
    <div className={classes.dummyContainer}>
      {lines}
    </div>
  );
};

export const DataTableLinesDummy = ({ number = 10 }: { number?: number }) => Array(number).fill(0).map((_, idx) => (<DataTableLineDummy key={idx} />));

const DataTableCell = ({
  cell,
  data,
}: DataTableCellProps) => {
  const classes = useStyles({ cell });
  const { useDataCellHelpers } = useDataTableContext();

  const helpers = useDataCellHelpers(cell);

  return (
    <div
      key={`${cell.id}_${data.id}`}
      className={classes.cellContainer}
    >
      <div className={classes.cellPadding}>
        {cell.render?.(data, helpers) ?? (<div>-</div>)}
      </div>
    </div>
  );
};

const DataTableLine = ({
  row,
  redirectionMode,
  storageHelpers,
  effectiveColumns,
  index,
  onToggleShiftEntity,
}: DataTableLineProps) => {
  const navigate = useNavigate();

  const {
    storageKey,
    useLineData,
    useDataTableToggle,
    useComputeLink,
    actions,
    disableNavigation,
    onLineClick,
    disableRedirectOnRowClick,
    variant,
  } = useDataTableContext();
  const data = useLineData(row);

  let link = useComputeLink(data);
  if (redirectionMode && redirectionMode !== 'overview') {
    link = `${link}/${redirectionMode}`;
  }

  const navigable = !disableNavigation && !onLineClick;
  const internalOnClick = () => {
    if (onLineClick) {
      onLineClick(data);
    } else if (navigable) {
      navigate(link);
    }
  };
  const classes = useStyles({ navigable });

  const {
    selectAll,
    deSelectedElements,
    selectedElements,
    onToggleEntity,
  } = useDataTableToggle(storageKey);

  const startsWithSelect = effectiveColumns.at(0)?.id === 'select';

  const handleSelectLine = (event: SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.shiftKey) {
      onToggleShiftEntity(index, data, event);
    } else {
      onToggleEntity(data, event);
    }
  };

  const handleRowClick = (event: SyntheticEvent) => {
    if (disableRedirectOnRowClick) {
      handleSelectLine(event);
      return undefined;
    }
    if (variant !== DataTableVariant.widget) internalOnClick();
    return undefined;
  };

  return (
    <div
      key={row.id}
      className={classes.row}
      onClick={handleRowClick}
      style={{ cursor: (navigable || Boolean(onLineClick)) ? 'pointer' : 'unset' }}
      data-testid={getMainRepresentative(data)}
    >
      {startsWithSelect && (
        <div
          key={`select_${data.id}`}
          className={classes.cellContainer}
          style={{
            width: 'calc(var(--col-select-size) * 1px)',
          }}
        >

          <Checkbox
            onClick={handleSelectLine}
            checked={
              (selectAll
                && !((data.id || 'id') in (deSelectedElements || {})))
              || (data.id || 'id') in (selectedElements || {})
            }
          />
        </div>
      )}
      {effectiveColumns.slice(startsWithSelect ? 1 : 0, actions || disableRedirectOnRowClick ? undefined : -1).map((column) => (
        <DataTableCell
          key={column.id}
          cell={column}
          data={data}
          storageHelpers={storageHelpers}
        />
      ))}

      <div
        key={`navigate_${data.id}`}
        className={classes.cellContainer}
        style={{
          width: 'calc(var(--col-navigate-size) * 1px)',
          overflow: 'initial',
        }}
        onClick={(e) => {
          if (actions && navigable) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        {actions && actions(data)}
        {effectiveColumns.at(-1)?.id === 'navigate' && (
        <IconButton onClick={() => navigate(link)}>
          <KeyboardArrowRightOutlined />
        </IconButton>
        )}
      </div>

    </div>
  );
};

export default DataTableLine;
