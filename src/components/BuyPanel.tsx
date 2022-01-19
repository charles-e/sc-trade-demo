import React, {useState} from 'react'
import Button from '@material-ui/core/Button';
import placeBuy from '../tasks/placebuy'
import { useWallet } from '../utils/wallet';
import { Market, MARKETS_LIST } from '@project-serum/serumx';
import { Keypair } from '@safecoin/web3.js';
import SERUM from '../KEYS/SERUM-2.json';
import { makeStyles } from '@material-ui/core/styles';

let serum = Keypair.fromSecretKey(Buffer.from(SERUM));

const useStyles = makeStyles((theme) => ({
    content: {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },

    button: {
      marginLeft: theme.spacing(1),
      color: "white",
      backgroundColor: "red"
    },
    menuItemIcon: {
      minWidth: 32,
    },
  }));

export default function BuyPanel() {
      const classes = useStyles();
 
    const wallet = useWallet();
    const [ busy, setBusy] = useState(false);
    const [ status, setStatus] = useState("placid");

    const buyIt = async (e)=>{
        const marketAddr = MARKETS_LIST[0].address;
        let market = await Market.load(wallet.connection ,marketAddr,{},serum.publicKey);
        setBusy(true);
        setStatus("workin")
        let res = await placeBuy(wallet.connection,market, wallet );
        setBusy(false);
        setStatus(((res as unknown) as string));
    }
    return (
        <div>
            <Button   
            color="inherit"
            className={classes.button}
            disabled={busy}
            onClick={(e)=>(buyIt(e))}>
            Buy Buy Buy
            </Button>
            <br/>
            Status: {status}
        </div>
    )
}
