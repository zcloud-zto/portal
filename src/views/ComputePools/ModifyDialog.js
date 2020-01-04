import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Skeleton from '@material-ui/lab/Skeleton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Switch from '@material-ui/core/Switch';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { getAllStoragePools, getAllNetworkPools, modifyComputePool, getComputePool } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Modify Pool',
    localStorage: 'Use local storage',
    noAddressPool: "Don't use address pool",
    storage: 'Backend Storage',
    network: 'Address Pool',
    failover: 'Failover',
    off: 'Off',
    on: 'On',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '修改资源池',
    localStorage: '使用本地存储',
    noAddressPool: "不使用地址池",
    storage: '后端存储',
    network: '地址池',
    failover: '故障切换',
    off: '关闭',
    on: '开启',
    cancel: '取消',
    confirm: '确定',
  },
}

const ModifyDialog = (props) =>{
  const defaultOption = '__default';
  const defaultValues = {
    storage: defaultOption,
    network: defaultOption,
    failover: false,
  };
  const { lang, pool, open, onSuccess, onCancel } = props;
  const [ initialed, setInitialed ] = React.useState(false);
  const [ error, setError ] = React.useState('');
  const [ request, setRequest ] = React.useState(defaultValues);
  const [ options, setOptions ] = React.useState({
    storage: [],
    network: [],
  });

  const texts = i18n[lang];
  const onModifyFail = (msg) =>{
    setError(msg);
  }
  const resetDialog = () =>{
    setError('');
    setRequest(defaultValues);
    setInitialed(false);
  };

  const closeDialog = ()=>{
    resetDialog();
    onCancel();
  }

  const onModifySuccess = (poolName) =>{
    resetDialog();
    onSuccess(poolName);
  }

  const confirmModify = () =>{
    let storage, address;
    if (defaultOption === request.storage){
      storage = '';
    }else{
      storage = request.storage;
    }
    if (defaultOption === request.network){
      address = '';
    }else{
      address = request.network;
    }
    modifyComputePool(pool, storage, address, request.failover, onModifySuccess, onModifyFail);
  }

  const handleRequestPropsChanged = name => e =>{
    var value = e.target.value
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleRequestSwitchChanged = name => e =>{
    var value = e.target.checked
    setRequest(previous => ({
      ...previous,
      [name]: value,
    }));
  };

  React.useEffect(()=>{
    if (!pool || !open || initialed ){
      return;
    }
    var storageList = [{
      name: texts.localStorage,
      value: defaultOption,
    }];
    var addressList = [{
      name: texts.noAddressPool,
      value: defaultOption,
    }];

    const onGetCurrentConfigueSuccess = (config) =>{
      setOptions({
        storage: storageList,
        network: addressList,
      });
      setRequest({
        storage: config.storage ? config.storage : defaultOption,
        network: config.network ? config.network : defaultOption,
        failover: config.failover,
      });
      setInitialed(true);
    }

    const onQueryNetworkSuccess = (dataList) =>{
      dataList.forEach((address)=>{
        var item = {
          name: address.name + ' (' + address.allocated + '/' + address.addresses + ' allocated via gateway ' + address.gateway + ')',
          value: address.name,
        }
        addressList.push(item);
      })
      getComputePool(pool, onGetCurrentConfigueSuccess, onModifyFail)
    };
    const onQueryStorageSuccess = (dataList) =>{
        dataList.forEach((storage)=>{
          var item = {
            name: storage.name + ' (' + storage.type + ':' + storage.host + ')',
            value: storage.name,
          }
          storageList.push(item);
        })
        getAllNetworkPools(onQueryNetworkSuccess, onModifyFail);
    };
    getAllStoragePools(onQueryStorageSuccess, onModifyFail);

  }, [initialed, open, pool, texts.localStorage, texts.noAddressPool]);

  //begin render
  let content;
  if (!initialed){
    content = <Skeleton variant="rect" style={{height: '10rem'}}/>;
  }else{
    content = (
      <Grid container>
        <GridItem xs={8}>
          <Box m={1} p={2}>
          <InputLabel htmlFor="storage">{texts.storage}</InputLabel>
          <Select
            value={request.storage}
            onChange={handleRequestPropsChanged('storage')}
            inputProps={{
              name: 'storage',
              id: 'storage',
            }}
            autoWidth
          >
            {
              options.storage.map((option) =>(
                <MenuItem value={option.value} key={option.value}>{option.name}</MenuItem>
              ))
            }
          </Select>
          </Box>
        </GridItem>
        <GridItem xs={8}>
          <Box m={1} p={2}>
          <InputLabel htmlFor="network">{texts.network}</InputLabel>
          <Select
            value={request.network}
            onChange={handleRequestPropsChanged('network')}
            inputProps={{
              name: 'network',
              id: 'network',
            }}
          >
            {
              options.network.map((option) =>(
                <MenuItem value={option.value} key={option.value}>{option.name}</MenuItem>
              ))
            }
          </Select>
          </Box>
        </GridItem>

        <GridItem xs={6}>
          <Box m={1} p={2}>
          <InputLabel htmlFor="failover">{texts.failover}</InputLabel>
          <GridItem>
            {texts.off}
            <Switch
              checked={request.failover}
              onChange={handleRequestSwitchChanged('failover')}
              color="primary"
              inputProps={{
                name: 'failover',
                id: 'failover',
              }}
            />
            {texts.on}
          </GridItem>
          </Box>
        </GridItem>
      </Grid>
    );
  }

  let prompt;
  if (!error || '' === error){
    prompt = <GridItem xs={12}/>;
  }else{
    prompt = (
      <GridItem xs={12}>
        <SnackbarContent message={error} color="danger"/>
      </GridItem>
    );
  }

  return (
    <Dialog
      open={open}
      aria-labelledby={texts.title}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{texts.title + ' ' + pool}</DialogTitle>
      <DialogContent>
        <Grid container>
          <GridItem xs={12}>
            {content}
          </GridItem>
          {prompt}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="transparent" autoFocus>
          {texts.cancel}
        </Button>
        <Button onClick={confirmModify} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};

export default ModifyDialog;
