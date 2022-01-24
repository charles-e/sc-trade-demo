import { Market } from '@project-serum/serumx';
import { Keypair, Connection, PublicKey} from '@safecoin/web3.js';
import BN from "bn.js";

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


export function isValidPublicKey(key) {
  if (!key) {
    return false;
  }
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

export const percentFormat = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function floorToDecimal(value: number, decimals: number | undefined | null) {
  return decimals ? Math.floor(value * 10 ** decimals) / 10 ** decimals : value;
}

export function roundToDecimal(value: number, decimals: number | undefined | null) {
  return decimals ? Math.round(value * 10 ** decimals) / 10 ** decimals : value;
}

export function getDecimalCount(value): number {
  if (!isNaN(value) && Math.floor(value) !== value)
    return value.toString().split('.')[1].length || 0;
  return 0;
}

export function divideBnToNumber(numerator: BN, denominator: BN): number {
  const quotient = numerator.div(denominator).toNumber();
  const rem = numerator.umod(denominator);
  const gcd = rem.gcd(denominator);
  return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
}

export function getTokenMultiplierFromDecimals(decimals: number): BN {
  return new BN(10).pow(new BN(decimals));
}



export function abbreviateAddress(address, size = 4) {
  const base58 = address.toBase58();
  return base58.slice(0, size) + '…' + base58.slice(-size);
}

export function isEqual(obj1, obj2, keys) {
  if (!keys && Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }
  keys = keys || Object.keys(obj1);
  for (const k of keys) {
    if (obj1[k] !== obj2[k]) {
      // shallow comparison
      return false;
    }
  }
  return true;
}
