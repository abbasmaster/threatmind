import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Slide from '@mui/material/Slide';
import MoreVert from '@mui/icons-material/MoreVert';
import { graphql, useMutation } from 'react-relay';
import ToggleButton from '@mui/material/ToggleButton';
import { useFormatter } from '../../../../components/i18n';
import { QueryRenderer } from '../../../../relay/environment';
import { opinionEditionQuery } from './OpinionEdition';
import { CollaborativeSecurity } from '../../../../utils/Security';
import { KNOWLEDGE_KNUPDATE_KNDELETE } from '../../../../utils/hooks/useGranted';
import OpinionEditionContainer from './OpinionEditionContainer';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const OpinionPopoverDeletionMutation = graphql`
  mutation OpinionPopoverDeletionMutation($id: ID!) {
    opinionEdit(id: $id) {
      delete
    }
  }
`;

const OpinionPopover = (data) => {
  const history = useHistory();
  const { t_i18n } = useFormatter();
  const [anchorEl, setAnchorEl] = useState(null);
  const [displayDelete, setDisplayDelete] = useState(false);
  const [displayEdit, setDisplayEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleOpenDelete = () => {
    setDisplayDelete(true);
    handleClose();
  };
  const handleCloseDelete = () => setDisplayDelete(false);
  const [commit] = useMutation(OpinionPopoverDeletionMutation);
  const submitDelete = () => {
    setDeleting(true);
    commit({
      variables: { id: data.id },
      onCompleted: () => {
        setDeleting(false);
        handleClose();
        history.push('/dashboard/analyses/opinions');
      },
    });
  };
  const handleOpenEdit = () => {
    setDisplayEdit(true);
    handleClose();
  };
  const handleCloseEdit = () => setDisplayEdit(false);
  return (
    <>
      <ToggleButton
        value="popover"
        size="small"
        onClick={handleOpen}
      >
        <MoreVert fontSize="small" color="primary" />
      </ToggleButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleOpenEdit}>{t_i18n('Update')}</MenuItem>
        <CollaborativeSecurity
          data={data.opinion}
          needs={[KNOWLEDGE_KNUPDATE_KNDELETE]}
        >
          <MenuItem onClick={handleOpenDelete}>{t_i18n('Delete')}</MenuItem>
        </CollaborativeSecurity>
      </Menu>
      <Dialog
        open={displayDelete}
        PaperProps={{ elevation: 1 }}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
      >
        <DialogContent>
          <DialogContentText>
            {t_i18n('Do you want to delete this opinions?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} disabled={deleting}>
            {t_i18n('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDelete} disabled={deleting}>
            {t_i18n('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <QueryRenderer
        query={opinionEditionQuery}
        variables={{ id: data.id }}
        render={({ props }) => {
          if (props) {
            return (
              <OpinionEditionContainer
                opinion={props.opinion}
                handleClose={handleCloseEdit}
                open={displayEdit}
              />
            );
          }
          return <div />;
        }}
      />
    </>
  );
};

export default OpinionPopover;
