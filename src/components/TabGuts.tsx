import React from 'react'
import Box from '@material-ui/core/Box';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from './TabPanel';
import { makeStyles } from '@material-ui/core/styles';
import MarketLoadButton from './MarketLoadButton';
import { MARKETS_LIST } from '@project-serum/serum';
import BuyPanel from './BuyPanel';
import OrderTable from './OrderTable';
import OrderForm from './OrderForm';
import CancelAllButton from './CancelAllButton';

function MarketComponent() {
  return (<><h1>Hello</h1>
    {MARKETS_LIST.map((m) => (m.name))}
    <MarketLoadButton></MarketLoadButton></>)

}

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

export default function TabGuts() {
  const classes = useStyles();
  const [value, setValue] = React.useState(0);

  function handleChange(event, newValue) {
    setValue(newValue);
  }

  return (<>
    <Box>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        aria-label="scrollable auto tabs example"
      >
        <Tab label="Item One" {...a11yProps(0)} />
        <Tab label="Buy Something" {...a11yProps(1)} />
        <Tab label="OrderBook" {...a11yProps(2)} />
        <Tab label="OrderForm" {...a11yProps(3)} />
        <Tab label="Do Cancelling" {...a11yProps(4)} />
        <Tab label="Item Six" {...a11yProps(5)} />
        <Tab label="Item Seven" {...a11yProps(6)} />
      </Tabs>
    </Box>
    <TabPanel value={value} index={0}>
      <MarketComponent />
    </TabPanel>
    <TabPanel value={value} index={1}>
      <BuyPanel />
    </TabPanel>
    <TabPanel value={value} index={2}>
      <OrderTable />
    </TabPanel>
    <TabPanel value={value} index={3}>
      <OrderForm/>
    </TabPanel>
    <TabPanel value={value} index={4}>
      <CancelAllButton/>
    </TabPanel>
    <TabPanel value={value} index={5}>
      Item Six
    </TabPanel>
    <TabPanel value={value} index={6}>
      Item Seven
    </TabPanel>
  </>);
}