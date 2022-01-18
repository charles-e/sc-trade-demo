import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import SERUM from '../KEYS/SERUM-2.json';
import { Market, MARKETS_LIST } from '@project-serum/serum';
import { Keypair } from '@safecoin/web3.js';
import { useWallet } from '../utils/wallet';
import { Button } from '@material-ui/core';
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

export default function OrderTable() {
  const classes = useStyles();
  const wallet = useWallet();
  const connection = wallet.connection;
  const MARKET = MARKETS_LIST[0].address;
  const [, setMarket] = useState(null);
  const [bidRows, setBidRows] = useState([]);
  const [askRows, setAskRows] = useState([]);
  const [marketAddr, setMarketAddr] = useState(MARKETS_LIST[0].address);

  const loadMarket = async () => {
    let market = await Market.load(
      wallet.connection,
      marketAddr,
      {},
      serum.publicKey,
    );
    setMarket(market);
    console.log(market);
    let bRows = await getBidRows(market);
    setBidRows(bRows);
    let aRows = await getAskRows(market);
    setAskRows(aRows);
  };

  console.log('market ok');
  let getAskRows = async (market) => {
    let ret = [];
    const askBook = await market.loadAsks(connection);
    for (const obItem of askBook.items()) {
      console.log(obItem.orderId.toString());
      let content = (
        <tr key={ret.length}>
          <td>{obItem.clientId.toString()}</td>
          <td>{obItem.price}</td>
          <td>{obItem.size}</td>
        </tr>
      );
      ret.push(content);
    }
    return ret;
  };
  let getBidRows = async (market) => {
    let ret = [];
    const bidBook = await market.loadBids(connection);

    for (const obItem of bidBook.items()) {
      console.log(obItem);
      let content = (
        <tr key={ret.length}>
          <td>{obItem.clientId.toString()}</td>
          <td>{obItem.price}</td>
          <td>{obItem.size}</td>
        </tr>
      );
      ret.push(content);
    }
    return ret;
  };
  return (
    <div>
      <Button
        color="inherit"
        onClick={(e) => loadMarket()}
        className={classes.button}
      >
        Load
      </Button>
      <h3>OrderBook</h3>
      <h4>Bids</h4>
      <table>
        <thead>
          <tr>
            <td>Order Id</td>
            <td>Price</td>
            <td>Size</td>
          </tr>
        </thead>
        <tbody>{bidRows}</tbody>
      </table>
      <h4>Asks</h4>
      <table>
        <thead>
          <tr>
            <td>Order Id</td>
            <td>Price</td>
            <td>Size</td>
          </tr>
        </thead>
        <tbody>{askRows}</tbody>
      </table>
    </div>
  );
}
