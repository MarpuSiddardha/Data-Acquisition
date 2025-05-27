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
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  SelectChangeEvent,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CloseIcon from "@mui/icons-material/Close";
import axios, { AxiosError } from "axios";

interface ValueandChartCardProps {
  showEditButton: boolean;
}

// Define interfaces for the RTU data structure
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

// Define widget data structure
interface SensorConfig {
  sensorType: string;
  sensorId: string;
}

interface WidgetData {
  widgetType: string;
  widgetName: string;
  data: {
    title: string;
    rtus: string[];
    sensors: SensorConfig[];
    units: string;
  };
}

const ValueandChartCard: React.FC<ValueandChartCardProps> = ({
  showEditButton,
}) => {
  const [openDialog, setOpenDialog] = useState(false); // Dialog visibility state
  const [title, setTitle] = useState(""); // Title state

  // RTU related states
  const [rtuList, setRtuList] = useState<RTU[]>([]);
  const [selectedRtu, setSelectedRtu] = useState<string>("");
  const [rtuName, setRtuName] = useState<string>("");
  const [sensorTypes, setSensorTypes] = useState<string[]>([]);
  const [selectedSensorType, setSelectedSensorType] = useState<string>("");
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<string>("");
  const [units, setUnits] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { reportId } = useParams<{ reportId: string }>(); // Get the reportId from the URL params
  const [widgetID, setWidgetID] = useState<number | null>(null);
  const [cardData, setCardData] = useState<any>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Added for validation
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [titleError, setTitleError] = useState(false);
  const [rtuError, setRtuError] = useState(false);
  const [sensorTypeError, setSensorTypeError] = useState(false);
  const [sensorIdError, setSensorIdError] = useState(false);
  const [unitsError, setUnitsError] = useState(false);

  useEffect(() => {
    const fetchWidgetData = async () => {
      if (!reportId) return;

      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:8091/manual-reports/${reportId}/view`
        );
        console.log("Widget data response:", response.data);

        // Extract widget ID correctly by finding the widget with type "Card"
        let widgetId = null;
        if (response.data.layout && response.data.layout.widgets) {
          const cardWidget = response.data.layout.widgets.find(
            (widget: any) => widget.widgetType === "Card"
          );
          if (cardWidget) {
            widgetId = Number(cardWidget.widgetId);
          }
        }

        console.log("Widget ID extracted:", widgetId);
        setWidgetID(widgetId);
        console.log(`report id ${reportId} and widget id ${widgetID}`);

        // If we have existing card data, store it but don't populate the form yet
        if (response.data.Card && response.data.Card.data) {
          const data = response.data.Card.data;
          setCardData(data);
        }

        setDataLoaded(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching widget data:", error);
        setIsLoading(false);
        setDataLoaded(true);
      }
    };

    if (reportId) {
      fetchWidgetData();
    } else {
      console.error("Report ID is missing");
    }
  }, [reportId, widgetID]);

  // Fetch RTU data when component mounts
  useEffect(() => {
    const fetchRtuData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await axios.get("http://localhost:8091/api/rtu");
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
            } else if (
              response.data.data &&
              Array.isArray(response.data.data)
            ) {
              rtus = response.data.data;
            } else if (
              response.data.rtus &&
              Array.isArray(response.data.rtus)
            ) {
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

          // Don't set default RTU anymore to keep fields empty initially
        } else {
          setError("No RTUs found in the response");
        }
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error("Error fetching RTU data:", axiosError);
        setError(axiosError.message || "Failed to fetch RTU data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRtuData();
  }, []);

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

      // Don't set default sensor type to keep field empty until user selects
      setSelectedSensorType("");
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

      // Don't set default sensor to keep field empty until user selects
      setSelectedSensor("");
    } else {
      setSensors([]);
      setSelectedSensor("");
    }
  }, [selectedSensorType, selectedRtu, rtuList]);

  // Open the dialog box and reset form fields and validation errors
  const openDialogbox = () => {
    setTitle("");
    setSelectedRtu("");
    setRtuName("");
    setSelectedSensorType("");
    setSelectedSensor("");
    setUnits("");
    // Reset validation errors
    setTitleError(false);
    setRtuError(false);
    setSensorTypeError(false);
    setSensorIdError(false);
    setUnitsError(false);
    setOpenDialog(true);
  };

  // Close the dialog box
  const onClose = () => {
    setOpenDialog(false); // Close the dialog
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Handle RTU selection change
  const handleRtuChange = (event: SelectChangeEvent) => {
    setSelectedRtu(event.target.value);
    setRtuError(false);
    setSelectedSensorType("");
    setSelectedSensor("");

    const rtu = rtuList.find((r) => String(r.rtuId) === event.target.value);
    if (rtu) {
      setRtuName(rtu.rtuName);
    }
  };

  const handleSensorTypeChange = (event: SelectChangeEvent) => {
    setSelectedSensorType(event.target.value);
    setSensorTypeError(false);
    setSelectedSensor("");
  };

  const handleSensorIdChange = (event: SelectChangeEvent) => {
    setSelectedSensor(event.target.value);
    setSensorIdError(false);
  };

  const handleUnitsChange = (event: SelectChangeEvent) => {
    setUnits(event.target.value);
    setUnitsError(false);
  };

  // Validate form fields before saving
  const validateForm = (): boolean => {
    let isValid = true;

    // Check title
    if (!title.trim()) {
      setTitleError(true);
      setSnackbarMessage("Please enter a title");
      setSnackbarOpen(true);
      isValid = false;
      return isValid;
    }

    // Check RTU
    if (!selectedRtu) {
      setRtuError(true);
      setSnackbarMessage("Please select an RTU");
      setSnackbarOpen(true);
      isValid = false;
      return isValid;
    }

    // Check Sensor Type
    if (!selectedSensorType) {
      setSensorTypeError(true);
      setSnackbarMessage("Please select a sensor type");
      setSnackbarOpen(true);
      isValid = false;
      return isValid;
    }

    // Check Sensor ID
    if (!selectedSensor) {
      setSensorIdError(true);
      setSnackbarMessage("Please select a sensor ID");
      setSnackbarOpen(true);
      isValid = false;
      return isValid;
    }

    // Check Units
    if (!units) {
      setUnitsError(true);
      setSnackbarMessage("Please select a unit");
      setSnackbarOpen(true);
      isValid = false;
      return isValid;
    }

    return isValid;
  };

  // Define widget data with proper typing
  const createWidgetData = (): WidgetData => {
    return {
      widgetType: "Card",
      widgetName: "Value and Chart Card",
      data: {
        title: title,
        rtus: [rtuName],
        sensors: [
          {
            sensorType: selectedSensorType,
            sensorId: selectedSensor,
          },
        ],
        units: units,
      },
    };
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    if (!reportId) {
      console.error("Report ID is missing:", { reportId });
      return;
    }

    if (!widgetID) {
      console.error("Widget ID is missing or invalid:", { widgetID });
      return;
    }

    try {
      // Try sending just the data object without the wrapper
      const SensorData = createWidgetData();
      console.log("Saving data:", SensorData);

      // Try with the same URL format as your fetch request
      const response = await axios.put(
        `http://localhost:8091/reports/${reportId}/widgets/${widgetID}`,
        SensorData
      );
      console.log("Widget data updated successfully:", response.data);

      onClose();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error("Error saving widget data:", axiosError);
      setSnackbarMessage("Failed to save data. Please try again.");
      setSnackbarOpen(true);
    }
  };

  const isEmpty = (arr: any[] | undefined) => {
    return !arr || arr.length === 0;
  };

  const getRtuDisplayName = (rtu: RTU) => {
    return rtu.rtuName || `RTU ${rtu.rtuId}`;
  };

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        boxShadow: 3,
        position: "relative",
      }}
    >
      {/* {!cardData && `No data added to widget`} */}
      {!cardData && (
        <CardContent>
          <Typography gutterBottom sx={{ color: "#1e3a8a", fontSize: 16 }}>
            <br />
            You're in Edit Mode of Value and Chart Card
          </Typography>
        </CardContent>
      )}
      {/* Show the Edit button only if showEditButton is true */}
      {showEditButton && (
        <IconButton
          size="small"
          onClick={openDialogbox} // Open the dialog when clicked
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

      {/* Snackbar for displaying validation messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Dialog component */}
      <Dialog open={openDialog} onClose={onClose}>
        <DialogTitle>
          <Typography
            variant="h5"
            color="#1E3A8A"
            fontWeight="bolder"
            textAlign="left"
            fontFamily="poppins"
          >
            Value and Chart Card
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
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setTitleError(false);
                    }}
                    sx={{
                      width: "300px",
                      backgroundColor: "#FAFBFF",
                    }}
                    error={titleError}
                    required
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Dropdowns for RTU, Sensor Type, Sensor ID, Units */}
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
                  <FormControl sx={{ width: "300px" }} error={rtuError}>
                    <Select
                      value={selectedRtu}
                      size="small"
                      onChange={handleRtuChange}
                      displayEmpty
                      sx={{ backgroundColor: "#FAFBFF" }}
                      disabled={isLoading}
                      error={rtuError}
                      required
                    >
                      <MenuItem value="">Select RTU</MenuItem>

                      {isLoading ? (
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
                        rtuList.map((rtu, index) => (
                          <MenuItem key={index} value={String(rtu.rtuId)}>
                            {getRtuDisplayName(rtu)}
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
                  <FormControl sx={{ width: "300px" }} error={sensorTypeError}>
                    <Select
                      value={selectedSensorType}
                      size="small"
                      onChange={handleSensorTypeChange}
                      displayEmpty
                      sx={{ backgroundColor: "#FAFBFF" }}
                      disabled={isEmpty(sensorTypes) || !selectedRtu}
                      error={sensorTypeError}
                      required
                    >
                      <MenuItem value="">Select Sensor Type</MenuItem>
                      {isEmpty(sensorTypes) ? (
                        <MenuItem value="">No sensor types available</MenuItem>
                      ) : (
                        sensorTypes.map((type, index) => (
                          <MenuItem key={index} value={type}>
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
                  <FormControl sx={{ width: "300px" }} error={sensorIdError}>
                    <Select
                      value={selectedSensor}
                      size="small"
                      onChange={handleSensorIdChange}
                      displayEmpty
                      sx={{ backgroundColor: "#FAFBFF" }}
                      disabled={isEmpty(sensors) || !selectedSensorType}
                      error={sensorIdError}
                      required
                    >
                      <MenuItem value="">Select Sensor ID</MenuItem>
                      {isEmpty(sensors) ? (
                        <MenuItem value="">No sensors available</MenuItem>
                      ) : (
                        sensors.map((sensor, index) => (
                          <MenuItem key={index} value={sensor.sensorId}>
                            {sensor.sensorId}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Box>

                {/* Units */}
                <Box display="flex" alignItems="flex-start" gap={1}>
                  <Typography
                    color="#003366"
                    fontWeight={500}
                    fontSize="14px"
                    minWidth="140px"
                    paddingTop="8px"
                  >
                    Units
                  </Typography>
                  <FormControl sx={{ width: "300px" }} error={unitsError}>
                    <Select
                      value={units}
                      size="small"
                      onChange={handleUnitsChange}
                      displayEmpty
                      sx={{ backgroundColor: "#FAFBFF" }}
                      error={unitsError}
                      required
                    >
                      <MenuItem value="">Select Unit</MenuItem>
                      <MenuItem value="Celsius">Celsius</MenuItem>
                      <MenuItem value="Bar">Bar</MenuItem>
                      <MenuItem value="%">Percentage</MenuItem>
                    </Select>
                  </FormControl>
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
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ValueandChartCard;
