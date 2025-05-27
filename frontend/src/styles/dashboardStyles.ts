const dashboardStyles = (isSidebarOpen: boolean) => ({
  rootContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    gap: "1em",
    padding: ".5em 2em",
    maxHeight: isSidebarOpen ? "100%" : "100%",
  },
  cardsContainer: {
    display: "flex",
    gap: 2,
    justifyContent: "space-between",
    flexWrap: "wrap",
    maxHeight: !isSidebarOpen ? "100%" : "",
  },
  tabsContainer: {
    mt: 0,
    width: "90%",
    overflow: "hidden",
  },
  card: {
    backgroundColor: "#f0f4ff",
    width: "30%",
    display: "flex",
    flexDirection: "column",
    gap: "0.5em",
    borderRadius: "8px",
    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.3)",
    // minHeight: "auto",
    maxHeight: "400px",
    // flexGrow: 1,
  },
  statsRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  chartBox: {
    backgroundColor: "#d0dbff",
    flexGrow: 1,
    minHeight: "120px",
    maxHeight: "100%",
    borderRadius: "8px",
  },
  notifProfileDetail: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "1em",
    backgroundColor: "#f9fafb",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    padding: "0 12px",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
  },
  notifProfileLabel: {
    margin: ".2em",
    color: "#1E3A8A",
    fontWeight: "400",
    fontFamily: "Poppins",
    fontSize: ".85rem",
    // fontWeight: "400"
  },
  notifProfileNumber: { display: "inline", fontWeight: "600" },
  tabsRootContainer: { width: "100%" },
  tabsInnerContainer: {
    display: "flex",
    justifyContent: "start",
    alignItems: "start",
  },
  tabsTabs: {
    minHeight: "32px",
    "& .MuiTabs-indicator": {
      display: "none",
    },
  },
  tabsTab: (index: number, tabIndex: number) => ({
    minHeight: "32px",
    textTransform: "none",
    padding: ".25em 1.3em",
    fontSize: ".85rem",
    fontWeight: "bold",
    fontFamily: "Poppins",
    border: "1px solid #1E3A8A",
    borderRadius: index === 0 ? "10px 0 0 0" : index === 3 ? "0 10px 0 0" : "",
    backgroundColor: tabIndex === index ? "#1E3A8A" : "#fff",
    color: "#1E3A8A",
    "&.Mui-selected": {
      color: "#fff !important",
      backgroundColor: "#1E3A8A",
    },
    "&:hover": {
      backgroundColor: tabIndex === index ? "#1E3A8A" : "#f0f4ff",
    },
  }),

  /* Dashboard Charts Styles */
});

const dashboardChartStyles = {
  chartContainer: { height: "100%", width: "100%" },
};

export { dashboardStyles, dashboardChartStyles };
