import React, { Component } from 'react';
import { CSVLink } from 'react-csv';
import { ExploreOutlined, GetAppOutlined, ImageOutlined } from '@mui/icons-material';
import { FileDelimitedOutline, FileExportOutline, FilePdfBox } from 'mdi-material-ui';
import withTheme from '@mui/styles/withTheme';
import withStyles from '@mui/styles/withStyles';
import * as R from 'ramda';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import { withRouter } from 'react-router-dom';
import fileDownload from 'js-file-download';
import themeLight from './ThemeLight';
import themeDark from './ThemeDark';
import { commitLocalUpdate } from '../relay/environment';
import { exportImage, exportPdf } from '../utils/Image';
import inject18n from './i18n';
import Loader from './Loader';

const styles = () => ({
  exportButtons: {
    display: 'flex',
  },
  loader: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});

class ExportButtons extends Component {
  constructor(props) {
    super(props);
    this.adjust = props.adjust;
    this.csvLink = React.createRef();
    commitLocalUpdate((store) => {
      const me = store.getRoot().getLinkedRecord('me');
      const exporting = me.getValue('exporting') || false;
      this.state = {
        anchorElImage: null,
        anchorElPdf: null,
        exporting,
      };
    });
  }

  handleOpenImage(event) {
    this.setState({ anchorElImage: event.currentTarget });
  }

  handleCloseImage() {
    this.setState({ anchorElImage: null });
  }

  exportImage(domElementId, name, theme, background) {
    this.setState({ exporting: true });
    this.handleCloseImage();
    const { theme: currentTheme, pixelRatio = 1 } = this.props;
    let timeout = 4000;
    if (theme !== currentTheme.palette.mode) {
      timeout = 6000;
      commitLocalUpdate((store) => {
        const me = store.getRoot().getLinkedRecord('me');
        me.setValue(theme, 'theme');
        me.setValue(true, 'exporting');
      });
    }
    setTimeout(() => {
      const container = document.getElementById(domElementId);
      const buttons = document.getElementById('export-buttons');
      buttons.setAttribute('style', 'display: none');
      const { offsetWidth, offsetHeight } = container;
      if (theme === currentTheme.palette.mode && this.adjust) {
        container.setAttribute('style', 'width:3840px; height:2160px');
        this.adjust(true);
      }
      setTimeout(() => {
        exportImage(
          domElementId,
          offsetWidth,
          offsetHeight,
          name,
          // eslint-disable-next-line no-nested-ternary
          background
            ? theme === 'light'
              ? themeLight().palette.background.default
              : themeDark().palette.background.default
            : null,
          pixelRatio,
          this.adjust,
        ).then(() => {
          buttons.setAttribute('style', 'display: block');
          if (theme !== currentTheme.palette.mode) {
            commitLocalUpdate((store) => {
              const me = store.getRoot().getLinkedRecord('me');
              me.setValue(false, 'exporting');
              me.setValue(currentTheme.palette.mode, 'theme');
            });
          } else {
            this.setState({ exporting: false });
          }
        });
      }, timeout / 2);
    }, timeout);
  }

  handleOpenPdf(event) {
    this.setState({ anchorElPdf: event.currentTarget });
  }

  handleExportJson(workspace) {
    this.setState({ exporting: true });

    const dashboardName = workspace.name;
    const dashboardConfig = JSON.stringify({
      version: '1.0.0',
      type: workspace.type,
      name: dashboardName,
      manifest: workspace.manifest,
    }, null, 2);
    const blob = new Blob([dashboardConfig], { type: 'text/json' });
    const [day, month, year] = new Date().toLocaleDateString('fr-FR').split('/');
    const fileName = `${year}${month}${day}_octi_dashboard_${dashboardName}`;

    fileDownload(blob, fileName, 'application/json');
    this.setState({ exporting: false });
  }

  handleClosePdf() {
    this.setState({ anchorElPdf: null });
  }

  exportPdf(domElementId, name, theme, background) {
    this.setState({ exporting: true });
    this.handleClosePdf();
    const { theme: currentTheme, pixelRatio = 1 } = this.props;
    let timeout = 4000;
    if (theme !== currentTheme.palette.mode) {
      timeout = 6000;
      commitLocalUpdate((store) => {
        const me = store.getRoot().getLinkedRecord('me');
        me.setValue(true, 'exporting');
        me.setValue(theme, 'theme');
      });
    }
    setTimeout(() => {
      const buttons = document.getElementById('export-buttons');
      buttons.setAttribute('style', 'display: none');
      exportPdf(
        domElementId,
        name,
        // eslint-disable-next-line no-nested-ternary
        background
          ? theme === 'light'
            ? themeLight().palette.background.default
            : themeDark().palette.background.default
          : null,
        pixelRatio,
        this.adjust,
      ).then(() => {
        buttons.setAttribute('style', 'display: block');
        if (theme !== currentTheme.palette.mode) {
          commitLocalUpdate((store) => {
            const me = store.getRoot().getLinkedRecord('me');
            me.setValue(false, 'exporting');
            me.setValue(currentTheme.palette.mode, 'theme');
          });
        } else {
          this.setState({ exporting: false });
        }
      });
    }, timeout);
  }

  render() {
    const { anchorElImage, anchorElPdf, exporting } = this.state;
    const {
      classes,
      t,
      domElementId,
      name,
      type,
      csvData,
      csvFileName,
      handleDownloadAsStixReport,
      containerId,
      investigationAddFromContainer,
      history,
      location,
      workspace,
    } = this.props;
    const isCustomDashBoard = location.pathname.includes('dashboards/');
    return (
      <div className={classes.exportButtons} id="export-buttons">
        <ToggleButtonGroup size="small" color="secondary" exclusive={true}>
          <Tooltip title={t('Export to image')}>
            <ToggleButton onClick={this.handleOpenImage.bind(this)}>
              <ImageOutlined fontSize="small" color="primary" />
            </ToggleButton>
          </Tooltip>
          <Tooltip title={t('Export to PDF')}>
            <ToggleButton onClick={this.handleOpenPdf.bind(this)}>
              <FilePdfBox fontSize="small" color="primary" />
            </ToggleButton>
          </Tooltip>
          {isCustomDashBoard && (
            <Tooltip title={t('Export to JSON')}>
              <ToggleButton onClick={this.handleExportJson.bind(this, workspace)}>
                <FileExportOutline fontSize="small" color="primary" />
              </ToggleButton>
            </Tooltip>
          )}
          {investigationAddFromContainer && (
            <Tooltip title={t('Start an investigation')}>
              <ToggleButton onClick={investigationAddFromContainer.bind(this, containerId, history)}>
                <ExploreOutlined fontSize="small" color="primary" />
              </ToggleButton>
            </Tooltip>
          )}
          {type === 'investigation' && (
            <Tooltip title={t('Download as STIX report')}>
              <ToggleButton onClick={handleDownloadAsStixReport.bind(this)}>
                <GetAppOutlined fontSize="small" color="primary" />
              </ToggleButton>
            </Tooltip>
          )}
          {csvData && (
            <Tooltip title={t('Export to CSV')}>
              <ToggleButton onClick={() => this.csvLink.current.link.click()}>
                <FileDelimitedOutline fontSize="small" color="primary" />
              </ToggleButton>
            </Tooltip>
          )}
        </ToggleButtonGroup>
        <Menu
          anchorEl={anchorElImage}
          open={Boolean(anchorElImage)}
          onClose={this.handleCloseImage.bind(this)}
        >
          <MenuItem
            onClick={this.exportImage.bind(
              this,
              domElementId,
              name,
              'dark',
              true,
            )}
          >
            {t('Dark (with background)')}
          </MenuItem>
          <MenuItem
            onClick={this.exportImage.bind(
              this,
              domElementId,
              name,
              'dark',
              false,
            )}
          >
            {t('Dark (without background)')}
          </MenuItem>
          <MenuItem
            onClick={this.exportImage.bind(
              this,
              domElementId,
              name,
              'light',
              true,
            )}
          >
            {t('Light (with background)')}
          </MenuItem>
          <MenuItem
            onClick={this.exportImage.bind(
              this,
              domElementId,
              name,
              'light',
              false,
            )}
          >
            {t('Light (without background)')}
          </MenuItem>
        </Menu>
        <Menu
          anchorEl={anchorElPdf}
          open={Boolean(anchorElPdf)}
          onClose={this.handleClosePdf.bind(this)}
        >
          <MenuItem
            onClick={this.exportPdf.bind(
              this,
              domElementId,
              name,
              'dark',
              true,
            )}
          >
            {t('Dark')}
          </MenuItem>
          <MenuItem
            onClick={this.exportPdf.bind(
              this,
              domElementId,
              name,
              'light',
              true,
            )}
          >
            {t('Light')}
          </MenuItem>
        </Menu>
        <Dialog
          PaperProps={{ elevation: 1 }}
          open={exporting}
          keepMounted={true}
          fullScreen={true}
          classes={{ paper: classes.loader }}
        >
          <Loader />
        </Dialog>
        {csvData && (
          <CSVLink
            filename={csvFileName || `${t('CSV data.')}.csv`}
            ref={this.csvLink}
            data={csvData}
          />
        )}
      </div>
    );
  }
}

export default R.compose(
  inject18n,
  withTheme,
  withRouter,
  withStyles(styles),
)(ExportButtons);
