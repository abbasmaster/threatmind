import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { createFragmentContainer } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { MoreVertOutlined, ShortTextOutlined } from '@material-ui/icons';
import { compose } from 'ramda';
import Skeleton from '@material-ui/lab/Skeleton';
import inject18n from '../../../../components/i18n';
import AttributePopover from './AttributePopover';

const styles = (theme) => ({
  item: {
    paddingLeft: 10,
    height: 50,
    cursor: 'default',
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
  bodyItem: {
    height: 20,
    fontSize: 13,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  goIcon: {
    position: 'absolute',
    right: -10,
  },
  itemIconDisabled: {
    color: theme.palette.grey[700],
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
});

const AttributeLineComponent = (props) => {
  const {
    classes, node, dataColumns, paginationOptions, refetch,
  } = props;
  return (
      <ListItem classes={{ root: classes.item }} divider={true} button={true}>
        <ListItemIcon classes={{ root: classes.itemIcon }}>
          <ShortTextOutlined />
        </ListItemIcon>
        <ListItemText
          primary={
            <div>
              <div className={classes.bodyItem} style={{ width: dataColumns.value.width }}>
                {node.value}
              </div>
            </div>
          }
        />
        <ListItemSecondaryAction>
          <AttributePopover attribute={node} refetch={refetch}
                            paginationOptions={paginationOptions} />
        </ListItemSecondaryAction>
      </ListItem>
  );
};

AttributeLineComponent.propTypes = {
  dataColumns: PropTypes.object,
  node: PropTypes.object,
  paginationOptions: PropTypes.object,
  me: PropTypes.object,
  classes: PropTypes.object,
};

const AttributeLineFragment = createFragmentContainer(AttributeLineComponent, {
  node: graphql`
    fragment AttributeLine_node on Attribute {
      id
      key
      value
    }
  `,
});

export const AttributeLine = compose(
  inject18n,
  withStyles(styles),
)(AttributeLineFragment);

class AttributeLineDummyComponent extends Component {
  render() {
    const { classes, dataColumns } = this.props;
    return (
      <ListItem classes={{ root: classes.item }} divider={true}>
        <ListItemIcon classes={{ root: classes.itemIconDisabled }}>
          <Skeleton animation="wave" variant="circle" width={30} height={30} />
        </ListItemIcon>
        <ListItemText
          primary={
            <div>
              <div className={classes.bodyItem} style={{ width: dataColumns.value.width }}>
                <Skeleton
                  animation="wave"
                  variant="rect"
                  width="90%"
                  height={20}
                />
              </div>
            </div>
          }
        />
        <ListItemSecondaryAction classes={{ root: classes.itemIconDisabled }}>
          <MoreVertOutlined />
        </ListItemSecondaryAction>
      </ListItem>
    );
  }
}

AttributeLineDummyComponent.propTypes = {
  dataColumns: PropTypes.object,
  classes: PropTypes.object,
};

export const AttributeLineDummy = compose(
  inject18n,
  withStyles(styles),
)(AttributeLineDummyComponent);
