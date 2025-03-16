import { fetchAPI } from "../../utils"; // Utility function for making API requests
import { jwtDecode } from "jwt-decode"; // Library to decode JWT tokens

// Factory function to create a Zustand slice for managing authentication-related state and actions
const createAuthSlice = (set, get) => ({
  loggedInMember: null,
  token: null,
  decodedToken: null,

  // Action to log in a member
  memberLogin: async (data) => {
    try {
      const loginResponse = await fetchAPI({ method: "post", url: "/members/login", data });
      const loginData = loginResponse.data;

      // Check if the member needs to set up a password
      if (loginData.requiresPasswordSetup) {
        set({ decodedToken: loginData.memberId }); // Store member ID in decodedToken
        return loginData; // Return data for further handling (e.g., redirect to password setup)
      }

      const token = loginData;
      sessionStorage.setItem("lh_token", token); 
      const decodedToken = jwtDecode(token); 
      set({ decodedToken, token }); 

      // Fetch member details using the decoded token's ID
      const memberResponse = await fetchAPI({ url: "/members/" + decodedToken.id, token });
      set({ loggedInMember: memberResponse.data }); // Update state with member data
      sessionStorage.setItem("lh_member", JSON.stringify(memberResponse.data)); 
      return token; // Return token to indicate successful login
    } catch (err) {
      console.error("Login error:", err); 
    }
  },

  // Action to sign up a new member
  memberSignup: async (data) => {
    try {
      await fetchAPI({
        method: 'post',
        url: '/members/new-member',
        data,
      });
      return true; 
    } catch (error) {
      console.log(error); 
      return false;
    }
  },

  // Action to reset a member's password
  memberResetPassword: async (data) => {
    try {
      await fetchAPI({
        method: 'post',
        url: '/members/new-password',
        data
      });
    } catch (err) {
      console.error('Error in ResetPassword', err); 
    }
  },

  // Action to log out the current member
  memberLogout: () => {
    sessionStorage.removeItem("lh_token"); 
    sessionStorage.removeItem("lh_member"); 
    set({ loggedInMember: null, token: null, decodedToken: null });
  },

  // Action to check and restore member login status
  memberCheck: async () => {
    try {
      // Skip if member is already logged in
      if (get().loggedInMember) {
        return;
      }

      // Retrieve token from session storage
      const token = sessionStorage.getItem('lh_token');
      if (!token) {
        return; // Exit if no token is found
      }
      const decodedToken = jwtDecode(token); 

      const loggedInMember = JSON.parse(sessionStorage.getItem('lh_member'));
      if (!loggedInMember) {
        return get().memberLogout(); // Logout if member data is missing
      }

      // Update state with persisted token and member data
      set({ token, decodedToken, loggedInMember });
    } catch (error) {
      console.log(error); 
    }
  },
});

export default createAuthSlice;