import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

import { Market, MARKETS_LIST } from '@project-serum/serum';
import { Keypair } from '@safecoin/web3.js';
import { useWallet } from '../utils/wallet';

import { red } from '@material-ui/core/colors';

import SERUM from '../KEYS/SERUM-2.json';
let serum = Keypair.fromSecretKey(Buffer.from(SERUM));

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
    color: 'white',
    backgroundColor: 'red',
  },
  checkbtn: {
    marginLeft: theme.spacing(1),
    color: 'white',
    backgroundColor: 'green',
  },
  menuItemIcon: {
    minWidth: 32,
  },
}));

function CheckWallet(props) {
  const classes = useStyles();

  if (props.target != null) {
    return (
      <Button color="inherit" className={classes.checkbtn}>
        CheckWallet
      </Button>
    );
  } else {
    return <></>;
  }
}

function MarketInfo(props) {
  if (props.market != null) {
    let market = props.market;
    let targetTokAddr = market.baseMintAddress;
    let denomAddr = market.quoteMintAddress;
    return (
      <>
        <table>
          <tr>
            <td>Target Token Mint:</td>
            <td>{targetTokAddr.toBase58()}</td>
            <td>
              <CheckWallet target={targetTokAddr} />
            </td>
          </tr>
          <tr>
            <td>Denomination Mint:</td>
            <td>{denomAddr.toBase58()}</td>
            <td>
              <CheckWallet target={denomAddr} />
            </td>
          </tr>
        </table>{' '}
      </>
    );
  } else {
    return <></>;
  }
}

export default function MarketLoadButton() {
  const classes = useStyles();
  const wallet = useWallet();

  const [market, setMarket] = useState(null);

  const loadMarket = async () => {
    let market = await Market.load(
      wallet.connection,
      marketAddr,
      {},
      serum.publicKey,
    );
    setMarket(market);
    console.log(market);
  };

  const [marketAddr, setMarketAddr] = useState(MARKETS_LIST[0].address);
  return (
    <>
      <TextField
        label="Market Address"
        fullWidth
        variant="outlined"
        margin="normal"
        value={marketAddr}
        onChange={(e) => setMarketAddr(e)}
      />
      <Button
        color="inherit"
        onClick={(e) => loadMarket()}
        className={classes.button}
      >
        Load Market
      </Button>
      <MarketInfo market={market} />
    </>
  );
}
