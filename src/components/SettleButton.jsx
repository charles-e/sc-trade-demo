import React from 'react';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import { Keypair, Transaction } from '@safecoin/web3.js';
import { useSendTransaction } from '../utils/notifications';
import SERUM from '../KEYS/SERUM-2.json';
import { useWallet } from '../utils/wallet';
import { signTransaction } from '../utils/send';

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
    backgroundColor: 'purple',
  },
  checkbtn: {
    marginLeft: theme.spacing(1),
    color: 'white',
    backgroundColor: 'purple',
  },
  menuItemIcon: {
    minWidth: 32,
  },
}));

export default function SettleButton(props) {
  const market = props.market;
  const classes = useStyles();

  const wallet = useWallet();
  const [sendTransaction, sending] = useSendTransaction();

  async function settleUp(e) {
    console.log('settleUp');
    const connection = wallet.connection;

    let ooAccounts = await market.findOpenOrdersAccountsForOwner(
      connection,
      wallet.publicKey,
      200,
    );
    console.log(ooAccounts);
    let quoteAccounts = await market.findQuoteTokenAccountsForOwner(
      connection,
      wallet.publicKey,
      false,
    );
    console.log(quoteAccounts);

    let baseAccounts = await market.findBaseTokenAccountsForOwner(
      connection,
      wallet.publicKey,
      false,
    );
    console.log(baseAccounts);

    let {
      transaction: txn,
      signers: signers,
    } = await market.makeSettleFundsTransaction(
      connection,
      ooAccounts[0],
      baseAccounts[0].pubkey,
      quoteAccounts[0].pubkey,
    );

    let signed = await signTransaction({
      transaction: txn,
      wallet: wallet,
      signers: signers,
      connection: connection,
    });

    let serial = signed.serialize();
    await sendTransaction(connection.sendRawTransaction(serial), {});
    props.updateMarket();
  }

  return (
    <div>
      <Button
        id="test"
        color="inherit"
        className={classes.button}
        disabled={sending}
        onClick={(e) => {
          console.log('settling....', e.target.id);
          settleUp(e);
        }}
      >
        Settle Funds
      </Button>
    </div>
  );
}
