const createUISlice = (set) => ({
    showPassword: false,
    collapsed: false,
    alert: null,
    dialog: null,
  
    handleClickShowPassword: () => set((state) => ({ showPassword: !state.showPassword })),
    toggleSidebar: () => set((state) => ({ collapsed: !state.collapsed })),
  
    raiseAlert: (alert = {}) => {
      set({ alert: { severity: "success", variant: "filled", duration: 4000, text: "Default alert", ...alert } });
    },
    destroyAlert: () => set({ alert: null }),
  
    raiseDialog: (dialog = {}) => {
      set({ dialog: { title: "Dialog Title", text: "Dialog Content", ...dialog } });
    },
    destroyDialog: () => set({ dialog: null }),
  });
  
  export default createUISlice;
  