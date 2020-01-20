import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Field, Form, Formik } from 'formik';
import { TextField } from 'formik-material-ui';
import Button from '@material-ui/core/Button';
import graphql from 'babel-plugin-relay/macro';
import queryString from 'query-string';
import { withRouter } from 'react-router-dom';
import { compose, head } from 'ramda';
import * as Yup from 'yup';
import * as PropTypes from 'prop-types';
import { commitMutation } from '../../relay/environment';
import inject18n from '../../components/i18n';

const styles = () => ({
  login: {
    paddingBottom: '15px',
  },
});

const loginMutation = graphql`
  mutation LoginFormMutation($input: UserLoginInput!) {
    token(input: $input)
  }
`;

const loginValidation = (t) => Yup.object().shape({
  email: Yup.string()
    .email(t('The value must be an email address'))
    .required(t('This field is required')),
  password: Yup.string().required(t('This field is required')),
});

const LoginForm = (props) => {
  const { classes, t, demo } = props;
  const params = queryString.parse(props.location.search);
  const { redirectLogin } = params;
  const onSubmit = (values, { setSubmitting, resetForm, setErrors }) => {
    commitMutation({
      mutation: loginMutation,
      variables: {
        input: values,
      },
      onError: (error) => {
        const errorMessage = props.t(head(error.res.errors).message);
        setErrors({ email: errorMessage });
      },
      setSubmitting,
      onCompleted: () => {
        setSubmitting(false);
        resetForm();
        props.history.push(redirectLogin ? atob(redirectLogin) : '/');
      },
    });
  };
  return (
      <div className={classes.login}>
        <Formik
          initialValues={{
            email: demo ? 'demo@opencti.io' : '',
            password: demo ? 'demo' : '',
          }}
          validationSchema={loginValidation(t)}
          onSubmit={onSubmit}
          render={({ submitForm, isSubmitting }) => (
            <Form>
              <Field
                name="email"
                component={TextField}
                label={t('Email')}
                fullWidth={true}
              />
              <Field
                name="password"
                component={TextField}
                type="password"
                label={t('Password')}
                fullWidth={true}
                style={{ marginTop: 20 }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                onClick={submitForm}
                style={{ marginTop: 30 }}>
                {t('Sign in')}
              </Button>
            </Form>
          )}
        />
      </div>
  );
};

LoginForm.propTypes = {
  classes: PropTypes.object,
  t: PropTypes.func,
  history: PropTypes.object,
  demo: PropTypes.bool,
};

export default compose(
  inject18n,
  withRouter,
  withStyles(styles),
)(LoginForm);
