import React, { useState } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { useConnectionConfig } from '../utils/connection';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { clusterApiUrl } from '@safecoin/web3.js';
import { useWalletSelector } from '../utils/wallet';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CheckIcon from '@material-ui/icons/Check';
import AddIcon from '@material-ui/icons/Add';
import AccountIcon from '@material-ui/icons/AccountCircle';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import SolanaIcon from './SolanaIcon';
import CodeIcon from '@material-ui/icons/Code';
import Tooltip from '@material-ui/core/Tooltip';

const useStyles = makeStyles((theme) => ({
  content: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  title: {
    flexGrow: 1,
  },
  button: {
    marginLeft: theme.spacing(1),
  },
  menuItemIcon: {
    minWidth: 32,
  },
}));

export default function NavigationFrame({ children }) {
  const classes = useStyles();
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title} component="h1">
            Safecoin Market Demo
          </Typography>
          <WalletSelector />
          <NetworkSelector />
          <Hidden xsDown>
            <Button
              component="a"
              color="inherit"
              target="_blank"
              rel="noopener"
              href="https://github.com/serum-foundation/spl-token-wallet"
              className={classes.button}
            >
              Source
            </Button>
          </Hidden>
          <Hidden smUp>
            <Tooltip title="View Source" arrow>
              <IconButton
                component="a"
                color="inherit"
                target="_blank"
                rel="noopener"
                href="https://github.com/serum-foundation/spl-token-wallet"
              >
                <CodeIcon />
              </IconButton>
            </Tooltip>
          </Hidden>
        </Toolbar>
      </AppBar>
      <main className={classes.content}>{children}</main>
    </>
  );
}

function NetworkSelector() {
  const { endpoint, setEndpoint } = useConnectionConfig();
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();

  const networks = [clusterApiUrl('devnet')];

  const networkLabels = {
    [clusterApiUrl('devnet')]: 'Devnet',
  };

  return (
    <>
      <Hidden xsDown>
        <Button
          color="inherit"
          onClick={(e) => setAnchorEl(e.target)}
          className={classes.button}
        >
          {networkLabels[endpoint] ?? 'Network'}
        </Button>
      </Hidden>
      <Hidden smUp>
        <Tooltip title="Select Network" arrow>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.target)}>
            <SolanaIcon />
          </IconButton>
        </Tooltip>
      </Hidden>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        getContentAnchorEl={null}
      >
        {networks.map((network) => (
          <MenuItem
            key={network}
            onClick={() => {
              setAnchorEl(null);
              setEndpoint(network);
            }}
            selected={network === endpoint}
          >
            <ListItemIcon className={classes.menuItemIcon}>
              {network === endpoint ? <CheckIcon fontSize="small" /> : null}
            </ListItemIcon>
            {network}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function WalletSelector() {
  const { addresses, walletIndex, setWalletIndex } = useWalletSelector();
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();

  if (addresses.length === 0) {
    return null;
  }

  return (
    <>
      <Hidden xsDown>
        <Button
          color="inherit"
          onClick={(e) => setAnchorEl(e.target)}
          className={classes.button}
        >
          Account
        </Button>
      </Hidden>
      <Hidden smUp>
        <Tooltip title="Select Account" arrow>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.target)}>
            <AccountIcon />
          </IconButton>
        </Tooltip>
      </Hidden>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        getContentAnchorEl={null}
      >
        {addresses.map((address, index) => (
          <MenuItem
            key={address.toBase58()}
            onClick={() => {
              setAnchorEl(null);
              setWalletIndex(index);
            }}
            selected={index === walletIndex}
          >
            <ListItemIcon className={classes.menuItemIcon}>
              {index === walletIndex ? <CheckIcon fontSize="small" /> : null}
            </ListItemIcon>
            {address.toBase58()}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setWalletIndex(addresses.length);
          }}
        >
          <ListItemIcon className={classes.menuItemIcon}>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          Create Account
        </MenuItem>
      </Menu>
    </>
  );
}
