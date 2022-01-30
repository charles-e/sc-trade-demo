import React, {useState, useEffect} from 'react'
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from './TabPanel';
import TokenInfoTable from './TokenInfoTable';
import { makeStyles } from '@material-ui/core/styles';
import { MARKETS_LIST, Market } from '@project-serum/serumx';
import BuyPanel from './BuyPanel';
import OrderTable from './OrderTable';
import MyOrderTable from './MyOrderTable';
import OrderForm from './OrderForm';
import OrderFormV2 from './OrderFormV2';
import MarketData from './MarketData';
import CancelAllButton from './CancelAllButton';
import MarketMenu from './MarketMenu';
import { PublicKey, Keypair } from '@safecoin/web3.js';
import { useWallet } from '../utils/wallet';
import SERUM from '../KEYS/SERUM-3.json';
import SettleButton from './SettleButton';
let serum = Keypair.fromSecretKey(Buffer.from(SERUM));


function a11yProps(index) {
  return {
    id: `scrollable-auto-tab-${index}`,
    "aria-controls": `scrollable-auto-tabpanel-${index}`
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: theme.palette.background.paper
  }
}));

const addr_to_idx = (addr)=>{
  let filtered = MARKETS_LIST.filter((mkt)=>(mkt.address == addr));
  if (filtered.length > 0){
    let selected = filtered[0];
    return selected.seq;
  }
  return 0;
}


export default function MarketTabs() {
  const wallet = useWallet();
  const [value, setValue] =  useState(0);
  
  // marketIdx - indexes market meta data so we can switch markets
  const [marketIdx, setMarketIdx] = useState(0);  
  const [market, setMarket] = useState<any>(null);  // the market is the Market Object

  // infoIdx is just a counter that should be incremented when anything gets done 
  // (ordering or cancelling) triggers market-using components to refresh
  const [infoIdx, setInfoIdx] = useState(0); 

  useEffect(() => {
    async function getMarket() {
      let addr = MARKETS_LIST[marketIdx].address;
      let key = new PublicKey(addr);

      let loaded = await Market.load(wallet.connection,key,{},serum.publicKey);
      console.log("loaded: ",loaded);

      setMarket(loaded);
    }

    getMarket();
  }, [market]);

  function handleChange(event, newValue) {
    setValue(newValue);
  }
  function handleMarketUpdate(){
    setInfoIdx(infoIdx+1);
  }
  const changeMarket = async (marketKey :PublicKey)=>{
    let idx : number = addr_to_idx(marketKey)
    let loaded = await Market.load(wallet.connection,marketKey,{},serum.publicKey);
    console.log("loaded: ",loaded);
    setMarketIdx(idx);
    setMarket(loaded);
  }

  
  return (<>
    <Box>
      Current Market: <MarketMenu label={MARKETS_LIST[marketIdx].name} onChangeMarket={changeMarket}/>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        <Tab label="My Orders" {...a11yProps(0)} />
        <Tab label="OrderBook" {...a11yProps(2)} />
        <Tab label="OrderForm" {...a11yProps(3)} />
        <Tab label="Do Cancelling/Settling" {...a11yProps(4)} />
        <Tab label="Token Info" {...a11yProps(5)} />
        <Tab label="Market Info" {...a11yProps(6)} />

      </Tabs>
    </Box>
    <TabPanel value={value} index={0}>
      <MyOrderTable market ={market} global={infoIdx} />
    </TabPanel>
    <TabPanel value={value} index={2}>
      <OrderTable market={market} global={infoIdx} updateMarket={handleMarketUpdate}/>
    </TabPanel>
    <TabPanel value={value} index={3}>
      <OrderFormV2 market={market} global={infoIdx} updateMarket={handleMarketUpdate}/>
    </TabPanel>
    <TabPanel value={value} index={4}>
    <SettleButton market={market} updateMarket={handleMarketUpdate}/>
    <br/>
    <CancelAllButton market={market} global={infoIdx} updateMarket={handleMarketUpdate}/>

    </TabPanel>
    <TabPanel value={value} index={5}>
     <TokenInfoTable market={market} global={infoIdx}/>
    </TabPanel>
    <TabPanel value={value} index={6}>
      <MarketData market={market} global={infoIdx}/>
    </TabPanel>

  </>);
}
