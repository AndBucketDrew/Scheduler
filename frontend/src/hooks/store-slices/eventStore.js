import { fetchAPI } from "../../utils"; // Utility function for making API requests

// Factory function to create a Zustand slice for managing event-related state and actions
const createEventSlice = (set) => ({
  events: [],
  event: null,
  eventTypes: [],
  swapRequests: [],
  myPendingSwapRequests: [],
  loading: false,

  // Action to fetch events from a specified endpoint
  fetchEvents: async (endpoint) => {
    try {
      set({ loading: true }); 
      const response = await fetchAPI({ method: "GET", url: endpoint }); 
      set({ events: response.data || [], loading: false }); 
    } catch (err) {
      if (err.response?.status === 404) {
        // Handle 404 gracefully by setting events to an empty array
        console.log("No events found for this user, returning empty array");
        set({ events: [], loading: false });
      } else {
        // Log other errors and set events to empty array
        console.error("Error fetching events:", err.message || err);
        set({ events: [], loading: false });
      }
    }
  },

  // Action to fetch a single event by ID
  fetchSingleEvent: async (eventId) => {
    try {
      set({ loading: true }); 
      const response = await fetchAPI({ method: "GET", url: `/shifts/single-shift/${eventId}` }); 
      set({ loading: false, event: response.data }); 
      // console.log(response.data); 
      return response.data; 
    } catch (err) {
      console.error("Error fetching event", err); 
      set({ loading: false }); 
      return null;
    }
  },

  // Action to create a new event
  createEvent: async (eventData) => {
    try {
      set({ loading: true }); 
      const token = sessionStorage.getItem("lh_token"); 
      const response = await fetchAPI({ method: "post", url: "/shifts/new-shift", data: eventData, token }); 
      set({ loading: false }); 
      return response.data; 
    } catch (err) {
      console.error("Error creating event", err); 
      set({ loading: false }); 
      return null;
    }
  },

  // Action to delete an event by ID
  deleteEvent: async (eventId) => {
    try {
      set({ loading: true }); 
      const token = sessionStorage.getItem("lh_token"); 
      await fetchAPI({
        method: "delete",
        url: `/shifts/${eventId}`,
        token,
      }); // Delete event
      // Update state by filtering out the deleted event
      set((state) => ({
        ...state,
        events: state.events.filter(event => event._id !== eventId),
        loading: false,
      }));
      return { success: true, message: "Shift deleted successfully" }; // Return success response
    } catch (err) {
      console.error("Error deleting event:", err); 
      set({ loading: false }); 
      return { success: false, message: err.response?.data?.message || "Failed to delete shift" };
    }
  },

  // Action to fetch all event types
  fetchEventTypes: async () => {
    try {
      set({ loading: true }); 
      const response = await fetchAPI({
        method: 'get',
        url: '/shifts/event-type',
      }); 
      // console.log('Fetched event types:', response.data); 
      set({ eventTypes: response.data || [], loading: false }); // Update eventTypes state
    } catch (err) {
      console.error('Error fetching event types:', err); 
      set({ loading: false, error: 'Failed to fetch event types' }); 
    }
  },

  // Action to create a new event type
  createEventType: async (eventTypeData) => {
    try {
      set({ loading: true });
      const token = sessionStorage.getItem("lh_token"); 
      const response = await fetchAPI({
        method: "post",
        url: "/shifts/event-type",
        data: eventTypeData,
        token
      });
      // Append new event type to the existing list
      set((state) => ({
        ...state,
        eventTypes: [...state.eventTypes, response.data],
        loading: false
      }));
      return { data: response.data }; 
    } catch (err) {
      console.error("Error creating event type:", err); 
      set({ loading: false }); 
      return { message: err.response?.data?.message || "Failed to create event type" }; 
    }
  },

  // Action to delete an event type by ID
  deleteEventType: async (eventTypeId) => {
    try {
      set({ loading: true });
      const token = sessionStorage.getItem("lh_token"); 
      const response = await fetchAPI({
        method: "delete",
        url: `/shifts/event-type/${eventTypeId}`,
        token
      }); // Delete event type
      // Filter out the deleted event type from the list
      set((state) => ({
        ...state,
        eventTypes: state.eventTypes.filter(type => type._id !== eventTypeId),
        loading: false
      }));
      return { message: response.data || "Event type deleted successfully" }; 
    } catch (err) {
      console.error("Error deleting event type:", err); 
      set({ loading: false }); 
      return { message: err.response?.data?.message || "Failed to delete event type" }; 
    }
  },

  // Action to update an event type by ID
  updateEventType: async (eventTypeId, eventTypeData) => {
    try {
      set({ loading: true });
      const token = sessionStorage.getItem("lh_token"); 
      const response = await fetchAPI({
        method: "put",
        url: `/shifts/event-type/${eventTypeId}`,
        data: eventTypeData,
        token,
      }); 
      // console.log('Updated event type response:', response.data);
      set((state) => ({
        ...state,
        eventTypes: state.eventTypes.map(type => 
          type._id === eventTypeId ? response.data : type
        ),
        loading: false
      }));
      return { data: response.data }; // Return updated event type data
    } catch (err) {
      console.error("Error updating event type:", err); 
      set({ loading: false }); 
      return { message: err.response?.data?.message || "Failed to update event type" };
    }
  },

  // Action to update a shift by ID
  updateShift: async (shiftId, shiftData) => {
    try {
      set({ loading: true });  
      const token = sessionStorage.getItem("lh_token"); 
      const response = await fetchAPI({
        method: "put",
        url: `/shifts/${shiftId}`,
        data: shiftData,
        token,
      }); // Update shift
      set({ loading: false }); 
      return response.data; 
    } catch (err) {
      console.error("Error updating shift", err); 
      set({ loading: false }); 
      return null; 
    }
  },

  // Action to request an event swap
  requestEventSwap: async (userId, { fromEventId, toEventId, toMemberId }) => {
    try {
      set({ loading: true }); 
      const token = sessionStorage.getItem('lh_token'); 
      const response = await fetchAPI({
        method: 'POST',
        url: `/shifts/swap-shift/${userId}`,
        data: { fromEventId, toEventId, toMemberId },
        token,
      }); 
      set({ loading: false }); 
      return { success: true, message: 'Swap request created successfully!', data: response.data };
    } catch (err) {
      console.error('Error requesting swap:', err); 
      set({ loading: false }); 
      return { success: false, message: err.message || 'Failed to create swap request. Please try again.' }; 
    }
  },

  // Action to fetch swap requests directed at the logged-in user awaiting their response
  fetchMyPendingSwapRequests: async (userId) => {
    try {
      set({ loading: true });
      const token = sessionStorage.getItem('lh_token');
      const response = await fetchAPI({
        method: 'get',
        url: `/shifts/swap-shift/my-requests/${userId}`,
        token,
      });
      set({ myPendingSwapRequests: response.data || [], loading: false });
    } catch (err) {
      console.error('Error fetching swap requests for member:', err);
      set({ myPendingSwapRequests: [], loading: false });
    }
  },

  // Action for the second user to accept or decline a swap request
  respondToSwapRequest: async (userId, swapRequestId, accept) => {
    try {
      set({ loading: true });
      const token = sessionStorage.getItem('lh_token');
      const response = await fetchAPI({
        method: 'POST',
        url: `/shifts/swap-shift/respond/${userId}`,
        data: { swapRequestId, accept },
        token,
      });
      set({ loading: false });
      return { success: true, message: response.data.message };
    } catch (err) {
      console.error('Error responding to swap request:', err);
      set({ loading: false });
      return { success: false, message: err.message || 'Failed to respond to swap request.' };
    }
  },

  // Action to fetch pending swap requests
  fetchPendingSwapRequests: async () => {
    try {
      set({ loading: true }); 
      const response = await fetchAPI({
        method: 'get',
        url: '/shifts/pending',
      }); 
      set({ swapRequests: response.data || [], loading: false }); // Update swapRequests state
    } catch (err) {
      console.error('Error fetching pending swap requests:', err); 
      set({ loading: false }); 
    }
  },
});

export default createEventSlice;