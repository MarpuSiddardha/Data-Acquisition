import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
  CardContent,
  Paper,
  Button,
  Chip,
  OutlinedInput,
  ListItemText,
  Snackbar,
  Alert,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CloseIcon from "@mui/icons-material/Close";
import RTUMultiSelect from "../RTUMultiSelect";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import axios from "axios";
import dayjs from "dayjs";

interface Sensor {
  id: number;
  sensorId: string;
  sensorName: string;
  sensorType: string;
  rtuId?: number;
}

interface AlarmData {
  id: string;
  timestamp: string;
  sensorId: string;
  status: string;
  severity: string;
  message: string;
}

interface AlarmsTableProps {
  showEditButton: boolean;
  widgetData?: any;
  openDialogbox?: () => void;
  onClose?: () => void;
  onRtuChange?: (rtus: string[]) => void;
  onSensorsChange?: (sensors: Sensor[]) => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const AlarmsTable: React.FC<AlarmsTableProps> = ({
  widgetData: initialWidgetData,
  showEditButton,
  openDialogbox,
  onClose,
  onRtuChange,
  onSensorsChange,
}) => {
  const { reportId } = useParams();

  const [openDialog, setOpenDialog] = useState(false);
  const [rtu, setRtu] = useState<string[]>([]);
  const [rtuNames, setRtuNames] = useState<string[]>([]);
  const [rtuMapping, setRtuMapping] = useState<{ [key: string]: string }>({});
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [title, setTitle] = useState("");
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);
  const [widgetID, setWidgetID] = useState<number | null>(null); // State to store widgetId
  const [availableSensors, setAvailableSensors] = useState<Sensor[]>([]);
  const [selectedSensorTypes, setSelectedSensorTypes] = useState<string[]>([]);
  const [filteredSensors, setFilteredSensors] = useState<Sensor[]>([]);
  const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>([]);
  const [status, setStatus] = useState<{ [key: string]: boolean }>({
    Active: false,
    Closed: false,
    Acknowledged: false,
  });
  const [severity, setSeverity] = useState<{ [key: string]: boolean }>({
    High: false,
    Moderate: false,
    Low: false,
  });

  const [widgetData, setWidgetData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [alarmData, setAlarmData] = useState<AlarmData[]>([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "error" | "success" | "info" | "warning"
  >("error");
  const [isSaving, setIsSaving] = useState(false);

  const formattedStartDate = startDate ? startDate.format("YYYY-MM-DD") : "";
  const formattedEndDate = endDate ? endDate.format("YYYY-MM-DD") : "";

  useEffect(() => {
    const fetchRtuMapping = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8091/RTU-Sensors/rtus"
        );
        const mapping: { [key: string]: string } = {};

        if (Array.isArray(response.data)) {
          response.data.forEach((rtu: any) => {
            mapping[rtu.id] = rtu.name || `RTU${rtu.id}`;
          });
        }

        console.log("RTU ID to name mapping:", mapping);
        setRtuMapping(mapping);
      } catch (error) {
        console.error("Error fetching RTU mapping:", error);
        showSnackbar(
          "Failed to fetch RTU data. Please try again later.",
          "error"
        );
      }
    };

    fetchRtuMapping();
  }, []);

  useEffect(() => {
    if (!reportId) {
      return;
    }
    const fetchLayout = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:8091/manual-reports/${reportId}/view`
        );

        console.log(response.data);

        const AlarmsTableWidget = response.data.layout.widgets.find(
          (widget) => widget.widgetName === "Alarms Table"
        );

        console.log("AlarmsTableWidget", AlarmsTableWidget);

        if (AlarmsTableWidget) {
          setWidgetID(AlarmsTableWidget.widgetId);

          if (AlarmsTableWidget.data) {
            setTitle(AlarmsTableWidget.data.title || "");
            // setDate(ValueCardWidget.data.date || null);
            setRtu(
              Array.isArray(AlarmsTableWidget.data.rtus)
                ? AlarmsTableWidget.data.rtus
                : []
            );
            // if (Array.isArray(ValueCardWidget.data.sensors)) {
            //   setAggregationValues(ValueCardWidget.data.aggregationValues);
            // }
          }
        } else {
          console.error("Alarms Table widget not found.");
          showSnackbar(
            "Alarms Table widget not found in the report",
            "warning"
          );
        }
      } catch (error) {
        console.error("Error fetching layout data:", error);
        showSnackbar(
          "Failed to load widget data. Please try again later.",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLayout();
  }, [reportId]);

  useEffect(() => {
    if (!widgetID) return;

    const controller = new AbortController();
    const { signal } = controller;
    const fetchWidgetData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8091/reports/${reportId}/widgets/${widgetID}/view`,
          { signal }
        );
        setWidgetData(response.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          console.error("Error fetching widget data:", error);
          showSnackbar(
            "Failed to load widget details. Please try again later.",
            "error"
          );
        }
      }
    };

    fetchWidgetData();

    return () => {
      controller.abort();
    };
  }, [widgetID, reportId]);

  const showSnackbar = (
    message: string,
    severity: "error" | "success" | "info" | "warning"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  useEffect(() => {
    console.log("RTU selection changed:", rtu);
    setSelectedSensorTypes([]);
    setSelectedSensorIds([]);
    setFilteredSensors([]);
  }, [rtu]);

  useEffect(() => {
    if (selectedSensorTypes.length > 0 && availableSensors.length > 0) {
      const sensorsFilteredByType = availableSensors.filter((sensor) =>
        selectedSensorTypes.includes(sensor.sensorType)
      );

      const uniqueSensors: Sensor[] = [];
      const sensorIdSet = new Set<string>();

      sensorsFilteredByType.forEach((sensor) => {
        if (!sensorIdSet.has(sensor.sensorId)) {
          sensorIdSet.add(sensor.sensorId);
          uniqueSensors.push(sensor);
        }
      });

      console.log("Filtered unique sensors:", uniqueSensors);
      setFilteredSensors(uniqueSensors);

      setSelectedSensorIds((prevSelected) =>
        prevSelected.filter((id) =>
          uniqueSensors.some((sensor) => sensor.sensorId === id)
        )
      );
    } else {
      setFilteredSensors([]);
      setSelectedSensorIds([]);
    }
  }, [selectedSensorTypes, availableSensors]);

  const handleOpenDialog = () => {
    if (openDialogbox) {
      openDialogbox();
    }

    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    if (onClose) {
      onClose();
    }
  };

  const handleRtuChange = (selectedRtus: string[]) => {
    console.log("Selected RTUs:", selectedRtus);
    setRtu(selectedRtus);

    const names = selectedRtus.map((id) => rtuMapping[id] || `RTU${id}`);
    console.log("Selected RTU Names:", names);
    setRtuNames(names);

    if (onRtuChange) {
      onRtuChange(selectedRtus);
    }
  };

  const handleAvailableSensors = (sensors: Sensor[]) => {
    // console.log("Received sensors from RTUMultiSelect:", sensors);

    const transformedSensors = sensors.map((sensor) => {
      // If sensor already has proper sensorId format, use it
      if (sensor.sensorId && sensor.sensorId.includes("-")) {
        return sensor;
      }

      // Otherwise, construct a sensorId based on available data
      const rtuPrefix = sensor.rtuId ? `RTU${sensor.rtuId}` : "RTU";
      const typePrefix = sensor.sensorType
        ? sensor.sensorType.substring(0, 4)
        : "Sens";
      const paddedId = String(sensor.id).padStart(3, "0");

      return {
        ...sensor,
        sensorId: `${rtuPrefix}-${typePrefix}${paddedId}`,
      };
    });

    const uniqueSensors: Sensor[] = [];
    const sensorIdSet = new Set<string>();

    for (const sensor of transformedSensors) {
      if (!sensorIdSet.has(sensor.sensorId)) {
        sensorIdSet.add(sensor.sensorId);
        uniqueSensors.push(sensor);
      }
    }

    if (JSON.stringify(uniqueSensors) !== JSON.stringify(availableSensors)) {
      setAvailableSensors(uniqueSensors);

      if (onSensorsChange) {
        onSensorsChange(uniqueSensors);
      }
    }
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setStatus((prevStatus) => ({
      ...prevStatus,
      [value]: checked,
    }));
  };

  const handleSeverityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setSeverity((prevSeverity) => ({
      ...prevSeverity,
      [value]: checked,
    }));
  };

  // Modified to handle multiple sensor type selections with checkboxes
  const handleSensorTypeChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const value = event.target.value as string[];
    console.log("Selected sensor types:", value);
    setSelectedSensorTypes(value);
  };

  // Handle multiple sensor ID selections with checkboxes
  const handleSensorIdChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    const value = event.target.value as string[];
    console.log("Selected sensor IDs:", value);
    setSelectedSensorIds(value);
  };

  // Get unique sensor types from available sensors
  const getSensorTypes = () => {
    const types = Array.from(
      new Set(availableSensors.map((s) => s.sensorType))
    );
    return types;
  };

  const getCurrentWidgetData = () => {
    return {
      widgetType: "Table",
      widgetName: "Alarms Table",
      data: {
        title: title,
        rtus:
          rtuNames.length > 0
            ? rtuNames
            : rtu.map((id) => rtuMapping[id] || id),
        sensors: selectedSensorIds.map((id) => ({
          sensorId: id,
          Type: selectedSensorTypes.find(
            (type) =>
              filteredSensors.find((s) => s.sensorId === id)?.sensorType ===
              type
          ),
        })),
        status: Object.keys(status).filter((key) => status[key]),
        severity: Object.keys(severity).filter((key) => severity[key]),
        date: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      },
    };
  };

  // Updated validation function to check all required fields
  const validateFormData = () => {
    // Check if title is empty
    if (!title.trim()) {
      showSnackbar("Title cannot be empty", "error");
      return false;
    }

    // Check if at least one RTU is selected
    if (rtu.length === 0) {
      showSnackbar("Please select at least one RTU", "error");
      return false;
    }

    // Check if at least one sensor type is selected
    if (selectedSensorTypes.length === 0) {
      showSnackbar("Please select at least one sensor type", "error");
      return false;
    }

    // Check if at least one sensor ID is selected
    if (selectedSensorIds.length === 0) {
      showSnackbar("Please select at least one sensor ID", "error");
      return false;
    }

    // Check if both dates are selected
    if (!startDate || !endDate) {
      showSnackbar("Please select both start and end dates", "error");
      return false;
    }

    // Check if date range is valid
    if (startDate && endDate && startDate.isAfter(endDate)) {
      showSnackbar("Start date cannot be after end date", "error");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    // Validate form data first
    if (!validateFormData()) {
      return;
    }

    // Check for required IDs
    if (!reportId) {
      console.error("Report ID is missing:", { reportId });
      showSnackbar("Report ID is missing. Cannot save changes.", "error");
      return;
    }

    if (!widgetID) {
      console.error("Widget ID is missing or invalid:", { widgetID });
      showSnackbar("Widget ID is missing. Cannot save changes.", "error");
      return;
    }

    // Prevent multiple save attempts
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    console.log(widgetID, "widgetID");
    const widgetData = getCurrentWidgetData();
    // Log the data being saved for debugging
    console.log("Saving data:", widgetData);

    try {
      const response = await axios.put(
        `http://localhost:8091/reports/${reportId}/widgets/${widgetID}`,
        widgetData
      );
      console.log("Widget data updated successfully:", response.data);
      //showSnackbar("Changes saved successfully", "success");

      // if (onSave) {
      //   onSave(widgetData);
      // }

      handleCloseDialog();
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date);
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        boxShadow: 3,
        backgroundColor: "#fff",
        position: "relative",
      }}
    >
      {/* Show the Edit button only if showEditButton is true */}
      {showEditButton && (
        <IconButton
          size="small"
          onClick={handleOpenDialog}
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

      {/* Dialog component */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm">
        <DialogTitle>
          <Typography
            variant="h5"
            color="#1E3A8A"
            fontWeight="bolder"
            textAlign="left"
            fontFamily="poppins"
          >
            Alarms Table
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{ position: "absolute", right: 8, top: 8, color: "#1E3A8A" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            {/* Title */}
            <Box display="flex" alignItems="flex-start" gap={9}>
              <Typography
                color="#003366"
                fontWeight={500}
                fontSize="14px"
                minWidth="120px"
                paddingTop="8px"
              >
                Title
              </Typography>
              <TextField
                size="small"
                placeholder="Enter Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{
                  width: "250px",
                  backgroundColor: "#FAFBFF",
                }}
              />
            </Box>

            {/* RTU Multi-Select Component */}
            <Box display="flex" alignItems="flex-start" gap={9}>
              <Typography
                color="#003366"
                fontWeight={500}
                fontSize="14px"
                minWidth="120px"
                paddingTop="8px"
              >
                RTU
              </Typography>
              <RTUMultiSelect
                selectedRtus={rtu}
                onChange={handleRtuChange}
                onSensorsChange={handleAvailableSensors}
              />
            </Box>

            {/* Multi-Select Sensor Type Dropdown with Checkboxes */}
            <Box display="flex" alignItems="flex-start" gap={9}>
              <Typography
                color="#003366"
                fontWeight={500}
                fontSize="14px"
                minWidth="120px"
                paddingTop="8px"
              >
                Sensor Type
              </Typography>
              <Select
                multiple
                value={selectedSensorTypes}
                onChange={handleSensorTypeChange}
                input={<OutlinedInput />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip
                        sx={{
                          margin: "2px",
                          backgroundColor: "#E0E7FF",
                          color: "#1E3A8A",
                          maxWidth: "100%",
                          borderRadius: "5px",

                          "& .MuiChip-label": {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          },
                          "& .MuiChip-deleteIcon": {
                            color: "ash",
                            "&:hover": {
                              color: "#1e3a8a",
                            },
                          },
                        }}
                        key={value}
                        label={value}
                        size="small"
                        onDelete={() => {
                          setSelectedSensorTypes((prev) =>
                            prev.filter((item) => item !== value)
                          );
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        deleteIcon={<CloseIcon style={{ fontSize: 14 }} />}
                      />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
                sx={{
                  width: "250px",
                  backgroundColor: "#FAFBFF",
                  border:
                    selectedSensorTypes.length === 0 && rtu.length > 0
                      ? "0.5px solid #d32f2f"
                      : undefined,
                }}
                disabled={rtu.length === 0}
                displayEmpty
                error={selectedSensorTypes.length === 0 && rtu.length > 0}
              >
                <MenuItem value="" disabled>
                  Select Sensor Types
                </MenuItem>
                {getSensorTypes().map((type) => (
                  <MenuItem key={type} value={type}>
                    <Checkbox
                      checked={selectedSensorTypes.indexOf(type) > -1}
                    />
                    <ListItemText primary={type} />
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {/* Multi-Select Sensor ID Dropdown with Checkboxes */}
            <Box display="flex" alignItems="flex-start" gap={9}>
              <Typography
                color="#003366"
                fontWeight={500}
                fontSize="14px"
                minWidth="120px"
                paddingTop="8px"
              >
                Sensor ID
              </Typography>
              <Select
                multiple
                value={selectedSensorIds}
                onChange={handleSensorIdChange}
                input={<OutlinedInput />}
                renderValue={(selected) => (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip
                        sx={{
                          margin: "2px",
                          backgroundColor: "#E0E7FF",
                          color: "#1E3A8A",
                          maxWidth: "100%",
                          borderRadius: "5px",

                          "& .MuiChip-label": {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          },
                          "& .MuiChip-deleteIcon": {
                            color: "ash",
                            "&:hover": {
                              color: "#1e3a8a",
                            },
                          },
                        }}
                        key={value}
                        label={value}
                        size="small"
                        onDelete={() => {
                          setSelectedSensorIds((prev) =>
                            prev.filter((item) => item !== value)
                          );
                        }}
                        deleteIcon={<CloseIcon style={{ fontSize: 14 }} />}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    ))}
                  </Box>
                )}
                sx={{
                  width: "250px",
                  backgroundColor: "#FAFBFF",
                  border:
                    selectedSensorIds.length === 0 &&
                    selectedSensorTypes.length > 0
                      ? "1px solid #d32f2f"
                      : undefined,
                }}
                disabled={selectedSensorTypes.length === 0}
                displayEmpty
                error={
                  selectedSensorIds.length === 0 &&
                  selectedSensorTypes.length > 0
                }
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      width: 250,
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  {selectedSensorTypes.length > 0
                    ? "Select Sensor IDs"
                    : "First select Sensor Types"}
                </MenuItem>
                {filteredSensors.map((sensor) => (
                  <MenuItem key={sensor.id} value={sensor.sensorId}>
                    <Checkbox
                      checked={selectedSensorIds.indexOf(sensor.sensorId) > -1}
                    />
                    <ListItemText primary={sensor.sensorId} />
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {/* Status Box */}
            <Paper
              sx={{
                display: "flex",
                flexDirection: "row",
                backgroundColor: "#FAFBFF",
                maxWidth: "445px",
              }}
            >
              <Typography
                sx={{ padding: 1, marginRight: "24px" }}
                color="#003366"
                fontWeight="200"
                fontSize="14px"
              >
                Status
              </Typography>
              <Box display="flex" gap={0}>
                {["Active", "Closed", "Acknowledged"].map((statusLabel) => (
                  <FormControlLabel
                    key={statusLabel}
                    control={
                      <Checkbox
                        checked={status[statusLabel]}
                        onChange={handleStatusChange}
                        value={statusLabel}
                      />
                    }
                    label={statusLabel}
                    sx={{ marginLeft: 0 }}
                  />
                ))}
              </Box>
            </Paper>

            {/* Severity Box */}
            <Paper
              sx={{
                display: "flex",
                flexDirection: "row",
                backgroundColor: "#FAFBFF",
                maxWidth: "445px",
              }}
            >
              <Typography
                sx={{ padding: 1, marginRight: "14px" }}
                color="#003366"
                fontWeight="200"
                fontSize="14px"
              >
                Severity
              </Typography>
              <Box display="flex" gap={2}>
                {["High", "Low", "Moderate"].map((severityLabel) => (
                  <FormControlLabel
                    key={severityLabel}
                    control={
                      <Checkbox
                        checked={severity[severityLabel]}
                        onChange={handleSeverityChange}
                        value={severityLabel}
                      />
                    }
                    label={severityLabel}
                    sx={{ marginLeft: 0 }}
                  />
                ))}
              </Box>
            </Paper>

            {/* Date Pickers */}
            <Paper
              sx={{
                marginTop: 2,
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#FAFBFF",
                padding: "12px",
                maxWidth: "445px",
              }}
            >
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 200,
                  marginBottom: 2,
                  color: "#003366",
                }}
              >
                Date
              </Typography>
              {/* Date Pickers */}
              <Box display="flex" flexDirection="row" gap={4}>
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
                      width: "46%",
                      backgroundColor: "#FAFBFF",
                    }}
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                    slotProps={{
                      textField: {
                        size: "small",
                      },
                    }}
                    slots={{ openPickerIcon: CalendarTodayIcon }}
                    sx={{
                      width: "46%",
                      backgroundColor: "#FAFBFF",
                    }}
                  />
                </LocalizationProvider>
              </Box>
            </Paper>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            sx={{ color: "#17468A", fontFamily: "Poppins, sans-serif" }}
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
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <CardContent sx={{ paddingTop: 4 }}>
        <Typography gutterBottom sx={{ color: "#1e3a8a", fontSize: 16 }}>
          <br />
          You're in Edit Mode of Alarms Table
        </Typography>
      </CardContent>
    </Box>
  );
};

export default AlarmsTable;
