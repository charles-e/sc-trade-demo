
import {
  Keypair,
  Connection,
  PublicKey,
  LAMPORTS_PER_SAFE,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  AccountInfo
} from '@safecoin/web3.js';

import { BN, Wallet } from "@project-serum/anchor";
import { Market, OpenOrders } from '@project-serum/serumx';
import { getAccountKeys } from '../utils/tsutil';
import { sendTransaction } from '../utils/send';
import SERUM from '../KEYS/SERUM-2.json';
import { OrdersAccountParams } from '@project-serum/serumx/lib/market';

const walletPath = process.env.SAFE_WALLET;

interface TokenAccount {
  pubkey: PublicKey;
  account: AccountInfo<Buffer> | null;
  effectiveMint: PublicKey
}


let prog = Keypair.fromSecretKey(
      Buffer.from(SERUM));

console.log(prog.publicKey.toBase58());


export default async function placeSell(connection: Connection, market: Market, wallet: Wallet) {


  console.log("market", market.dump());
  let ooAccountAddr : PublicKey;
  let signers : Keypair[] = [];
  let ooAccounts = await market.findOpenOrdersAccountsForOwner(connection, wallet.publicKey, 200);
  let txn;
  if (ooAccounts.length == 0) {
    console.log("will create Open Orders");
     const ooAccount = new Keypair();
     const params : OrdersAccountParams = {connection:connection, ownerAddress: wallet.publicKey, programId: prog.publicKey,marketAddress:market.address,newAccountAddress:ooAccount.publicKey};
      txn = await OpenOrders.makeCreateOrdersAccountTransaction(params);
      signers.push(ooAccount);
      ooAccountAddr = ooAccount.publicKey;
}
  else {
    txn = new Transaction();
    ooAccountAddr = ooAccounts[0].address;
  }
  let owner_info = await getAccountKeys(connection,market,wallet.publicKey);

  console.log("feePayer = ", wallet.publicKey.toBase58());

  let order = {
    owner: wallet.publicKey,
    payer: owner_info.base,
    side: ('sell' as any),
    price: 1.0,
    size: 0.001,
    orderType: ('limit' as any),
    clientId: new BN(1),
    openOrdersAddressKey: ooAccountAddr
  };
  const order_ix = await market.makePlaceOrderInstruction(connection, order);

  const con_ix = await market.makeConsumeEventsInstruction([ooAccountAddr], 3);
  txn.add(order_ix)
  txn.add(con_ix);

  console.log("about to send");
  await sendTransaction(
    {
      connection: connection,
      transaction: txn,
      wallet: wallet,
      signers: signers,
      sendingMessage: "sending",
      sentMessage: "sent",
      successMessage: "success",
      timeout: 15000,
      sendNotification: true
    });

}

