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

export default function MyOrderTable(props) {
  const classes = useStyles();
  const wallet = useWallet();
  const connection = wallet.connection;
  const [orderRows, setOrderRows] = useState([]);
  const market = props.market;

  useEffect(() => {
    let getOwnerRows = async () => {
      let ret = [];
      if (market != null) {
        let orders = await market.loadOrdersForOwner(
          connection,
          wallet.publicKey,
          100,
        );
        let rows = orders.map((o) => (
          <TableRow>
            <TableCell>{o.clientId.toString()}</TableCell>
            <TableCell>{o.side}</TableCell>
            <TableCell>{o.price}</TableCell>
            <TableCell>{o.size}</TableCell>
          </TableRow>
        ));
        setOrderRows(rows);
        /*  const askBook = await market.loadAsks(connection);
        
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
        setAskRows(ret);*/
      }
    };

    getOwnerRows();
  }, [market, props.global]);

  return (
    <div>
      <h3>My Orders</h3>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order Id</TableCell>
            <TableCell>Side</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Size</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{orderRows}</TableBody>
      </Table>
    </div>
  );
}
