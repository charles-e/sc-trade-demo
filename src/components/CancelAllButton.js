import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import { Market, MARKETS_LIST } from '@project-serum/serum';
import { Keypair, Transaction } from '@safecoin/web3.js';
import { useSendTransaction } from '../utils/notifications';
import { signTransaction } from '../utils/send';
import SERUM from '../KEYS/SERUM-2.json';
import { useWallet } from '../utils/wallet';

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

export default function CancelAllButton() {
  const classes = useStyles();

  const wallet = useWallet();
  const [sendTransaction, sending] = useSendTransaction();

  const cancelAll = async (e) => {
    const connection = wallet.connection;
    let market = await Market.load(
      wallet.connection,
      MARKETS_LIST[0].address,
      {},
      serum.publicKey,
    );

    let myOrders = await market.loadOrdersForOwner(
      connection,
      wallet.publicKey,
    );

    // Cancelling orders
    let txn = new Transaction();
    for (let order of myOrders) {
      let ix = await market.makeCancelOrderInstruction(
        connection,
        wallet.publicKey,
        order,
      );
      txn.add(ix);
    }
    let signed = await signTransaction({
      transaction: txn,
      wallet: wallet,
      connection: connection,
    });

    let serial = signed.serialize();
    sendTransaction(connection.sendRawTransaction(serial), {});
  };

  return (
    <div>
      <Button
        color="inherit"
        className={classes.button}
        disabled={sending}
        onClick={(e) => {
          cancelAll(e);
        }}
      >
        Cancel All My Orders{' '}
      </Button>
    </div>
  );
}
