import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Toolbar,
  Typography,
  IconButton,
  Skeleton,
  CircularProgress,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Highcharts from "highcharts";
import GetAppIcon from "@mui/icons-material/GetApp";
import { widgetStyles } from "@/styles/widgetStyles";
import { viewautomatedreport } from "@/services/api/apis";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";
import AlarmTable from "@/pages/reports/automated/widgets/AlarmTable";
import SensorDataTable from "@/pages/reports/automated/widgets/SensorDataTable";
import LineChart from "@/pages/reports/automated/widgets/LineChart";
import ValueCard from "@/pages/reports/automated/widgets/ValueCard";
import BarChart from "@/pages/reports/automated/widgets/BarChart";
import ValueAndChartCard from "@/pages/reports/automated/widgets/ValueAndChart";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import ArrowBack from "@mui/icons-material/ArrowBack";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseIcon from "@mui/icons-material/Close";
import Modal from "@mui/material/Modal";


const reportDataCache = new Map<string, any>();

export default function ViewReport() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportId = location.state?.report?.reportId;
  const divRef = useRef<HTMLDivElement>(null);

  const [reportData, setReportData] = useState<any>(null);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enlargedWidget, setEnlargedWidget] = useState<number | null>(null);
  

  const fetchReportData = useCallback(async (id: string) => {
    if (!id) return;
    
    setIsLoading(true);
    
    
    if (reportDataCache.has(id)) {
      const cachedData = reportDataCache.get(id);
      setReportData(cachedData);
      setWidgets(cachedData.layout?.widgets || []);
      setTimeout(() => setIsLoading(false), 100); 
      return;
    }
    
    try {
      const reportid= Number(id);
      const response = await viewautomatedreport(reportid);
      
      reportDataCache.set(id, response);
      setReportData(response);
      setWidgets(response.layout?.widgets || []);
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to fetch report data.");
      console.error("Error fetching report:", error);
    } finally {
      setTimeout(() => setIsLoading(false), 500);
    }
  }, []);
  
  
  useEffect(() => {
    let isMounted = true;
    console.log(isMounted);
    
    if (!reportId) return;
    
    const loadData = async () => {
      await fetchReportData(reportId);
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [reportId, fetchReportData]);


  const processedWidgets = useMemo(() => {
    return widgets.map(widget => {
     
      return widget;
    });
  }, [widgets]);

  const handleEnlargeWidget = useCallback((index: number) => {
    setEnlargedWidget(index);
  }, []);

  const handleCloseEnlargedWidget = useCallback(() => {
    setEnlargedWidget(null);
  }, []);

  const handleDownloadWidget = useCallback(async (widgetId: string, widgetName: string) => {
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
  }, []);

  const handleDownload = useCallback(async () => {
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
  }, [reportData]);

  
  const renderWidgetContent = useCallback((widget: any, index: number) => {
    const isEmpty = !widget.data || Object.keys(widget.data).length === 0;
    const commonBoxProps = {
      key: index,
      id: `widget-${index}`,
      sx: {
        ...widgetStyles.widgetstyle,
        minHeight: "400px",
        position: "relative",
      },
    };

    return (
      <Box {...commonBoxProps}>
        <Box sx={{ position: "absolute", top: 8, right: 8, display: "flex" }}>
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
            left: 16,
            fontWeight: "bold",
            color: "text.secondary",
          }}
        >
          {widget.widgetName}
        </Typography>

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
            {(widget.widgetName === "Line Chart" ||
              widget.widgetName === "Time Series Chart") && (
              <LineChart data={widget.data} />
            )}
            {widget.widgetName === "Bar Chart" && (
              <BarChart data={widget.data} />
            )}
            {widget.widgetName === "Value and Chart Card" && (
              <ValueAndChartCard data={widget.data} />
            )}
            {widget.widgetName === "Value Card" && (
              <ValueCard data={widget.data} widgetName={widget.widgetName} />
            )}
          </>
        )}
      </Box>
    );
  }, [handleEnlargeWidget, handleDownloadWidget]);

  
  const renderEnlargedWidget = useCallback(() => {
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

          {!isEmpty && widget.data.title && (
            <Typography
              variant="h6"
              sx={{ color: "#1E3A8A", mb: 2, fontFamily: "Poppins" }}
            >
              {widget.data.title}
            </Typography>
          )}

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
                {(widget.widgetName === "Line Chart" ||
                  widget.widgetName === "Time Series Chart") && (
                  <LineChart data={widget.data} />
                )}
                {widget.widgetName === "Bar Chart" && (
                  <BarChart data={widget.data} />
                )}
                {widget.widgetName === "Value and Chart Card" && (
                  <ValueAndChartCard data={widget.data} />
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
  }, [enlargedWidget, widgets, handleCloseEnlargedWidget]);

  
  const skeletonWidgets = useMemo(() => {
    return Array(4)
      .fill(0)
      .map((_, index) => (
        <Box
          key={`skeleton-${index}`}
          sx={{
            ...widgetStyles.widgetstyle,
            minHeight: "400px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            padding: "16px",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Skeleton variant="text" width="30%" height={20} />
            <Box sx={{ display: "flex" }}>
              <Skeleton
                variant="circular"
                width={24}
                height={24}
                sx={{ mr: 1 }}
              />
              <Skeleton variant="circular" width={24} height={24} />
            </Box>
          </Box>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={40}
            sx={{ mb: 2 }}
          />
          <Skeleton variant="rectangular" width="100%" height="75%" />
        </Box>
      ));
  }, []);

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
        id="report-header"
      >
        <IconButton onClick={() => navigate("/reports-analytics/automated")}>
          <ArrowBack sx={{ color: "#1E3A8A" }} />
          <Typography
            sx={{
              fontSize: ".85rem",
              fontWeight: 500,
              color: "#1e3a8a",
              marginRight: 2,
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Back
          </Typography>
        </IconButton>
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
          <Box sx={{ marginTop: "-14px" }}>
            <Button
              size="small"
              sx={{ ...widgetStyles.newBtnStyles, fontFamily: "Poppins" }}
              startIcon={<FileDownloadRoundedIcon />}
              onClick={handleDownload}
              disabled={isLoading}
            >
              Export to PDF
            </Button>
          </Box>
        </Toolbar>
      </Box>
      <Box
        ref={divRef}
        id="widgets"
        sx={{
          paddingLeft: 3,
          paddingTop: 2,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: "1fr 1fr",
          },
          "@media (min-width: 900px)": {
            gridTemplateColumns: "1fr 1fr",
          },
          "@media (max-width: 619px)": {
            gridTemplateColumns: "1fr",
          },
          overflowY: "auto",
          height: "calc(100vh - 50px)",
          width: "100%",
          gap: "30px",
          marginBottom: "20px",
        }}
      >
        {isLoading ? (
          skeletonWidgets
        ) : processedWidgets.length > 0 ? (
          processedWidgets.map((widget, index) => renderWidgetContent(widget, index))
        ) : (
          <Box
            sx={{ gridColumn: "span 2", textAlign: "center", padding: "40px" }}
          >
            <Typography variant="h6" color="text.secondary">
              No widgets available for this report
            </Typography>
          </Box>
        )}
      </Box>

      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 60,
            right: 20,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            bgcolor: "#fff",
            borderRadius: 2,
            padding: "8px 16px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <CircularProgress size={24} sx={{ mr: 2, color: "#1E3A8A" }} />
          <Typography variant="body2" sx={{ fontFamily: "Poppins" }}>
            Loading widgets...
          </Typography>
        </Box>
      )}

      {renderEnlargedWidget()}

      <ToastContainer />
    </Box>
  );
}
