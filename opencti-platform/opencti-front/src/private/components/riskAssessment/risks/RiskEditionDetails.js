import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import graphql from 'babel-plugin-relay/macro';
import { createFragmentContainer } from 'react-relay';
import * as R from 'ramda';
import { Field } from 'formik';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { Information } from 'mdi-material-ui';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import inject18n from '../../../../components/i18n';
import TextField from '../../../../components/TextField';
import SelectField from '../../../../components/SelectField';
import { commitMutation } from '../../../../relay/environment';
import DatePickerField from '../../../../components/DatePickerField';
import MarkDownField from '../../../../components/MarkDownField';

const styles = () => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '24px 24px 32px 24px',
    borderRadius: 6,
  },
});

const riskEditionDetailsFocus = graphql`
  mutation RiskEditionDetailsFocusMutation(
    $id: ID!
    $input: [EditInput]!
  ) {
    editRisk(id: $id, input: $input) {
      id
    }
  }
`;

class RiskEditionDetailsComponent extends Component {
  handleChangeFocus(name) {
    commitMutation({
      mutation: riskEditionDetailsFocus,
      variables: {
        id: this.props.risk?.id,
        input: {
          focusOn: name,
        },
      },
    });
  }

  render() {
    const {
      t, classes,
    } = this.props;
    return (
      <div>
        <div style={{ height: '100%' }}>
          <Typography variant="h4" gutterBottom={true}>
            {t('Details')}
          </Typography>
          <Paper classes={{ root: classes.paper }} elevation={2}>
            <Grid item={true} xs={12} style={{ marginBottom: '21px' }}>
              <Grid item={true}>
                <Typography
                  variant="h3"
                  color="textSecondary"
                  gutterBottom={true}
                  style={{ float: 'left' }}
                >
                  {t('Name')}
                </Typography>
                <div style={{ float: 'left', margin: '0 0 0 4px' }}>
                  <Tooltip
                    title={t(
                      'Identifies the name for the risk.',
                    )}
                  >
                    <Information fontSize="inherit" color="disabled" />
                  </Tooltip>
                </div>
                <div className="clearfix" />
                <Field
                  component={TextField}
                  variant='outlined'
                  size='small'
                  name="name"
                  fullWidth={true}
                  containerstyle={{ width: '100%' }}
                />
              </Grid>
            </Grid>
            <Grid container={true} spacing={3} style={{ marginBottom: '9px' }}>
              <Grid item={true} xs={6}>
                <Grid item={true}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Created')}
                  </Typography>
                  <div style={{ float: 'left', margin: '-1px 0 0 4px' }}>
                    <Tooltip
                      title={t(
                        'Indicates the date and time at which the object was originally created.',
                      )}
                    >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <Field
                    component={DatePickerField}
                    variant='outlined'
                    size='small'
                    name="riskDetailsCreated"
                    fullWidth={true}
                    invalidDateMessage={t(
                      'The value must be a date (YYYY-MM-DD)',
                    )}
                    containerstyle={{ width: '100%' }}
                  />
                </Grid>
              </Grid>
              <Grid item={true} xs={6}>
                <Grid item={true}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Last Modified')}
                  </Typography>
                  <div style={{ float: 'left', margin: '-1px 0 0 4px' }}>
                    <Tooltip
                      title={t(
                        'Indicates the date and time that this particular version of the object was last modified.',
                      )}
                    >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <Field
                    component={DatePickerField}
                    variant='outlined'
                    size='small'
                    name="riskDetailsModified"
                    fullWidth={true}
                    invalidDateMessage={t(
                      'The value must be a date (YYYY-MM-DD)',
                    )}
                    containerstyle={{ width: '100%' }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid container={true} spacing={3}>
              <Grid xs={12} item={true}>
                <Grid style={{ marginBottom: '15px' }} item={true}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Description')}
                  </Typography>
                  <div style={{ float: 'left', margin: '0 0 0 4px' }}>
                    <Tooltip
                      title={t(
                        'Identifies a human-readable summary of the identified risk, to include a statement of how the risk impacts the system.',
                      )}
                    >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <Field
                    component={MarkDownField}
                    name="riskDetailsDescription"
                    fullWidth={true}
                    multiline={true}
                    rows="3"
                    variant='outlined'
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid container={true} spacing={3}>
              <Grid xs={12} item={true}>
                <Grid style={{ marginBottom: '15px' }} item={true}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Statement')}
                  </Typography>
                  <div style={{ float: 'left', margin: '0 0 0 4px' }}>
                    <Tooltip
                      title={t(
                        'Identifies a summary of impact for how the risk affects the system.',
                      )}
                    >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <Field
                    component={TextField}
                    name="statement"
                    fullWidth={true}
                    multiline={true}
                    rows="3"
                    variant='outlined'
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid container={true} spacing={3}>
              <Grid xs={6} item={true}>
                <Grid style={{ marginBottom: '15px' }} item={true}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Risk Status')}
                  </Typography>
                  <div style={{ float: 'left', margin: '0 0 0 4px' }}>
                    <Tooltip
                      title={t(
                        'Identifies the status of the associated risk.',
                      )}
                    >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <AddIcon fontSize="small" style={{ margin: '-3px 0 0 0' }} />
                  <div className="clearfix" />
                  <Field
                    component={SelectField}
                    variant='outlined'
                    name="risk_status"
                    size='small'
                    fullWidth={true}
                    style={{ height: '38.09px' }}
                    containerstyle={{ width: '100%', padding: '0 0 1px 0' }}
                  />
                </Grid>
                <Grid style={{ marginBottom: '15px' }} item={true}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Detection Source')}
                  </Typography>
                  <div style={{ float: 'left', margin: '0 0 0 4px' }}>
                    <Tooltip
                      title={t(
                        'Identifies one or more sources of the finding, such as a tool, interviewed person, or activity.',
                      )}
                    >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <Field
                    component={TextField}
                    variant='outlined'
                    size='small'
                    name="detection_source"
                    fullWidth={true}
                    containerstyle={{ width: '100%' }}
                  />
                </Grid>
                <Grid style={{ marginBottom: '15px' }} item={true}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('False-Positive')}
                  </Typography>
                  <div style={{ float: 'left', margin: '0 0 0 4px' }}>
                    <Tooltip
                      title={t(
                        'Identifies that the risk has been confirmed to be a false positive.',
                      )}
                    >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <Field
                    component={SelectField}
                    variant='outlined'
                    name="false_positive"
                    size='small'
                    fullWidth={true}
                    style={{ height: '38.09px' }}
                    containerstyle={{ width: '100%', padding: '0 0 1px 0' }}
                  />
                </Grid>
                <Grid style={{ marginBottom: '15px' }} item={true}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Risk Adjusted')}
                  </Typography>
                  <div style={{ float: 'left', margin: '0 0 0 4px' }}>
                    <Tooltip
                      title={t(
                        'Identifies that mitigating factors were identified or implemented, reducing the likelihood or impact of the risk.',
                      )}
                    >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <Field
                    component={SelectField}
                    variant='outlined'
                    name="risk_adjusted"
                    size='small'
                    fullWidth={true}
                    style={{ height: '38.09px' }}
                    containerstyle={{ width: '100%', padding: '0 0 1px 0' }}
                  />
                </Grid>
              </Grid>
              <Grid item={true} xs={6}>
                <Grid style={{ marginBottom: '20px' }} item={true}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Deadline')}
                  </Typography>
                  <div style={{ float: 'left', margin: '0 0 0 4px' }}>
                    <Tooltip
                      title={t(
                        'Identifies the date/time by which the risk must be resolved.',
                      )}
                    >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <Field
                    component={DatePickerField}
                    variant='outlined'
                    size='small'
                    name="deadline"
                    fullWidth={true}
                    invalidDateMessage={t(
                      'The value must be a date (YYYY-MM-DD)',
                    )}
                    style={{ height: '38.09px' }}
                    containerstyle={{ width: '100%' }}
                  />
                </Grid>
                <Grid style={{ marginBottom: '15px' }} item={true}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Impacted Control')}
                  </Typography>
                  <div style={{ float: 'left', margin: '0 0 0 4px' }}>
                    <Tooltip
                      title={t(
                        'Identifies a control impacted by this risk.',
                      )}
                    >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <Field
                    component={TextField}
                    variant='outlined'
                    size='small'
                    name="impacted_control"
                    fullWidth={true}
                    containerstyle={{ width: '100%' }}
                  />
                </Grid>
                <Grid style={{ marginBottom: '15px' }} item={true}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Operationally Required')}
                  </Typography>
                  <div style={{ float: 'left', margin: '0 0 0 4px' }}>
                    <Tooltip
                      title={t(
                        'Operationally Required',
                      )}
                    >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <Field
                    component={SelectField}
                    variant='outlined'
                    name="operationally_required"
                    size='small'
                    fullWidth={true}
                    style={{ height: '38.09px' }}
                    containerstyle={{ width: '100%', padding: '0 0 1px 0' }}
                  />
                </Grid>
                <Grid style={{ marginBottom: '15px' }} item={true}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Vendor Dependency')}
                  </Typography>
                  <div style={{ float: 'left', margin: '0 0 0 4px' }}>
                    <Tooltip
                      title={t(
                        'Identifies that a vendor resolution is pending, but not yet available.',
                      )}
                    >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <Field
                    component={SelectField}
                    variant='outlined'
                    name="vendor_dependency"
                    size='small'
                    fullWidth={true}
                    style={{ height: '38.09px' }}
                    containerstyle={{ width: '100%', padding: '0 0 1px 0' }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </div>
      </div>
    );
  }
}

RiskEditionDetailsComponent.propTypes = {
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  risk: PropTypes.object,
  enableReferences: PropTypes.bool,
  context: PropTypes.array,
  handleClose: PropTypes.func,
};

// const RiskEditionDetails = createFragmentContainer(
//   RiskEditionDetailsComponent,
//   {
//     risk: graphql`
//       fragment RiskEditionDetails_risk on ThreatActor {
//         id
//         first_seen
//         last_seen
//         sophistication
//         resource_level
//         primary_motivation
//         secondary_motivations
//         personal_motivations
//         goals
//       }
//     `,
//   },
// );

const RiskEditionDetails = createFragmentContainer(
  RiskEditionDetailsComponent,
  {
    risk: graphql`
      fragment RiskEditionDetails_risk on POAMItem {
        id
        created
        modified
        poam_id     # Item ID
        name        # Weakness
        description
        labels {
          id
          name
          color
          description
        }
        origins {
          id
          origin_actors {       # only use if UI support Detection Source
            actor_type
            actor_ref {
              ... on AssessmentPlatform {
                id
                name
              }
              ... on Component {
                id
                component_type
                name
              }
              ... on OscalParty {
                id
                party_type
                name
              }
            }
          }
        }
        links {
          id
          created
          modified
          external_id     # external id
          source_name     # Title
          description     # description
          url             # URL
          media_type      # Media Type
        }
        remarks {
          id
          abstract
          content
          authors
        }
        related_risks {
          edges {
            node{
              id
              created
              modified
              name
              description
              statement
              risk_status       # Risk Status
              deadline
              priority
              impacted_control_id
              accepted
              false_positive    # False-Positive
              risk_adjusted     # Operational Required
              vendor_dependency # Vendor Dependency
              characterizations {
                origins {
                  id
                  origin_actors {
                    actor_type
                    actor_ref {
                      ... on AssessmentPlatform {
                        id
                        name
                      }
                      ... on Component {
                        id
                        component_type
                        name          # Detection Source
                      }
                      ... on OscalParty {
                        id
                        party_type
                        name            # Detection Source
                      }
                    }
                  }
                }
                facets {
                  id
                  source_system
                  facet_name
                  facet_value
                  risk_state
                  entity_type
                }
              }
              remediations {
                response_type
                lifecycle
              }
            }
          }
        }
      }
    `,
  },
);

export default R.compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(RiskEditionDetails);
