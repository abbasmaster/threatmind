import React, { FormEvent, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { FormikErrors } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useFormatter } from '../../../../components/i18n';

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1rem;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1rem;
`;

interface CustomFileUploadProps<T> {
  setFieldValue:
  (field: string, value: File | string | undefined, shouldValidate?: boolean) =>
  Promise<void |
  FormikErrors<T>>
  ,
  isEmbeddedInExternalReferenceCreation?: boolean
}

function CustomFileUploader<T>(
  { setFieldValue, isEmbeddedInExternalReferenceCreation }
  : CustomFileUploadProps<T>,
) {
  const { t } = useFormatter();
  const theme = useTheme();
  const [fileName, setFileName] = useState('');

  async function onChange(event: FormEvent) {
    const eventTargetValue = (event.target as HTMLInputElement).value as string;
    const newFileName = eventTargetValue.substring(eventTargetValue.lastIndexOf('\\') + 1);
    setFileName(newFileName);
    await setFieldValue('file', (event.target as HTMLInputElement).files?.[0]);
    if (isEmbeddedInExternalReferenceCreation) {
      const externalIdValue = (document.getElementById('external_id') as HTMLInputElement).value;
      if (!externalIdValue) {
        await setFieldValue('external_id', newFileName);
      }
    }
  }

  return (
    <div
      style={{
        marginTop: 30,
        width: '100%',
      }}
    >
      <label
        htmlFor="label"
        style={{
          color: theme.palette.grey['400'],
        }}
      >
        {t('Associated file')}
      </label>
      <br/>
      <Box
        sx={{
          width: '100%',
          paddingBottom: '0.2rem',
          borderBottom: `0.05rem solid ${theme.palette.grey['400']}`,
          cursor: 'default',
          '&:hover': {
            paddingBottom: '0.15rem',
            borderBottom: '0.1rem solid white',
          },
          '&:active': {
            paddingBottom: '0.15rem',
            borderBottom: `0.1rem solid ${theme.palette.primary.main}`,
          },
        }}
      >
        <Button
          component="label"
          variant="contained"
          onChange={onChange}
        >
          {t('Select your file')}
          <VisuallyHiddenInput type="file" />
        </Button>
        <span
          title={fileName || t('No file selected.')}
          style={{
            marginLeft: 5,
          }}
        >
          {fileName || t('No file selected.')}
        </span>
      </Box>
    </div>
  );
}

export default CustomFileUploader;
