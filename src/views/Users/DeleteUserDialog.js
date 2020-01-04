import React from "react";
// @material-ui/core components
import Grid from "@material-ui/core/Grid";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

// dashboard components
import Button from "components/CustomButtons/Button.js";
import GridItem from "components/Grid/GridItem.js";
import SnackbarContent from "components/Snackbar/SnackbarContent.js";
import { deleteUser } from 'nano_api.js';

const i18n = {
  'en':{
    title: 'Delete User',
    content: 'Are you sure to delete user ',
    cancel: 'Cancel',
    confirm: 'Confirm',
  },
  'cn':{
    title: '删除用户',
    content: '是否删除用户 ',
    cancel: '取消',
    confirm: '确定',
  },
}

export default function DeleteUserDialog(props){
  const { lang, name, open, onSuccess, onCancel } = props;
  const [ error, setError ] = React.useState('');
  const texts = i18n[lang];
  const onDeleteFail = (msg) =>{
    setError(msg);
  }

  const closeDialog = ()=>{
    setError('');
    onCancel();
  }

  const onDeleteSuccess = (name) =>{
    setError('');
    onSuccess(name);
  }

  const confirmDelete = () =>{
    deleteUser(name, onDeleteSuccess, onDeleteFail);
  }


  //begin render
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
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{texts.title}</DialogTitle>
      <DialogContent>
        <Grid container>
          <GridItem xs={12}>
            {texts.content + name}
          </GridItem>
          {prompt}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="transparent" autoFocus>
          {texts.cancel}
        </Button>
        <Button onClick={confirmDelete} color="info">
          {texts.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  )
};
