import { Field, Form, Formik } from 'formik';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';
import { InfoOutlined } from '@mui/icons-material';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import ObjectMarkingField from '@components/common/form/ObjectMarkingField';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import React from 'react';
import { Option } from '@components/common/form/ReferenceField';
import { FormikConfig } from 'formik/dist/types';
import * as Yup from 'yup';
import { BUILT_IN_FROM_FILE_TEMPLATE, BUILT_IN_FROM_TEMPLATE } from '@components/common/stix_core_objects/StixCoreObjectFileExport';
import { useFormatter } from '../../../../components/i18n';
import { fieldSpacingContainerStyle } from '../../../../utils/field';
import SelectField from '../../../../components/fields/SelectField';
import AutocompleteField from '../../../../components/AutocompleteField';
import TextField from '../../../../components/TextField';

export type FilesTemplateOption = Pick<Option, 'label' | 'value'> & {
  fileMarkings: {
    id: string
    name: string
  }[]
};

export type ConnectorOption = Option & {
  connectorScope: readonly string[]
};

export interface StixCoreObjectFileExportFormInputs {
  connector: ConnectorOption | null;
  format: string;
  type: string | null;
  templateFile: FilesTemplateOption | null;
  template: Option | null;
  exportFileName: string | null;
  contentMaxMarkings: Option[];
  fileMarkings: Option[];
}

export interface StixCoreObjectFileExportFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: FormikConfig<StixCoreObjectFileExportFormInputs>['onSubmit']
  connectors: ConnectorOption[]
  templates?: Option[]
  filesFromTemplate?: FilesTemplateOption[]
  defaultValues?: {
    connector: string
    format: string
    template?: string
    templateFile?: string
  }
}

const StixCoreObjectFileExportForm = ({
  isOpen,
  onClose,
  onSubmit,
  connectors,
  templates,
  filesFromTemplate,
  defaultValues,
}: StixCoreObjectFileExportFormProps) => {
  const { t_i18n } = useFormatter();

  const isBuiltInConnector = (connector?: string) => (
    [BUILT_IN_FROM_TEMPLATE.value, BUILT_IN_FROM_FILE_TEMPLATE.value].includes(connector ?? '')
  );

  const validation = () => Yup.object().shape({
    connector: Yup.object().required(t_i18n('This field is required')),
    format: Yup.string().trim().required(t_i18n('This field is required')),
    type: Yup.string().nullable().when('connector', {
      is: (val: ConnectorOption | null) => !isBuiltInConnector(val?.value),
      then: (schema) => schema.required(t_i18n('This field is required')),
    }),
    template: Yup.object().nullable().when('connector', {
      is: (val: ConnectorOption | null) => val?.value === BUILT_IN_FROM_TEMPLATE.value,
      then: (schema) => schema.required(t_i18n('This field is required')),
    }),
    templateFile: Yup.object().nullable().when('connector', {
      is: (val: ConnectorOption | null) => val?.value === BUILT_IN_FROM_FILE_TEMPLATE.value,
      then: (schema) => schema.required(t_i18n('This field is required')),
    }),
    exportFileName: Yup.string().nullable().when('connector', {
      is: (val: ConnectorOption | null) => isBuiltInConnector(val?.value),
      then: (schema) => schema.required(t_i18n('This field is required')),
    }),
  });

  const connectorScopes = Array.from(new Set(connectors.flatMap((c) => c.connectorScope ?? [])));

  const defaultTemplate = templates?.find((t) => t.value === defaultValues?.template);
  const defaultTemplateFile = filesFromTemplate?.find((f) => f.value === defaultValues?.templateFile);

  let defaultExportFileName = null;
  if (defaultTemplate) defaultExportFileName = defaultTemplate.label;
  if (defaultTemplateFile) [defaultExportFileName] = defaultTemplateFile.label.split('.');

  const initialValues: StixCoreObjectFileExportFormInputs = {
    connector: connectors.find((c) => c.value === defaultValues?.connector) ?? null,
    format: defaultValues?.format ?? '',
    type: null,
    template: defaultTemplate ?? null,
    templateFile: defaultTemplateFile ?? null,
    exportFileName: defaultExportFileName,
    contentMaxMarkings: [],
    fileMarkings: [],
  };

  const isFormatValid = (format: string, selectedConnector: ConnectorOption | null) => {
    if (!selectedConnector) return true;
    const connector = connectors.find((c) => c.value === selectedConnector.value);
    return !!connector?.connectorScope?.includes(format);
  };

  const isConnectorValid = (option: ConnectorOption, selectedFormat: string) => {
    if (!selectedFormat) return true;
    const connector = connectors.find((c) => c.value === option.value);
    return !!connector?.connectorScope?.includes(selectedFormat);
  };

  return (
    <Formik<StixCoreObjectFileExportFormInputs>
      enableReinitialize={true}
      initialValues={initialValues}
      validationSchema={validation}
      onSubmit={onSubmit}
    >
      {({ submitForm, handleReset, isSubmitting, setFieldValue, values }) => (
        <Form>
          <Dialog
            PaperProps={{
              elevation: 1,
              style: {
                minHeight: '50vh',
              },
            }}
            open={isOpen}
            onClose={() => {
              handleReset();
              onClose();
            }}
            fullWidth={true}
            data-testid="StixCoreObjectFileExportDialog"
          >
            <DialogTitle>
              {t_i18n('Generate an export')}
              <Tooltip title={t_i18n('Your max shareable markings will be applied to the content max markings')}>
                <InfoOutlined sx={{ paddingLeft: 1 }} fontSize="small" />
              </Tooltip>
            </DialogTitle>

            <DialogContent>
              <Field
                component={SelectField}
                variant="standard"
                name="format"
                label={t_i18n('Export format')}
                fullWidth={true}
                containerstyle={fieldSpacingContainerStyle}
              >
                {connectorScopes.map((scope) => (
                  <MenuItem
                    key={scope}
                    value={scope}
                    disabled={!isFormatValid(scope, values.connector)}
                  >
                    {scope}
                  </MenuItem>
                ))}
              </Field>

              <Field
                component={AutocompleteField}
                name="connector"
                fullWidth={true}
                style={fieldSpacingContainerStyle}
                options={connectors}
                getOptionDisabled={(option: ConnectorOption) => !isConnectorValid(option, values.format)}
                renderOption={(
                  props: React.HTMLAttributes<HTMLLIElement>,
                  option: Option,
                ) => <li {...props}>{option.label}</li>}
                textfieldprops={{ label: t_i18n('Connector') }}
                optionLength={80}
              />

              {values.connector && (
                <>
                  {values.connector.value === BUILT_IN_FROM_TEMPLATE.value && (
                    <Field
                      component={AutocompleteField}
                      name="template"
                      fullWidth={true}
                      style={fieldSpacingContainerStyle}
                      options={templates}
                      onChange={(_: string, o: Option | null) => {
                        if (!values.exportFileName && o) {
                          setFieldValue('exportFileName', o.label);
                        }
                      }}
                      renderOption={(
                        props: React.HTMLAttributes<HTMLLIElement>,
                        option: Option,
                      ) => <li {...props}>{option.label}</li>}
                      textfieldprops={{ label: t_i18n('Template') }}
                      optionLength={80}
                    />
                  )}

                  {values.connector.value === BUILT_IN_FROM_FILE_TEMPLATE.value && (
                    <Field
                      component={AutocompleteField}
                      name="templateFile"
                      fullWidth={true}
                      style={fieldSpacingContainerStyle}
                      options={filesFromTemplate}
                      onChange={(_: string, o: Option | null) => {
                        if (!values.exportFileName && o) {
                          setFieldValue('exportFileName', o.label.split('.')[0]);
                        }
                      }}
                      renderOption={(
                        props: React.HTMLAttributes<HTMLLIElement>,
                        option: Option,
                      ) => <li {...props}>{option.label}</li>}
                      textfieldprops={{ label: t_i18n('Template file') }}
                      optionLength={80}
                    />
                  )}

                  {!isBuiltInConnector(values.connector.value) && (
                    <Field
                      component={SelectField}
                      variant="standard"
                      name="type"
                      aria-label={'TYPE'}
                      label={t_i18n('Export type')}
                      fullWidth={true}
                      containerstyle={fieldSpacingContainerStyle}
                    >
                      <MenuItem value="simple">
                        {t_i18n('Simple export (just the entity)')}
                      </MenuItem>
                      <MenuItem value="full">
                        {t_i18n('Full export (entity and first neighbours)')}
                      </MenuItem>
                    </Field>
                  )}

                  {isBuiltInConnector(values.connector.value) && (
                    <Field
                      component={TextField}
                      variant="standard"
                      name="exportFileName"
                      label={t_i18n('Export file name')}
                      style={fieldSpacingContainerStyle}
                    />
                  )}

                  {values.connector.value !== BUILT_IN_FROM_FILE_TEMPLATE.value && (
                    <>
                      <ObjectMarkingField
                        name="contentMaxMarkings"
                        label={t_i18n('Content max marking definition levels')}
                        style={fieldSpacingContainerStyle}
                        setFieldValue={setFieldValue}
                        limitToMaxSharing
                      />
                      <ObjectMarkingField
                        name="fileMarkings"
                        label={t_i18n('File marking definition levels')}
                        style={fieldSpacingContainerStyle}
                        setFieldValue={setFieldValue}
                      />
                    </>
                  )}
                </>
              )}
            </DialogContent>

            <DialogActions>
              <Button
                disabled={isSubmitting}
                onClick={() => {
                  handleReset();
                  onClose();
                }}
              >
                {t_i18n('Cancel')}
              </Button>
              <Button
                color="secondary"
                onClick={submitForm}
                disabled={isSubmitting}
              >
                {t_i18n('Create')}
              </Button>
            </DialogActions>
          </Dialog>
        </Form>
      )}
    </Formik>
  );
};

export default StixCoreObjectFileExportForm;
