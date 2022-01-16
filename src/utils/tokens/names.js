import EventEmitter from 'events';
import { useConnectionConfig } from '../connection';
import { useListener } from '../utils';
import { useCallback } from 'react';
import { clusterApiUrl } from '@safecoin/web3.js';

export const TOKENS = {
  [clusterApiUrl('devnet')]: [
    {
      mintAddress: 'SRmaJesFc3feD9WxoHg85oLA443b5g8G6qPnQgUvbhC',
      tokenName: 'Serum',
      tokenSymbol: 'SRM',
    },
    {
      mintAddress: 'msmUmQ7BEftBi5DLUL5Vwk46HcMGjVNdNuAJcX8vELy',
      tokenName: 'MegaSerum',
      tokenSymbol: 'MSRM',
    },
    {
      mintAddress: 'AaACXpmVyNpowJcMG6GK3x6R6oPsGv31V48izvLN44mc',
      tokenName: 'AA-Token',
      tokenSymbol: 'AA',    
    },
    {
      mintAddress: 'Bbw9wHcUJE1xeCheooReZREqGuphWnCdv9ueNQLZDVm2',
      tokenName: 'BB-Token',
      tokenSymbol: 'BB'
    }
  ],
};

const customTokenNamesByNetwork = JSON.parse(
  localStorage.getItem('tokenNames') ?? '{}',
);

const nameUpdated = new EventEmitter();
nameUpdated.setMaxListeners(100);

export function useTokenName(mint) {
  const { endpoint } = useConnectionConfig();
  useListener(nameUpdated, 'update');

  if (!mint) {
    return { name: null, symbol: null };
  }

  let info = customTokenNamesByNetwork?.[endpoint]?.[mint.toBase58()];
  if (!info) {
    let match = TOKENS?.[endpoint]?.find(
      (token) => token.mintAddress === mint.toBase58(),
    );
    if (match) {
      info = { name: match.tokenName, symbol: match.tokenSymbol };
    }
  }
  return { name: info?.name, symbol: info?.symbol };
}

export function useUpdateTokenName() {
  const { endpoint } = useConnectionConfig();
  return useCallback(
    function updateTokenName(mint, name, symbol) {
      if (!customTokenNamesByNetwork[endpoint]) {
        customTokenNamesByNetwork[endpoint] = {};
      }
      customTokenNamesByNetwork[endpoint][mint.toBase58()] = { name, symbol };
      localStorage.setItem(
        'tokenNames',
        JSON.stringify(customTokenNamesByNetwork),
      );
      nameUpdated.emit('update');
    },
    [endpoint],
  );
}
