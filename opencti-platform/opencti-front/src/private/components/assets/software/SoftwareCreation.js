/* eslint-disable */
/* refactor */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as Yup from 'yup';
import * as R from 'ramda';
import { compose, evolve } from 'ramda';
import { Formik, Form } from 'formik';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { Close, CheckCircleOutline } from '@material-ui/icons';
import { parse } from '../../../../utils/Time';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Slide from '@material-ui/core/Slide';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import graphql from 'babel-plugin-relay/macro';
import { QueryRenderer as QR, commitMutation as CM } from 'react-relay';
import environmentDarkLight from '../../../../relay/environmentDarkLight';
import inject18n from '../../../../components/i18n';
import CyioCoreObjectLatestHistory from '../../common/stix_core_objects/CyioCoreObjectLatestHistory';
import CyioCoreObjectOrCyioCoreRelationshipNotes from '../../analysis/notes/CyioCoreObjectOrCyioCoreRelationshipNotes';
import CyioDomainObjectAssetCreationOverview from '../../common/stix_domain_objects/CyioDomainObjectAssetCreationOverview';
import SoftwareCreationDetails from './SoftwareCreationDetails';
import CyioCoreObjectAssetCreationExternalReferences from '../../analysis/external_references/CyioCoreObjectAssetCreationExternalReferences';
import { toastGenericError } from "../../../../utils/bakedToast";
import ErrorBox from '../../common/form/ErrorBox';

const styles = (theme) => ({
  container: {
    margin: 0,
  },
  header: {
    margin: '-25px -24px 20px -24px',
    padding: '23px 24px 24px 24px',
    height: '64px',
    backgroundColor: '#1F2842',
  },
  gridContainer: {
    marginBottom: 20,
  },
  iconButton: {
    float: 'left',
    minWidth: '0px',
    marginRight: 15,
    padding: '8px 16px 8px 8px',
  },
  title: {
    float: 'left',
  },
  rightContainer: {
    float: 'right',
    marginTop: '-5px',
  },
  editButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
  },
  buttonPopover: {
    textTransform: 'capitalize',
  },
  dialogActions: {
    justifyContent: 'flex-start',
    padding: '10px 0 20px 22px',
  },
  drawerPaper: {
    minHeight: '100vh',
    width: '50%',
    position: 'fixed',
    overflow: 'auto',
    backgroundColor: theme.palette.navAlt.background,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    padding: 0,
  },
});

const softwareCreationMutation = graphql`
  mutation SoftwareCreationMutation($input: SoftwareAssetAddInput) {
    createSoftwareAsset (input: $input) {
      id
      # ...SoftwareCard_node
      # operational_status
      # serial_number
      # release_date
      # description
      # version
      # name
    }
  }
`;

const softwareValidation = (t) => Yup.object().shape({
  name: Yup.string().required(t('This field is required')),
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';
class SoftwareCreation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: {},
      open: false,
      onSubmit: false,
      displayCancel: false,
    };
  }

  handleOpen() {
    this.setState({ open: true });
  }

  onSubmit(values, { setSubmitting, resetForm }) {
    const adaptedValues = evolve(
      {
        release_date: () => values.release_date === null ? null : parse(values.release_date).format(),
      },
      values,
    );
    const finalValues = R.pipe(
      R.assoc('asset_type', values.asset_type),
      R.dissoc('labels'),
    )(adaptedValues);
    CM(environmentDarkLight, {
      mutation: softwareCreationMutation,
      variables: {
        input: finalValues,
      },
      setSubmitting,
      onCompleted: (data) => {
        setSubmitting(false);
        resetForm();
        this.handleClose();
        this.props.history.push('/defender HQ/assets/software');
      },
      onError: (err) => {
        toastGenericError('Failed to create Software');
        const ErrorResponse = JSON.parse(JSON.stringify(err.source.errors))
        this.setState({ error: ErrorResponse });
      }
    });
    // commitMutation({
    //   mutation: softwareCreationMutation,
    //   variables: {
    //     input: values,
    //   },
    //   updater: (store) => insertNode(
    //     store,
    //     'Pagination_softwareAssetList',
    //     this.props.paginationOptions,
    //     'createSoftwareAsset',
    //   ),
    //   setSubmitting,
    //   onCompleted: () => {
    //     setSubmitting(false);
    //     resetForm();
    //     this.handleClose();
    //   },
    // });
    this.setState({ onSubmit: true });
  }

  handleClose() {
    this.setState({ open: false });
  }

  handleCancelButton() {
    this.setState({ displayCancel: false });
  }

  handleOpenCancelButton() {
    this.setState({ displayCancel: true });
  }

  handleSubmit() {
    this.setState({ onSubmit: true });
  }

  onReset() {
    this.handleClose();
  }

  render() {
    const { t, classes } = this.props;
    return (
      <div className={classes.container}>
        <Formik
          initialValues={{
            name: '',
            asset_id: '',
            version: '',
            serial_number: '',
            asset_tag: '',
            vendor_name: '',
            release_date: null,
            software_identifier: '',
            license_key: '',
            installation_id: '',
            patch_level: '',
            cpe_identifier: '',
            description: '',
            operational_status: 'other',
            implementation_point: 'external',
            labels: [],
            asset_type: 'software',
          }}
          validationSchema={softwareValidation(t)}
          onSubmit={this.onSubmit.bind(this)}
          onReset={this.onReset.bind(this)}
        >
          {({
            submitForm,
            isSubmitting,
            setFieldValue,
            values,
          }) => (
            <>
              <div className={classes.header}>
                <Typography
                  variant="h1"
                  gutterBottom={true}
                  classes={{ root: classes.title }}
                >
                  {t('New Asset')}
                </Typography>
                <div className={classes.rightContainer}>
                  <Tooltip title={t('Cancel')}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Close />}
                      color='primary'
                      // onClick={handleReset}
                      onClick={this.handleOpenCancelButton.bind(this)}
                      className={classes.iconButton}
                    >
                      {t('Cancel')}
                    </Button>
                  </Tooltip>
                  <Tooltip title={t('Create')}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<CheckCircleOutline />}
                      onClick={submitForm}
                      disabled={isSubmitting}
                      classes={{ root: classes.iconButton }}
                    >
                      {t('Done')}
                    </Button>
                  </Tooltip>
                </div>
              </div>
              <Form>
                <Grid
                  container={true}
                  spacing={3}
                  classes={{ container: classes.gridContainer }}
                >
                  <Grid item={true} xs={6}>
                    <CyioDomainObjectAssetCreationOverview
                      setFieldValue={setFieldValue}
                      values={values}
                      assetType="Software"
                    />
                  </Grid>
                  <Grid item={true} xs={6}>
                    <SoftwareCreationDetails setFieldValue={setFieldValue} />
                  </Grid>
                </Grid>
              </Form>
              <Grid
                container={true}
                spacing={3}
                classes={{ container: classes.gridContainer }}
                style={{ marginTop: 25 }}
              >
                <Grid item={true} xs={6}>
                  {/* <StixCoreObjectExternalReferences
                      stixCoreObjectId={software.id}
                    /> */}
                  <div>
                    <CyioCoreObjectAssetCreationExternalReferences disableAdd={true} />
                  </div>
                </Grid>
                <Grid item={true} xs={6}>
                  <CyioCoreObjectLatestHistory />
                </Grid>
              </Grid>
              <div>
                <CyioCoreObjectOrCyioCoreRelationshipNotes height='100px' disableAdd={true} />
              </div>
            </>
          )}
        </Formik>
        <Dialog
          open={this.state.displayCancel}
          TransitionComponent={Transition}
          onClose={this.handleCancelButton.bind(this)}
        >
          <DialogContent>
            <Typography style={{
              fontSize: '18px',
              lineHeight: '24px',
              color: 'white',
            }} >
              {t('Are you sure you’d like to cancel?')}
            </Typography>
            <DialogContentText>
              {t('Your progress will not be saved')}
            </DialogContentText>
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            <Button
              onClick={this.handleCancelButton.bind(this)}
              classes={{ root: classes.buttonPopover }}
              variant="outlined"
              size="small"
            >
              {t('Go Back')}
            </Button>
            <Button
              onClick={() => this.props.history.push('/defender HQ/assets/software')}
              // onClick={() => history.goBack()}
              color="primary"
              classes={{ root: classes.buttonPopover }}
              variant="contained"
              size="small"
            >
              {t('Yes Cancel')}
            </Button>
          </DialogActions>
        </Dialog>
        <ErrorBox
          error={this.state.error}
          pathname='/defender HQ/assets/software'
        />
      </div>
    );
  }
}

SoftwareCreation.propTypes = {
  softwareId: PropTypes.string,
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
};

export default compose(
  inject18n,
  withStyles(styles, { withTheme: true }),
)(SoftwareCreation);
