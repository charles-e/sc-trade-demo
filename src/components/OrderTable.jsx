import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import SERUM from '../KEYS/SERUM-2.json';
import { Market, MARKETS_LIST } from '@project-serum/serumx';
import { Keypair } from '@safecoin/web3.js';
import { useWallet } from '../utils/wallet';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
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

export default function OrderTable(props) {
  const classes = useStyles();
  const wallet = useWallet();
  const connection = wallet.connection;
  const [bidRows, setBidRows] = useState([]);
  const [askRows, setAskRows] = useState([]);
  const market = props.market;

  useEffect(() => {
    let getAskRows = async () => {
      let ret = [];
      if (market != null) {
        const askBook = await market.loadAsks(connection);

        for (const obItem of askBook.items()) {
          let content = (
            <TableRow key={ret.length}>
              <TableCell>{obItem.clientId.toString()}</TableCell>
              <TableCell>{obItem.price}</TableCell>
              <TableCell>{obItem.size}</TableCell>
            </TableRow>
          );
          ret.push(content);
        }
        setAskRows(ret);
      }
    };

    let getBidRows = async () => {
      if (market != null) {
        let ret = [];
        const bidBook = await market.loadBids(connection);

        for (const obItem of bidBook.items()) {
          let content = (
            <TableRow key={ret.length}>
              <TableCell>{obItem.clientId.toString()}</TableCell>
              <TableCell>{obItem.price}</TableCell>
              <TableCell>{obItem.size}</TableCell>
            </TableRow>
          );
          ret.push(content);
        }
        setBidRows(ret);
      }
    };
    getAskRows();

    getBidRows();
  }, [market, props.global]);

  return (
    <div>
      <h3>OrderBook</h3>
      <h4>Bids</h4>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order Id</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Size</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{bidRows}</TableBody>
      </Table>
      <h4>Asks</h4>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order Id</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Size</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{askRows}</TableBody>
      </Table>
    </div>
  );
}
