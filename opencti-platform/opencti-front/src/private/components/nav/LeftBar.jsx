import React, { useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createStyles, makeStyles, styled, useTheme } from '@mui/styles';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';
import {
  AccountBalanceOutlined,
  AssignmentOutlined,
  BiotechOutlined,
  BugReportOutlined,
  CasesOutlined,
  ChevronLeft,
  ChevronRight,
  ConstructionOutlined,
  DashboardOutlined,
  DeleteOutlined,
  DescriptionOutlined,
  DiamondOutlined,
  DomainOutlined,
  EventOutlined,
  ExpandLessOutlined,
  ExpandMoreOutlined,
  ExploreOutlined,
  FlagOutlined,
  InsertChartOutlinedOutlined,
  LayersOutlined,
  LocalOfferOutlined,
  MapOutlined,
  PersonOutlined,
  PlaceOutlined,
  PublicOutlined,
  SourceOutlined,
  SpeakerNotesOutlined,
  StorageOutlined,
  StreamOutlined,
  SubjectOutlined,
  SurroundSoundOutlined,
  TaskAltOutlined,
  VisibilityOutlined,
  WebAssetOutlined,
  WifiTetheringOutlined,
  WorkspacesOutlined,
} from '@mui/icons-material';
import {
  AccountMultipleOutline,
  ArchiveOutline,
  Binoculars,
  Biohazard,
  BriefcaseEditOutline,
  BriefcaseEyeOutline,
  BriefcaseRemoveOutline,
  BriefcaseSearchOutline,
  ChessKnight,
  CityVariantOutline,
  CogOutline,
  Database,
  Fire,
  FlaskOutline,
  FolderTableOutline,
  GlobeModel,
  HexagonOutline,
  LaptopAccount,
  LockPattern,
  ProgressWrench,
  ServerNetwork,
  ShieldSearch,
  Timetable,
} from 'mdi-material-ui';
import Popover from '@mui/material/Popover';
import Collapse from '@mui/material/Collapse';
import { useFormatter } from '../../../components/i18n';
import Security from '../../../utils/Security';
import useGranted, {
  EXPLORE,
  INVESTIGATION,
  KNOWLEDGE,
  KNOWLEDGE_KNASKIMPORT,
  KNOWLEDGE_KNUPDATE,
  KNOWLEDGE_KNUPDATE_KNDELETE,
  MODULES,
  SETTINGS_SETPARAMETERS,
  SETTINGS_SECURITYACTIVITY,
  SETTINGS_SETACCESSES,
  SETTINGS_SETLABELS,
  SETTINGS_SETCUSTOMIZATION,
  SETTINGS_SETMARKINGS,
  SETTINGS_FILEINDEXING,
  SETTINGS_SUPPORT,
  CSVMAPPERS,
  VIRTUAL_ORGANIZATION_ADMIN,
  INGESTION,
  INGESTION_SETINGESTIONS,
  TAXIIAPI,
} from '../../../utils/hooks/useGranted';
import { fileUri, MESSAGING$ } from '../../../relay/environment';
import { useHiddenEntities, useIsHiddenEntities } from '../../../utils/hooks/useEntitySettings';
import useAuth from '../../../utils/hooks/useAuth';
import { useSettingsMessagesBannerHeight } from '../settings/settings_messages/SettingsMessagesBanner';
import logoFiligranDark from '../../../static/images/logo_filigran_dark.png';
import logoFiligranLight from '../../../static/images/logo_filigran_light.png';
import logoFiligranTextDark from '../../../static/images/logo_filigran_text_dark.png';
import logoFiligranTextLight from '../../../static/images/logo_filigran_text_light.png';
import useEnterpriseEdition from '../../../utils/hooks/useEnterpriseEdition';
import useDimensions from '../../../utils/hooks/useDimensions';

const SMALL_BAR_WIDTH = 55;
const OPEN_BAR_WIDTH = 180;

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles((theme) => createStyles({
  drawerPaper: {
    width: SMALL_BAR_WIDTH,
    minHeight: '100vh',
    background: 'none',
    overflowX: 'hidden',
  },
  drawerPaperOpen: {
    width: OPEN_BAR_WIDTH,
    minHeight: '100vh',
    background: 'none',
    overflowX: 'hidden',
  },
  menuItemIcon: {
    color: theme.palette.text.primary,
  },
  menuItem: {
    paddingRight: 2,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuHoverItem: {
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuSubItem: {
    paddingLeft: 20,
    height: 25,
    fontWeight: 500,
    fontSize: 12,
  },
  menuItemText: {
    padding: '1px 0 0 15px',
    fontWeight: 1000,
    fontSize: 14,
  },
  menuSubItemText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    padding: '1px 0 0 10px',
    fontWeight: 500,
    fontSize: 12,
  },
  menuCollapseOpen: {
    width: OPEN_BAR_WIDTH,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuCollapse: {
    width: SMALL_BAR_WIDTH,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuLogoOpen: {
    width: OPEN_BAR_WIDTH,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuLogo: {
    width: SMALL_BAR_WIDTH,
    height: 35,
    fontWeight: 500,
    fontSize: 14,
  },
  menuItemSmallText: {
    padding: '1px 0 0 20px',
  },
}));

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.black,
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.black,
  },
}));

const LeftBar = () => {
  const theme = useTheme();
  const location = useLocation();
  const ref = useRef();
  const { t_i18n } = useFormatter();
  const {
    me: { submenu_auto_collapse, submenu_show_icons },
    settings: { platform_whitemark },
  } = useAuth();
  const navigate = useNavigate();
  const isEnterpriseEdition = useEnterpriseEdition();
  const isGrantedToKnowledge = useGranted([KNOWLEDGE]);
  const isGrantedToImport = useGranted([KNOWLEDGE_KNASKIMPORT]);
  const isGrantedToProcessing = useGranted([KNOWLEDGE_KNUPDATE, SETTINGS_SETACCESSES, CSVMAPPERS]);
  const isGrantedToSharing = useGranted([TAXIIAPI]);
  const isGrantedToSettings = useGranted([
    SETTINGS_SETPARAMETERS,
    SETTINGS_SETACCESSES,
    SETTINGS_SETMARKINGS,
    SETTINGS_SETCUSTOMIZATION,
    SETTINGS_SETLABELS,
    SETTINGS_SECURITYACTIVITY,
    SETTINGS_FILEINDEXING,
    SETTINGS_SUPPORT,
  ]);
  const isGrantedToParameters = useGranted([SETTINGS_SETPARAMETERS]);
  const isGrantedToTaxonomies = useGranted([SETTINGS_SETLABELS]);
  const isGrantedToFileIndexing = useGranted([SETTINGS_FILEINDEXING]);
  const isGrantedToSupport = useGranted([SETTINGS_SUPPORT]);
  const isGrantedToIngestion = useGranted([MODULES, INGESTION, INGESTION_SETINGESTIONS]);
  const isOrganizationAdmin = useGranted([VIRTUAL_ORGANIZATION_ADMIN]);
  const isGrantedToCustomization = useGranted([SETTINGS_SETCUSTOMIZATION]);
  const isGrantedToSecurity = useGranted([SETTINGS_SETMARKINGS, SETTINGS_SETACCESSES, VIRTUAL_ORGANIZATION_ADMIN]);
  const isGrantedToAudit = useGranted([SETTINGS_SECURITYACTIVITY]);
  const anchors = {
    analyses: useRef(null),
    cases: useRef(null),
    events: useRef(null),
    observations: useRef(null),
    threats: useRef(null),
    arsenal: useRef(null),
    techniques: useRef(null),
    entities: useRef(null),
    locations: useRef(null),
    dashboards: useRef(null),
    investigations: useRef(null),
    data: useRef(null),
    settings: useRef(null),
  };
  const [selectedMenu, setSelectedMenu] = useState(
    JSON.parse(localStorage.getItem('selectedMenu') ?? '[]'),
  );
  const [navOpen, setNavOpen] = useState(
    localStorage.getItem('navOpen') === 'true',
  );
  const classes = useStyles({ navOpen });
  const addMenuUnique = (menu) => {
    const joined = selectedMenu.concat(menu);
    return joined.filter((value, index, array) => array.indexOf(value) === index);
  };
  const removeMenuUnique = (menu) => {
    return selectedMenu.filter((value) => value !== menu);
  };
  const handleToggle = () => {
    setSelectedMenu([]);
    localStorage.setItem('navOpen', String(!navOpen));
    window.dispatchEvent(new StorageEvent('storage', { key: 'navOpen' }));
    localStorage.setItem('selectedMenu', JSON.stringify([]));
    setNavOpen(!navOpen);
    MESSAGING$.toggleNav.next('toggle');
  };
  const handleSelectedMenuOpen = (menu) => {
    const updatedMenu = (navOpen && submenu_auto_collapse) ? addMenuUnique(menu) : [menu];
    setSelectedMenu(updatedMenu);
  };
  const handleSelectedMenuClose = () => {
    setSelectedMenu([]);
  };
  const handleSelectedMenuToggle = (menu) => {
    let updatedMenu;
    if (submenu_auto_collapse) {
      updatedMenu = selectedMenu.includes(menu) ? [] : [menu];
      setSelectedMenu(updatedMenu);
    } else {
      updatedMenu = selectedMenu.includes(menu)
        ? removeMenuUnique(menu)
        : addMenuUnique(menu);
      setSelectedMenu(updatedMenu);
    }
    localStorage.setItem('selectedMenu', JSON.stringify(updatedMenu));
  };
  const handleGoToPage = (link) => {
    navigate(link);
  };

  const handleExpandIcon = (entity_type) => {
    if (!navOpen) return null;
    if (selectedMenu.includes(entity_type) && location.pathname.includes(`dashboard/${entity_type}`)) {
      return <ExpandLessOutlined color="primary" />;
    } if (selectedMenu.includes(entity_type) && !location.pathname.includes(`dashboard/${entity_type}`)) {
      return <ExpandLessOutlined/>;
    }
    if (location.pathname.includes(`dashboard/${entity_type}`)) {
      return <ExpandMoreOutlined color="primary">;</ExpandMoreOutlined>;
    }
    return <ExpandMoreOutlined />;
  };
  const hiddenEntities = useHiddenEntities();
  const hideAnalyses = useIsHiddenEntities(
    'Report',
    'Grouping',
    'Note',
    'Malware-Analysis',
  );
  const hideEvents = useIsHiddenEntities(
    'stix-sighting-relationship',
    'Incident',
    'Observed-Data',
  );
  const hideObservations = useIsHiddenEntities(
    'Stix-Cyber-Observable',
    'Artifact',
    'Indicator',
    'Infrastructure',
  );
  const hideThreats = useIsHiddenEntities(
    'Threat-Actor',
    'Intrusion-Set',
    'Campaign',
  );
  const hideEntities = useIsHiddenEntities(
    'Sector',
    'Event',
    'Organization',
    'System',
    'Individual',
  );
  const hideCases = useIsHiddenEntities(
    'Case-Incident',
    'Feedback',
    'Case-Rfi',
    'Case-Rft',
    'Task',
  );
  const hideArsenal = useIsHiddenEntities(
    'Malware',
    'Channel',
    'Tool',
    'Vulnerability',
  );
  const hideTechniques = useIsHiddenEntities(
    'Attack-Pattern',
    'Narrative',
    'Course-Of-Action',
    'Data-Component',
    'Data-Source',
  );
  const hideLocations = useIsHiddenEntities(
    'Region',
    'Administrative-Area',
    'Country',
    'City',
    'Position',
  );
  const {
    bannerSettings: { bannerHeightNumber },
  } = useAuth();
  const settingsMessagesBannerHeight = useSettingsMessagesBannerHeight();
  const { dimension } = useDimensions();

  const isMobile = dimension.width < 768;
  const generateSubMenu = (menu, entries) => {
    return navOpen ? (
      <Collapse in={selectedMenu.includes(menu)} timeout="auto" unmountOnExit={true}>
        <MenuList component="nav" disablePadding={true}>
          {entries.filter((entry) => entry.granted !== false && !hiddenEntities.includes(entry.type)).map((entry) => {
            return (
              <StyledTooltip key={entry.label} title={t_i18n(entry.label)} placement="right">
                <MenuItem
                  component={Link}
                  to={entry.link}
                  selected={entry.exact ? location.pathname === entry.link : location.pathname.includes(entry.link)}
                  sx={{
                    color: location.pathname.includes(entry.link.substring(0, entry.link.lastIndexOf('/')))
                      ? theme.palette.primary.main
                      : theme.palette.common.white,
                  }}
                  dense={true}
                  classes={{ root: classes.menuSubItem }}
                >
                  {submenu_show_icons && entry.icon && <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                    {entry.icon}
                  </ListItemIcon>}
                  <ListItemText
                    classes={{ primary: classes.menuSubItemText }}
                    primary={t_i18n(entry.label)}
                  />
                </MenuItem>
              </StyledTooltip>
            );
          })}
        </MenuList>
      </Collapse>
    ) : (
      <Popover
        sx={{ pointerEvents: 'none' }}
        open={selectedMenu.includes(menu)}
        anchorEl={anchors[menu]?.current}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handleSelectedMenuClose}
        disableRestoreFocus={true}
        disableScrollLock={true}
        slotProps={{
          paper: {
            elevation: 1,
            onMouseEnter: () => handleSelectedMenuOpen(menu),
            onMouseLeave: handleSelectedMenuClose,
            sx: {
              pointerEvents: 'auto',
            },
          },
        }}
      >
        <MenuList component="nav">
          {entries.filter((entry) => entry.granted !== false && !hiddenEntities.includes(entry.type)).map((entry) => {
            return (
              <MenuItem
                key={entry.label}
                component={Link}
                to={entry.link}
                selected={entry.exact ? location.pathname === entry.link : location.pathname.includes(entry.link)}
                dense={true}
                classes={{ root: classes.menuHoverItem }}
                onClick={handleSelectedMenuClose}
              >
                {submenu_show_icons && entry.icon && <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {entry.icon}
                </ListItemIcon>}
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t_i18n(entry.label)}
                />
              </MenuItem>
            );
          })}
        </MenuList>
      </Popover>
    );
  };
  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: navOpen ? classes.drawerPaperOpen : classes.drawerPaper,
      }}
      sx={{
        width: navOpen ? 180 : 55,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <div ref={ref}>
        <MenuList
          component="nav"
          style={{ marginTop: bannerHeightNumber + settingsMessagesBannerHeight }}
        >
          <StyledTooltip title={!navOpen && t_i18n('Home')} placement="right">
            <MenuItem
              component={Link}
              to="/dashboard"
              selected={location.pathname === '/dashboard'}
              sx ={{ color: location.pathname === '/dashboard' ? theme.palette.primary.main : theme.palette.common.white }}
              dense={true}
              classes={{ root: classes.menuItem }}
            >
              <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                {location.pathname === '/dashboard' ? <DashboardOutlined color="primary"/> : <DashboardOutlined />}
              </ListItemIcon>
              {navOpen && (
                <ListItemText
                  classes={{ primary: classes.menuItemText }}
                  primary={t_i18n('Home')}
                />
              )}
            </MenuItem>
          </StyledTooltip>
        </MenuList>
        <Divider />
        <Security needs={[KNOWLEDGE]}>
          <MenuList component="nav">
            {!hideAnalyses && (
              <MenuItem
                ref={anchors.analyses}
                selected={!navOpen && location.pathname.includes('/dashboard/analyses')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (isMobile || navOpen) {
                    handleSelectedMenuToggle('analyses');
                  } else {
                    handleGoToPage('/dashboard/analyses');
                  }
                }}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('analyses')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {location.pathname.includes('analyses') ? <AssignmentOutlined color="primary"/> : <AssignmentOutlined />}
                </ListItemIcon>
                {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Analyses')}
                    sx={[
                      {
                        color: location.pathname.includes('/dashboard/analyses')
                          ? theme.palette.primary.main
                          : theme.palette.common.white,
                      },
                    ]}
                  />
                )}
                {handleExpandIcon('analyses')}
              </MenuItem>
            )}
            {!hideAnalyses && generateSubMenu(
              'analyses',
              [
                {
                  type: 'Report',
                  link: '/dashboard/analyses/reports',
                  label: 'Reports',
                  icon: location.pathname.includes('/dashboard/analyses') ? <DescriptionOutlined fontSize="small" color="primary"/> : <DescriptionOutlined fontSize="small" />,
                },
                {
                  type: 'Grouping',
                  link: '/dashboard/analyses/groupings',
                  label: 'Groupings',
                  icon: location.pathname.includes('/dashboard/analyses') ? <WorkspacesOutlined fontSize="small" color="primary"/> : <WorkspacesOutlined fontSize="small" />,
                },
                {
                  type: 'Malware-Analysis',
                  link: '/dashboard/analyses/malware_analyses',
                  label: 'Malware analyses',
                  icon: location.pathname.includes('/dashboard/analyses') ? <BiotechOutlined fontSize="small" color="primary" /> : <BiotechOutlined fontSize="small" />,
                },
                {
                  type: 'Note',
                  link: '/dashboard/analyses/notes',
                  label: 'Notes',
                  icon: location.pathname.includes('/dashboard/analyses') ? <SubjectOutlined fontSize="inherit" color="primary" /> : <SubjectOutlined fontSize="inherit" />,
                },
                {
                  type: 'External-Reference',
                  link: '/dashboard/analyses/external_references',
                  label: 'External references',
                  icon: location.pathname.includes('/dashboard/analyses') ? <LocalOfferOutlined fontSize="small" color="primary" /> : <LocalOfferOutlined fontSize="small" />,
                },
              ],
            )}
            {!hideCases && (
              <MenuItem
                ref={anchors.cases}
                selected={!navOpen && location.pathname.includes('/dashboard/cases')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('cases') : handleGoToPage('/dashboard/cases'))}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('cases')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {location.pathname.includes('cases') ? <CasesOutlined color="primary"/> : <CasesOutlined />}
                </ListItemIcon>
                {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Cases')}
                    sx={[
                      {
                        color: location.pathname.includes('/dashboard/cases')
                          ? theme.palette.primary.main
                          : theme.palette.common.white,
                      },
                    ]}
                  />
                )}
                {handleExpandIcon('cases')}
              </MenuItem>
            )}
            {!hideCases && generateSubMenu(
              'cases',
              [
                {
                  type: 'Case-Incident',
                  link: '/dashboard/cases/incidents',
                  label: 'Incident responses',
                  icon: location.pathname.includes('/dashboard/cases') ? <BriefcaseEyeOutline fontSize="small" color="primary"/> : <BriefcaseEyeOutline fontSize="small" />,
                },
                {
                  type: 'Case-Rfi',
                  link: '/dashboard/cases/rfis',
                  label: 'Requests for information',
                  icon: location.pathname.includes('/dashboard/cases') ? <BriefcaseSearchOutline fontSize="small" color="primary"/> : <BriefcaseSearchOutline fontSize="small" />,
                },
                {
                  type: 'Case-Rft',
                  link: '/dashboard/cases/rfts',
                  label: 'Requests for takedown',
                  icon: location.pathname.includes('/dashboard/cases') ? <BriefcaseRemoveOutline fontSize="small" color="primary"/> : <BriefcaseRemoveOutline fontsize="small" />,
                },
                {
                  type: 'Task',
                  link: '/dashboard/cases/tasks',
                  label: 'Tasks',
                  icon: location.pathname.includes('/dashboard/cases') ? <TaskAltOutlined fontSize="small" color="primary"/> : <TaskAltOutlined fontSize="small" />,
                },
                {
                  type: 'Feedback',
                  link: '/dashboard/cases/feedbacks',
                  label: 'Feedbacks',
                  icon: location.pathname.includes('/dashboard/cases') ? <BriefcaseEditOutline fontSize="small" color="primary"/> : <BriefcaseEditOutline fontSize="small" />,
                },
              ],
            )}
            {!hideEvents && (
              <MenuItem
                ref={anchors.events}
                selected={!navOpen && location.pathname.includes('/dashboard/events')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('events') : handleGoToPage('/dashboard/events'))}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('events')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {location.pathname.includes('dashboard/events') ? <Timetable color="primary"/> : <Timetable /> }
                </ListItemIcon>
                {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Events')}
                    sx={[
                      {
                        color: location.pathname.includes('/dashboard/events')
                          ? theme.palette.primary.main
                          : theme.palette.common.white,
                      },
                    ]}
                  />
                )}
                {handleExpandIcon('events')}
              </MenuItem>
            )}
            {!hideEvents && generateSubMenu(
              'events',
              [
                {
                  type: 'Incident',
                  link: '/dashboard/events/incidents',
                  label: 'Incidents',
                  icon: location.pathname.includes('/dashboard/events') ? <Fire fontSize="small" color="primary"/> : <Fire fontSize="small" />,
                },
                {
                  type: 'stix-sighting-relationship',
                  link: '/dashboard/events/sightings',
                  label: 'Sightings',
                  icon: location.pathname.includes('/dashboard/events') ? <VisibilityOutlined fontSize="small" color="primary"/> : <VisibilityOutlined fontSize="small" />,
                },
                {
                  type: 'Observed-Data',
                  link: '/dashboard/events/observed_data',
                  label: 'Observed datas',
                  icon: location.pathname.includes('/dashboard/events') ? <WifiTetheringOutlined fontSize="small" color="primary"/> : <WifiTetheringOutlined fontSize="small" />,
                },
              ],
            )}
            {!hideObservations && (
              <MenuItem
                ref={anchors.observations}
                selected={!navOpen && location.pathname.includes('/dashboard/observations')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('observations') : handleGoToPage('/dashboard/observations'))}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('observations')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {location.pathname.includes('observations') ? <Binoculars color="primary"/> : <Binoculars />}
                </ListItemIcon>
                {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Observations')}
                    sx={[
                      {
                        color: location.pathname.includes('/dashboard/observations')
                          ? theme.palette.primary.main
                          : theme.palette.common.white,
                      },
                    ]}
                  />
                )}
                {handleExpandIcon('observations')}
              </MenuItem>
            )}
            {!hideObservations && generateSubMenu(
              'observations',
              [
                {
                  type: 'Stix-Cyber-Observable',
                  link: '/dashboard/observations/observables',
                  label: 'Observables',
                  icon: location.pathname.includes('/dashboard/observations') ? <HexagonOutline color="primary" fontSize="small" /> : <HexagonOutline fontSize="small" />,
                },
                {
                  type: 'Artifact',
                  link: '/dashboard/observations/artifacts',
                  label: 'Artifacts',
                  icon: location.pathname.includes('/dashboard/observations') ? <ArchiveOutline color="primary" fontSize="small"/> : <ArchiveOutline fontSize="small"/>,
                },
                {
                  type: 'Indicator',
                  link: '/dashboard/observations/indicators',
                  label: 'Indicators',
                  icon: location.pathname.includes('/dashboard/observations') ? <ShieldSearch color="primary" fontSize="small"/> : <ShieldSearch fontSize="small"/>,
                },
                {
                  type: 'Infrastructure',
                  link: '/dashboard/observations/infrastructures',
                  label: 'Infrastructures',
                  icon: location.pathname.includes('/dashboard/observations') ? <ServerNetwork color="primary" fontSize="small" /> : <ServerNetwork fontSize="small" />,
                },
              ],
            )}
          </MenuList>
          <Divider />
          <MenuList component="nav">
            {!hideThreats && (
              <MenuItem
                ref={anchors.threats}
                selected={!navOpen && location.pathname.includes('/dashboard/threats')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('threats') : handleGoToPage('/dashboard/threats'))}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('threats')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {location.pathname.includes('threats') ? <FlaskOutline color="primary"/> : <FlaskOutline /> }
                </ListItemIcon>
                {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Threats')}
                    sx={[
                      {
                        color: location.pathname.includes('/dashboard/threats')
                          ? theme.palette.primary.main
                          : theme.palette.common.white,
                      },
                    ]}
                  />
                )}
                {handleExpandIcon('threats')}
              </MenuItem>
            )}
            {!hideThreats && generateSubMenu(
              'threats',
              [
                {
                  type: 'Threat-Actor-Group',
                  link: '/dashboard/threats/threat_actors_group',
                  label: 'Threat actors (group)',
                  icon: location.pathname.includes('/dashboard/threats') ? <AccountMultipleOutline fontSize="small" color="primary"/> : <AccountMultipleOutline fontsize="small" />,
                },
                {
                  type: 'Threat-Actor-Individual',
                  link: '/dashboard/threats/threat_actors_individual',
                  label: 'Threat actors (individual)',
                  icon: location.pathname.includes('/dashboard/threats') ? <LaptopAccount fontSize="small" color="primary"/> : <LaptopAccount fontsize="small" />,
                },
                {
                  type: 'Intrusion-Set',
                  link: '/dashboard/threats/intrusion_sets',
                  label: 'Intrusion sets',
                  icon: location.pathname.includes('/dashboard/threats') ? <DiamondOutlined fontSize="small" color="primary"/> : <DiamondOutlined fontsize="small" />,
                },
                {
                  type: 'Campaign',
                  link: '/dashboard/threats/campaigns',
                  label: 'Campaigns',
                  icon: location.pathname.includes('/dashboard/threats') ? <ChessKnight fontSize="small" color="primary"/> : <ChessKnight fontsize="small"/>,
                },
              ],
            )}
            {!hideArsenal && (
              <MenuItem
                ref={anchors.arsenal}
                selected={!navOpen && location.pathname.includes('/dashboard/arsenal')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('arsenal') : handleGoToPage('/dashboard/arsenal'))}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('arsenal')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {location.pathname.includes('arsenal') ? <LayersOutlined color="primary"/> : <LayersOutlined /> }
                </ListItemIcon>
                {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Arsenal')}
                    sx={[
                      {
                        color: location.pathname.includes('/dashboard/arsenal')
                          ? theme.palette.primary.main
                          : theme.palette.common.white,
                      },
                    ]}
                  />
                )}
                {handleExpandIcon('arsenal')}
              </MenuItem>
            )}
            {!hideArsenal && generateSubMenu(
              'arsenal',
              [
                {
                  type: 'Malware',
                  link: '/dashboard/arsenal/malwares',
                  label: 'Malwares',
                  icon: location.pathname.includes('/dashboard/arsenal') ? <Biohazard fontSize="small" color="primary"/> : <Biohazard fontSize="small" />,
                },
                {
                  type: 'Channel',
                  link: '/dashboard/arsenal/channels',
                  label: 'Channels',
                  icon: location.pathname.includes('/dashboard/arsenal') ? <SurroundSoundOutlined fontSize="small" color="primary"/> : <SurroundSoundOutlined fontSize="small" />,
                },
                {
                  type: 'Tool',
                  link: '/dashboard/arsenal/tools',
                  label: 'Tools',
                  icon: location.pathname.includes('/dashboard/arsenal') ? <WebAssetOutlined fontSize="small" color="primary"/> : <WebAssetOutlined fontSize="small" />,
                },
                {
                  type: 'Vulnerability',
                  link: '/dashboard/arsenal/vulnerabilities',
                  label: 'Vulnerabilities',
                  icon: location.pathname.includes('/dashboard/arsenal') ? <BugReportOutlined fontSize="small" color="primary"/> : <BugReportOutlined fontSize="small" />,
                },
              ],
            )}
            {!hideTechniques && (
              <MenuItem
                ref={anchors.techniques}
                selected={!navOpen && location.pathname.includes('/dashboard/techniques')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('techniques') : handleGoToPage('/dashboard/techniques'))}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('techniques')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {location.pathname.includes('techniques') ? <ConstructionOutlined color="primary"/> : <ConstructionOutlined /> }
                </ListItemIcon>
                {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Techniques')}
                    sx={[
                      {
                        color: location.pathname.includes('/dashboard/techniques')
                          ? theme.palette.primary.main
                          : theme.palette.common.white,
                      },
                    ]}
                  />
                )}
                {handleExpandIcon('techniques')}
              </MenuItem>
            )}
            {!hideTechniques && generateSubMenu(
              'techniques',
              [
                {
                  type: 'Attack-Pattern',
                  link: '/dashboard/techniques/attack_patterns',
                  label: 'Attack patterns',
                  icon: location.pathname.includes('/dashboard/techniques') ? <LockPattern fontSize="small" color="primary"/> : <LockPattern fontSize="small" />,
                },
                {
                  type: 'Narrative',
                  link: '/dashboard/techniques/narratives',
                  label: 'Narratives',
                  icon: location.pathname.includes('/dashboard/techniques') ? <SpeakerNotesOutlined fontSize="small" color="primary"/> : <SpeakerNotesOutlined fontSize="small" />,
                },
                {
                  type: 'Course-Of-Action',
                  link: '/dashboard/techniques/courses_of_action',
                  label: 'Courses of action',
                  icon: location.pathname.includes('/dashboard/techniques') ? <ProgressWrench fontSize="small" color="primary"/> : <ProgressWrench fontSize="small" />,
                },
                {
                  type: 'Data-Component',
                  link: '/dashboard/techniques/data_components',
                  label: 'Data components',
                  icon: location.pathname.includes('/dashboard/techniques') ? <SourceOutlined fontSize="small" color="primary"/> : <SourceOutlined fontSize="small" />,
                },
                {
                  type: 'Data-Source',
                  link: '/dashboard/techniques/data_sources',
                  label: 'Data sources',
                  icon: location.pathname.includes('/dashboard/techniques') ? <StreamOutlined fontSize="small" color="primary"/> : <StreamOutlined fontSize="small" />,
                },
              ],
            )}
            {!hideEntities && (
              <MenuItem
                ref={anchors.entities}
                selected={!navOpen && location.pathname.includes('/dashboard/entities')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('entities') : handleGoToPage('/dashboard/entities'))}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('entities')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {location.pathname.includes('dashboard/entities') ? <FolderTableOutline color="primary"/> : <FolderTableOutline />}
                </ListItemIcon>
                {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Entities')}
                    sx={[
                      {
                        color: location.pathname.includes('/dashboard/entities')
                          ? theme.palette.primary.main
                          : theme.palette.common.white,
                      },
                    ]}
                  />
                )}
                {handleExpandIcon('entities')}
              </MenuItem>
            )}
            {!hideEntities && generateSubMenu(
              'entities',
              [
                {
                  type: 'Sector',
                  link: '/dashboard/entities/sectors',
                  label: 'Sectors',
                  icon: location.pathname.includes('/dashboard/entities') ? <DomainOutlined fontSize="small" color="primary"/> : <DomainOutlined fontSize="small"/>,
                },
                {
                  type: 'Event',
                  link: '/dashboard/entities/events',
                  label: 'Events',
                  icon: location.pathname.includes('/dashboard/entities') ? <EventOutlined fontSize="small" color="primary"/> : <EventOutlined fontSize="small" />,
                },
                {
                  type: 'Organization',
                  link: '/dashboard/entities/organizations',
                  label: 'Organizations',
                  icon: location.pathname.includes('/dashboard/entities') ? <AccountBalanceOutlined fontSize="small" color="primary" /> : <AccountBalanceOutlined fontSize="small"/>,
                },
                {
                  type: 'System',
                  link: '/dashboard/entities/systems',
                  label: 'Systems',
                  icon: location.pathname.includes('/dashboard/entities') ? <StorageOutlined fontSize="small" color="primary" /> : <StorageOutlined fontSize="small" />,
                },
                {
                  type: 'Individual',
                  link: '/dashboard/entities/individuals',
                  label: 'Individuals',
                  icon: location.pathname.includes('/dashboard/entities') ? <PersonOutlined fontSize="small" color="primary" /> : <PersonOutlined fontSize="small" />,
                },
              ],
            )}
            {!hideLocations && (
              <MenuItem
                ref={anchors.locations}
                selected={!navOpen && location.pathname.includes('/dashboard/locations')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('locations') : handleGoToPage('/dashboard/locations'))}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('locations')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {location.pathname.includes('locations') ? <GlobeModel color="primary"/> : <GlobeModel /> }
                </ListItemIcon>
                {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Locations')}
                    sx={[
                      {
                        color: location.pathname.includes('/dashboard/locations')
                          ? theme.palette.primary.main
                          : theme.palette.common.white,
                      },
                    ]}
                  />
                )}
                {handleExpandIcon('locations')}
              </MenuItem>
            )}
            {!hideLocations && generateSubMenu(
              'locations',
              [
                {
                  type: 'Region',
                  link: '/dashboard/locations/regions',
                  label: 'Regions',
                  icon: location.pathname.includes('/dashboard/locations') ? <PublicOutlined fontSize="small" color="primary" /> : <PublicOutlined fontSize="small" />,
                },
                {
                  type: 'Country',
                  link: '/dashboard/locations/countries',
                  label: 'Countries',
                  icon: location.pathname.includes('/dashboard/locations') ? <FlagOutlined fontSize="small" color="primary"/> : <FlagOutlined fontSize="small" />,
                },
                {
                  type: 'Administrative-Area',
                  link: '/dashboard/locations/administrative_areas',
                  label: 'Administrative areas',
                  icon: location.pathname.includes('/dashboard/locations') ? <MapOutlined fontSize="small" color="primary" /> : <MapOutlined fontSize="small" />,
                },
                {
                  type: 'City',
                  link: '/dashboard/locations/cities',
                  label: 'Cities',
                  icon: location.pathname.includes('/dashboard/locations') ? <CityVariantOutline fontSize="small" color="primary" /> : <CityVariantOutline fontSize="small" />,
                },
                {
                  type: 'Position',
                  link: '/dashboard/locations/positions',
                  label: 'Positions',
                  icon: location.pathname.includes('/dashboard/locations') ? <PlaceOutlined fontSize="small" color="primary" /> : <PlaceOutlined fontSize="small" />,
                },
              ],
            )}
          </MenuList>
        </Security>
        <Security needs={[EXPLORE, INVESTIGATION, MODULES, KNOWLEDGE, TAXIIAPI, CSVMAPPERS, INGESTION]}>
          <Divider />
          <MenuList component="nav">
            <Security needs={[EXPLORE]}>
              <StyledTooltip title={!navOpen && t_i18n('Dashboards')} placement="right">
                <MenuItem
                  component={Link}
                  to="/dashboard/workspaces/dashboards"
                  selected={!navOpen && location.pathname.includes('/dashboard/workspaces/dashboards')}
                  dense={true}
                  classes={{ root: classes.menuItem }}
                >
                  <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                    {location.pathname.includes('/dashboard/workspaces/dashboards') ? <InsertChartOutlinedOutlined color="primary"/> : <InsertChartOutlinedOutlined /> }
                  </ListItemIcon>
                  {navOpen && (
                    <ListItemText
                      classes={{ primary: classes.menuItemText }}
                      primary={t_i18n('Dashboards')}
                      sx={{ color: location.pathname === '/dashboard/workspaces/dashboards' ? theme.palette.primary.main : theme.palette.common.white }}
                    />
                  )}
                </MenuItem>
              </StyledTooltip>
            </Security>
            <Security needs={[INVESTIGATION]}>
              <StyledTooltip title={!navOpen && t_i18n('Investigations')} placement="right">
                <MenuItem
                  component={Link}
                  to="/dashboard/workspaces/investigations"
                  selected={!navOpen && location.pathname.includes('/dashboard/workspaces/investigations')}
                  dense={true}
                  classes={{ root: classes.menuItem }}
                >
                  <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                    {location.pathname.includes('/dashboard/workspaces/investigations') ? <ExploreOutlined color="primary"/> : <ExploreOutlined />}
                  </ListItemIcon>
                  {navOpen && (
                    <ListItemText
                      classes={{ primary: classes.menuItemText }}
                      primary={t_i18n('Investigations')}
                      sx={{ color: location.pathname === '/dashboard/workspaces/investigations' ? theme.palette.primary.main : theme.palette.common.white }}
                    />
                  )}
                </MenuItem>
              </StyledTooltip>
            </Security>
            <Security needs={[MODULES, KNOWLEDGE, TAXIIAPI, CSVMAPPERS, INGESTION]}>
              <MenuItem
                ref={anchors.data}
                selected={!navOpen && location.pathname.includes('/dashboard/data')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('data') : handleGoToPage('/dashboard/data'))}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('data')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {location.pathname.includes('data') ? <Database color="primary"/> : <Database />}
                </ListItemIcon>
                {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Data')}
                    sx={[
                      {
                        color: location.pathname.includes('/dashboard/data')
                          ? theme.palette.primary.main
                          : theme.palette.common.white,
                      },
                    ]}
                  />
                )}
                {handleExpandIcon('data')}
              </MenuItem>
              {generateSubMenu(
                'data',
                [
                  { granted: isGrantedToKnowledge, link: '/dashboard/data/entities', label: 'Entities' },
                  { granted: isGrantedToKnowledge, link: '/dashboard/data/relationships', label: 'Relationships' },
                  { granted: isGrantedToIngestion, link: '/dashboard/data/ingestion', label: 'Ingestion' },
                  { granted: isGrantedToImport, link: '/dashboard/data/import', label: 'Import' },
                  { granted: isGrantedToProcessing, link: '/dashboard/data/processing', label: 'Processing' },
                  { granted: isGrantedToSharing, link: '/dashboard/data/sharing', label: 'Data sharing' },
                ],
              )}
            </Security>
            <Security needs={[KNOWLEDGE_KNUPDATE_KNDELETE]}>
              <StyledTooltip title={!navOpen && t_i18n('Trash')} placement="right">
                <MenuItem
                  component={Link}
                  to="/dashboard/trash"
                  selected={!navOpen && location.pathname.includes('/dashboard/trash')}
                  dense={true}
                  classes={{ root: classes.menuItem }}
                >
                  <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                    {location.pathname.includes('/dashboard/trash') ? <DeleteOutlined color="primary"/> : <DeleteOutlined /> }
                  </ListItemIcon>
                  {navOpen && (
                    <ListItemText
                      classes={{ primary: classes.menuItemText }}
                      primary={t_i18n('Trash')}
                      sx={{ color: location.pathname === '/dashboard/trash' ? theme.palette.primary.main : theme.palette.common.white }}
                    />
                  )}
                </MenuItem>
              </StyledTooltip>
            </Security>
          </MenuList>
        </Security>
        <Security needs={[
          VIRTUAL_ORGANIZATION_ADMIN,
          SETTINGS_SETPARAMETERS,
          SETTINGS_SETACCESSES,
          SETTINGS_SETMARKINGS,
          SETTINGS_SETCUSTOMIZATION,
          SETTINGS_SETLABELS,
          SETTINGS_SECURITYACTIVITY,
          SETTINGS_FILEINDEXING,
          SETTINGS_SUPPORT,
        ]}
        >
          <Divider />
          <MenuList component="nav">
            {isOrganizationAdmin && !isGrantedToSettings ? (
              <StyledTooltip
                title={!navOpen && t_i18n('Settings')}
                placement="right"
              >
                <MenuItem
                  component={Link}
                  to="/dashboard/settings/accesses/organizations"
                  selected={!navOpen && location.pathname.includes('/dashboard/settings')}
                  dense={true}
                  classes={{ root: classes.menuItem }}
                >
                  <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                    {location.pathname.includes('/dashboard/settings') ? <CogOutline color="primary"/> : <CogOutline /> }
                  </ListItemIcon>
                  {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Settings')}
                  />
                  )}
                </MenuItem>
              </StyledTooltip>
            ) : (
              <MenuItem
                ref={anchors.settings}
                selected={!navOpen && location.pathname.includes('/dashboard/settings')}
                dense={true}
                classes={{ root: classes.menuItem }}
                onClick={() => (isMobile || navOpen ? handleSelectedMenuToggle('settings') : handleGoToPage('/dashboard/settings'))}
                onMouseEnter={() => !navOpen && handleSelectedMenuOpen('settings')}
                onMouseLeave={() => !navOpen && handleSelectedMenuClose()}
              >
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  {location.pathname.includes('settings') ? <CogOutline color="primary"/> : <CogOutline /> }
                </ListItemIcon>
                {navOpen && (
                  <ListItemText
                    classes={{ primary: classes.menuItemText }}
                    primary={t_i18n('Settings')}
                    sx={[
                      {
                        color: location.pathname.includes('/dashboard/settings') && selectedMenu.includes('settings')
                          ? theme.palette.primary.main
                          : theme.palette.common.white,
                      },
                    ]}
                  />
                )}
                {handleExpandIcon('settings')}
              </MenuItem>
            )}
            {isGrantedToSettings && generateSubMenu(
              'settings',
              [
                { granted: isGrantedToParameters, link: '/dashboard/settings/', label: 'Parameters', exact: true },
                { granted: isGrantedToSecurity, link: '/dashboard/settings/accesses', label: 'Security' },
                { granted: isGrantedToCustomization, link: '/dashboard/settings/customization', label: 'Customization' },
                { granted: isGrantedToTaxonomies, link: '/dashboard/settings/vocabularies', label: 'Taxonomies' },
                { granted: isGrantedToAudit, link: '/dashboard/settings/activity', label: 'Activity' },
                { granted: isGrantedToFileIndexing, link: '/dashboard/settings/file_indexing', label: 'File indexing' },
                { granted: isGrantedToSupport, link: '/dashboard/settings/support', label: 'Support' },
              ],
            )}
          </MenuList>
        </Security>
      </div>
      <div style={{ marginTop: 'auto' }}>
        <MenuList component="nav">
          {(!platform_whitemark || !isEnterpriseEdition) && (
            <MenuItem
              dense={true}
              classes={{
                root: navOpen ? classes.menuLogoOpen : classes.menuLogo,
              }}
              onClick={() => window.open('https://filigran.io/', '_blank')}
            >
              <Tooltip title={'By Filigran'}>
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
                  <img
                    src={fileUri(theme.palette.mode === 'dark' ? logoFiligranDark : logoFiligranLight)}
                    alt="logo"
                    width={20}
                  />
                </ListItemIcon>
              </Tooltip>
              {navOpen && (
                <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20, padding: '4px 0 0 15px' }}>
                  <img
                    src={fileUri(theme.palette.mode === 'dark' ? logoFiligranTextDark : logoFiligranTextLight)}
                    alt="logo"
                    width={50}
                  />
                </ListItemIcon>
              )}
            </MenuItem>
          )}
          <MenuItem
            dense={true}
            style={{ marginBottom: bannerHeightNumber }}
            classes={{
              root: navOpen ? classes.menuCollapseOpen : classes.menuCollapse,
            }}
            onClick={() => handleToggle()}
          >
            <ListItemIcon classes={{ root: classes.menuItemIcon }} style={{ minWidth: 20 }}>
              {navOpen ? <ChevronLeft /> : <ChevronRight />}
            </ListItemIcon>
            {navOpen && (
              <ListItemText
                classes={{ primary: classes.menuItemText }}
                primary={t_i18n('Collapse')}
              />
            )}
          </MenuItem>
        </MenuList>
      </div>
    </Drawer>
  );
};

export default LeftBar;
