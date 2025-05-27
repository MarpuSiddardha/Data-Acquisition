const sidebarStyles = {
  root: (isMobile: boolean) => ({
    display: "flex",
    flexDirection: "column",
    width: isMobile ? "90%" : "240px",
    height: "calc(100vh - 50px)",
    backgroundColor: "#F0F4FF",
    color: "red",
    position: "fixed",
    top: "50px",
    left: 0,
    zIndex: 999,
  }),
  title: {
    height: {
      lg: "50px",
      md: "50px",
    },
    padding: ".5em 1em",
    color: "#1E3A8A",
    fontWeight: "bold",
    fontSize: {
      lg: "1.25rem",
      md: "1rem",
    },
    fontFamily: "Poppins",
    marginLeft: "1em",
  },
  list: {
    flexGrow: 1,
    p: 1,
    justifyContent: "space-between",
  },

  listItemIcon: (isSelected: boolean) => ({
    color: isSelected ? "#F0F4FF" : "#1E3A8A",
    minWidth: "auto",
    margin: "0 .5em 0 1em",
    transition: "color 0.3s ease-in-out",
  }),
  listItemText: (isSelected: boolean) => ({
    color: isSelected ? "#F0F4FF" : "#1E3A8A",
    fontFamily: "Poppins",
    fontWeight: "500",
    transition: "color 0.3s ease-in-out",
  }),
  listItemButton: (isSelected: boolean) => ({
    backgroundColor: isSelected ? "#1E3A8A !important" : "transparent",
    borderRadius: "8px",
    "&:hover": {
      backgroundColor: "#E0E7FF",
    },
  }),
};

export { sidebarStyles };
