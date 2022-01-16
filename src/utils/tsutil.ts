import { Market } from '@project-serum/serum';
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

export async function getAccountKeys(connection: Connection, market: Market, userKey: PublicKey): Promise<{ base: PublicKey; quote: PublicKey; orders: PublicKey;}> {
  const base = await market.findBaseTokenAccountsForOwner(connection, userKey, false);
  const quote = await market.findQuoteTokenAccountsForOwner(connection, userKey, false);
  const accounts = await market.findOpenOrdersAccountsForOwner(connection, userKey, 1000);

  console.log("orders : ", accounts.length);
  let order;
  if (accounts.length > 0) {
    order = accounts[0].address;
  } 
  console.log( {
    base: base[0].pubkey.toBase58(),
    quote: quote[0].pubkey.toBase58(),
    orders: order ? order.toBase58() : "null",
    count: accounts.length
  });
  return {
    base: base[0].pubkey,
    quote: quote[0].pubkey,
    orders: order,
  };
}

export const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

export const getUnixTs = () => {
  return new Date().getTime() / 1000;
};

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function path2Keypair(path: string): Keypair {
  const payer = Keypair.fromSecretKey(
    Buffer.from(
      JSON.parse(
        require("fs").readFileSync(path, {
          encoding: "utf-8",
        })
      )
    )
  );
  return payer
}