import React, { useState, useEffect } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import { TOKEN_MINTS_LIST } from '@project-serum/serumx';
import { getMultipleSolanaAccounts } from '../utils/send';
import { useWallet } from '../utils/wallet';
import { parseMintData } from '../utils/tokens/data';
import BN from 'bn.js';

export default function TokenInfoTable(props) {
  const wallet = useWallet();
  const [tokenInfo, setTokenInfo] = useState(null);
  const headerNames = ['id', 'name', 'supply', 'decimals'];

  useEffect(() => {
    async function getTokens() {
      let keys = TOKEN_MINTS_LIST.map((i) => i.address);
      TOKEN_MINTS_LIST.map((i) => console.log(i.address.toBase58()));
      let res = await getMultipleSolanaAccounts(wallet.connection, keys);

      let data = [];
      let mintsObj = res.value;
      console.log('mints: ', mintsObj);
      let bnBase10 = new BN('10', 10);
      for (let k in keys) {
        let mint = mintsObj[keys[k]];
        if (mint != null) {
          let { supply, decimals } = parseMintData(mint.data);
          let bnDec = new BN(decimals, 10);
          let bnSupp = new BN(supply, 10);
          let bnDecVal = bnBase10.pow(bnDec);
          let dispSupp = bnSupp.div(bnDecVal).toString();
          let name = TOKEN_MINTS_LIST[k].name;

          data.push({
            name: name,
            address: keys[k].toBase58(),
            decimals: decimals,
            supply: dispSupp,
          });
        }
      }
      let tRows = data.map((val, id) => (
        <TableRow key={id}>
          <TableCell>{val.address}</TableCell>
          <TableCell>{val.name}</TableCell>
          <TableCell>{val.supply}</TableCell>
          <TableCell>{val.decimals}</TableCell>
        </TableRow>
      ));
      setTokenInfo(tRows);
    }

    getTokens();
  }, [props.market, props.global]);

  const headers = headerNames.map((n) => <TableCell>{n}</TableCell>);

  return (
    <Table>
      <TableHead>
        <TableRow>{headers}</TableRow>
      </TableHead>
      <TableBody>{tokenInfo}</TableBody>
    </Table>
  );
}
