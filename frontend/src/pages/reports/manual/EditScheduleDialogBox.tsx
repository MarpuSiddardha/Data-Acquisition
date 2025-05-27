import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  DialogActions,
  Button,
  Switch,
  FormControlLabel,
  Box,
  Select,
  MenuItem,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import axios from "axios";

import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import ManageScheduleDialog from "@/pages/reports/automated/scheduleManagement/ManageScheduleDialog";
import { alarmStyles } from "@/styles/alarmStyles";

interface EditScheduleDialogBoxProps {
  open: boolean;
  onClose: () => void;
  reportId: string | undefined;
  initialScheduleEnabled?: boolean;
  onScheduleToggle?: (enabled: boolean) => void;
}

const EditScheduleDialogBox: React.FC<EditScheduleDialogBoxProps> = ({
  open,
  onClose,
  reportId,
  initialScheduleEnabled = false,
  onScheduleToggle,
}) => {
    const [manageScheduleOpen, setManageScheduleOpen] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(
    initialScheduleEnabled
  );
  const [frequency, setFrequency] = useState("HOURLY"); 
  const [startDateTime, setStartDateTime] = useState<dayjs.Dayjs | null>(
    dayjs() 
  );
  const [endDateTime, setEndDateTime] = useState<dayjs.Dayjs | null>(
    dayjs().add(1, "hour")
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const handleToggleSwitch = () => {
    setScheduleEnabled(!scheduleEnabled);
    console.log("Toggled Schedule:", !scheduleEnabled);
  };

  const handleSave = async () => {
    if (!reportId) {
      setError("Report ID is missing. Cannot save schedule.");
      return;
    }

    if (scheduleEnabled) {
      if (!frequency) {
        setError("Frequency is required when enabling a schedule.");
        return;
      }

      if (!startDateTime || !endDateTime) {
        setError(
          "Start and end date/time are required when enabling a schedule."
        );
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        scheduleEnabled: scheduleEnabled, 
        frequency: scheduleEnabled ? frequency : undefined,
        startDate:
          scheduleEnabled && startDateTime
            ? startDateTime.format("YYYY-MM-DDTHH:mm:ss")
            : null,
        endDate:
          scheduleEnabled && endDateTime
            ? endDateTime.format("YYYY-MM-DDTHH:mm:ss")
            : null,
      };

      console.log("Sending API request with payload:", payload);
      console.log("Report ID:", reportId);

      const response = await axios.put(
        `http://localhost:8091/reports/${reportId}/toggle-schedule`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("API response:", response.data);

      if (onScheduleToggle) {
        onScheduleToggle(scheduleEnabled); 
      }

      setSuccessMessage(
        `Schedule ${scheduleEnabled ? "enabled" : "disabled"} successfully`
      );

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error("API error:", err);
      let errorMessage = "Unknown error occurred";

      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.message ||
          `API error: ${err.response?.status || "unknown"}`;
        console.error("API response data:", err.response?.data);
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(
        `Failed to ${scheduleEnabled ? "enable" : "disable"} schedule: ${errorMessage}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccessMessage(null);
  };

  useEffect(() => {
    if (open) {
      setScheduleEnabled(initialScheduleEnabled);
    }
  }, [open, initialScheduleEnabled]);

  const handleScheduleClickOpen = () => {
      setManageScheduleOpen(true);
    };
    const handleScheduleClose = () => {
      setManageScheduleOpen(false);
    };

  return (
    <Box>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>
          <Typography
            color="#1E3A8A"
            fontWeight="bolder"
            textAlign="left"
            fontFamily="poppins"
          >
            Edit Schedule
          </Typography>
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#1E3A8A",
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ minHeight: 300, display: 'flex', flexDirection: 'column' }}>
          <Button
            variant="contained"
            onClick={handleScheduleClickOpen}
            startIcon={<ManageAccountsRoundedIcon />}
            size="small"
            sx={{...alarmStyles.modalCancelBtn, marginLeft: "auto"}}
          >
            Active Schedules
          </Button>
          <ManageScheduleDialog 
            open={manageScheduleOpen} 
            onClose={handleScheduleClose} 
          />
          <FormControlLabel
            control={
              <Switch
                checked={scheduleEnabled}
                onChange={handleToggleSwitch}
                color="primary"
                disabled={isLoading}
              />
            }
            label={scheduleEnabled ? "Adding New Schedule" : "Add Schedule"}
          />

          <Box
            sx={{
              visibility: scheduleEnabled ? "visible" : "hidden",
              height: scheduleEnabled ? "auto" : 0,
              overflow: "hidden",
              padding: 1,
            }}
          >
            <Box display="flex" alignItems="flex-start" gap={0}>
              <Typography
                color="#003366"
                fontWeight={500}
                fontSize="17px"
                minWidth="140px"
                paddingTop="8px"
              >
                Frequency
              </Typography>
              <Select
                size="small"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                sx={{
                  width: "166px",
                  backgroundColor: "#FAFBFF",
                }}
              >
                <MenuItem value="HOURLY">HOURLY</MenuItem>
                <MenuItem value="DAILY">DAILY</MenuItem>
                <MenuItem value="WEEKLY">WEEKLY</MenuItem>
                <MenuItem value="MONTHLY">MONTHLY</MenuItem>
              </Select>
            </Box>
            <Box
              flexDirection="column"
              sx={{
                marginTop: 3,
                display: "flex",
                gap: 2,
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={startDateTime}
                  onChange={(newValue) => setStartDateTime(newValue)}
                  sx={{ width: 300, backgroundColor: "#FAFBFF" }}
                  slotProps={{popper: { placement: 'auto' }}}
                />
                <DateTimePicker
                  label="End Date & Time"
                  value={endDateTime}
                  onChange={(newValue) => setEndDateTime(newValue)}
                  sx={{ width: 300, backgroundColor: "#FAFBFF" }}
                  slotProps={{popper: { placement: 'auto' }}}
                />
              </LocalizationProvider>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            sx={{
              fontFamily: "Poppins, sans-serif",
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{
              backgroundColor: "#003366",
              "&:hover": { backgroundColor: "#002244" },
              fontFamily: "Poppins, sans-serif",
            }}
            onClick={handleSave}
            disabled={isLoading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EditScheduleDialogBox;
