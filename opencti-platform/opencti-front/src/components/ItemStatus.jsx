import React from 'react';
import * as PropTypes from 'prop-types';
import withStyles from '@mui/styles/withStyles';
import Chip from '@mui/material/Chip';
import { compose } from 'ramda';
import { useTheme } from '@mui/material';
import inject18n from './i18n';
import { hexToRGB } from '../utils/Colors';
import useAuth from '../utils/hooks/useAuth';

const styles = () => ({
  chip: {
    fontSize: 12,
    lineHeight: '12px',
    height: 25,
    marginRight: 7,
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 100,
  },
  chipInList: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 80,
  },
  chipInline: {
    fontSize: 12,
    lineHeight: '10px',
    height: 20,
    float: 'left',
    textTransform: 'uppercase',
    borderRadius: 4,
  },
});

const ItemStatus = (props) => {
  const { me: { monochrome_labels } } = useAuth();
  const theme = useTheme();
  const { classes, t, status, variant, disabled, onClick } = props;
  let style = classes.chip;
  if (variant === 'inList') {
    style = classes.chipInList;
  } else if (variant === 'inLine') {
    style = classes.chipInline;
  }
  if (status && status.template) {
    return (
      <Chip
        classes={{ root: style }}
        variant="outlined"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick?.('workflow_id', status.id ?? null, 'eq');
        }}
        label={status.template.name}
        style={{
          color: theme.palette.chip.main,
          borderColor: monochrome_labels ? theme.palette.background.accent : status.template.color,
          backgroundColor: monochrome_labels ? theme.palette.background.accent : hexToRGB(status.template.color),
          cursor: onClick ? 'pointer' : 'default',
        }}
      />
    );
  }
  return (
    <Chip
      classes={{ root: style }}
      variant="outlined"
      label={disabled ? t('Disabled') : t('Unknown')}
    />
  );
};

ItemStatus.propTypes = {
  classes: PropTypes.object.isRequired,
  onClick: PropTypes.func,
  status: PropTypes.object,
  variant: PropTypes.string,
  t: PropTypes.func,
  disabled: PropTypes.bool,
};

export default compose(inject18n, withStyles(styles))(ItemStatus);
