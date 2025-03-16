import React, { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, CircularProgress, Typography
} from '@mui/material';
import useStore from '../../hooks/useStore';
import styles from './manageEvents.module.css';

const ManageEvents = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [formData, setFormData] = useState({});

  const {
    eventTypes = [],
    loading,
    fetchEventTypes,
    createEventType,
    updateEventType,
    deleteEventType
  } = useStore((state) => state);

  useEffect(() => {
    fetchEventTypes();
  }, [fetchEventTypes]);

  const handleEditClick = (eventType) => {
    setSelectedEventType(eventType);
    setFormData({
      name: eventType.name,
      icon: eventType.icon,
      color: eventType.color,
    });
    setEditDialogOpen(true);
  };

  const handleCreateClick = () => {
    setFormData({
      name: '',
      icon: '',
      color: '#000000'
    });
    setCreateDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event type?')) {
      await deleteEventType(id);
      fetchEventTypes();
    }
  };

  const handleUpdate = async () => {
    if (selectedEventType) {
      await updateEventType(selectedEventType._id, formData);
      setEditDialogOpen(false);
      fetchEventTypes();
    }
  };

  const handleCreate = async () => {
    await createEventType(formData);
    setCreateDialogOpen(false);
    fetchEventTypes();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress className={styles.circularProgress} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Typography variant="h4" sx={{ justifySelf: 'center', paddingBottom: '1ex' }}>
        Manage Events Settings
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Icon</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(eventTypes || []).map((eventType) => (
              <TableRow key={eventType._id}>
                <TableCell>{eventType.name}</TableCell>
                <TableCell>{eventType.icon}</TableCell>
                <TableCell>
                  <div
                    style={{
                      backgroundColor: eventType.color,
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      display: 'inline-block',
                      marginRight: '8px'
                    }}
                  />
                  {eventType.color}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleEditClick(eventType)}
                    className={styles.editButton}
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(eventType._id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <Button
          variant="contained"
          onClick={handleCreateClick}
          className={styles.createButton}
        >
          Create New Event Type
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle className={styles.dialogTitle}>Edit Event Type</DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <TextField
            margin="dense"
            name="name"
            label="Event Type Name"
            fullWidth
            value={formData.name || ''}
            onChange={handleInputChange}
            className={styles.textField}
          />
          <TextField
            margin="dense"
            name="icon"
            label="Icon"
            fullWidth
            value={formData.icon || ''}
            onChange={handleInputChange}
            className={styles.textField}
          />
          <TextField
            margin="dense"
            name="color"
            label="Color"
            fullWidth
            value={formData.color || ''}
            onChange={handleInputChange}
            type="color"
            className={styles.textField}
          />
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            className={styles.saveButton}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle className={styles.dialogTitle}>Create Event Type</DialogTitle>
        <DialogContent className={styles.dialogContent}>
          <TextField
            margin="dense"
            name="name"
            label="Event Type Name"
            fullWidth
            value={formData.name || ''}
            onChange={handleInputChange}
            className={styles.textField}
          />
          <TextField
            margin="dense"
            name="icon"
            label="Icon"
            fullWidth
            value={formData.icon || ''}
            onChange={handleInputChange}
            className={styles.textField}
          />
          <TextField
            margin="dense"
            name="color"
            label="Color"
            fullWidth
            value={formData.color || ''}
            onChange={handleInputChange}
            type="color"
            className={styles.textField}
          />
        </DialogContent>
        <DialogActions className={styles.dialogActions}>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            className={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className={styles.saveButton}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageEvents;