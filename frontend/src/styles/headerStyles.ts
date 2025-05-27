const headerStyles = {
  container: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row",
    height: "50px",
    width: "100vw",
    fontWeight: "500",
    backgroundColor: "#F0F4FF",
    color: "#1E3A8A",
    padding: "0 1em",
    postition: "fixed",
    backdropFilter: "blur(20px)",
    top: 0,
    left: 0,
    zIndex: 1000,
  },
  title: {
    color: "#1E3A8A",
    fontWeight: "bold",
    fontSize: {
      lg: "1.25rem",
      md: "1rem",
    },
    fontFamily: "Poppins",
    marginLeft: ".5em",
  },
  notifProfileContainer: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  notifProfileDetail: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
    backgroundColor: "#F9FAFB",
    padding: ".375em .75em",
    borderRadius: "8px",
    border: "1px solid #0000001A",
    boxShadow: "0 1px 2px #0000000D",
  },
  notifProfileIcon: {
    fontSize: "1rem",
    color: "#1E3A8A",
  },
  notifProfileLabel: {
    marginLeft: 2,
    color: "#1E3A8A",
    fontWeight: "500",
    fontSize: ".85rem",
  },
};

export { headerStyles };
