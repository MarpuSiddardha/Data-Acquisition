import { alarmStyles } from "@/styles/alarmStyles";

const widgetStyles = {
  widgetstyle: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "8px",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    aspectRatio: "1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    minWidth: "90%",
    minHeight: "90%",
    height: "90%",
    width: "90%",
  },
  title: {
    color: "#1E3A8A",
    fontFamily: "Poppins",
    fontSize: "1rem",
    marginTop: "-14px",
  },
  exportButton: {
    bgcolor: "#1E3A8A",
    color: "White",
    mr: 1,
    fontSize: "0.75rem",
  },
  closeButton: {
    bgcolor: "#1E3A8A",
    color: "white",
    fontSize: "0.75rem",
    padding: "4px 8px",
  },
  newBtnStyles: {
    ...alarmStyles.modalCancelBtn, color: '#fff', backgroundColor: '#1e3a8a', marginLeft: '1em', padding: '.35em 1em',
    ":hover": 'none'
  },

  tableHeaderStyle: {
    backgroundColor: "#D9E6FF",
    padding: "8px",
    borderBottom: "2px solid #ddd",
    fontWeight: "bold",
    textAlign: "left",
  },
  tableRowStyle: {
    borderBottom: "1px solid #ddd",
  },
  tableCellStyle: {
    padding: "8px",
    textAlign: "left",
  },
};

export { widgetStyles };
