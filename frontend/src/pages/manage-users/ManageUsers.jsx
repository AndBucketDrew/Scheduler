// src/pages/ManageUsers.jsx
import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, MenuItem, CircularProgress, Typography
} from '@mui/material';
import useStore from '../../hooks/useStore'; // Custom hook for accessing global state
import styles from './manageUsers.module.css'; // Import CSS Module for scoped styling

const ManageUsers = () => {
  // State to control the edit dialog visibility
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  // State to track the currently selected user for editing
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State to manage form data for editing a user
  const [formData, setFormData] = useState({});

  // Destructure necessary methods and state from the global store
  const { members, loading, fetchMembers, deleteMember, updateMember, resetMemberPassword } = useStore((state) => state);

  // Define available roles for user selection
  const roles = ['super-admin', 'office-leader', 'team-leader', 'worker'];

  // Fetch all members when the component mounts
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Handle clicking the "Edit" button for a user
  const handleEditClick = (user) => {
    setSelectedUser(user); // Set the selected user
    setFormData({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      number: user.number,
      birthDay: user.birthDay,
      birthMonth: user.birthMonth,
      birthYear: user.birthYear,
      role: user.role
    }); // Populate form data with user details
    setEditDialogOpen(true); // Open the edit dialog
  };

  // Handle deleting a user with confirmation
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteMember(id); // Delete the user if confirmed
    }
  };

  // Handle resetting a user's password with confirmation
  const handleResetPassword = async (id) => {
    if (window.confirm('Reset password for this user? They will need to set a new password on next login.')) {
      await resetMemberPassword(id); // Reset password if confirmed
    }
  };

  // Handle updating a user's details
  const handleUpdate = async () => {
    await updateMember(selectedUser._id, formData); // Update the user with new form data
    setEditDialogOpen(false); // Close the edit dialog
  };

  // Handle changes to form inputs in the edit dialog
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value }); // Update form data dynamically
  };

  // Show a loading spinner while data is being fetched
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <CircularProgress />
      </div>
    );
  }

  return (
    // Main container for the manage users page
    <div className={styles.container}>
      {/* Page title */}
      <Typography variant="h4" sx={{ justifySelf: 'center', paddingBottom: '1ex'}}>
        Manage Users
      </Typography>

      {/* Table to display user data */}
      <TableContainer component={Paper}>
        <Table>
          {/* Table header */}
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          {/* Table body with user rows */}
          <TableBody>
            {members.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {/* Edit button */}
                  <Button className={styles.editButton} onClick={() => handleEditClick(user)}>Edit</Button>
                  {/* Delete button */}
                  <Button className={styles.deleteButton} onClick={() => handleDelete(user._id)} color="error">
                    Delete
                  </Button>
                  {/* Reset Password button */}
                  <Button className={styles.editButton} onClick={() => handleResetPassword(user._id)}>
                    Reset Password
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog for editing user details */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          {/* Email input */}
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            value={formData.email || ''}
            onChange={handleInputChange}
          />
          {/* First Name input */}
          <TextField
            margin="dense"
            name="firstName"
            label="First Name"
            fullWidth
            value={formData.firstName || ''}
            onChange={handleInputChange}
          />
          {/* Last Name input */}
          <TextField
            margin="dense"
            name="lastName"
            label="Last Name"
            fullWidth
            value={formData.lastName || ''}
            onChange={handleInputChange}
          />
          {/* Phone Number input */}
          <TextField
            margin="dense"
            name="number"
            label="Number"
            fullWidth
            value={formData.number || ''}
            onChange={handleInputChange}
          />
          {/* Birth Day input */}
          <TextField
            margin="dense"
            name="birthDay"
            label="Birth Day"
            type="number"
            fullWidth
            value={formData.birthDay || ''}
            onChange={handleInputChange}
          />
          {/* Birth Month input */}
          <TextField
            margin="dense"
            name="birthMonth"
            label="Birth Month"
            type="number"
            fullWidth
            value={formData.birthMonth || ''}
            onChange={handleInputChange}
          />
          {/* Birth Year input */}
          <TextField
            margin="dense"
            name="birthYear"
            label="Birth Year"
            type="number"
            fullWidth
            value={formData.birthYear || ''}
            onChange={handleInputChange}
          />
          {/* Role selection */}
          <TextField
            select
            margin="dense"
            name="role"
            label="Role"
            fullWidth
            value={formData.role || ''}
            onChange={handleInputChange}
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        {/* Dialog actions */}
        <DialogActions>
          <Button className={styles.editButton} onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageUsers;