import React from 'react';
import * as R from 'ramda';
import * as PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import makeStyles from '@mui/styles/makeStyles';
import EnrichedTooltip from './EnrichedTooltip';
import { useFormatter } from './i18n';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  chip: {
    fontSize: 12,
    lineHeight: '12px',
    height: 25,
    margin: '0 7px 7px 0',
    borderRadius: 4,
    width: 120,
  },
  chipInList: {
    fontSize: 12,
    lineHeight: '12px',
    height: 20,
    float: 'left',
    marginRight: 7,
    borderRadius: 4,
    width: 90,
  },
  chipInToolTip: {
    fontSize: 12,
    lineHeight: '12px',
    height: 25,
    margin: '0 7px 7px 0',
    borderRadius: 4,
    width: '100%',
  },
}));

const inlineStylesDark = {
  white: {
    backgroundColor: '#ffffff',
    color: '#2b2b2b',
  },
  green: {
    backgroundColor: '#2e7d32',
  },
  blue: {
    backgroundColor: '#283593',
  },
  red: {
    backgroundColor: '#c62828',
  },
  orange: {
    backgroundColor: '#d84315',
  },
  transparent: {
    color: '#ffffff',
    border: '2px solid #ffffff',
  },
};

const inlineStylesLight = {
  white: {
    backgroundColor: '#ffffff',
    color: '#2b2b2b',
    border: '1px solid #2b2b2b',
  },
  green: {
    backgroundColor: '#2e7d32',
    color: '#ffffff',
  },
  blue: {
    backgroundColor: '#283593',
    color: '#ffffff',
  },
  red: {
    backgroundColor: '#c62828',
    color: '#ffffff',
  },
  orange: {
    backgroundColor: '#d84315',
    color: '#ffffff',
  },
  transparent: {
    color: '#2b2b2b',
    border: '2px solid #2b2b2b',
  },
};

const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    right: 9,
    top: 4,
  },
}));

const ItemMarkings = ({ variant, markingDefinitions, limit }) => {
  const markings = markingDefinitions ?? [];
  const classes = useStyles();
  const theme = useTheme();
  const { t_i18n } = useFormatter();

  const monochromeStyle = (color, isTooltip = false) => ({
    backgroundColor: isTooltip
      ? `${color}`
      : `${color}33`, // 20% opacity
    color: theme.palette.text.primary,
    border: `2px solid ${color}`,
  });

  const renderChip = (markingDefinition, isTooltip = false) => {
    let className = classes.chip;
    if (isTooltip) {
      className = classes.chipInToolTip;
    } else if (variant === 'inList') {
      className = classes.chipInList;
    }
    if (markingDefinition.x_opencti_color) {
      const monochromeStyles = monochromeStyle(markingDefinition.x_opencti_color, isTooltip);
      let { backgroundColor } = monochromeStyles;
      let textColor = monochromeStyles.color;
      let { border } = monochromeStyles;
      if (theme.palette.mode === 'light') {
        if (backgroundColor.startsWith('#ffffff')) {
          backgroundColor = '#ffffff';
          textColor = '#2b2b2b';
          border = '2px solid #2b2b2b';
        }
      } else if (backgroundColor.startsWith('#ffffff')) {
        textColor = '#2b2b2b';
      }
      return (
        <Chip
          key={markingDefinition.definition}
          className={className}
          style={{
            backgroundColor,
            color: textColor,
            border,
          }}
          label={markingDefinition.definition}
        />
      );
    }
    let inlineStyles = inlineStylesDark;
    if (theme.palette.mode === 'light') {
      inlineStyles = inlineStylesLight;
    }
    switch (markingDefinition.definition) {
      case 'CD':
      case 'CD-SF':
      case 'DR':
      case 'DR-SF':
      case 'TLP:RED':
        return (
          <Chip
            key={markingDefinition.definition}
            className={className}
            style={monochromeStyle(inlineStyles.red.backgroundColor)}
            label={markingDefinition.definition}
          />
        );
      case 'TLP:AMBER':
        return (
          <Chip
            key={markingDefinition.definition}
            className={className}
            style={monochromeStyle(inlineStyles.orange.backgroundColor)}
            label={markingDefinition.definition}
          />
        );
      case 'NP':
      case 'TLP:GREEN':
        return (
          <Chip
            key={markingDefinition.definition}
            className={className}
            style={monochromeStyle(inlineStyles.green.backgroundColor)}
            label={markingDefinition.definition}
          />
        );
      case 'SF':
        return (
          <Chip
            key={markingDefinition.definition}
            className={className}
            style={monochromeStyle(inlineStyles.blue.backgroundColor)}
            label={markingDefinition.definition}
          />
        );
      case 'NONE':
        return (
          <Chip
            key={markingDefinition.definition}
            className={className}
            style={inlineStyles.transparent}
            label={t_i18n(markingDefinition.definition)}
            variant="outlined"
          />
        );
      default:
        return (
          <Chip
            key={markingDefinition.definition}
            className={className}
            style={inlineStyles.white}
            label={markingDefinition.definition}
          />
        );
    }
  };
  if (!limit || markings.length <= 1) {
    return (
      <span>
        {markings.length === 0
          ? renderChip({ definition: 'NONE' }, false)
          : markings.map((markingDefinition) => renderChip(markingDefinition, false))}
      </span>
    );
  }
  return (
    <EnrichedTooltip
      title={
        <Grid container={true} spacing={3}>
          {markings.map((markingDefinition) => (
            <Grid key={markingDefinition.id} item={true} xs={6}>
              {renderChip(markingDefinition, true)}
            </Grid>
          ))}
        </Grid>
      }
      placement="bottom"
    >
      <span>
        <StyledBadge variant="dot" color="primary">
          {R.take(limit, markings).map((markingDefinition) => renderChip(markingDefinition, false))}
        </StyledBadge>
      </span>
    </EnrichedTooltip>
  );
};

ItemMarkings.propTypes = {
  variant: PropTypes.string,
  limit: PropTypes.number,
};

export default ItemMarkings;
