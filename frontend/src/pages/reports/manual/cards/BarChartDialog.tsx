import React, { useState, useEffect, useCallback } from "react";
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
  Table,
  TableContainer,
  FormControlLabel,
  Checkbox,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Snackbar,
} from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import RTUMultiSelect from "@/pages/reports/manual/RTUMultiSelect";
import { useParams } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
// import BarHighchart from "../charts/BarHighchart";

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

interface SensorConfiguration {
  id: number;
  sensorType: string | null;
  sensorId: string | null;
  yAxis: string;
  color: string;
}

interface BarChartProps {
  showEditButton: boolean;
}

const BarChartDialog: React.FC<BarChartProps> = ({ showEditButton }) => {
  const { reportId } = useParams();

  const [openDialog, setOpenDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [rtu, setRtu] = useState<string[]>([]);
  const [showMin, setShowMin] = useState(false);
  const [showMax, setShowMax] = useState(false);
  const [availableSensors, setAvailableSensors] = useState<Sensor[]>([]);
  const [availableRtus, setAvailableRtus] = useState<RTUData[]>([]);
  const [sensorData, setSensorData] = useState<SensorConfiguration[]>([]);
  const [widgetID, setWidgetID] = useState<number>();
  const [isLoading, setIsLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(null);
  const [endDate, setEndDate] = useState<dayjs.Dayjs | null>(null);

  // Form validation state - Added for validation
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showValidationError, setShowValidationError] = useState(false);
  const MAX_SENSORS = 2;
  const [widgetData, setWidgetData] = useState(null);

  // Use useCallback for handleRtuChange to prevent it from changing on every render
  const handleRtuChange = useCallback(
    (selectedRtus: string[]) => {
      setRtu(selectedRtus);
      // Only reset sensor data if the RTU selection changes completely
      if (
        selectedRtus.length === 0 ||
        !selectedRtus.some((r) => rtu.includes(r))
      ) {
        setSensorData([]);
      }
    },
    [rtu]
  );

  const formattedStartDate = startDate ? startDate.format("YYYY-MM-DD") : "";
  const formattedEndDate = endDate ? endDate.format("YYYY-MM-DD") : "";

  // Use useCallback for handleAvailableSensors to prevent it from changing on every render
  const handleAvailableSensors = useCallback((sensors: Sensor[]) => {
    setAvailableSensors(sensors);
  }, []);

  // New callback to handle available RTUs from the RTUMultiSelect component
  const handleAvailableRtus = useCallback((rtus: RTUData[]) => {
    setAvailableRtus(rtus);
  }, []);

  useEffect(() => {
    if (!reportId || dataInitialized) {
      return;
    }

    const fetchLayout = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `http://localhost:8091/manual-reports/${reportId}/view`
        );
        console.log(response.data);

        // Find the Bar Chart widget
        const BarChartWidget = response.data.layout.widgets.find(
          (widget) => widget.widgetName === "Bar Chart"
        );

        if (BarChartWidget) {
          setWidgetID(BarChartWidget.widgetId);

          // If widget has existing data, load it
          if (BarChartWidget.data) {
            setTitle(BarChartWidget.data.title || "");
            setRtu(
              Array.isArray(BarChartWidget.data.rtu)
                ? BarChartWidget.data.rtu.map((id) => String(id))
                : []
            );
            setShowMin(!!BarChartWidget.data.showMin);
            setShowMax(!!BarChartWidget.data.showMax);
            if (Array.isArray(BarChartWidget.data.sensorData)) {
              setSensorData(BarChartWidget.data.sensorData);
            }

            // Added date initialization
            if (BarChartWidget.data.date) {
              if (BarChartWidget.data.date.startDate) {
                setStartDate(dayjs(BarChartWidget.data.date.startDate));
              }
              if (BarChartWidget.data.date.endDate) {
                setEndDate(dayjs(BarChartWidget.data.date.endDate));
              }
            }
          }

          setDataInitialized(true); // Mark as initialized
        } else {
          console.error("Bar Chart widget not found.");
        }
      } catch (error) {
        console.error("Error fetching layout data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLayout();
  }, [reportId, dataInitialized]);

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
        }
      }
    };

    fetchWidgetData();

    return () => {
      controller.abort();
    };
  }, [widgetID, reportId]);

  const handleAddSensor = () => {
    if (sensorData.length >= MAX_SENSORS) {
      setValidationError(`Maximum of ${MAX_SENSORS} sensors allowed`);
      setShowValidationError(true);
      return;
    }
    const newSensor: SensorConfiguration = {
      id: Date.now(), // Use timestamp for unique ID instead of array length
      sensorType: null,
      sensorId: null,
      yAxis: "left",
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };
    setSensorData([...sensorData, newSensor]);
  };

  const handleSensorChange = (
    e: React.ChangeEvent<{ value: unknown }>,
    field: string,
    id: number
  ) => {
    const updatedData = sensorData.map((sensor) => {
      if (sensor.id === id) {
        if (field === "sensorType") {
          return { ...sensor, [field]: e.target.value, sensorId: null }; // Reset sensorId on sensorType change
        }
        return { ...sensor, [field]: e.target.value };
      }
      return sensor;
    });
    setSensorData(updatedData);
  };

  const handleDeleteSensor = (id: number) => {
    const updatedData = sensorData.filter((sensor) => sensor.id !== id);
    setSensorData(updatedData);
  };

  const getSensorTypes = () => {
    return Array.from(new Set(availableSensors.map((s) => s.sensorType)));
  };

  // Updated validation function with proper error handling
  const validateFormData = () => {
    if (title.trim() === "") {
      setValidationError("Title cannot be empty");
      setShowValidationError(true);
      return false;
    }

    if (rtu.length === 0) {
      setValidationError("At least one RTU must be selected");
      setShowValidationError(true);
      return false;
    }

    if (sensorData.length === 0) {
      setValidationError("At least one sensor must be configured");
      setShowValidationError(true);
      return false;
    }

    const invalidSensors = sensorData.filter(
      (s) => !s.sensorType || !s.sensorId
    );
    if (invalidSensors.length > 0) {
      setValidationError("All sensors must have both type and ID selected");
      setShowValidationError(true);
      return false;
    }

    if (!startDate || !endDate) {
      setValidationError("Both start date and end date must be selected");
      setShowValidationError(true);
      return false;
    }

    if (startDate && endDate) {
      if (endDate.isBefore(startDate)) {
        setValidationError("End Date cannot be before start date");
        setShowValidationError(true);
        return false;
      }
    }

    return true;
  };

  // Added handler to close validation error Snackbar
  const handleCloseValidationError = () => {
    setShowValidationError(false);
  };

  const saveWidgetData = async () => {
    if (!validateFormData()) {
      return;
    }

    // Get RTU names from selected RTU IDs
    const selectedRtuNames = rtu.map((rtuId) => {
      const foundRtu = availableRtus.find((r) => String(r.rtuId) === rtuId);
      return foundRtu ? foundRtu.rtuName : `RTU ${rtuId}`;
    });

    // Transform the sensor data to match the backend's expected format
    const transformedSensorData = sensorData.map((sensor) => ({
      ...sensor,
      // Transform yAxis value from "left"/"right" to the expected backend format
      yAxis: sensor.yAxis, // Keep as is since you want "left" or "right"
    }));

    // Create a widget object that matches the backend's expected structure
    const widgetDataPut = {
      widgetType: "Chart",
      widgetName: "Bar Chart",
      data: {
        title: title,
        rtus: selectedRtuNames,
        sensors: transformedSensorData, // Use the transformed sensor data
        date: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
        showValues: {
          showMax: showMax,
          showMin: showMin,
        },
      },
    };

    console.log("Sending widget data:", widgetDataPut);

    try {
      const response = await axios.put(
        `http://localhost:8091/reports/${reportId}/widgets/${widgetID}`,
        widgetDataPut
      );
      const chartdata = response.data;
      setWidgetData(chartdata);
      console.log("Widget data saved successfully:", chartdata);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error saving widget data:", error);
      if (error) {
        console.error("Response data:", error);
        console.error("Response status:", error);
      }
    }
  };

  const getSensorIdsForType = (sensorType: string | null) => {
    if (!sensorType) return [];

    // Get all sensors with matching sensorType
    const filteredSensors = availableSensors.filter(
      (s) => s.sensorType === sensorType
    );

    // Create a map to track unique sensorIds while preserving the first occurrence of each
    const uniqueSensorIds = new Map();

    filteredSensors.forEach((sensor) => {
      if (!uniqueSensorIds.has(sensor.sensorId)) {
        uniqueSensorIds.set(sensor.sensorId, sensor.id);
      }
    });

    // Convert the map back to the expected array format
    return Array.from(uniqueSensorIds).map(([sensorId, id]) => ({
      id,
      sensorId,
    }));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
            You're in Edit Mode of Bar Chart
          </Typography>
        </CardContent>
      )}
      {/* {widgetData && <BarHighChart reportId={reportId} widgetId={widgetID} />} */}
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

      {/* Added Validation Error Snackbar at the bottom */}
      <Snackbar
        open={showValidationError}
        autoHideDuration={6000}
        onClose={handleCloseValidationError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseValidationError}
          severity="error"
          sx={{ width: "100%" }}
        >
          {validationError}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography
            color="#1E3A8A"
            fontWeight="bolder"
            textAlign="left"
            fontFamily="poppins"
            sx={{ fontSize: "2rem" }}
          >
            Bar Chart
          </Typography>
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8, color: "#1E3A8A" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" gap={4} mb={3}>
            <Box flex={1}>
              <Box display="flex" flexDirection="row" gap={10}>
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
                    sx={{ width: "166px", backgroundColor: "#FAFBFF" }}
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
                  <RTUMultiSelect
                    selectedRtus={rtu}
                    onChange={handleRtuChange}
                    onSensorsChange={handleAvailableSensors}
                    onRtusChange={handleAvailableRtus}
                  />
                </Box>
              </Box>
            </Box>
          </Box>

          <TableContainer
            component={Paper}
            sx={{ marginTop: 2, backgroundColor: "#FAFBFF" }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "20%", color: "#003366" }}>
                    Sensor Type
                  </TableCell>
                  <TableCell sx={{ width: "20%", color: "#003366" }}>
                    Sensor ID
                  </TableCell>
                  <TableCell sx={{ width: "20%", color: "#003366" }}>
                    Y-axis
                  </TableCell>
                  <TableCell sx={{ width: "10%", color: "#003366" }}>
                    Color
                  </TableCell>
                  <TableCell sx={{ width: "20%", color: "#003366" }}>
                    <Button
                      variant="contained"
                      onClick={handleAddSensor}
                      disabled={
                        rtu.length === 0 || sensorData.length >= MAX_SENSORS
                      }
                      sx={{
                        backgroundColor: "#17468A",
                        color: "#fff",
                        maxWidth: "100%",
                        height: "36px",
                        fontSize: "14px",
                      }}
                    >
                      Add Sensor
                    </Button>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sensorData.map((sensor) => (
                  <TableRow key={sensor.id}>
                    <TableCell>
                      <Select
                        size="small"
                        value={sensor.sensorType || ""}
                        onChange={(e) =>
                          handleSensorChange(
                            e as React.ChangeEvent<{ value: unknown }>,
                            "sensorType",
                            sensor.id
                          )
                        }
                        displayEmpty
                        sx={{ width: "100%", backgroundColor: "#FAFBFF" }}
                        error={!sensor.sensorType}
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
                    </TableCell>

                    <TableCell>
                      <Select
                        size="small"
                        value={sensor.sensorId || ""}
                        onChange={(e) =>
                          handleSensorChange(
                            e as React.ChangeEvent<{ value: unknown }>,
                            "sensorId",
                            sensor.id
                          )
                        }
                        displayEmpty
                        disabled={!sensor.sensorType}
                        sx={{ width: "100%", backgroundColor: "#FAFBFF" }}
                      >
                        <MenuItem value="" disabled>
                          Select Sensor ID
                        </MenuItem>
                        {getSensorIdsForType(sensor.sensorType).map((s) => (
                          <MenuItem key={s.id} value={s.sensorId}>
                            {s.sensorId}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={sensor.yAxis}
                        onChange={(e) =>
                          handleSensorChange(
                            e as React.ChangeEvent<{ value: unknown }>,
                            "yAxis",
                            sensor.id
                          )
                        }
                        sx={{ width: "100%", backgroundColor: "#FAFBFF" }}
                      >
                        <MenuItem value="left">Left</MenuItem>
                        <MenuItem value="right">Right</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <input
                        type="color"
                        value={sensor.color}
                        onChange={(e) =>
                          handleSensorChange(
                            e as unknown as React.ChangeEvent<{
                              value: unknown;
                            }>,
                            "color",
                            sensor.id
                          )
                        }
                        style={{ width: "50%" }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleDeleteSensor(sensor.id)}
                        sx={{ color: "grey" }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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
                color: "#003366",
              }}
            >
              Date
            </Typography>
            <Box sx={{ marginTop: 3, display: "flex", gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e)}
                  sx={{
                    width: 500,
                    backgroundColor: "#FAFBFF",
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e)}
                  sx={{
                    width: 500,
                    backgroundColor: "#FAFBFF",
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Paper>

          <Paper
            sx={{
              marginTop: 2,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#FAFBFF",
              padding: "10px", // Optional padding for better spacing
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#003366",
                }}
              >
                Show values
              </Typography>
              <Box display="flex" gap={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showMin}
                      onChange={() => setShowMin(!showMin)}
                    />
                  }
                  label="Min"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showMax}
                      onChange={() => setShowMax(!showMax)}
                    />
                  }
                  label="Max"
                />
              </Box>
            </Box>
          </Paper>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            sx={{ color: "#17468A", fontFamily: "Poppins, sans-serif" }}
          >
            Cancel
          </Button>
          <Button
            onClick={saveWidgetData}
            variant="contained"
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

      {!widgetData && (
        <CardContent sx={{ marginTop: "auto" }}>
          <Typography
            gutterBottom
            sx={{ color: "text.secondary", fontSize: 16 }}
          >
            Bar Chart
          </Typography>
        </CardContent>
      )}
    </Card>
  );
};

export default BarChartDialog;
