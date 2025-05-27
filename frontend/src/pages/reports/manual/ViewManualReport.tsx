import React, { useState, useEffect, useContext } from "react";
import { Box, Toolbar, Typography, IconButton, Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import EditScheduleDialogBox from "./EditScheduleDialogBox";
import axios from "axios";
import { fetchManualReports } from "@/store/ManualReportsSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { widgetStyles } from "@/styles/widgetStyles";
import { SaveRounded } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Highcharts from "highcharts";

import GetAppIcon from "@mui/icons-material/GetApp";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";
import Modal from "@mui/material/Modal";
import html2canvas from "html2canvas";
import { useRef } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";

import AlarmsTableDialog from "./cards/AlarmsTableDialog";
import BarChartDialog from "./cards/BarChartDialog";
import LineChartDialog from "./cards/LineChartDialog";
import SensorDataDialog from "./cards/SensorDataDialog";
import TimeSeriesChartDialog from "./cards/TimeSerieschartDialog";
import ValueAndChartCard from "./cards/ValueAndChartDialog";
import ValueCardDialog from "./cards/ValueCardDialog";

import AlarmTable from "@/pages/reports/manual/widgets/AlarmTable";
import BarChart from "@/pages/reports/manual/widgets/BarChart";
import LineChart from "@/pages/reports/manual/widgets/LineChart";
import SensorDataTable from "@/pages/reports/manual/widgets/SensorDataTable";
import TimeSeriesChart from "@/pages/reports/manual/widgets/TimeSeriesChart";
import ValueAndChart from "@/pages/reports/manual/widgets/ValueAndChart";
import ValueCard from "@/pages/reports/manual/widgets/ValueCard";

import { SidebarContext } from "@/context/SidebarContext";
import { WidgetData } from "@/utils/types";

import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import ManageScheduleDialog from "@/pages/reports/automated/scheduleManagement/ManageScheduleDialog";
import { alarmStyles } from "@/styles/alarmStyles";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import CancelPresentationRoundedIcon from "@mui/icons-material/CancelPresentationRounded";

const CreateReport: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { isSidebarOpen } = useContext(SidebarContext);
  const [manageScheduleOpen, setManageScheduleOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showEditButton, setShowEditButton] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const refreshCount = 0;
  const [widgets, setWidgets] = useState<WidgetData[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  const [enlargedWidget, setEnlargedWidget] = useState<number | null>(null);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    if (!reportId) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8091/manual-reports/${reportId}/view`
        );
        console.log("Report Data:", response.data);
        setLoading(false);
        if (isMounted) {
          setReportData(response.data);

          setWidgets(response.data.layout?.widgets || []);
          console.log("Report Data:", widgets);
        }
      } catch (error) {
        if (isMounted) {
          toast.dismiss();
          toast.error("Failed to fetch report data.");
          console.error("Error fetching report:", error);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [reportId, refreshCount]);

  if (loading) return <Typography>Loading...</Typography>;

  const handleEdit = () => {
    setIsEditing(true);
    setShowEditButton(true);
  };

  const handleConfirm = async () => {
    try {
      // If you have changes that need to be saved to the backend, do that here
      // For example:
      // await axios.post(`http://localhost:8091/manual-reports/${reportId}/update`, { /* updated data */ });

      setIsEditing(false);
      setShowEditButton(false);

      const response = await axios.get(
        `http://localhost:8091/manual-reports/${reportId}/view`
      );
      setReportData(response.data);
      setWidgets(response.data.layout?.widgets || []);

      toast.success("Changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    dispatch(fetchManualReports());
    navigate("/reports-analytics/manual");
  };

  const handleScheduleClickOpen = () => {
    setManageScheduleOpen(true);
  };
  const handleScheduleClose = () => {
    setManageScheduleOpen(false);
  };

  const handleEnlargeWidget = (index: number) => {
    setEnlargedWidget(index);
  };

  const handleCloseEnlargedWidget = () => {
    setEnlargedWidget(null);
  };

  const renderEnlargedWidget = () => {
    if (enlargedWidget === null || !widgets[enlargedWidget]) return null;

    const widget = widgets[enlargedWidget];
    const isEmpty = !widget.data || Object.keys(widget.data).length === 0;

    return (
      <Modal
        open={enlargedWidget !== null}
        onClose={handleCloseEnlargedWidget}
        aria-labelledby="enlarged-widget-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            height: "90%",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            overflow: "auto",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography
              variant="h6"
              sx={{ color: "#1E3A8A", fontFamily: "Poppins" }}
            >
              {widget.widgetName}
            </Typography>
            <IconButton onClick={handleCloseEnlargedWidget}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ height: "calc(100% - 60px)" }}>
            {isEmpty ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
                No data available
              </Typography>
            ) : (
              <>
                {widget.widgetName === "Sensor Data Table" && (
                  <SensorDataTable data={widget.data} />
                )}
                {widget.widgetName === "Alarms Table" && (
                  <AlarmTable widgetData={widget.data} />
                )}
                {widget.widgetName === "Line Chart" && (
                  <LineChart data={widget.data} />
                )}
                {widget.widgetName === "Bar Chart" && (
                  <BarChart data={widget.data} />
                )}
                {widget.widgetName === "Value and Chart Card" && (
                  <ValueAndChart data={widget.data} />
                )}
                {widget.widgetName === "Time Series Chart" && (
                  <TimeSeriesChart data={widget.data} />
                )}
                {widget.widgetName === "Value Card" && (
                  <ValueCard
                    data={widget.data}
                    widgetName={widget.widgetName}
                  />
                )}
              </>
            )}
          </Box>
        </Box>
      </Modal>
    );
  };

  const handleDownload = async () => {
    const toastId = toast.loading("Generating PDF...");

    try {
      const element = divRef.current;
      if (element) {
        const originalHeight = element.style.height;
        const originalOverflow = element.style.overflow;
        element.style.height = "auto";
        element.style.overflow = "visible";

        await new Promise((resolve) => setTimeout(resolve, 500));

        Highcharts.charts.forEach((chart) => {
          if (chart) {
            chart.reflow();
            chart.redraw();
          }
        });

        const canvas = await html2canvas(element, {
          scale: 2,
          scrollX: 0,
          scrollY: -window.scrollY,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const margin = 10;
        const pdfWidth = 210 - 2 * margin;
        const pdfHeight = 297 - 2 * margin;

        const imgWidth = Math.min(
          pdfWidth,
          (canvas.width * pdfHeight) / canvas.height
        );
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
        pdf.save(`${reportData.reportType}.pdf`);

        // Step 4: Revert container styles
        element.style.height = originalHeight;
        element.style.overflow = originalOverflow;

        toast.update(toastId, {
          render: "PDF downloaded successfully",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.dismiss();
      toast.update(toastId, {
        render: "Error downloading the report",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      console.error("Error downloading the report:", error);
    }
  };

  const handleDownloadWidget = async (widgetId: string, widgetName: string) => {
    const toastId = toast.loading(`Downloading ${widgetName} PDF...`);

    try {
      const element = document.getElementById(widgetId);
      if (!element) {
        throw new Error("Widget not found!");
      }

      const pdf = new jsPDF("p", "mm", "a4");
      const margin = 10;
      const pageWidth = 210 - 2 * margin;
      let position = margin;

      // Handle SensorDataTable separately with jspdf-autotable
      if (widgetName === "Sensor Data Table" || widgetName === "Alarms Table") {
        const table = element.querySelector("table");
        if (!table) {
          throw new Error("Table element not found inside widget!");
        }

        const rows = Array.from(table.querySelectorAll("tr")).map((row) => {
          const cols = Array.from(row.querySelectorAll("th, td")).map(
            (col) => col.textContent || ""
          );
          return cols;
        });
        const headers = ["Timestamp", "Value", "Sensor ID"];
        const data = rows.slice(1);
        autoTable(pdf, {
          head: [headers],
          body: data,
          startY: position,
          margin: { top: margin, right: margin, bottom: margin, left: margin },
          theme: "striped",
          styles: { overflow: "linebreak" },
          columnStyles: {
            0: { cellWidth: "auto" },
            1: { cellWidth: "auto" },
            2: { cellWidth: "auto" },
          },
        });
      } else {
        const originalHeight = element.style.height;
        const originalOverflow = element.style.overflow;

        element.style.height = "auto";
        element.style.overflow = "visible";
        element.style.maxHeight = "none";

        await new Promise((resolve) => setTimeout(resolve, 500));

        Highcharts.charts.forEach((chart) => {
          if (chart) {
            chart.reflow();
            chart.redraw();
          }
        });

        const canvas = await html2canvas(element, {
          scale: 2,
          width: element.scrollWidth,
          height: element.scrollHeight,
          scrollX: 0,
          scrollY: -window.scrollY,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pageHeight = 297 - 2 * margin;

        if (position + imgHeight > pageHeight) {
          pdf.addPage();
          position = margin;
        }

        pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
        position += imgHeight;

        // Revert styles
        element.style.height = originalHeight;
        element.style.overflow = originalOverflow;
        element.style.maxHeight = "";
      }

      pdf.save(`${widgetName}.pdf`);

      toast.update(toastId, {
        render: `${widgetName} PDF downloaded successfully`,
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
    } catch (error) {
      toast.dismiss();
      toast.update(toastId, {
        render: `Error downloading ${widgetName}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      console.error(`Error downloading ${widgetName}:`, error);
    }
  };

  return (
    <Box
      id="container"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box
        sx={{
          height: "50px",
          bgcolor: "#D9e6ff",
          width: "100%",
          display: "flex",
          zIndex: 10,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Typography variant="h6" sx={widgetStyles.title}>
            {reportData?.reportType || "Report Details"}
          </Typography>
          <Box sx={{ marginTop: "-14px", display: "flex", gap: "10px" }}>
            <Button
              variant="contained"
              onClick={handleScheduleClickOpen}
              startIcon={<ManageAccountsRoundedIcon />}
              size="small"
              sx={{ ...alarmStyles.modalCancelBtn, marginLeft: "auto" }}
            >
              Manage Schedule
            </Button>
            {!isEditing ? (
              <Button
                variant="contained"
                sx={alarmStyles.modalCancelBtn}
                startIcon={<EditNoteRoundedIcon />}
                onClick={handleEdit}
              >
                Edit
              </Button>
            ) : (
              <Button
                variant="contained"
                sx={alarmStyles.modalCancelBtn}
                startIcon={<EditNoteRoundedIcon />}
                onClick={() => setOpenDialog("editSchedule")}
              >
                Edit Schedule
              </Button>
            )}
            <Button
              variant="contained"
              sx={alarmStyles.modalCancelBtn}
              startIcon={<CancelPresentationRoundedIcon />}
              onClick={handleClose}
            >
              Close
            </Button>
            <Button
              variant="contained"
              sx={{
                ...alarmStyles.modalSaveBtn,
                color: "#f0f4ff",
                backgroundColor: "#1e3a8a",
              }}
              startIcon={<SaveRounded />}
              onClick={handleConfirm}
            >
              Save
            </Button>
            <Button
              size="small"
              sx={{
                ...widgetStyles.newBtnStyles,
                fontFamily: "Poppins",
                display: isEditing ? "none" : "flex",
              }}
              startIcon={<FileDownloadRoundedIcon />}
              onClick={handleDownload}
            >
              Export to PDF
            </Button>
          </Box>
        </Toolbar>
      </Box>

      <Box
        sx={{
          paddingLeft: 3,
          paddingTop: 2,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflowY: "auto",
          height: "calc(100vh - 50px)",
          width: "100%",
          gap: "30px",
          marginY: "20px",
          "@media (max-width: 900px)": {
            gridTemplateColumns: "1fr",
          },
        }}
        ref={divRef}
      >
        {widgets.map((widget, index) => {
          if (widget.widgetName === "Sensor Data Table") {
            return (
              <Box
                key={index}
                id={`widget-${index}`}
                sx={{
                  ...widgetStyles.widgetstyle,
                  minHeight: "400px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEnlargeWidget(index)}
                    sx={{ mr: 1 }}
                  >
                    <OpenInFullIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleDownloadWidget(`widget-${index}`, widget.widgetName)
                    }
                  >
                    <GetAppIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 10,

                    fontWeight: "bold",
                    color: "text.secondary",
                    fontFamily: "poppins",
                  }}
                >
                  {widget.widgetName}
                </Typography>

                {showEditButton ? (
                  <SensorDataDialog showEditButton={showEditButton} />
                ) : (
                  <SensorDataTable data={widget.data} />
                )}
              </Box>
            );
          }

          if (widget.widgetName === "Alarms Table") {
            return (
              <Box
                key={index}
                id={`widget-${index}`}
                sx={{
                  ...widgetStyles.widgetstyle,
                  minHeight: "400px",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEnlargeWidget(index)}
                    sx={{ mr: 1 }}
                  >
                    <OpenInFullIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleDownloadWidget(`widget-${index}`, widget.widgetName)
                    }
                  >
                    <GetAppIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 10,

                    fontWeight: "bold",
                    color: "text.secondary",
                    fontFamily: "poppins",
                  }}
                >
                  {widget.widgetName}
                </Typography>

                {showEditButton ? (
                  <AlarmsTableDialog showEditButton={showEditButton} />
                ) : (
                  <AlarmTable widgetData={widget.data} />
                )}
              </Box>
            );
          }

          if (widget.widgetName === "Line Chart") {
            return (
              <Box
                key={index}
                id={`widget-${index}`}
                sx={{ ...widgetStyles.widgetstyle, minHeight: "400px" }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEnlargeWidget(index)}
                    sx={{ mr: 1 }}
                  >
                    <OpenInFullIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleDownloadWidget(`widget-${index}`, widget.widgetName)
                    }
                  >
                    <GetAppIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 10,

                    fontWeight: "bold",
                    color: "text.secondary",
                    fontFamily: "poppins",
                  }}
                >
                  {widget.widgetName}
                </Typography>

                {showEditButton ? (
                  <LineChartDialog showEditButton={showEditButton} />
                ) : (
                  <LineChart data={widget.data} />
                )}
              </Box>
            );
          }

          if (widget.widgetName === "Bar Chart") {
            return (
              <Box
                key={index}
                id={`widget-${index}`}
                sx={{ ...widgetStyles.widgetstyle, minHeight: "400px" }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                  }}
                >
                  {/* Add enlarge button */}
                  <IconButton
                    size="small"
                    onClick={() => handleEnlargeWidget(index)}
                    sx={{ mr: 1 }}
                  >
                    <OpenInFullIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleDownloadWidget(`widget-${index}`, widget.widgetName)
                    }
                  >
                    <GetAppIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 10,

                    fontWeight: "bold",
                    color: "text.secondary",
                    fontFamily: "poppins",
                  }}
                >
                  {widget.widgetName}
                </Typography>

                {showEditButton ? (
                  <BarChartDialog showEditButton={showEditButton} />
                ) : (
                  <BarChart data={widget.data} />
                )}
              </Box>
            );
          }

          if (widget.widgetName === "Value and Chart Card") {
            return (
              <Box
                key={index}
                id={`widget-${index}`}
                sx={{ ...widgetStyles.widgetstyle, minHeight: "400px" }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEnlargeWidget(index)}
                    sx={{ mr: 1 }}
                  >
                    <OpenInFullIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleDownloadWidget(`widget-${index}`, widget.widgetName)
                    }
                  >
                    <GetAppIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 10,

                    fontWeight: "bold",
                    color: "text.secondary",
                    fontFamily: "poppins",
                  }}
                >
                  {widget.widgetName}
                </Typography>
                {showEditButton ? (
                  <ValueAndChartCard showEditButton={showEditButton} />
                ) : (
                  <ValueAndChart data={widget.data} />
                )}
              </Box>
            );
          }

          if (widget.widgetName === "Time Series Chart") {
            return (
              <Box
                key={index}
                id={`widget-${index}`}
                sx={{ ...widgetStyles.widgetstyle, minHeight: "400px" }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEnlargeWidget(index)}
                    sx={{ mr: 1 }}
                  >
                    <OpenInFullIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleDownloadWidget(`widget-${index}`, widget.widgetName)
                    }
                  >
                    <GetAppIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: 6,
                    left: 10,

                    fontWeight: "bold",
                    color: "text.secondary",
                    fontFamily: "poppins",
                  }}
                >
                  {widget.widgetName}
                </Typography>

                {showEditButton ? (
                  <TimeSeriesChartDialog showEditButton={showEditButton} />
                ) : (
                  <TimeSeriesChart data={widget.data} />
                )}
              </Box>
            );
          }

          if (widget.widgetName === "Value Card") {
            return (
              <Box
                key={index}
                id={`widget-${index}`}
                sx={{ ...widgetStyles.widgetstyle, minHeight: "400px" }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEnlargeWidget(index)}
                    sx={{ mr: 1 }}
                  >
                    <OpenInFullIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleDownloadWidget(`widget-${index}`, widget.widgetName)
                    }
                  >
                    <GetAppIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: 8,
                    left: 10,

                    fontWeight: "bold",
                    color: "text.secondary",
                    fontFamily: "poppins",
                  }}
                >
                  {widget.widgetName}
                </Typography>

                {showEditButton ? (
                  <ValueCardDialog showEditButton={showEditButton} />
                ) : (
                  <ValueCard
                    data={widget.data}
                    widgetName={widget.widgetName}
                  />
                )}
              </Box>
            );
          }
        })}
      </Box>

      {renderEnlargedWidget()}

      <EditScheduleDialogBox
        open={openDialog === "editSchedule"}
        reportId={reportId}
        onClose={() => setOpenDialog("")}
      />

      <ManageScheduleDialog
        open={manageScheduleOpen}
        onClose={handleScheduleClose}
      />

      <ToastContainer />
    </Box>
  );
};

export default CreateReport;
