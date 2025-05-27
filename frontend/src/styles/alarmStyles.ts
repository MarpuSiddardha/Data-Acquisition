const alarmStyles = {
  /* Alarms.tsx Styles */

  snfContainer: (isSidebarOpen: boolean) => ({
    display: "flex",
    gap: "1.5em",
    fontFamily: "Poppins",
    padding: "2em 2em 0 2em",
    alignItems: "center",
    marginLeft: !isSidebarOpen ? "" : "10%",
  }),

  search: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "20px",
      fontFamily: "Poppins",
      fontSize: ".85rem",
      color: "#1e3a8a",
      "& fieldset": {
        borderColor: "#1e3a8a",
      },
      "&:hover fieldset": {
        borderColor: "#1e3a8a",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1e3a8a",
      },
    },
    "& .MuiInputLabel-root": {
      display: "none",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1rem",
      color: "#1e3a8a",
    },
  },

  filterContainer: {
    display: "flex",
    gap: ".5em",
    alignItems: "center",
  },

  filterText: {
    fontFamily: "Poppins",
    fontSize: ".85rem",
    fontWeight: 500,
    color: "#1e3a8a",
  },

  filter: {
    width: "150px",
    height: "36px",
    fontFamily: "Poppins",
    fontSize: "0.8rem",
    color: "#1e3a8a",
    borderRadius: "12px",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#1e3a8a",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#1e3a8a",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#1e3a8a",
    },
    "& .MuiSelect-icon": {
      color: "#1e3a8a",
    },
  },

  filterOptions: {
    PaperProps: {
      sx: {
        width: "110px",
        fontFamily: "Poppins",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        color: "#1e3a8a",
        "& .MuiMenuItem-root": {
          color: "#1e3a8a",
          fontSize: ".8rem",
          height: "25px",
          "&:hover": {
            backgroundColor: "#f0f4ff",
          },
          "&.Mui-selected": {
            backgroundColor: "#e0eaff",
            "&:hover": {
              backgroundColor: "#d0e0ff",
            },
          },
          "&.Mui-focusVisible": {
            display: "none",
          },
        },
      },
    },
  },

  clearFilters: {
    fontFamily: "Poppins",
    fontSize: ".85rem",
    fontWeight: "300",
    color: "#1e3a8a",
    ":hover": { cursor: "pointer", color: "#ef4444" },
    textDecoration: "underline",
  },

  /* Modal Styles */

  modalContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: 500,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 3,
    maxHeight: "90%",
    overflowY: "auto",
    borderRadius: 2,
    display: "flex",
    flexDirection: "column",
    gap: 1,
    "&::-webkit-scrollbar": {
      width: "0.5em",
    },
    "&::-webkit-scrollbar-track": {
      boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
      webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#cbd5e1",
      outline: "1px solid #334155",
      borderRadius: "10px",
    },
  },

  modalTitle: {
    fontFamily: "Poppins",
    color: "#1e3a8a",
    fontWeight: "600",
  },

  modalBtnsContainer: { display: "flex", justifyContent: "flex-end", gap: 1 },

  modalCancelBtn: {
    borderColor: "#D1D5DB",
    color: "#1e3a8a",
    backgroundColor: "#ffffff",
    fontWeight: "600",
    textTransform: "none",
    borderRadius: 2,
    ":hover": {
      backgroundColor: "#f0f4ff",
      color: "#1e3a8a",
      fontWeight: "700",
    },
  },

  modalSaveBtn: {
    borderColor: "#1e3a8a",
    color: "#1e3a8a",
    backgroundColor: "#f0f4ff",
    fontWeight: "800",
    textTransform: "none",
    borderRadius: 2,
    ":hover": {
      backgroundColor: "#1e3a8a",
      color: "#f0f4ff",
      fontWeight: "600",
    },
  },

  statusModalText: {
    fontFamily: "Poppins",
    fontSize: "0.85rem",
    mb: 0,
    color: "#1e3a8a",
    fontWeight: "300",
  },

  statusModalTextSpan: { fontWeight: "500" },

  statusModalInputLabel: {
    fontSize: ".85rem",
    color: "#1e3a8a",
    fontWeight: "600",
  },

  statusModalInputOptions: { fontSize: "1rem", maxWidth: "40%" },

  detailModalListContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },

  detailModalList: { display: "flex", flexDirection: "row", width: "100%" },

  detailModalListDetailBox1: {
    width: "40%",
    display: "flex",
    alignContent: "flex-end",
    justifyContent: "center",
  },

  detailModalListDetailBox2: { width: "60%" },

  detailModalListText: {
    fontFamily: "Poppins",
    fontSize: "0.75rem",
    backgroundColor: "#f0f4ff",
    width: "100%",
    borderRadius: "20px",
    color: "#1e3a8a",
    padding: ".2em 1em",
    fontWeight: "300",
  },

  detailModalListDetail: {
    fontFamily: "Poppins",
    fontSize: "0.75rem",
    backgroundColor: "#f0f4ff",
    width: "100%",
    borderRadius: "20px",
    color: "#1e3a8a",
    padding: ".2em 1em",
    fontWeight: "500",
  },

  detailModalInput: {
  width: "100%",
  marginTop: 1,
  backgroundColor: "#fff",
  borderRadius: 2,
  fontFamily: "Poppins",
  fontSize: "0.85rem",
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    "& fieldset": {
      borderColor: "#D1D5DB",
    },
    "&:hover fieldset": {
      borderColor: "#D1D5DB",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#D1D5DB",
      borderWidth: 2,
    },
  },
  "& .MuiInputBase-input": {
    color: "#1e3a8a",
    fontWeight: 500,
    padding: ".25em 1.25em",
  },
  "& .MuiInputLabel-root": {
    color: "#1e3a8a",
    fontWeight: 600,
  },
  "& .Mui-focused.MuiInputLabel-root": {
    color: "#1e3a8a",
  },
},

};

export { alarmStyles };
