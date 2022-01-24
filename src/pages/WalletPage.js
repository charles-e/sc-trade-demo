import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import BalancesList from '../components/BalancesList';
import Grid from '@material-ui/core/Grid';
import { useIsProdNetwork } from '../utils/connection';
import DebugButtons from '../components/DebugButtons';
import { Checkbox } from '@material-ui/core';

export default function WalletPage() {
  const [show, setShow] = useState(true);
  const changeShow = (e) => {
    setShow(e.target.checked);
  };

  const isProdNetwork = useIsProdNetwork();
  return (
    <Container fixed maxWidth="md">
      <Checkbox checked={show} onChange={(e) => changeShow(e)} /> Show Balances
      {show && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <BalancesList />
          </Grid>
          {isProdNetwork ? null : (
            <Grid item xs={12}>
              <DebugButtons />
            </Grid>
          )}
        </Grid>
      )}
    </Container>
  );
}
