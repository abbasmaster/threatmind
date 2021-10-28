import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { compose } from 'ramda';
import { createFragmentContainer } from 'react-relay';
import Markdown from 'react-markdown';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import { StarBorderOutlined, Router } from '@material-ui/icons';
import Skeleton from '@material-ui/lab/Skeleton';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import inject18n from '../../../../components/i18n';
import StixCoreObjectLabels from '../../common/stix_core_objects/StixCoreObjectLabels';
import {
  addBookmark,
  deleteBookMark,
} from '../../common/stix_domain_objects/StixDomainObjectBookmark';

const styles = (theme) => ({
  card: {
    width: '100%',
    height: '319px',
    borderRadius: 9,
  },
  cardDummy: {
    width: '100%',
    height: '319px',
    color: theme.palette.grey[700],
    borderRadius: 9,
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
  },
  avatarDisabled: {
    backgroundColor: theme.palette.grey[600],
  },
  icon: {
    margin: '10px 20px 0 0',
    fontSize: 40,
    color: '#242d30',
  },
  area: {
    width: '100%',
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '13px',
  },
  body: {
    marginBottom: '13px',
  },
  content: {
    width: '100%',
    padding: '24px',
  },
  description: {
    height: 170,
    overflow: 'hidden',
  },
  objectLabel: {
    height: 45,
    paddingTop: 7,
  },
  contentDummy: {
    width: '100%',
    height: 120,
    overflow: 'hidden',
    marginTop: 15,
  },
  placeholderHeader: {
    display: 'inline-block',
    height: '.8em',
    backgroundColor: theme.palette.grey[700],
  },
  placeholderHeaderDark: {
    display: 'inline-block',
    height: '.8em',
    backgroundColor: theme.palette.grey[800],
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
});

class NetworkCardComponent extends Component {
  render() {
    const {
      t,
      fsd,
      classes,
      node,
      selectAll,
      onToggleEntity,
      bookmarksIds,
      onLabelClick,
      selectedElements,
    } = this.props;
    const objectLabel = { edges: { node: { id: 1, value: 'labels', color: 'red' } } };
    return (
      <Card classes={{ root: classes.card }} raised={true} elevation={3}>
        <CardActionArea
          classes={{ root: classes.area }}
          component={Link}
          to={`/dashboard/assets/network/${node.id}`}
        >
          {/* <CardHeader
            classes={{ root: classes.header }}
            avatar={
              <Avatar className={classes.avatar}>{node.name.charAt(0)}</Avatar>
            }
            title={node.name}
            subheader={`${t('Updated the')} ${fsd(node.modified)}`}
            action={
              <IconButton
                size="small"
                onClick={
                  bookmarksIds.includes(node.id)
                    ? deleteBookMark.bind(this, node.id, 'Network')
                    : addBookmark.bind(this, node.id, 'Network')
                }
                color={bookmarksIds.includes(node.id) ? 'secondary' : 'primary'}
                style={{ marginTop: 10 }}
              >
                <StarBorderOutlined />
              </IconButton>
            }
          /> */}
          <CardContent className={classes.content}>
            {/* <div className={classes.description}>
              <Markdown
                remarkPlugins={[remarkGfm, remarkParse]}
                parserOptions={{ commonmark: true }}
                disallowedTypes={['link', 'linkReference']}
                unwrapDisallowed={true}
              >
                {node.description}
              </Markdown>
            </div>
            <div className={classes.objectLabel}>
              <StixCoreObjectLabels
                labels={node.objectLabel}
                onClick={onLabelClick.bind(this)}
              />
            </div> */}
            <Grid item={true} className={classes.header}>
              <div>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  gutterBottom={true}
                >
                  {t('Type')}
                </Typography>
                <Router size='large' />
              </div>
              <div style={{ marginRight: 'auto', marginLeft: '12px' }}>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  gutterBottom={true}
                >
                    {t('Network Name')}
                </Typography>
                <Typography>
                    {/* {t('KK-HWELL-011')} */}
                    {t(node.network_name)}
                </Typography>
              </div>
              <div>
                <Checkbox
                  color='primary'
                  disableRipple={true}
                  onClick={onToggleEntity.bind(this, node)}
                  checked={selectAll || node.id in (selectedElements || {})}
                />
              </div>
            </Grid>
            <Grid xs={12} container={true} >
              <Grid item={true} xs={6} className={classes.body}>
                <Typography
                 variant="h3"
                 color="textSecondary"
                 gutterBottom ={true}>
                  {t('Asset ID')}
                </Typography>
                <Typography>
                  {/* {t('KK-HWELL-011')} */}
                  {t(node.asset_id)}
                </Typography>
                <div className="clearfix" />
                <Typography
                 variant="h3"
                 color="textSecondary"
                 style={{ marginTop: '13px' }}
                 gutterBottom={true}
                >
                  {t('Network ID')}
                </Typography>
                <Typography>
                  {/* {t('Lorem Ipsum')} */}
                  {t(node.network_id)}
                </Typography>
              </Grid>
              <Grid xs={6} item={true} className={classes.body}>
                <Typography
                 variant="h3"
                 color="textSecondary"
                 gutterBottom ={true}>
                  {t('IP Address')}
                </Typography>
                <Typography>
                    {t('00:50:56:A3:59:4D')}
                </Typography>
                <div className="clearfix" />
                <Typography
                 variant="h3"
                 color="textSecondary"
                 style={{ marginTop: '13px' }}
                 gutterBottom={true}
                >
                  {t('Network Range')}
                </Typography>
                <Typography>
                    {t('Lorem Ipsum')}
                    {/* {t(node.network_id)} */}
                </Typography>
              </Grid>
            </Grid>
            <div className={classes.objectLabel}>
              <Typography
               variant="h3"
               color="textSecondary"
               gutterBottom ={true}>
                {t('Label')}
              </Typography>
              <StixCoreObjectLabels
                labels={objectLabel}
                onClick={onLabelClick.bind(this)}
              />
            </div>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }
}

NetworkCardComponent.propTypes = {
  node: PropTypes.object,
  bookmarksIds: PropTypes.array,
  classes: PropTypes.object,
  t: PropTypes.func,
  fsd: PropTypes.func,
  onLabelClick: PropTypes.func,
};

// const NetworkCardFragment = createFragmentContainer(
//   NetworkCardComponent,
//   {
//     node: graphql`
//       fragment NetworkCard_node on IntrusionSet {
//         id
//         name
//         description
//         created
//         modified
//         objectMarking {
//           edges {
//             node {
//               id
//               definition
//             }
//           }
//         }
//         objectLabel {
//           edges {
//             node {
//               id
//               value
//               color
//             }
//           }
//         }
//       }
//     `,
//   },
// );

const NetworkCardFragment = createFragmentContainer(
  NetworkCardComponent,
  {
    node: graphql`
      fragment NetworkCard_node on NetworkAsset {
        id
        network_name
        asset_type
        asset_id
        network_id
        labels
      }
    `,
  },
);

export const NetworkCard = compose(
  inject18n,
  withStyles(styles),
)(NetworkCardFragment);

class NetworkCardDummyComponent extends Component {
  render() {
    const { classes } = this.props;
    return (
      <Card classes={{ root: classes.cardDummy }} raised={true} elevation={3}>
        <CardActionArea classes={{ root: classes.area }}>
          <CardHeader
            classes={{ root: classes.header }}
            avatar={
              <Skeleton
                animation="wave"
                variant="circle"
                width={30}
                height={30}
              />
            }
            title={
              <Skeleton
                animation="wave"
                variant="rect"
                width="90%"
                style={{ marginBottom: 10 }}
              />
            }
            titleTypographyProps={{ color: 'inherit' }}
            subheader={
              <Skeleton
                animation="wave"
                variant="rect"
                width="90%"
                style={{ marginBottom: 10 }}
              />
            }
            action={
              <Skeleton
                animation="wave"
                variant="circle"
                width={30}
                height={30}
              />
            }
          />
          <CardContent classes={{ root: classes.contentDummy }}>
            <Skeleton
              animation="wave"
              variant="rect"
              width="90%"
              style={{ marginBottom: 10 }}
            />
            <Skeleton
              animation="wave"
              variant="rect"
              width="95%"
              style={{ marginBottom: 10 }}
            />
            <Skeleton
              animation="wave"
              variant="rect"
              width="90%"
              style={{ marginBottom: 10 }}
            />
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }
}

NetworkCardDummyComponent.propTypes = {
  classes: PropTypes.object,
};

export const NetworkCardDummy = compose(
  inject18n,
  withStyles(styles),
)(NetworkCardDummyComponent);
