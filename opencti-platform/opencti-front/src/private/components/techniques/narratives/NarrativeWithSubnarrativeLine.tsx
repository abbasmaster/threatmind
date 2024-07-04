import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { KeyboardArrowRightOutlined } from '@mui/icons-material';
import List from '@mui/material/List';
import { makeStyles } from '@mui/styles';
import { Theme } from '@mui/material/styles/createTheme';
import Skeleton from '@mui/material/Skeleton';
import { ListItemButton } from '@mui/material';
import ItemIcon from '../../../../components/ItemIcon';
import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles<Theme>((theme) => ({
  item: {},
  itemNested: {
    paddingLeft: theme.spacing(4),
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
  name: {
    width: '20%',
    height: 20,
    lineHeight: '20px',
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  description: {
    width: '70%',
    height: 20,
    lineHeight: '20px',
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: '#a5a5a5',
    fontSize: 12,
  },
  goIcon: {
    position: 'absolute',
    right: -10,
  },
}));

interface NarrativeWithSubnarrativeLineProps {
  isSubNarrative?: boolean;
  subNarratives?: any[];
  node: any;
}

const NarrativeWithSubnarrativeLine: FunctionComponent<NarrativeWithSubnarrativeLineProps> = ({ node, subNarratives, isSubNarrative }) => {
  const { t_i18n } = useFormatter();
  const classes = useStyles();

  return (
    <div>
      <ListItemButton
        classes={{ root: isSubNarrative ? classes.itemNested : classes.item }}
        divider
        component={Link}
        to={`/dashboard/techniques/narratives/${node.id}`}
      >
        <ListItemIcon classes={{ root: classes.itemIcon }}>
          <ItemIcon
            type="Narrative"
            size={isSubNarrative ? 'small' : 'medium'}
          />
        </ListItemIcon>
        <ListItemText
          primary={
            <>
              <div className={classes.name}>{node.name}</div>
              <div className={classes.description}>
                {node.description?.length ? node.description : t_i18n('This narrative does not have any description.')}
              </div>
            </>
              }
        />
        <ListItemIcon classes={{ root: classes.goIcon }}>
          <KeyboardArrowRightOutlined />
        </ListItemIcon>
      </ListItemButton>
      {subNarratives && subNarratives.length > 0 && (
      <List style={{ marginTop: 0, padding: 0 }}>
        {subNarratives.map((subNarrative) => (
          <NarrativeWithSubnarrativeLine key={subNarrative.id} node={subNarrative} isSubNarrative={true} />
        ))}
      </List>
      )}
    </div>
  );
};

export const NarrativeWithSubnarrativeLineDummy: FunctionComponent = () => {
  const classes = useStyles();

  return (
    <ListItem classes={{ root: classes.item }} divider>
      <ListItemIcon classes={{ root: classes.itemIcon }}>
        <Skeleton animation="wave" variant="circular" width={30} height={30} />
      </ListItemIcon>
      <ListItemText
        primary={
          <Skeleton animation="wave" variant="rectangular" width="90%" height={20} />
        }
      />
      <ListItemIcon classes={{ root: classes.goIcon }}>
        <KeyboardArrowRightOutlined color="disabled" />
      </ListItemIcon>
    </ListItem>
  );
};

export default NarrativeWithSubnarrativeLine;
