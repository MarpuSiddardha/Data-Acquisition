import React, { useState, useEffect } from "react";

import {
  Card,
  CardContent,
  IconButton,
  Typography,
  Select,
  MenuItem,
  Box,
  Paper,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  FormControl,
  Alert,
  SelectChangeEvent,
  TextField,
  Snackbar,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import axios from "axios";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";

// Define interfaces to match the API data structure from your working example

interface Sensor {
  id: number;
  sensorId: string;
  sensorType: string;
  value?: number;
  timestamp?: string;
}

interface RTU {
  rtuId: number;
  rtuName: string;
  sensors: Sensor[];
}

interface SensorDataTableProps {
  showEditButton: boolean;
}

const SensorDataTable: React.FC<SensorDataTableProps> = ({
  showEditButton,
}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // RTU related states (matching your working component)
  const [rtuList, setRtuList] = useState<RTU[]>([]);
  const [selectedRtu, setSelectedRtu] = useState<string>("");
  const [rtuName, setRtuName] = useState<string>("");
  const [sensorTypes, setSensorTypes] = useState<string[]>([]);
  const [selectedSensorType, setSelectedSensorType] = useState<string>("");
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  // Date related states
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);

  // Report and widget ID
  const { reportId } = useParams<{ reportId: string }>();
  const [widgetID, setWidgetID] = useState<number | null>(null);
  const [cardData, setCardData] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Error handling states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "error" | "success" | "info" | "warning"
  >("error");
  const [isSaving, setIsSaving] = useState(false);

  const formattedStartDate = startDate ? startDate.format("YYYY-MM-DD") : "";
  const formattedEndDate = endDate ? endDate.format("YYYY-MM-DD") : "";

  // Helper function to show snackbar messages
  const showSnackbar = (
    message: string,
    severity: "error" | "success" | "info" | "warning"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Function to handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const validateData = (): { isValid: boolean; errorMessage?: string } => {
    if (!title.trim()) {
      return { isValid: false, errorMessage: "Title cannot be empty" };
    }

    if (!selectedRtu) {
      return { isValid: false, errorMessage: "Please select an RTU" };
    }

    if (!selectedSensorType) {
      return { isValid: false, errorMessage: "Please select a sensor type" };
    }

    if (!selectedSensor) {
      return { isValid: false, errorMessage: "Please select a sensor" };
    }

    // Check if date range is valid
    if (startDate && endDate && startDate.isAfter(endDate)) {
      return {
        isValid: false,
        errorMessage: "Start date cannot be after end date",
      };
    }

    return { isValid: true };
  };

  useEffect(() => {
    const fetchWidgetData = async () => {
      if (!reportId) {
        showSnackbar("Report ID is missing", "error");
        return;
      }

      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:8091/manual-reports/${reportId}/view`
        );
        console.log("Report data response:", response.data);

        // Extract widget ID correctly by finding the widget with type "Table" and name "Sensor Data Table"
        let widgetId = null;
        if (response.data.layout && response.data.layout.widgets) {
          const sensorTableWidget = response.data.layout.widgets.find(
            (widget: any) =>
              widget.widgetType === "Table" &&
              widget.widgetName === "Sensor Data Table"
          );
          if (sensorTableWidget) {
            widgetId = Number(sensorTableWidget.widgetId);
            console.log("Widget ID extracted:", widgetId);
            setWidgetID(widgetId);
          } else {
            console.error("Sensor Data Table widget not found in layout");
            showSnackbar(
              "Sensor Data Table widget not found in the report",
              "warning"
            );
          }
        }

        // If we have existing card data, populate the form
        if (response.data.Table && response.data.Table.data) {
          const data = response.data.Table.data;
          setCardData(data);

          setTitle(data.title || "");

          // Set RTU information if available
          if (data.rtus && data.rtus.length > 0) {
            setRtuName(data.rtus[0]);
          }

          // Set sensor information if available
          if (data.sensors && data.sensors.length > 0) {
            const sensor = data.sensors[0];
            setSelectedSensorType(sensor.sensorType || "");
            setSelectedSensor(sensor.sensorId || "");
          }

          // Set date if available
          if (data.date) {
            if (data.date.startDate) {
              setStartDate(dayjs(data.date.startDate));
            }
            if (data.date.endDate) {
              setEndDate(dayjs(data.date.endDate));
            }
          }
        }

        setDataLoaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching widget data:", error);
        setIsLoading(false);
        setDataLoaded(true);
        showSnackbar(
          "Failed to load widget data. Please try again later.",
          "error"
        );
      }
    };

    if (reportId) {
      fetchWidgetData();
    } else {
      console.error("Report ID is missing");
      showSnackbar("Report ID is missing", "error");
    }
  }, [reportId]);

  // Reset states when opening dialog
  const resetStates = () => {
    setSelectedRtu("");
    setRtuName("");
    setSensorTypes([]);
    setSelectedSensorType("");
    setSensors([]);
    setSelectedSensor("");
  };

  // Fetch RTUs when the dialog opens
  useEffect(() => {
    if (openDialog) {
      resetStates();
      fetchRtuData();
    }
  }, [openDialog]);

  // Fetch RTU data function
  const fetchRtuData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:8091/api/rtu", {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      console.log("RTU API Response:", response);

      // Process the RTU data
      let rtus: RTU[] = [];

      if (response.data) {
        if (Array.isArray(response.data)) {
          rtus = response.data;
        } else if (typeof response.data === "object") {
          // Handle different possible response structures
          if (response.data.items && Array.isArray(response.data.items)) {
            rtus = response.data.items;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            rtus = response.data.data;
          } else if (response.data.rtus && Array.isArray(response.data.rtus)) {
            rtus = response.data.rtus;
          } else {
            // If it's a single RTU
            rtus = [response.data];
          }
        }
      }

      console.log("Processed RTUs:", rtus);

      if (rtus && rtus.length > 0) {
        // Remove duplicate sensor IDs
        rtus = rtus.map((rtu) => {
          if (rtu.sensors && rtu.sensors.length > 0) {
            // Use a Set to get unique sensor IDs
            const uniqueSensorIds = new Set();
            const uniqueSensors = [];

            for (const sensor of rtu.sensors) {
              if (!uniqueSensorIds.has(sensor.sensorId)) {
                uniqueSensorIds.add(sensor.sensorId);
                uniqueSensors.push(sensor);
              }
            }

            return {
              ...rtu,
              sensors: uniqueSensors,
            };
          }

          return rtu;
        });

        setRtuList(rtus);
        // setSuccessMessage(`Loaded ${rtus.length} RTUs successfully`);
      } else {
        setError("No RTUs found in the response");
        showSnackbar("No RTUs found in the response", "warning");
      }
    } catch (error: any) {
      console.error("Error fetching RTU data:", error);
      setError(error.message || "Failed to fetch RTU data");
      showSnackbar(
        "Failed to fetch RTU data: " + (error.message || "Unknown error"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update sensor types when RTU selection changes
  useEffect(() => {
    if (!selectedRtu || rtuList.length === 0) {
      setSensorTypes([]);
      setSensors([]);
      return;
    }

    // Find the selected RTU
    const selectedRtuObj = rtuList.find(
      (rtu) => String(rtu.rtuId) === selectedRtu
    );

    if (selectedRtuObj && selectedRtuObj.sensors) {
      // Get unique sensor types
      const uniqueTypes = [
        ...new Set(selectedRtuObj.sensors.map((sensor) => sensor.sensorType)),
      ];

      setSensorTypes(uniqueTypes);

      // Store RTU name for later use
      setRtuName(selectedRtuObj.rtuName);
    } else {
      setSensorTypes([]);
      setSelectedSensorType("");
    }
  }, [selectedRtu, rtuList]);

  // Update sensors when sensor type selection changes
  useEffect(() => {
    if (!selectedSensorType || !selectedRtu || rtuList.length === 0) {
      setSensors([]);
      return;
    }

    // Find the selected RTU
    const selectedRtuObj = rtuList.find(
      (rtu) => String(rtu.rtuId) === selectedRtu
    );

    if (selectedRtuObj && selectedRtuObj.sensors) {
      // Get sensors of the selected type
      const sensorsOfType = selectedRtuObj.sensors.filter(
        (sensor) => sensor.sensorType === selectedSensorType
      );

      setSensors(sensorsOfType);
    } else {
      setSensors([]);
      setSelectedSensor("");
    }
  }, [selectedSensorType, selectedRtu, rtuList]);

  // Open the dialog box
  const openDialogbox = () => {
    setOpenDialog(true);
  };

  // Close the dialog box
  const onClose = () => {
    setOpenDialog(false);
    setError(null);
    setSuccessMessage(null);
  };

  // Handle RTU selection change
  const handleRtuChange = (event: SelectChangeEvent) => {
    setSelectedRtu(event.target.value);
    setSelectedSensorType("");
    setSelectedSensor("");

    const rtu = rtuList.find((r) => String(r.rtuId) === event.target.value);
    if (rtu) {
      setRtuName(rtu.rtuName);
    }
  };

  // Handle sensor type selection
  const handleSensorTypeChange = (event: SelectChangeEvent) => {
    setSelectedSensorType(event.target.value);
    setSelectedSensor("");
  };

  // Handle sensor selection
  const handleSensorIdChange = (event: SelectChangeEvent) => {
    setSelectedSensor(event.target.value);
  };

  const widgetData = {
    widgetType: "Table",
    widgetName: "Sensor Data Table",
    data: {
      title: title,
      rtus: [rtuName],
      sensors: [
        {
          sensorType: selectedSensorType,
          sensorId: selectedSensor,
        },
      ],
      date: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
    },
  };

  const handleSave = async () => {
    // Validate form data first
    const validation = validateData();
    if (!validation.isValid) {
      showSnackbar(
        validation.errorMessage || "Form validation failed",
        "error"
      );
      return;
    }

    if (!reportId) {
      console.error("Report ID is missing:", { reportId });
      showSnackbar("Report ID is missing. Cannot save changes.", "error");
      return;
    }

    if (!widgetID) {
      console.error("Widget ID is missing or invalid:", { widgetID });
      showSnackbar(
        "Widget ID is missing or invalid. Cannot save changes.",
        "error"
      );
      return;
    }

    // Prevent multiple save attempts
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    console.log("Saving data with widget ID:", widgetID);
    console.log("Widget data:", widgetData);

    try {
      const response = await axios.put(
        `http://localhost:8091/reports/${reportId}/widgets/${widgetID}`,
        widgetData
      );
      console.log("Widget data updated successfully:", response.data);
      // showSnackbar("Changes saved successfully", "success");
      onClose();
    } catch (error) {
      console.error("Error updating widget data:", error);

      // Improved error handling with specific error messages
      if (axios.isAxiosError(error)) {
        if (!error.response) {
          showSnackbar(
            "Network error. Please check your connection and try again.",
            "error"
          );
        } else if (error.response.status === 404) {
          showSnackbar(
            "Widget or report not found. Please refresh the page and try again.",
            "error"
          );
        } else if (error.response.status === 400) {
          showSnackbar(
            `Bad request: ${error.response.data?.message || "Invalid form data"}`,
            "error"
          );
        } else if (
          error.response.status === 401 ||
          error.response.status === 403
        ) {
          showSnackbar(
            "You don't have permission to perform this action.",
            "error"
          );
        } else if (error.response.status >= 500) {
          showSnackbar("Server error. Please try again later.", "error");
        } else {
          showSnackbar(
            `Failed to save: ${error.response.data?.message || "Unknown error"}`,
            "error"
          );
        }
      } else {
        showSnackbar("Failed to save widget data. Please try again.", "error");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const isEmpty = (arr: any[] | undefined) => {
    return !arr || arr.length === 0;
  };

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        boxShadow: 3,
        backgroundColor: "#fff",
        position: "relative",
      }}
    >
      {showEditButton && (
        <IconButton
          size="small"
          onClick={openDialogbox}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "#1e3a8a",
            color: "#f0f4ff",
            boxShadow: 1,
            ":hover": { color: "#1e3a8a", backgroundColor: "#f0f4ff" },
          }}
        >
          <ModeEditIcon />
        </IconButton>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Dialog component styled to match ValueandChartCard */}
      <Dialog open={openDialog} onClose={onClose}>
        <DialogTitle>
          <Typography
            variant="h5"
            color="#1E3A8A"
            fontWeight="bolder"
            textAlign="left"
            fontFamily="poppins"
          >
            Sensor Data Table
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 8, top: 8, color: "#1E3A8A" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {successMessage && (
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon fontSize="inherit" />}
              sx={{ mb: 3 }}
            >
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Form Fields */}
          <Box display="flex" gap={4} mb={3}>
            <Box flex={1}>
              <Box display="flex" flexDirection="column" gap={10}>
                {/* Title */}
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <Typography
                    color="#003366"
                    fontWeight={500}
                    fontSize="14px"
                    minWidth="140px"
                    paddingTop="8px"
                  >
                    Title
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="Enter Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    sx={{ width: "366px", backgroundColor: "#FAFBFF" }}
                    // required
                    // error={!title.trim()}
                    // helperText={!title.trim() ? "Title is required" : ""}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Dropdowns for RTU, Sensor Type, Sensor ID */}
          <Box display="flex" flexDirection="column" gap={4} mb={3}>
            <Box flex={1}>
              <Box display="flex" flexDirection="column" gap={3}>
                {/* RTU Selection */}
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <Typography
                    color="#003366"
                    fontWeight={500}
                    fontSize="14px"
                    minWidth="140px"
                    paddingTop="8px"
                  >
                    RTU
                  </Typography>
                  <FormControl sx={{ width: "366px" }}>
                    <Select
                      value={selectedRtu}
                      size="small"
                      onChange={handleRtuChange}
                      displayEmpty
                      sx={{ backgroundColor: "#FAFBFF" }}
                      disabled={loading}
                      // error={!selectedRtu && !loading}
                    >
                      <MenuItem value="">Select RTU</MenuItem>

                      {loading ? (
                        <MenuItem value="">
                          <Box display="flex" alignItems="center">
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            Loading...
                          </Box>
                        </MenuItem>
                      ) : error ? (
                        <MenuItem value="">{error}</MenuItem>
                      ) : isEmpty(rtuList) ? (
                        <MenuItem value="">No RTUs available</MenuItem>
                      ) : (
                        rtuList.map((rtu) => (
                          <MenuItem
                            key={`rtu-${rtu.rtuId}`}
                            value={String(rtu.rtuId)}
                          >
                            {rtu.rtuName}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Box>

                {/* Sensor Type */}
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <Typography
                    color="#003366"
                    fontWeight={500}
                    fontSize="14px"
                    minWidth="140px"
                    paddingTop="8px"
                  >
                    Sensor Type
                  </Typography>
                  <FormControl sx={{ width: "366px" }}>
                    <Select
                      value={selectedSensorType}
                      size="small"
                      onChange={handleSensorTypeChange}
                      displayEmpty
                      sx={{ backgroundColor: "#FAFBFF" }}
                      disabled={isEmpty(sensorTypes) || !selectedRtu}
                      error={
                        !selectedSensorType &&
                        !isEmpty(sensorTypes) &&
                        Boolean(selectedRtu)
                      }
                    >
                      <MenuItem value="">Select Sensor Type</MenuItem>

                      {isEmpty(sensorTypes) ? (
                        <MenuItem value="">No sensor types available</MenuItem>
                      ) : (
                        sensorTypes.map((type, index) => (
                          <MenuItem key={`type-${index}`} value={type}>
                            {type}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>

            <Box flex={1}>
              <Box display="flex" flexDirection="column" gap={3}>
                {/* Sensor ID */}
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <Typography
                    color="#003366"
                    fontWeight={500}
                    fontSize="14px"
                    minWidth="140px"
                    paddingTop="8px"
                  >
                    Sensor ID
                  </Typography>
                  <FormControl sx={{ width: "366px" }}>
                    <Select
                      value={selectedSensor}
                      size="small"
                      onChange={handleSensorIdChange}
                      displayEmpty
                      sx={{ backgroundColor: "#FAFBFF" }}
                      disabled={isEmpty(sensors) || !selectedSensorType}
                      error={
                        !selectedSensor &&
                        !isEmpty(sensors) &&
                        Boolean(selectedSensorType)
                      }
                    >
                      <MenuItem value="">Select Sensor ID</MenuItem>

                      {isEmpty(sensors) ? (
                        <MenuItem value="">No sensors available</MenuItem>
                      ) : (
                        sensors.map((sensor) => (
                          <MenuItem
                            key={`sensor-${sensor.id}`}
                            value={sensor.sensorId}
                          >
                            {sensor.sensorId}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Box>

                {/* Date Range */}
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <Paper
                    sx={{
                      marginTop: 2,
                      display: "flex",
                      flexDirection: "column",
                      backgroundColor: "#FAFBFF",
                      padding: "15px", // Optional padding for better spacing
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 500,
                        marginBottom: 2,
                        color: "#003366",
                      }}
                    >
                      Date
                    </Typography>
                    {/* Date Pickers */}
                    <Box
                      display="flex"
                      flexDirection="row"
                      gap={2}
                      justifyContent="space-between"
                    >
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Start Date"
                          value={startDate}
                          onChange={(newValue) => setStartDate(newValue)}
                          slotProps={{
                            textField: {
                              size: "small",
                            },
                          }}
                          slots={{ openPickerIcon: CalendarTodayIcon }}
                          sx={{
                            width: "48%",
                            backgroundColor: "#FAFBFF",
                          }}
                        />
                        <DatePicker
                          label="End Date"
                          value={endDate}
                          onChange={(newValue) => setEndDate(newValue)}
                          slotProps={{ textField: { size: "small" } }}
                          slots={{ openPickerIcon: CalendarTodayIcon }}
                          sx={{
                            width: "48%",
                            backgroundColor: "#FAFBFF",
                          }}
                        />
                      </LocalizationProvider>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            sx={{ color: "#17468A", fontFamily: "Poppins, sans-serif" }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{
              backgroundColor: "#1E3A8A",
              color: "white",
              fontFamily: "Poppins, sans-serif",
            }}
            onClick={handleSave}
            disabled={isSaving}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <CardContent sx={{ paddingTop: 4 }}>
        <Typography gutterBottom sx={{ color: "#1e3a8a", fontSize: 16 }}>
          <br />
          You're in Edit Mode of Sensor Data Table
        </Typography>
      </CardContent>
    </Card>
  );
};

export default SensorDataTable;
