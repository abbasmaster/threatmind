import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { compose } from 'ramda';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Slide from '@mui/material/Slide';
import { graphql } from 'react-relay';
import withRouter from '../../../../utils/compat-router/withRouter';
import inject18n from '../../../../components/i18n';
import { commitMutation, QueryRenderer } from '../../../../relay/environment';
import { positionEditionQuery } from './PositionEdition';
import PositionEditionContainer from './PositionEditionContainer';
import Security from '../../../../utils/Security';
import { KNOWLEDGE_KNUPDATE_KNDELETE } from '../../../../utils/hooks/useGranted';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const PositionPopoverDeletionMutation = graphql`
  mutation PositionPopoverDeletionMutation($id: ID!) {
    positionEdit(id: $id) {
      delete
    }
  }
`;

class PositionPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      displayDelete: false,
      displayEdit: false,
      deleting: false,
    };
  }

  handleOpen(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenDelete() {
    this.setState({ displayDelete: true });
    this.handleClose();
  }

  handleCloseDelete() {
    this.setState({ displayDelete: false });
  }

  submitDelete() {
    this.setState({ deleting: true });
    commitMutation({
      mutation: PositionPopoverDeletionMutation,
      variables: {
        id: this.props.id,
      },
      onCompleted: () => {
        this.setState({ deleting: false });
        this.handleClose();
        this.props.navigate('/dashboard/locations/positions');
      },
    });
  }

  handleOpenEdit() {
    this.setState({ displayEdit: true });
    this.handleClose();
  }

  handleCloseEdit() {
    this.setState({ displayEdit: false });
  }

  render() {
    const { t, id } = this.props;
    return (
      <React.Fragment>
        <Security needs={[KNOWLEDGE_KNUPDATE_KNDELETE]}>
          <Button
            color="error"
            variant="contained"
            onClick={this.handleOpenDelete.bind(this)}
            disabled={this.state.deleting}
            sx={{ marginTop: 2 }}
          >
            {t('Delete')}
          </Button>
        </Security>
        <Dialog
          PaperProps={{ elevation: 1 }}
          open={this.state.displayDelete}
          keepMounted={true}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this position?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleCloseDelete.bind(this)}
              disabled={this.state.deleting}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              onClick={this.submitDelete.bind(this)}
              disabled={this.state.deleting}
            >
              {t('Delete')}
            </Button>
          </DialogActions>
        </Dialog>
        <QueryRenderer
          query={positionEditionQuery}
          variables={{ id }}
          render={({ props }) => {
            if (props) {
              return (
                <PositionEditionContainer
                  position={props.position}
                  handleClose={this.handleCloseEdit.bind(this)}
                  open={this.state.displayEdit}
                />
              );
            }
            return <div />;
          }}
        />
      </React.Fragment>
    );
  }
}

PositionPopover.propTypes = {
  id: PropTypes.string,
  t: PropTypes.func,
  navigate: PropTypes.func,
};

export default compose(inject18n, withRouter)(PositionPopover);
