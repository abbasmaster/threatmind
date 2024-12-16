import React from 'react';
import { ApolloSandbox } from '@apollo/sandbox/react';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles({
  sandbox: {
    width: '100%',
    height: '100%',
  },
});

const SandBox = () => {
  const classes = useStyles();
  return (
    <ApolloSandbox
      initialEndpoint='http://localhost:4000'
      className={classes.sandbox}
    />
  );
};

export default SandBox;
