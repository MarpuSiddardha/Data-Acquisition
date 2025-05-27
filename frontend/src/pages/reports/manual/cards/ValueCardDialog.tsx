import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  IconButton,
  Typography,
  TextField,
  Select,
  MenuItem,
  Box,
  Paper,
  FormControlLabel,
  Checkbox,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SelectChangeEvent,
  FormControl,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import axios from "axios";
import dayjs from "dayjs";

interface ValueCardProps {
  showEditButton: boolean;
}

interface Sensor {
  id: number;
  sensorId: string;
  sensorType: string;
  value?: number;
  timestamp?: string;
}

interface RTUData {
  rtuId: number;
  rtuName: string;
  sensors: Sensor[];
}

interface AggregationValues {
  max: boolean;
  min: boolean;
  average: boolean;
}

interface WidgetData {
  data: {
    title: string;
    rtus: string[];
    date: string | null;
    aggregationValues?: AggregationValues;
  };
}

const ValueCardDialog: React.FC<ValueCardProps> = ({ showEditButton }) => {
  const { reportId } = useParams<{ reportId: string }>();
  const [widgetID, setWidgetID] = useState<number | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedRtu, setSelectedRtu] = useState<string>("");
  const [rtuName, setRtuName] = useState<string>("");
  const [sensorType, setSensorType] = useState("");
  const [sensorId, setSensorId] = useState("");
  const [units, setUnits] = useState("");
  const [widgetData, setWidgetData] = useState<WidgetData | null>(null);
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rtuList, setRtuList] = useState<RTUData[]>([]);
  const [availableSensors, setAvailableSensors] = useState<Sensor[]>([]);

  // Error handling states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "error" | "success" | "info" | "warning"
  >("error");
  const [isSaving, setIsSaving] = useState(false);

  const [aggregationValues, setAggregationValues] = useState<AggregationValues>(
    {
      max: false,
      min: false,
      average: false,
    }
  );

  // Helper function to show snackbar messages
  const showSnackbar = (
    message: string,
    severity: "error" | "success" | "info" | "warning"
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Fetch widget data when component mounts
  useEffect(() => {
    if (!reportId) {
      showSnackbar("Report ID is missing", "error");
      return;
    }
    const fetchLayout = async () => {
      try {
        setIsLoading(true);
        console.log(isLoading);
        const response = await axios.get(
          `http://localhost:8091/manual-reports/${reportId}/view`
        );

        const ValueCardWidget = response.data.layout.widgets.find(
          (widget: any) => widget.widgetName === "Value Card"
        );

        if (ValueCardWidget) {
          setWidgetID(ValueCardWidget.widgetId);

          if (ValueCardWidget.data) {
            setTitle(ValueCardWidget.data.title || "");
            setDate(
              ValueCardWidget.data.date
                ? dayjs(ValueCardWidget.data.date)
                : null
            );

            // If RTUs data exists, set the first one
            if (
              Array.isArray(ValueCardWidget.data.rtus) &&
              ValueCardWidget.data.rtus.length > 0
            ) {
              setRtuName(ValueCardWidget.data.rtus[0]);
            }

            // If sensor data exists
            if (
              ValueCardWidget.data.sensors &&
              ValueCardWidget.data.sensors.length > 0
            ) {
              setSensorType(ValueCardWidget.data.sensors[0].sensorType || "");
              setSensorId(ValueCardWidget.data.sensors[0].sensorId || "");
            }

            // If units exist
            if (ValueCardWidget.data.units) {
              setUnits(ValueCardWidget.data.units);
            }

            // If aggregation values exist
            if (ValueCardWidget.data.aggregations) {
              setAggregationValues({
                max: !!ValueCardWidget.data.aggregations.max,
                min: !!ValueCardWidget.data.aggregations.min,
                average: !!ValueCardWidget.data.aggregations.average,
              });
            }
          }
        } else {
          console.error("Value Card widget not found.");
          showSnackbar("Value Card widget not found in the report", "warning");
        }
      } catch (error) {
        console.error("Error fetching layout data:", error);
        showSnackbar("Failed to load widget data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLayout();
  }, [reportId]);

  // Get widget data
  useEffect(() => {
    if (!widgetID || !reportId) return;

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
          showSnackbar("Failed to fetch widget data", "error");
        }
      }
    };

    fetchWidgetData();

    return () => {
      controller.abort();
    };
  }, [widgetID, reportId]);

  // Fetch RTU data when dialog opens
  useEffect(() => {
    if (openDialog) {
      fetchRtuData();
    }
  }, [openDialog]);

  // Fetch RTU data
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
      let rtus: RTUData[] = [];

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
        setAvailableSensors(rtus.flatMap((rtu) => rtu.sensors || []));
        console.log(availableSensors);

        // Auto-select RTU if we have a saved RTU name
        if (rtuName) {
          const matchingRtu = rtus.find((rtu) => rtu.rtuName === rtuName);
          if (matchingRtu) {
            setSelectedRtu(String(matchingRtu.rtuId));
          }
        }
      } else {
        setError("No RTUs found in the response");
        showSnackbar("No RTUs found in the response", "warning");
      }
    } catch (error: any) {
      console.error("Error fetching RTU data:", error);
      setError("Failed to fetch RTU data");
      showSnackbar(
        "Failed to fetch RTU data: " + (error.message || "Unknown error"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    setOpenDialog(false);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleAggregationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setAggregationValues((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  // Handle RTU selection change
  const handleRtuChange = (event: SelectChangeEvent) => {
    setSelectedRtu(event.target.value);
    setSensorType("");
    setSensorId("");

    const rtu = rtuList.find((r) => String(r.rtuId) === event.target.value);
    if (rtu) {
      setRtuName(rtu.rtuName);
    }
  };

  // Safe date formatting - only format if date exists
  const formattedDate = date ? dayjs(date).format("YYYY-MM-DD") : "";

  const getSensorTypes = (): string[] => {
    if (!selectedRtu || rtuList.length === 0) return [];

    const selectedRtuObj = rtuList.find(
      (rtu) => String(rtu.rtuId) === selectedRtu
    );

    if (selectedRtuObj && selectedRtuObj.sensors) {
      // Get unique sensor types
      return [
        ...new Set(selectedRtuObj.sensors.map((sensor) => sensor.sensorType)),
      ];
    }

    return [];
  };

  const getSensorIdsForType = (
    sensorType: string | null
  ): { id: number; sensorId: string }[] => {
    if (!sensorType || !selectedRtu) return [];

    const selectedRtuObj = rtuList.find(
      (rtu) => String(rtu.rtuId) === selectedRtu
    );

    if (selectedRtuObj && selectedRtuObj.sensors) {
      // Get sensors of the selected type
      const sensorsOfType = selectedRtuObj.sensors.filter(
        (sensor) => sensor.sensorType === sensorType
      );

      const uniqueSensorIds = new Map<string, number>();

      sensorsOfType.forEach((sensor) => {
        if (!uniqueSensorIds.has(sensor.sensorId)) {
          uniqueSensorIds.set(sensor.sensorId, sensor.id);
        }
      });

      return Array.from(uniqueSensorIds).map(([sensorId, id]) => ({
        id,
        sensorId,
      }));
    }

    return [];
  };

  const validateForm = (): { isValid: boolean; errorMessage?: string } => {
    // Check for title
    if (!title.trim()) {
      return { isValid: false, errorMessage: "Title cannot be empty" };
    }

    // Check for RTU selection
    if (!selectedRtu) {
      return { isValid: false, errorMessage: "Please select an RTU" };
    }

    // Check for sensor type
    if (!sensorType) {
      return { isValid: false, errorMessage: "Please select a sensor type" };
    }

    // Check for sensor ID
    if (!sensorId) {
      return { isValid: false, errorMessage: "Please select a sensor ID" };
    }

    // Check for date
    if (!date) {
      return { isValid: false, errorMessage: "Please select a date" };
    }

    return { isValid: true };
  };

  const prepareDataForSave = () => {
    return {
      widgetType: "Card",
      widgetName: "Value Card",
      data: {
        title: title,
        rtus: [rtuName],
        date: formattedDate,
        sensors: [
          {
            sensorId: sensorId,
            sensorType: sensorType,
          },
        ],
        units: units,
        aggregations: {
          max: aggregationValues.max,
          min: aggregationValues.min,
          average: aggregationValues.average,
        },
      },
    };
  };

  const saveValueCardData = async () => {
    if (widgetID === null || !reportId) {
      console.error("Widget ID or Report ID is missing.");
      showSnackbar("Widget ID or Report ID is missing", "error");
      return;
    }

    // Prevent multiple save attempts
    if (isSaving) {
      return;
    }

    // Validate form data
    const validation = validateForm();
    if (!validation.isValid) {
      showSnackbar(
        validation.errorMessage || "Form validation failed",
        "error"
      );
      return;
    }

    setIsSaving(true);
    const valueCardData = prepareDataForSave();
    console.log("Saving data:", valueCardData);

    try {
      const response = await axios.put(
        `http://localhost:8091/reports/${reportId}/widgets/${widgetID}`,
        valueCardData
      );
      console.log("Widget data saved successfully:", response.data);
      // showSnackbar("Changes saved successfully", "success");
      onClose();
    } catch (error) {
      console.error("Error saving widget data:", error);

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

  // Effect to update sensor types when RTU selection changes
  useEffect(() => {
    if (selectedRtu && sensorType) {
      // Auto-select sensor ID if we have a saved sensor ID
      const sensorOptions = getSensorIdsForType(sensorType);
      const matchingSensor = sensorOptions.find((s) => s.sensorId === sensorId);
      if (!matchingSensor && sensorOptions.length > 0) {
        setSensorId(sensorOptions[0].sensorId);
      }
    }
  }, [sensorType, selectedRtu]);

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        boxShadow: 3,
        position: "relative",
      }}
    >
      {widgetData === null && `No data added to widget`}
      {widgetData && (
        <CardContent>
          <Typography gutterBottom sx={{ color: "#1e3a8a", fontSize: 16 }}>
            <br />
            You're in Edit Mode of Value Card
          </Typography>
        </CardContent>
      )}
      {showEditButton && (
        <IconButton
          size="small"
          onClick={() => setOpenDialog(true)}
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

      <Dialog open={openDialog} onClose={onClose}>
        <DialogTitle>
          <Typography
            variant="h5"
            color="#1E3A8A"
            fontWeight="bolder"
            textAlign="left"
            fontFamily="poppins"
          >
            Value Card
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

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box display="flex" flexDirection="column" gap={2} mb={3}>
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
                  width: "300px",
                  backgroundColor: "#FAFBFF",
                }}
              />
            </Box>

            <Box display="flex" alignItems="flex-start" gap={9}>
              <Typography
                color="#003366"
                fontWeight={500}
                fontSize="14px"
                minWidth="120px"
                paddingTop="8px"
              >
                RTU Selection
              </Typography>
              <FormControl sx={{ width: "300px" }}>
                <Select
                  value={selectedRtu}
                  size="small"
                  onChange={handleRtuChange}
                  displayEmpty
                  sx={{ backgroundColor: "#FAFBFF" }}
                  disabled={loading}
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
                value={sensorType}
                size="small"
                onChange={(e: SelectChangeEvent) =>
                  setSensorType(e.target.value)
                }
                sx={{ width: "300px", backgroundColor: "#FAFBFF" }}
                disabled={!selectedRtu}
                // error={!sensorType && Boolean(selectedRtu)}
              >
                <MenuItem value="" disabled>
                  Select Sensor Type
                </MenuItem>
                {getSensorTypes().map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </Box>

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
                value={sensorId}
                size="small"
                onChange={(e: SelectChangeEvent) => setSensorId(e.target.value)}
                sx={{ width: "300px", backgroundColor: "#FAFBFF" }}
                disabled={!sensorType}
                // error={!sensorId && Boolean(sensorType)}
              >
                <MenuItem value="" disabled>
                  Select Sensor ID
                </MenuItem>
                {getSensorIdsForType(sensorType).map((s) => (
                  <MenuItem key={s.id} value={s.sensorId}>
                    {s.sensorId}
                  </MenuItem>
                ))}
              </Select>
            </Box>

            <Box display="flex" alignItems="flex-start" gap={9}>
              <Typography
                color="#003366"
                fontWeight={500}
                fontSize="14px"
                minWidth="120px"
                paddingTop="8px"
              >
                Units
              </Typography>
              <Select
                value={units}
                size="small"
                onChange={(e: SelectChangeEvent) => setUnits(e.target.value)}
                sx={{ width: "300px", backgroundColor: "#FAFBFF" }}
              >
                <MenuItem value="°C">°C</MenuItem>
                <MenuItem value="atm">atm</MenuItem>
                <MenuItem value="%">%</MenuItem>
              </Select>
            </Box>
          </Box>

          <Paper
            sx={{
              display: "flex",
              flexDirection: "row",
              backgroundColor: "#FAFBFF",
            }}
          >
            <Typography
              sx={{ padding: 1, marginRight: "60px" }}
              color="#1E3A8A"
            >
              Aggregation
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={aggregationValues.max}
                  onChange={handleAggregationChange}
                  name="max"
                />
              }
              label="Maximum"
              sx={{ marginLeft: 0 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={aggregationValues.min}
                  onChange={handleAggregationChange}
                  name="min"
                />
              }
              label="Minimum"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={aggregationValues.average}
                  onChange={handleAggregationChange}
                  name="average"
                />
              }
              label="Average"
            />
          </Paper>

          <Box sx={{ marginTop: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={date}
                onChange={(newDate) => setDate(newDate)}
                sx={{
                  width: "100%",
                  backgroundColor: "#FAFBFF",
                }}
              />
            </LocalizationProvider>
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
            onClick={saveValueCardData}
            disabled={isSaving}
            sx={{
              backgroundColor: "#1E3A8A",
              color: "white",
              fontFamily: "Poppins, sans-serif",
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <CardContent sx={{ paddingTop: 4 }}>
        <Typography variant="body2" color="textSecondary"></Typography>
      </CardContent>
    </Card>
  );
};

export default ValueCardDialog;
