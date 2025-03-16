import { fetchAPI } from "../../utils";

// Factory function to create a Zustand slice for managing member-related state and actions
const createMemberSlice = (set) => ({
  members: [],
  loading: false,

  // Action to fetch all members from the server
  fetchMembers: async () => {
    try {
      set({ loading: true });

      const token = sessionStorage.getItem("lh_token");

      const response = await fetchAPI({ method: "get", url: "/members", token });

      // Update state with fetched members and reset loading
      set({ members: response.data, loading: false });
    } catch (err) {
      console.error("Error fetching members", err);
      set({ loading: false });
    }
  },

  // Action to delete a member by ID
  deleteMember: async (id) => {
    try {
      set({ loading: true });

      const token = sessionStorage.getItem("lh_token");

      await fetchAPI({
        method: "delete",
        url: `/members/${id}`,
        token
      });

      // Update state by filtering out the deleted member and reset loading
      set((state) => ({
        members: state.members.filter(member => member._id !== id),
        loading: false
      }));
      return true;
    } catch (err) {
      console.error("Error deleting member", err);
      set({ loading: false });
    }
  },

  // Action to update a member's details by ID
  updateMember: async (id, data) => {
    try {
      set({ loading: true });

      const token = sessionStorage.getItem("lh_token");

      const response = await fetchAPI({
        method: "patch",
        url: `/members/${id}`,
        data: {
          ...data,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          number: data.number,
          birthDay: data.birthDay,
          birthMonth: data.birthMonth,
          birthYear: data.birthYear,
          role: data.role
        },
        token
      });

      // Update state by replacing the updated member in the members array
      set((state) => ({
        members: state.members.map(member => 
          member._id === id ? response.data : member
        ),
        loading: false
      }));

      return response.data;
    } catch (err) {
      console.error("Error updating member", err);
      set({ loading: false });
    }
  },

  // Action to reset a member's password
  resetMemberPassword: async (id) => {
    try {
      set({ loading: true });

      const token = sessionStorage.getItem("lh_token");

      console.log('Resetting password for member:', id);

      // Make a PATCH request to set mustSetPassword flag to true
      const response = await fetchAPI({
        method: "patch",
        url: `/members/${id}`,
        data: { mustSetPassword: true }, // Forces user to set a new password on next login
        token
      });

      console.log('Reset password response:', response.data);

      set((state) => ({
        members: state.members.map(member => 
          member._id === id ? { ...member, mustSetPassword: true } : member
        ),
        loading: false
      }));

      return true;
    } catch (err) {
      console.error("Error resetting password:", err.response?.data || err.message);
      set({ loading: false });
    }
  },
});

export default createMemberSlice;