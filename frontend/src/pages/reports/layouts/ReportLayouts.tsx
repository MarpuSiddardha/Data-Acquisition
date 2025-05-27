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
} from "@mui/material";
import LoopIcon from "@mui/icons-material/Loop";
import { SelectChangeEvent } from "@mui/material/Select";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useLocation } from "react-router-dom";
import { alarmStyles } from "@/styles/alarmStyles";
import LayoutTable from "./LayoutTable";
import { automatedStyles } from "@/styles/automatedStyles";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchFilteredLayouts,
  fetchLayoutsReports,
  searchLayoutsByName,
} from "@/store/layoutsSlice";
import { useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import { RootState, AppDispatch } from "@/store/store";

const ReportLayouts: React.FC = () => {
  const context = useContext(SidebarContext);
  const { isSidebarOpen } = context;
  const [searchParams, setSearchParams] = useSearchParams();
  let searchQuery = searchParams.get("search") || "";
  const navigate = useNavigate();
  const location = useLocation();

  const dispatch = useDispatch<AppDispatch>();
  const { LayoutsData, loading, error, searchResults } = useSelector(
    (state: RootState) => state.layouts
  );

  const [startDate, setStartDate] = useState("");
  const [startDateError, setStartDateError] = useState<string | null>(null);
  const [endDateError, setEndDateError] = useState<string | null>(null);
  const [endDate, setEndDate] = useState("");
  const [layoutType, setLayoutType] = useState<string>("");
  const [layoutName, setLayoutName] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchLayoutsReports());
  }, [dispatch]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    setStartDate(params.get("startDate") || "");
    setEndDate(params.get("endDate") || "");
    setLayoutType(params.get("layoutType") || "");
    setLayoutName(params.get("layoutName") || "");
  }, [location.search]);

  useEffect(() => {
    return () => {
      setStartDate("");
      setEndDate("");
      setLayoutName("");
      setLayoutType("");
    };
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    searchQuery = event.target.value;
    if(searchQuery) {
      dispatch(searchLayoutsByName(searchQuery));
      setSearchParams({ search: searchQuery });
    } else {
      dispatch(fetchLayoutsReports());
      setSearchParams({});
    }
  };

  const handleApply = () => {
    setStartDateError(null);
  setEndDateError(null);

  let hasError = false;

 

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    setStartDateError("Start date is after end date");
    console.log(endDateError)
    hasError = true;
  }

  if (hasError) return;



    const filters = {
      layoutType,
      layoutName,
      startDate,
      endDate,
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

    dispatch(fetchFilteredLayouts(filters));
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
     setStartDateError(null);
    setEndDateError(null);
    setLayoutName("");
    setLayoutType("");
    navigate("/reports-analytics/layouts");
    dispatch(fetchLayoutsReports());
  };

  const handleLayoutTypeChange = (event: SelectChangeEvent<string>) => {
    setLayoutType(event.target.value);
  };

  const fetchData = () => {
    setIsRefreshing(true);
    dispatch(fetchLayoutsReports()).finally(() => setIsRefreshing(false));
  };

  const uniqueLayoutTypes = ["Customized", "Default"];

  const finalData = searchQuery ? searchResults : LayoutsData;

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
              placeholder="Layout Name"
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
              sx={{ ...automatedStyles.search, width: "28%" }}
            />
            <LoopIcon
              onClick={fetchData}
              fontSize="medium"
              className={isRefreshing ? "rotate" : ""}
              sx={{
                height: "35px",
                color: "#1e3a8a",
                cursor: "pointer",
                gap: "10px",
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddCircleRoundedIcon />}
              size="small"
              sx={{
                ...alarmStyles.modalSaveBtn,
                marginLeft: "auto",
                color: "#fff",
                backgroundColor: "#1e3a8a",
                fontSize: "1rem",
                padding: ".25em 1em",
                fontFamily: "Poppins",
                fontWeight: "400"
              }}
              onClick={() => navigate("layouts/create-layout")}
            >
              Add Layout
            </Button>
          </Box>
          <Box sx={{ marginLeft: "auto", display: "flex", gap: "10px" }}></Box>
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
          <Typography sx={{ ...alarmStyles.filterText, marginRight: "3em" }}>
            Filter By
          </Typography>
          <Select
            value={layoutType}
            onChange={handleLayoutTypeChange}
            size="small"
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return <span style={{ color: "#1e3a8a" }}>Layout Type</span>;
              }
              return selected;
            }}
            sx={{ ...alarmStyles.filter, width: "22%", flexGrow: 1 }}
            MenuProps={alarmStyles.filterOptions}
          >
            {uniqueLayoutTypes.map((layout) => (
              <MenuItem key={layout} value={layout}>
                {layout}
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
            />
            <span style={{ fontSize: "14px", color: "#1e3a8a" }}>to</span>
            <TextField
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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
            />
          </Box>
          <Button
            variant="contained"
            size="small"
            sx={{
              minWidth: "90px",
              bgcolor: "#1E3A8A",
              borderRadius: "20px",
              textTransform: "none",
              fontFamily: "Poppins",
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
          <LayoutTable
            data={Array.isArray(finalData) ? finalData : []}
            error={error}
          />
        )}
      </Box>
    </>
  );
};

export default ReportLayouts;
