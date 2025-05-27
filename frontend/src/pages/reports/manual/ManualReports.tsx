import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Box,
  InputAdornment,
  CircularProgress,
  Typography,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { SyntheticEvent } from "react";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import { alarmStyles } from "@/styles/alarmStyles";
import SearchIcon from "@mui/icons-material/Search";
import LoopIcon from "@mui/icons-material/Loop";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import ManualReportsTable from "./ManualReportsTable";
import { automatedStyles } from "@/styles/automatedStyles";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchManualReports,
  fetchFilteredReports,
  searchmanualreports,
} from "@/store/ManualReportsSlice";
import { RootState, AppDispatch } from "@/store/store";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import CreateReportDialog from "./CreateReportDialog";
import { ToastContainer } from "react-toastify";
import Autocomplete from "@mui/material/Autocomplete";

const ManualReports: React.FC = () => {
  const context = useContext(SidebarContext);
  const { isSidebarOpen } = context;

  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [searchValue, setSearchValue] = useState(searchQuery);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedReportType, setSelectedReportType] = useState<string | null>(
    null
  );
  const [selectedScheduleStatus, setSelectedScheduleStatus] = useState<
    string | null
  >("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { manualReports, loading, error, searchResults } = useSelector(
    (state: RootState) => state.manualReports
  );

  const handleScheduleStatusChange = (
    event: SelectChangeEvent<string | null>
  ) => {
    setSelectedScheduleStatus(event.target.value);
  };

  // const handleScheduleStatusChange = (
  //   event: SelectChangeEvent<string>
  // ) => {
  //   setSelectedScheduleStatus(event.target.value);
  // };

  // const handleReportTypeChange = (
  //   _: SyntheticEvent<Element, Event>,
  //   newValue: string | null
  // ) => {
  //   setSelectedReportType(newValue || "");
  // };

  const handleReportTypeChange = (
    _: SyntheticEvent<Element, Event>,
    newValue: string | null
  ) => {
    setSelectedReportType(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);

    if (value.trim()) {
      setSearchParams({ search: value });
    } else {
      setSearchParams({});
    }
  };

  const handleApply = () => {
    setStartDateError(null);
    setEndDateError(null);
    let hasError = false;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setStartDateError("Start date is after end date");
      hasError = true;
    }

    if (hasError) return;
    const filters = {
      startDate,
      endDate,
      reportType: selectedReportType,
      scheduleStatus: selectedScheduleStatus,
    };

    const queryParams = new URLSearchParams(
      Object.entries(filters).reduce(
        (acc: Record<string, string>, [key, value]) => {
          if (value) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      )
    ).toString();

    navigate(`?${queryParams}`);
    dispatch(fetchFilteredReports(filters));
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setStartDateError(null);
    setEndDateError(null);
    setSelectedReportType("");
    setSelectedScheduleStatus("");
    navigate("/reports-analytics/manual");
    dispatch(fetchManualReports());
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    dispatch(fetchManualReports());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    setStartDate(params.get("startDate") || "");
    setEndDate(params.get("endDate") || "");
    setSelectedReportType(params.get("selectedReportType") || "");
    setSelectedScheduleStatus(params.get("selectedScheduleStatus") || "");
  }, [location.search]);

  useEffect(() => {
    return () => {
      setStartDate("");
      setEndDate("");
      setSelectedReportType("");
      setSelectedScheduleStatus("");
    };
  }, []);

  useEffect(() => {
    if (searchValue.trim()) {
      dispatch(searchmanualreports(searchValue));
    }
  }, [searchValue, dispatch]);

  const fetchData = () => {
    setIsRefreshing(true);
    dispatch(fetchManualReports()).finally(() => setIsRefreshing(false));
  };

  const additionalReportTypes = [
    "No Comms Report",
    "Sensor Analysis Report",
    "Alarm Analysis Report",
  ];

  const uniqueReportTypes = Array.from(
    new Set([
      ...manualReports.map((row) => row.reportType),
      ...additionalReportTypes,
    ])
  );

  const uniqueScheduleStatus = ["On", "Off"];

  const finalData = searchValue ? searchResults : manualReports;
  // console.log(manualReports)

  const [open, setOpen] = useState(false);

  return (
    <>
      <style>
        {`
          @keyframes rotate {
            from {
              transform: rotate(200deg);
            }
            to {
              transform: rotate(200deg);
            }
          }
          .rotate {
            animation: rotate 20s linear infinite;
          }
        `}
      </style>

      <Box sx={automatedStyles.snfContainer(isSidebarOpen)}>
        <Box
          sx={{
            display: "flex",
            width: "100%",
          }}
        >
          <Box
            sx={{
              width: "100%",
              alignSelf: "start",
              flexDirection: "row",
              display: "flex",
              gap: "1em",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{ ...alarmStyles.filterText, marginRight: "1.25em" }}
            >
              Search By
            </Typography>
            <TextField
              placeholder="Report Type"
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ ...automatedStyles.search, width: "28%" }}
            />
            <LoopIcon
              onClick={fetchData}
              fontSize="medium"
              className={isRefreshing ? "rotate" : ""}
              sx={{
                height: "35px",
                cursor: "pointer",
                color: "#1e3a8a",
                gap: "10px",
              }}
            />
            <Button
              variant="contained"
              onClick={handleClickOpen}
              startIcon={<AddCircleRoundedIcon />}
              size="small"
              sx={{
                ...alarmStyles.modalSaveBtn,
                marginLeft: "auto",
                color: "#fff",
                backgroundColor: "#1e3a8a",
                fontSize: "1rem",
                padding: ".25em 1em",
                fontWeight: "400",
                fontFamily: "Poppins",
              }}
            >
              Add Report
            </Button>
            <CreateReportDialog open={open} onClose={handleClose} />{" "}
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Autocomplete
            options={uniqueReportTypes}
            value={selectedReportType}
            onChange={handleReportTypeChange}
            noOptionsText="No Reports to filter"
            sx={{
              width: "180px",
              flexGrow: 1,
              "& .MuiOutlinedInput-root": {
                height: "36px",
                fontSize: "0.8rem",
                padding: "4px 10px",
                borderRadius: "12px",
                borderColor: "#1e3a8a",
                fontFamily: "Poppins",
                color: "#1e3a8a",
                "& fieldset": {
                  borderColor: "#1e3a8a",
                },
                "&:hover fieldset": {
                  borderColor: "#1e3a8a",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1e3a8a",
                },
              },
              "& .MuiOutlinedInput-endAdornment": {
                right: "4px",
              },
              "& input": {
                padding: "0px 4px !important",
              },
              "& .MuiInputLabel-root": {
                color: "#1e3a8a",
                fontSize: "0.87rem",
              },
              "& .MuiSvgIcon-root": {
                color: "#1e3a8a",
              },
              "& .MuiAutocomplete-popupIndicator": {
                color: "#1e3a8a",
                padding: "2px",
              },
            }}
            slotProps={{
              popper: {
                sx: {
                  overflowY: "auto",
                  "&:hover": {
                    backgroundColor: "#f0f4ff",
                  },
                  "& .MuiAutocomplete-option": {
                    width: "100%",
                    fontFamily: "Poppins",
                    borderRadius: "10px",
                    color: "#1e3a8a",
                    fontSize: ".8rem",
                    "&:hover": {
                      backgroundColor: "#f0f4ff",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "#e0eaff",
                      "&:hover": {
                        backgroundColor: "#d0e0ff",
                      },
                    },
                    "&.Mui-focusVisible": {
                      display: "none",
                    },
                  },
                },
              },
              clearIndicator: {
                sx: { display: "none" },
              },
              popupIndicator: {
                sx: {
                  color: "#1e3a8a",
                  padding: "-4px",
                },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                InputLabelProps={{ shrink: false }}
                InputProps={{
                  ...params.InputProps,
                  placeholder: "Select Report Type",
                  endAdornment: (
                    <div style={{ padding: 0, margin: 0 }}>
                      {params.InputProps.endAdornment}
                    </div>
                  ),
                  startAdornment: null,
                  inputProps: {
                    ...params.inputProps,
                    style: { opacity: 1 },
                  },
                }}
              />
            )}
          />

          <Select
            value={selectedScheduleStatus}
            onChange={handleScheduleStatusChange}
            size="small"
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <span style={{ color: "#1e3a8a" }}>Scheduled Status</span>
                );
              }
              return selected;
            }}
            sx={{ ...alarmStyles.filter, width: "17%" }}
            MenuProps={alarmStyles.filterOptions}
          >
            {uniqueScheduleStatus.map((report, index) => (
              <MenuItem key={`${report}-${index}`} value={report}>
                {report}
              </MenuItem>
            ))}
          </Select>

          <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <TextField
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={!!startDateError}
              helperText={startDateError}
              sx={{
                ...alarmStyles.filter,
                width: "180px",
                "& .MuiOutlinedInput-root": {
                  height: "36px",
                  padding: "4px 10px",
                  fontSize: "0.8rem",
                  borderRadius: "12px",
                  borderColor: "#1e3a8a",
                  fontFamily: "Poppins",
                  color: "#1e3a8a",
                  "& fieldset": {
                    borderColor: "#1e3a8a",
                  },
                  "&:hover fieldset": {
                    borderColor: "#1e3a8a",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1e3a8a",
                  },
                },
                "& .MuiInputLabel-root": {
                  display: "none",
                },
                "& .MuiSvgIcon-root": {
                  color: "#1e3a8a",
                },
              }}
              InputProps={{
                inputProps: {
                  style: { opacity: 1 },
                },
              }}
            />
            <span style={{ fontSize: "14px", color: "#1e3a8a" }}>to</span>
            <TextField
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={!!endDateError}
              sx={{
                ...alarmStyles.filter,
                width: "180px",
                "& .MuiOutlinedInput-root": {
                  height: "36px",
                  padding: "4px 10px",
                  fontSize: "0.8rem",
                  borderRadius: "12px",
                  borderColor: "#1e3a8a",
                  fontFamily: "Poppins",
                  color: "#1e3a8a",
                  "& fieldset": {
                    borderColor: "#1e3a8a",
                  },
                  "&:hover fieldset": {
                    borderColor: "#1e3a8a",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#1e3a8a",
                  },
                },
                "& .MuiInputLabel-root": {
                  display: "none",
                },
                "& .MuiSvgIcon-root": {
                  color: "#1e3a8a",
                },
              }}
              InputProps={{
                inputProps: {
                  style: { opacity: 1 },
                },
              }}
            />
          </Box>
          <Button
            variant="contained"
            size="small"
            sx={{
              minWidth: "90px",
              bgcolor: "#1E3A8A",
              borderRadius: "20px",
              fontFamily: "Poppins",
              textTransform: "none",
            }}
            onClick={handleApply}
          >
            Apply
          </Button>
          <Button
            variant="contained"
            size="small"
            sx={{
              minWidth: "90px",
              bgcolor: "#1E3A8A",
              fontFamily: "Poppins",
              borderRadius: "20px",
              textTransform: "none",
            }}
            onClick={handleReset}
          >
            Reset
          </Button>
        </Box>
      </Box>

      <Box sx={{ marginTop: "20px" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <CircularProgress />
            <Typography variant="h6" sx={{ ml: 2 }}>
              Loading reports...
            </Typography>
          </Box>
        ) : (
          <ManualReportsTable
            data={Array.isArray(finalData) ? finalData : []}
            error={error}
          />
        )}
      </Box>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        draggable
        theme="colored"
      />
    </>
  );
};

export default ManualReports;
