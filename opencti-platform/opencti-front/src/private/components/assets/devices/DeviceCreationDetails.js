/* eslint-disable */
/* refactor */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import graphql from 'babel-plugin-relay/macro';
import { createFragmentContainer } from 'react-relay';
import * as Yup from 'yup';
import * as R from 'ramda';
import { Formik, Form, Field } from 'formik';
import { withStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { Information } from 'mdi-material-ui';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import inject18n from '../../../../components/i18n';
import TextField from '../../../../components/TextField';
import SelectField from '../../../../components/SelectField';
import { SubscriptionFocus } from '../../../../components/Subscription';
import { commitMutation } from '../../../../relay/environment';
import OpenVocabField from '../../common/form/OpenVocabField';
import { dateFormat, parse } from '../../../../utils/Time';
import DatePickerField from '../../../../components/DatePickerField';
import CommitMessage from '../../common/form/CommitMessage';
import { adaptFieldValue } from '../../../../utils/String';
import ItemIcon from '../../../../components/ItemIcon';
import InstalledAsset from '../../common/form/InstalledAsset';
import Protocols from '../../common/form/Protocols';

const styles = (theme) => ({
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    overflow: 'hidden',
    backgroundColor: theme.palette.navAlt.background,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: '30px 30px 30px 30px',
  },
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '24px 24px 32px 24px',
    borderRadius: 6,
  },
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  importButton: {
    position: 'absolute',
    top: 30,
    right: 30,
  },
});

const deviceMutationFieldPatch = graphql`
  mutation DeviceCreationDetailsFieldPatchMutation(
    $id: ID!
    $input: [EditInput]!
    $commitMessage: String
  ) {
    threatActorEdit(id: $id) {
      fieldPatch(input: $input, commitMessage: $commitMessage) {
        ...DeviceCreationDetails_device
        # ...Device_device
      }
    }
  }
`;

const deviceCreationDetailsFocus = graphql`
  mutation DeviceCreationDetailsFocusMutation(
    $id: ID!
    $input: EditContext!
  ) {
    threatActorEdit(id: $id) {
      contextPatch(input: $input) {
        id
      }
    }
  }
`;

class DeviceCreationDetailsComponent extends Component {
  handleChangeFocus(name) {
    commitMutation({
      mutation: deviceCreationDetailsFocus,
      variables: {
        id: this.props.device.id,
        input: {
          focusOn: name,
        },
      },
    });
  }

  render() {
    const {
      t,
      classes,
      device,
      context,
      enableReferences,
      onSubmit,
      setFieldValue,
    } = this.props;
    return (
      <div style={{ height: '100%' }}>
        <Typography variant="h4" gutterBottom={true}>
          {t('Details')}
        </Typography>
        <Paper classes={{ root: classes.paper }} elevation={2}>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={6}>
                <div style={{ marginBottom: '119px' }}>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Installed Operating System')}
                  </Typography>
                  <div style={{ float: 'left', margin: '-5px 0 0 5px' }}>
                    <Tooltip title={t('Installed Operating System')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                    <AddIcon fontSize="small" color="disabled" />
                  </div>
                  <Field
                    component={SelectField}
                    variant='outlined'
                    size='small'
                    name='installed_operating_system'
                    style={{ height: '38.09px' }}
                    fullWidth={true}
                    containerstyle={{ width: '100%' }}
                  >
                    <MenuItem key="microsoft" value="microsoft">
                      <ItemIcon variant='inline' type='microsoft' />&nbsp;{t('Windows')}
                    </MenuItem>
                    <MenuItem key="appliance" value="appliance">
                      <ItemIcon variant='inline' type='apple' />&nbsp;{t('Apple')}
                    </MenuItem>
                    <MenuItem key="linux" value="linux">
                      <ItemIcon variant='inline' type='linux' />&nbsp;{t('Linux')}
                    </MenuItem>
                    <MenuItem key="other" value="other">
                      <ItemIcon variant='inline' type='other' />&nbsp;{t('Other')}
                    </MenuItem>
                  </Field>
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('Installed Software')}
                  </Typography>
                  <div style={{ float: 'left', margin: '15px 0 0 5px' }}>
                    <Tooltip title={t('Installed Software')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                    <AddIcon fontSize="small" color="disabled" style={{ marginTop: 2 }} />
                  </div>
                  <InstalledAsset
                    component={SelectField}
                    variant='outlined'
                    type='software'
                    multiple={true}
                    name="installed_software"
                    // disabled={true}
                    fullWidth={true}
                    style={{ height: '38.09px' }}
                    containerstyle={{ width: '100%' }}
                    helperText={t('Select device')}
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('Motherboard ID')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip
                      title={t('Motherboard ID')}>
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    variant='outlined'
                    disabled={true}
                    name="motherboard_id"
                    size='small'
                    fullWidth={true}
                  // helperText={
                  //   <SubscriptionFocus
                  //   fieldName="motherboard_id"
                  //   />
                  // }
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('Ports')}
                  </Typography>
                  <div style={{ float: 'left', margin: '12px 0 0 5px' }}>
                    <Tooltip title={t('Ports')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                    <AddIcon fontSize="small" color="disabled" style={{ marginTop: 2 }} />
                  </div>
                  <div className="clearfix" />
                  <Field
                    component={TextField}
                    style={{  width: '50%' }}
                    type="number"
                    variant='outlined'
                    name="port_number"
                    size='small'
                    fullWidth={true}
                  />
                  <Protocols
                    component={SelectField}
                    style={{ height: '38.09px' }}
                    variant='outlined'
                    name="protocols"
                    size='small'
                    fullWidth={true}
                    containerstyle={{ width: '50%', padding: '0 0 1px 0' }}
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('Installation ID')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('Installation ID')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    variant='outlined'
                    disabled={true}
                    name="installation_id"
                    size='small'
                    fullWidth={true}
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('Connect To Network')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('Connect To Network')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    name="connected_to_network"
                    size='small'
                    variant='outlined'
                    fullWidth={true}
                  // helperText={
                  //   <SubscriptionFocus
                  //   fieldName="connect_to_network"
                  //   />
                  // }
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('NetBIOS Name')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('NetBIOS Name')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    variant='outlined'
                    name="bios_id"
                    size='small'
                    fullWidth={true}
                  // helperText={
                  //   <SubscriptionFocus
                  //   fieldName="netbios_name"
                  //   />
                  // }
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('Virtual')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('Virtual')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>No</Typography>
                    <Switch color='primary' defaultChecked inputProps={{ 'aria-label': 'ant design' }} />
                    <Typography>Yes</Typography>
                  </div>
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('Publicity Accessible')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('Publicity Accessible')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>No</Typography>
                    <Switch color='primary' defaultChecked inputProps={{ 'aria-label': 'ant design' }} />
                    <Typography>Yes</Typography>
                  </div>
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('FQDN')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('Outlined')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    variant='outlined'
                    name="fqdn"
                    size='small'
                    fullWidth={true}
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('IPv4 Address')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('ipv4_address')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    variant='outlined'
                    name="fqdn"
                    size='small'
                    multiline={true}
                    fullWidth={true}
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('IPv6 Address')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('ipv6_address')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    variant='outlined'
                    name="fqdn"
                    size='small'
                    multiline={true}
                    fullWidth={true}
                  />
                </div>
              </Grid>
              <Grid item={true} xs={6}>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left' }}
                  >
                    {t('Installed Hardware')}
                  </Typography>
                  <div style={{ float: 'left', margin: '-5px 0 0 5px' }}>
                    <Tooltip title={t('Installed Hardware')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                    <AddIcon fontSize="small" color="disabled" />
                  </div>
                  <div className="clearfix" />
                  <InstalledAsset
                    component={SelectField}
                    variant='outlined'
                    type='hardware'
                    multiple={true}
                    name="installed_hardware"
                    // disabled={true}
                    fullWidth={true}
                    style={{ height: '38.09px' }}
                    containerstyle={{ width: '100%' }}
                    helperText={t('Select device')}
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 15 }}
                  >
                    {t('Location')}
                  </Typography>
                  <div style={{ float: 'left', margin: '16px 0 0 5px' }}>
                    <Tooltip title={t('Location')}>
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <Field
                  component={TextField}
                  name="Description"
                  fullWidth={true}
                  multiline={true}
                  rows="3"
                  variant='outlined'
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('Model')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('Model')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    variant='outlined'
                    name="model"
                    size='small'
                    fullWidth={true}
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('MAC Address')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('MAC Address')}>
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    variant='outlined'
                    name="mac_address"
                    size='small'
                    fullWidth={true}
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('Baseline Configuration Name')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('Baseline Configuration Name')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    variant='outlined'
                    name="baseline_configuration_name"
                    size='small'
                    fullWidth={true}
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('URI')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('URI')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    variant='outlined'
                    name="uri"
                    size='small'
                    fullWidth={true}
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('BIOS ID')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('BIOS ID')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    disabled={true}
                    variant='outlined'
                    name="bios_id"
                    size='small'
                    fullWidth={true}
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('Scanned')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('Scanned')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <div className="clearfix" />
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>No</Typography>
                    <Switch color='primary' defaultChecked inputProps={{ 'aria-label': 'ant design' }} />
                    <Typography>Yes</Typography>
                  </div>
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('Host Name')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('Host Name')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    variant='outlined'
                    name="hostname"
                    size='small'
                    fullWidth={true}
                  />
                </div>
                <div>
                  <Typography
                    variant="h3"
                    color="textSecondary"
                    gutterBottom={true}
                    style={{ float: 'left', marginTop: 20 }}
                  >
                    {t('Default Gateway')}
                  </Typography>
                  <div style={{ float: 'left', margin: '21px 0 0 5px' }}>
                    <Tooltip title={t('Default Gateway')} >
                      <Information fontSize="inherit" color="disabled" />
                    </Tooltip>
                  </div>
                  <Field
                    component={TextField}
                    variant='outlined'
                    name="default_gateway"
                    size='small'
                    fullWidth={true}
                  />
                </div>
              </Grid>
            </Grid>
        </Paper>
      </div>
    );
  }
}

DeviceCreationDetailsComponent.propTypes = {
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  device: PropTypes.object,
  enableReferences: PropTypes.bool,
  context: PropTypes.array,
  handleClose: PropTypes.func,
};

const DeviceCreationDetails = createFragmentContainer(
  DeviceCreationDetailsComponent,
  {
    device: graphql`
      fragment DeviceCreationDetails_device on ThreatActor {
        id
        first_seen
        last_seen
        sophistication
        resource_level
        primary_motivation
        secondary_motivations
        personal_motivations
        goals
      }
    `,
  },
);

export default R.compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(DeviceCreationDetails);
