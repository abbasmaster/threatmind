/* eslint-disable */
/* refactor */
import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { compose } from 'ramda';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
} from '@material-ui/core';
import inject18n from '../../../../components/i18n';

const styles = (theme) => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '15px',
    borderRadius: 6,
  },
  inputTextField: {
    color: 'white',
  },
  dialogTitle: {
    padding: '24px 0 16px 24px',
  },
  textField: {
    background: theme.palette.header.background,
  },
  dialogAction: {
    margin: '15px 20px 15px 0',
  },
});

class ErrorBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
    }
  }

  handleErrorResponse(errorMessage) {
    let FieldName;
    function title(str) {
      return str.replace(/(^|\s)\S/g, (s) => s.toUpperCase());
    }
    if ((/(enum)\b/).test(errorMessage)) {
      FieldName = errorMessage.match(/(input)\.\w+/);
      const FilteredValue = FieldName[0].replace(/(input.)/, '').replace('_', ' ');
      return `Value of ${title(FilteredValue)} in invalid`;
    }
    if ((/; ?(Field)/).test(errorMessage)) {
      FieldName = errorMessage.match(/; ?(Field).+/)[0].replace(/; ?/, '');
      return FieldName;
    }
    FieldName = errorMessage.match(/\bValue\b.+/);
    return FieldName[0];
  }

  handleRenderComponent(error) {
    if (Object.keys(error).length) {
      if ((error.every((value) => value.name !== undefined && value.name.includes('CyioError')))) {
        return this.renderCyioError();
      }
      else if (error.every((value) => value.extensions.code.includes('BAD_USER_INPUT'))) {
        return this.renderBadUserInput();
      }
      else if (error.every((value) => value.extensions.code.includes('GRAPHQL_PARSE_FAILED') || value.extensions.code.includes('GRAPHQL_VALIDATION_FAILED') || value.extensions.code.includes('INTERNAL_SERVER_ERROR'))) {
        return this.renderInternalServerError();
      }
      else if (error.every((value) => value.extensions.code.includes('FORBIDDEN'))) {
        return this.renderForbidden();
      }
      return this.renderInternalServerError();
    }
  }

  renderBadUserInput() {
    const {
      t, classes, history, pathname, error,
    } = this.props;
    return (
      <>
        <DialogTitle classes={{ root: classes.dialogTitle }}>
          {t('ERROR')}
        </DialogTitle>
        <DialogContent style={{ overflow: 'hidden' }}>
          <Typography style={{ marginBottom: '20px' }}>
            Sorry. Something went wrong and DarkLight Support has been notified. Please try again or contact <strong style={{ color: '#075AD3' }}>Support@darklight.ai</strong> for assistance.
          </Typography>
          <List>
            {Object.keys(error).length && error.map((value, key) => {
              return (
                <ListItem
                  divider
                  key={key}
                >
                  {this.handleErrorResponse(value.message)}
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Button
            variant='outlined'
            onClick={() => history.push(pathname)}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </>
    );
  }

  renderCyioError() {
    const {
      t, classes, history, pathname, error,
    } = this.props;
    return (
      <>
        <DialogTitle classes={{ root: classes.dialogTitle }}>
          {t('ERROR')}
        </DialogTitle>
        <DialogContent style={{ overflow: 'hidden' }}>
          <Typography style={{ marginBottom: '20px' }}>
            Sorry. Something went wrong and DarkLight Support has been notified. Please try again or contact <strong style={{ color: '#075AD3' }}>Support@darklight.ai</strong> for assistance.
          </Typography>
          <List>
            {Object.keys(error).length && error.map((value, key) => {
              return (
                <ListItem
                  divider
                  key={key}
                >
                  {value.message}
                </ListItem>
              );
            })}
          </List>
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Button
            variant='outlined'
            onClick={() => this.setState({ open: false })}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </>
    );
  }

  renderInternalServerError() {
    const {
      t, classes, history, pathname,
    } = this.props;
    return (
      <>
        <DialogTitle classes={{ root: classes.dialogTitle }}>
          {t('ERROR')}
        </DialogTitle>
        <DialogContent style={{ overflow: 'hidden' }}>
          <Typography style={{ marginBottom: '20px' }}>
            Sorry. Something went wrong and DarkLight Support has been notified. Please try again or contact <strong style={{ color: '#075AD3' }}>Support@darklight.ai</strong> for assistance.
          </Typography>
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Button
            variant='outlined'
            onClick={() => history.push(pathname)}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </>
    );
  }

  renderUnauthenticated() {
    const {
      t, classes, history, pathname,
    } = this.props;
    return (
      <>
        <DialogTitle classes={{ root: classes.dialogTitle }}>
          {t('ERROR')}
        </DialogTitle>
        <DialogContent style={{ overflow: 'hidden' }}>
          <Typography style={{ marginBottom: '20px' }}>
            Sorry, you need to be Authenticated to do this. You are not logged in.
          </Typography>
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Button
            variant='outlined'
            onClick={() => history.push(pathname)}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </>
    );
  }

  renderForbidden() {
    const {
      t, classes, history, pathname,
    } = this.props;
    return (
      <>
        <DialogTitle classes={{ root: classes.dialogTitle }}>
          {t('ERROR')}
        </DialogTitle>
        <DialogContent style={{ overflow: 'hidden' }}>
          <Typography style={{ marginBottom: '20px' }}>
            Sorry, you are not authorized to perform this operation. Please contact your admin for assistance.
          </Typography>
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Button
            variant='outlined'
            onClick={() => history.push(pathname)}
          >
            {t('Cancel')}
          </Button>
        </DialogActions>
      </>
    );
  }

  render() {
    const {
      error,
    } = this.props;
    return (
      <Dialog
        open={Object.keys(error).length && this.state.open}
        fullWidth={true}
        maxWidth='md'
      >
        {this.handleRenderComponent(error)}
      </Dialog>
    );

  }
}

ErrorBox.propTypes = {
  pathname: PropTypes.string,
  history: PropTypes.object,
  classes: PropTypes.object,
  t: PropTypes.func,
  error: PropTypes.object,
  fldt: PropTypes.func,
};

export default compose(withRouter, inject18n, withStyles(styles))(ErrorBox);
