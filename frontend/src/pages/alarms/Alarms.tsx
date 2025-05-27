import { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  TextField,
  Typography,
  Box,
  InputAdornment,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Snackbar,
  AlertTitle,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { RootState, AppDispatch } from "@/store/store";
import { fetchAlarms, searchAlarm, clearUpdateStatus, clearErrorStatus } from "@/store/alarmsSlice";
import { useAlarmsFilters } from "@/hooks/useAlarmsFilters";
import { AlarmFilters } from "@/utils/types";
import AlarmsTable from "@/pages/alarms/AlarmsTable";
import { alarmStyles } from "@/styles/alarmStyles";
import { globalStyles } from "@/styles/globalStyles";
import { SidebarContext } from "@/context/SidebarContext";

export default function Alarms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  let searchQuery = searchParams.get("search") || "";
  const { isSidebarOpen } = useContext(SidebarContext);
  
  const dispatch = useDispatch<AppDispatch>();
  const { alarmsData, loadingAlarms, errorAlarms, searchedAlarms, updateError, updateSuccess } = useSelector(
    (state: RootState) => state.alarms
  );
  
  const { severity, status, setFilters } = useAlarmsFilters();
  const uniqueSeverities = ["Low", "Moderate", "High"];
  const uniqueStatuses = ["Active", "Closed", "Acknowledged"];

  useEffect(() => {
    dispatch(fetchAlarms({ severity, status }));
  }, [severity, status, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      setShowUpdateAlert(true);
      setTimeout(() => {
        setShowUpdateAlert(false);
        dispatch(clearUpdateStatus());
      }, 3000);
    }
    if(updateError) {
      setShowErrorAlert(true);
      setTimeout(() => {
        setShowErrorAlert(false);
        dispatch(clearErrorStatus());
      }, 3000);
    }
  }, [updateSuccess, updateError, dispatch]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    searchQuery = event.target.value.trim();
    if (searchQuery) {
      dispatch(searchAlarm(searchQuery));
      setSearchParams({ search: searchQuery });
    } else {
      dispatch(fetchAlarms({ severity, status }));
      setSearchParams({});
    }
  };

  const handleUpdateAlertClose = () => {
    setShowUpdateAlert(false);
    dispatch(clearUpdateStatus());
  };

  const handleErrorAlertClose = () => {
    setShowErrorAlert(false);
    dispatch(clearErrorStatus());
  };

  const clearFilters = () => {
    setFilters({ severity: "", status: "" });
  };
  const finalData = searchQuery ? searchedAlarms : alarmsData;

  return (
    <>
      <Box sx={alarmStyles.snfContainer(isSidebarOpen)}>
        <Snackbar
          open={showErrorAlert}
          autoHideDuration={3000}
          onClose={handleErrorAlertClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            variant="filled"
            severity="error"
            sx={{...alarmStyles.modalSaveBtn, color: "oklch(93.6% 0.032 17.717)", backgroundColor: "oklch(44.4% 0.177 26.899)", width: "100%" }}
          >
            Error Updating Alarm
          </Alert>
        </Snackbar>

        <Snackbar
          open={showUpdateAlert}
          autoHideDuration={3000}
          onClose={handleUpdateAlertClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            variant="filled"
            severity="info"
            sx={{...alarmStyles.modalSaveBtn, color: "#f0f4ff", backgroundColor: "#1e3a8a", width: "100%" }}
          >
            Alarm Updated Successfully
          </Alert>
        </Snackbar>
        <Box sx={alarmStyles.filterContainer}>
          <Typography sx={alarmStyles.filterText}>Search By</Typography>
          <TextField
            placeholder=" Name or Tags"
            variant="outlined"
            size="small"
            onChange={handleSearchChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={alarmStyles.search}
          />
        </Box>
        <Box sx={alarmStyles.filterContainer}>
          <Typography sx={alarmStyles.filterText}>Filter By</Typography>

          <Select
            value={severity}
            onChange={(e) =>
              setFilters({
                severity: e.target.value as AlarmFilters["severity"],
              })
            }
            size="small"
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return <span style={{ color: "#1e3a8a" }}>Severity</span>;
              }
              return selected;
            }}
            sx={alarmStyles.filter}
            MenuProps={alarmStyles.filterOptions}
          >
            {uniqueSeverities.map((severity) => (
              <MenuItem key={severity} value={severity}>
                {severity}
              </MenuItem>
            ))}
          </Select>

          <Select
            value={status}
            onChange={(e) =>
              setFilters({ status: e.target.value as AlarmFilters["status"] })
            }
            size="small"
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return <span>Status</span>;
              }
              return selected;
            }}
            sx={alarmStyles.filter}
            MenuProps={alarmStyles.filterOptions}
          >
            {uniqueStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>

          {(severity || status) && (
            <Typography sx={alarmStyles.clearFilters} onClick={clearFilters}>
              Clear Filters
            </Typography>
          )}
        </Box>
      </Box>
      {loadingAlarms ? (
        <div style={globalStyles.loading}>
          <LinearProgress />
          <br />
          Loading alarms...
        </div>
      ) : errorAlarms ? (
        <div>
          <Alert severity="error" style={globalStyles.error}>
            <AlertTitle>Backend Error</AlertTitle>
            Unable to fetch data.
          </Alert>
        </div>
      ) : (
        <AlarmsTable data={Array.isArray(finalData) ? finalData : []} error={errorAlarms} />
      )}
    </>
  );
}
