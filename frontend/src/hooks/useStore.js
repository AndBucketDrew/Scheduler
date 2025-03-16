import { create } from "zustand";
import createAuthSlice from "./store-slices/authStore.js";
import createEventSlice from "./store-slices/eventStore.js";
import createMemberSlice from "./store-slices/memberStore.js";
import createUISlice from "./store-slices/uiStore.js";

// Makes the useStore cleanier and the code more readable
const useStore = create((set, get) => ({
  ...createAuthSlice(set, get),
  ...createEventSlice(set, get),
  ...createMemberSlice(set, get),
  ...createUISlice(set, get),
}));

export default useStore;