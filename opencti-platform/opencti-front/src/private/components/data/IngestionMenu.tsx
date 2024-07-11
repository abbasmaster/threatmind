import React from 'react';
import NavToolbarMenu, { MenuEntry } from '@components/common/menus/NavToolbarMenu';
import useGranted, { MODULES, INGESTION } from '../../../utils/hooks/useGranted';

const IngestionMenu = () => {
  const isConnectorReader = useGranted([MODULES]);
  const isGrantedIngestion = useGranted([INGESTION]);
  const settingsEntries: MenuEntry[] = [
    {
      path: '/dashboard/data/ingestion/sync',
      label: 'Remote OCTI Streams',
    },
    {
      path: '/dashboard/data/ingestion/taxii',
      label: 'TAXII Feeds',
    },
    {
      path: '/dashboard/data/ingestion/rss',
      label: 'RSS Feeds',
    },
    {
      path: '/dashboard/data/ingestion/csv',
      label: 'CSV Feeds',
    },
  ];
  const entries: MenuEntry[] = isGrantedIngestion ? [...settingsEntries] : [];
  if (isConnectorReader) {
    entries.push({
      path: '/dashboard/data/ingestion/connectors',
      label: 'Connectors',
    });
  }
  return <NavToolbarMenu entries={entries} />;
};

export default IngestionMenu;
