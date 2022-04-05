import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose, pathOr } from 'ramda';
import Skeleton from '@material-ui/lab/Skeleton';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import List from '@material-ui/core/List';
import { createFragmentContainer, QueryRenderer as QR } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import QueryRendererDarkLight from '../../../../relay/environmentDarkLight';
import inject18n from '../../../../components/i18n';
// import { QueryRenderer } from '../../../../relay/environment';
import RiskObservationLine, { riskObservationLineQuery } from './RiskObservationLine';

const styles = (theme) => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '19px 0',
    overflowY: 'scroll',
  },
  avatar: {
    width: 24,
    height: 24,
    backgroundColor: theme.palette.primary.main,
  },
  avatarDisabled: {
    width: 24,
    height: 24,
  },
  placeholder: {
    display: 'inline-block',
    height: '1em',
    backgroundColor: theme.palette.grey[700],
  },
  buttonExpand: {
    position: 'absolute',
    bottom: 2,
    width: '100%',
    height: 25,
    backgroundColor: 'rgba(255, 255, 255, .2)',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, .5)',
    },
  },
  bodyItem: {
    height: 55,
    fontSize: 13,
    paddingLeft: 24,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'flex',
    justifyContent: 'left',
    alignItems: 'center',
  },
  ListItem: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
  },
});

class RiskObservation extends Component {
  render() {
    const {
      t,
      risk,
      classes,
      cyioCoreObjectId,
    } = this.props;
    const RiskObservationEdges = pathOr([], ['related_observations', 'edges'], risk);
    return (
      <div style={{ marginTop: '50px', height: '500px' }}>
        <Typography variant="h4" gutterBottom={true}>
          {t('Observations')}
        </Typography>
        <div className="clearfix" />
        <Paper className={classes.paper} elevation={2}>
          <QR
            environment={QueryRendererDarkLight}
            query={riskObservationLineQuery}
            variables={{ id: risk.id, first: 10, offset: 0 }}
            render={({ error, props }) => {
              if (props) {
                return (
                  <RiskObservationLine
                    risk={props.risk}
                  />
                );
              }
              return (
                <div style={{ height: '100%' }}>
                  <List>
                    {Array.from(Array(6), (e, i) => (
                      <ListItem
                        key={i}
                        dense={true}
                        divider={true}
                        button={false}
                      >
                        <ListItemText
                          primary={
                            <div className={classes.ListItem}>
                              <div
                                className={classes.bodyItem}
                              >
                                <Skeleton
                                  animation="wave"
                                  variant="rect"
                                  width={800}
                                  height="100%"
                                />
                              </div>
                              <div
                                className={classes.bodyItem}
                              >
                                <Skeleton
                                  animation="wave"
                                  variant="circle"
                                  width={30}
                                  height={30}
                                />
                              </div>
                            </div>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </div>
              );
            }
            }
          />
        </Paper>
      </div>
    );
  }
}

RiskObservation.propTypes = {
  risk: PropTypes.object,
  cyioCoreObjectId: PropTypes.string,
  limit: PropTypes.number,
  classes: PropTypes.object,
  t: PropTypes.func,
  fld: PropTypes.func,
};

// const RiskObservationComponent = createFragmentContainer(
//   RiskObservation,
//   {
//     risk: graphql`
//       fragment RiskObservation_risk on Risk {
//         related_observations {
//           edges {
//             node {
//               id
//               ...RiskObservationLine_risk
//             }
//           }
//         }
//       }
//     `,
//   },
// );

export default compose(
  inject18n,
  withStyles(styles),
)(RiskObservation);
