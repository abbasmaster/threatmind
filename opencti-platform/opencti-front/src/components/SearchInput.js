import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import { Search } from '@material-ui/icons';
import { compose, propOr } from 'ramda';
import inject18n from './i18n';

const styles = theme => ({
  searchRoot: {
    borderRadius: 5,
    padding: '0 10px 0 10px',
    backgroundColor: theme.palette.background.paperLight,
  },
  searchRootInDrawer: {
    borderRadius: 5,
    padding: '0 10px 0 10px',
    backgroundColor: theme.palette.navAlt.background,
  },
  searchInput: {
    transition: theme.transitions.create('width'),
    width: 250,
    '&:focus': {
      width: 350,
    },
  },
  searchInputSmall: {
    transition: theme.transitions.create('width'),
    width: 150,
    '&:focus': {
      width: 250,
    },
  },
});

class SearchInput extends Component {
  render() {
    const {
      t,
      classes,
      onChange,
      onSubmit,
      variant,
      keyword,
      location,
    } = this.props;
    const queryParams = Object.fromEntries(
      new URLSearchParams(location.search.substring(1)),
    );
    let finalKeyword = keyword;
    if (variant === 'small') {
      finalKeyword = keyword || propOr('', 'searchTerm', queryParams);
    }
    return (
      <Input
        name="keyword"
        defaultValue={finalKeyword}
        placeholder={`${t('Search')}...`}
        onChange={(event) => {
          const { value } = event.target;
          if (typeof onChange === 'function') {
            onChange(value);
          }
        }}
        onKeyPress={(event) => {
          const { value } = event.target;
          if (typeof onSubmit === 'function' && event.key === 'Enter') {
            onSubmit(value);
          }
        }}
        startAdornment={
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        }
        classes={{
          root:
            variant === 'inDrawer'
              ? classes.searchRootInDrawer
              : classes.searchRoot,
          input:
            variant === 'small' ? classes.searchInputSmall : classes.searchInput,
        }}
        disableUnderline={true}
      />
    );
  }
}

SearchInput.propTypes = {
  keyword: PropTypes.string,
  t: PropTypes.func.isRequired,
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  variant: PropTypes.string,
  location: PropTypes.object,
};

export default compose(
  inject18n,
  withStyles(styles),
  withRouter,
)(SearchInput);
