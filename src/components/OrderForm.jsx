import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import { makeStyles } from '@material-ui/core';

import SERUM from '../KEYS/SERUM-2.json';
import { Market, OpenOrders, MARKETS_LIST } from '@project-serum/serumx';
import { Keypair, Transaction } from '@safecoin/web3.js';
import { useWallet } from '../utils/wallet';
import { useSendTransaction } from '../utils/notifications';
import { signTransaction, transmitSignedTransaction } from '../utils/send';
import BN from 'bn.js';

let serum = Keypair.fromSecretKey(Buffer.from(SERUM));

const useStyles = makeStyles((theme) => ({
  tabs: {
    marginBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.background.paper}`,
    width: '100%',
  },
}));

export default function OrderForm(props) {
  let classes = useStyles();
  const [tradeSide, setTradeSide] = useState('buy');
  const [isLimit, setIsLimit] = useState(true);
  const [price, setPrice] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState('placid');
  const wallet = useWallet();
  const [busy, setBusy] = useState(false);
  const [sendTransaction, sending] = useSendTransaction();

  const market = props.market;

  const changePrice = (ev) => {
    setPrice(ev.target.value);
  };
  const changeSize = (ev) => {
    setSize(ev.target.value);
  };
  const changeLimit = (ev) => {
    setIsLimit(ev.target.value);
  };
  const changeTradeSide = (ev) => {
    console.log(ev.target.checked);
    let side = ev.target.checked === true ? 'sell' : 'buy';
    console.log(side);
    setTradeSide(side);
  };

  const placeOrder = async (e) => {
    const connection = wallet.connection;

    let signers = [];

    setBusy(true);

    // depending on what side is which token wallet we will "pay" from
    let token_accounts =
      tradeSide == 'bid'
        ? await market.findQuoteTokenAccountsForOwner(
            connection,
            wallet.publicKey,
            false,
          )
        : await market.findBaseTokenAccountsForOwner(
            connection,
            wallet.publicKey,
            false,
          );

    if (token_accounts.length == 0) {
      console.log('no wallet for payer');
      return;
    }
    let ooAccounts = await market.findOpenOrdersAccountsForOwner(
      connection,
      wallet.publicKey,
      200,
    );
    let ooAccountAddr;
    let txn;
    if (ooAccounts.length == 0) {
      console.log('will create Open Orders');
      const ooAccount = new Keypair();
      const params = {
        connection: connection,
        ownerAddress: wallet.publicKey,
        programId: serum.publicKey,
        marketAddress: market.address,
        newAccountAddress: ooAccount.publicKey,
      };
      txn = await OpenOrders.makeCreateOrdersAccountTransaction(params);
      signers.push(ooAccount);
      ooAccountAddr = ooAccount.publicKey;
    } else {
      txn = new Transaction();
      ooAccountAddr = ooAccounts[0].address;
    }
    let order = {
      owner: wallet.publicKey,
      payer: token_accounts[0].pubkey, // the debited token account
      side: tradeSide,
      price: price,
      size: size,
      orderType: isLimit ? 'limit' : '',
      clientId: new BN(Math.random()),
      openOrdersAddressKey: ooAccountAddr,
    };

    const order_ix = await market.makePlaceOrderInstruction(connection, order);

    const con_ix = await market.makeConsumeEventsInstruction(
      [ooAccountAddr],
      3,
    );
    txn.add(order_ix);
    txn.add(con_ix);

    let signed = await signTransaction({
      transaction: txn,
      wallet: wallet,
      signers: signers,
      connection: connection,
    });
    let txId = await transmitSignedTransaction({
      signedTransaction: signed,
      connection: connection,
      sendNotification: false,
    });

    sendTransaction(
      txId,

      { onSuccess: setBusy(false) },
    );
    setBusy(false);
  };
  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>
              <Switch
                color="primary"
                exclusive
                checked={tradeSide === 'sell'}
                onChange={(e) => changeTradeSide(e)}
              />
            </td>
            <td>{tradeSide}</td>
          </tr>
        </tbody>
      </table>

      <table>
        <tbody>
          <tr>
            <td>Price:</td>
            <td>
              <TextField value={price} onChange={(e) => changePrice(e)} />
            </td>
          </tr>
          <tr>
            <td>Size:</td>
            <td>
              <TextField value={size} onChange={(e) => changeSize(e)} />
            </td>
          </tr>
          <tr>
            <td>Limit:</td>
            <td>
              <Switch value={isLimit} onChange={(e) => changeLimit(e)} />
            </td>
          </tr>
        </tbody>
      </table>
      <Button
        color="inherit"
        className={classes.button}
        disabled={busy}
        onClick={(e) => placeOrder(e)}
      >
        Submit
      </Button>
    </div>
  );
}
