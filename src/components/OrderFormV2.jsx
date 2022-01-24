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
import { useSnackbar } from 'notistack';
import { getDecimalCount } from '../utils/tsutil';

let serum = Keypair.fromSecretKey(Buffer.from(SERUM));

const useStyles = makeStyles((theme) => ({
  tabs: {
    marginBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.background.paper}`,
    width: '100%',
  },
}));

export default function OrderFormV2(props) {
  let classes = useStyles();
  const [tradeSide, setTradeSide] = useState('buy');
  const [isLimit, setIsLimit] = useState(true);
  const [price, setPrice] = useState(0);
  const [size, setSize] = useState(10);
  const [status, setStatus] = useState('placid');
  const wallet = useWallet();
  const [busy, setBusy] = useState(false);
  const [sendTransaction, sending] = useSendTransaction();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

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
    let orderOk = true;
    const connection = wallet.connection;
    const bitchQuit = (msg) => {
      enqueueSnackbar(msg, { variant: 'error' });
      orderOk = false;
    };

    if (!wallet || !wallet.publicKey) {
      // sanity
      bitchQuit('Connect wallet');
    }
    if (!market) {
      bitchQuit('No market?');
    }

    if (isNaN(price)) {
      bitchQuit('Invalid price');
    }
    if (price == 0) {
      bitchQuit('No Freebies! (price is zero)');
    }
    if (size == 0) {
      bitchQuit('What even are you trying do here? (size is zero)');
    }
    if (isNaN(size)) {
      bitchQuit('Invalid size');
    }

    // depending on what side is which token wallet we will "pay" from
    let token_accounts =
      tradeSide == 'buy'
        ? await market.findQuoteTokenAccountsForOwner(
            connection,
            wallet.publicKey,
            true,
          )
        : await market.findBaseTokenAccountsForOwner(
            connection,
            wallet.publicKey,
            true,
          );

    if (token_accounts.length == 0) {
      bitchQuit('no wallet for payer');
    }

    let formattedMinOrderSize =
      market?.minOrderSize?.toFixed(getDecimalCount(market.minOrderSize)) ||
      market?.minOrderSize;
    let formattedTickSize =
      market?.tickSize?.toFixed(getDecimalCount(market.tickSize)) ||
      market?.tickSize;
    const isIncrement = (num, step) =>
      Math.abs((num / step) % 1) < 1e-5 ||
      Math.abs(((num / step) % 1) - 1) < 1e-5;
    if (!isIncrement(size, market.minOrderSize)) {
      bitchQuit(`Size must be an increment of ${formattedMinOrderSize}`);
      return;
    }
    if (size < market.minOrderSize) {
      bitchQuit('Size too small');
    }
    if (!isIncrement(price, market.tickSize)) {
      bitchQuit(`Price must be an increment of ${formattedTickSize}`);
    }
    if (price < market.tickSize) {
      bitchQuit('Price under tick size');
    }

    let txn, signers;
    if (orderOk) {
      let order = {
        owner: wallet.publicKey,
        payer: token_accounts[0].pubkey, // the debited token account
        side: tradeSide,
        price: price * 1.0,
        size: size * 1.0,
        orderType: isLimit ? 'limit' : '',
        clientId: new BN(Math.random() * 1000, 10),
      };
      console.log(order);
      let poRes;
      try {
        poRes = await market.makePlaceOrderTransaction(connection, order);
      } catch (e) {
        bitchQuit(e.message);
      }
      let signed;
      if (orderOk) {
        try {
          signed = await signTransaction({
            transaction: poRes.txn,
            wallet: wallet,
            signers: poRes.sigs,
            connection: connection,
          });
        } catch (e) {
          bitchQuit(e.message);
        }
      }
      let txId;
      if (orderOk) {
        try {
          txId = await transmitSignedTransaction({
            signedTransaction: signed,
            connection: connection,
            sendNotification: false,
          });
        } catch (e) {
          bitchQuit(e.message);
        }
      }
      if (orderOk) {
        sendTransaction(
          txId,

          { onSuccess: setBusy(false) },
        );
      }
      props.updateMarket();
      setBusy(false);
    }
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
