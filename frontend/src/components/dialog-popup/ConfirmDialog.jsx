import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import useStore from '../../hooks/useStore.js';

const ConfirmDialog = () => {
  const { dialog, destroyDialog } = useStore((state) => state);

  const handleClickOK = () => {
    if (dialog?.handleOK) {
      dialog.handleOK();
    }
    destroyDialog();
  };

  const handleClickCancel = () => {
    if (dialog?.handleCancel) {
      dialog.handleCancel();
    }
    destroyDialog();
  };

  return (
    <>
      <Dialog
        open={Boolean(dialog)}
        onClose={destroyDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{dialog?.title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{dialog?.text}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClickCancel}>Abbrechen</Button>
          <Button onClick={handleClickOK}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfirmDialog;
