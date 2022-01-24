import React, { useState, useEffect } from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import BN from 'bn.js';

export default function MarketData(props) {
  const headerNames = ['property', 'value'];
  const market = props.market;

  const baseLotsRatio = () => {
    const oneBN = new BN('1', 10);
    const ret = market.baseSizeLotsToNumber(oneBN);
    return ret.toString();
  };

  const quoteLotsRatio = () => {
    const oneBN = new BN('1', 10);
    const ret = market.quoteSizeLotsToNumber(oneBN);
    return ret.toString();
  };
  const quoteLotsMult = () => {
    const oneBN = new BN('1', 10);
    const ret = market.quoteSizeNumberToLots(oneBN);
    return ret.toString();
  };
  const baseLotsMult = () => {
    const oneBN = new BN('1', 10);
    const ret = market.baseSizeNumberToLots(oneBN);
    return ret.toString();
  }; /*

  get supportsSrmFeeDiscounts() {
    return supportsSrmFeeDiscounts(this._programId);
  }

  get supportsReferralFees() {
    return getLayoutVersion(this._programId) > 1;
  }

  get usesRequestQueue() {
    return getLayoutVersion(this._programId) <= 2;
  }*/

  const headers = headerNames.map((n) => <TableCell>{n}</TableCell>);
  const data = market
    ? [
        {
          prop: 'Support Discounts',
          val: market.supportsSrmFeeDiscounts ? 'yes' : 'no',
        },
        {
          prop: 'Uses Request Queue',
          val: market.usesRequestQueue ? 'yes' : 'no',
        },
        {
          prop: 'Supports Referral Fees',
          val: market.supportsReferralFees ? 'yes' : 'no',
        },
        { prop: 'Tick Size', val: market.tickSize },
        { prop: 'Min Order Size', val: market.minOrderSize },
        { prop: 'Program Id', val: market.programId.toBase58() },
        { prop: 'Base Mint Address', val: market.baseMintAddress.toBase58() },
        { prop: 'Quote Mint Address', val: market.quoteMintAddress.toBase58() },
        { prop: 'Public Key', val: market.publicKey.toBase58() },
        { prop: 'Base Lots Ratio', val: baseLotsRatio() },
        { prop: 'Base Lots Multiplier', val: baseLotsMult() },
        { prop: 'Quote Lots Ratio', val: quoteLotsRatio() },
        { prop: 'Quote Lots Multiplier', val: quoteLotsMult() },
      ]
    : [];
  const dataRows = data.map((d) => (
    <TableRow>
      <TableCell>{d.prop}</TableCell>
      <TableCell>{d.val}</TableCell>
    </TableRow>
  ));
  return (
    <Table>
      <TableHead>
        <TableRow>{headers}</TableRow>
      </TableHead>
      <TableBody>{dataRows}</TableBody>
    </Table>
  );
}
