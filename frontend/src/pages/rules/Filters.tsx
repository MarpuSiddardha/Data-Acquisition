import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Switch,
  TextField,
  Select,
  Typography,
  useTheme,
  useMediaQuery,
  InputAdornment,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RulesTable from "./RulesTable";
import Popup from "./Popup";
import { FiltersProps, Rule } from "@/utils/types";
import { RulesStyle } from "@/styles/rulesStyles";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  setPopupOpen,
  setSelectedRule,
  setEditMode,
  setViewMode,
  fetchData,
  deleteRuleAsync,
  searchRulesAsync,
  fetchFilteredRules,
  setFilters,
  clearFilters,
  clearSelectedRule,
  clearDeleteStatus,
  clearCreateStatus,
  clearUpdateStatus,
} from "@/store/rulesSlice";
import { useSearchParams } from "react-router-dom"; // Replace useLocation with useSearchParams
import { alarmStyles } from "@/styles/alarmStyles";

const Filters: React.FC<FiltersProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams(); // Use useSearchParams instead of useNavigate/useLocation
  const isPopupOpen = useSelector(
    (state: RootState) => state.rules.isPopupOpen
  );
  const {
    rules: rulesData,
    loading,
    createSuccess,
    updateSuccess,
  } = useSelector((state: RootState) => state.rules);
  const [showDeleteAlert, setDeleteShowAlert] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showUpdateAlert, setShowUpdateAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  ); // Initialize with URL param if present

  const handleEditRule = (rule: Rule) => {
    dispatch(clearSelectedRule());
    dispatch(setSelectedRule(rule));
    dispatch(setPopupOpen(true));
    dispatch(setEditMode(true));
    dispatch(setViewMode(false));
  };

  useEffect(() => {
    if (updateSuccess) {
      setShowUpdateAlert(true);
      setTimeout(() => {
        setShowUpdateAlert(false);
        dispatch(clearUpdateStatus());
      }, 3000);
    }
  }, [updateSuccess, dispatch]);

  const handleAddRule = () => {
    dispatch(clearSelectedRule());
    dispatch(setSelectedRule(null));
    dispatch(setPopupOpen(true));
    dispatch(setEditMode(false));
    dispatch(setViewMode(false));
  };

  useEffect(() => {
    if (createSuccess) {
      setShowCreateAlert(true);
      setTimeout(() => {
        setShowCreateAlert(false);
        dispatch(clearCreateStatus());
      }, 3000);
    }
  }, [createSuccess, dispatch]);

  const handleDelete = (id: number) => {
    dispatch(deleteRuleAsync(id)).then(() => {
      setDeleteShowAlert(true);
      setTimeout(() => {
        setDeleteShowAlert(false);
        dispatch(clearDeleteStatus());
      }, 3000);
    });
  };

  const handleDeleteAlertClose = () => {
    setDeleteShowAlert(false);
    dispatch(clearDeleteStatus());
  };

  const handleCreateAlertClose = () => {
    setShowCreateAlert(false);
    dispatch(clearCreateStatus());
  };

  const handleUpdateAlertClose = () => {
    setShowUpdateAlert(false);
    dispatch(clearUpdateStatus());
  };

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [activeToggle, setActiveToggle] = useState(false);
  const [pausedToggle, setPausedToggle] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  // const [uniquePriorities, setUniquePriorities] = useState<string[]>([]);

  //handle search input change
  // This function is called when the search input changes
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query) {
      const searchType = !isNaN(Number(query)) ? "ruleId" : "tags";
      dispatch(searchRulesAsync({ searchType, searchValue: query }));
      setSearchParams({ search: query }); // Update URL param without navigating
    } else {
      dispatch(fetchData());
      setSearchParams({});
    }
  };

  const applyFilters = () => {
    const filterParams: { priority?: string; status?: string } = {};

    if (activeToggle && !pausedToggle) {
      filterParams.status = "Active";
    } else if (pausedToggle && !activeToggle) {
      filterParams.status = "Paused";
    }
    if (selectedPriority) {
      filterParams.priority = selectedPriority;
    }
    if (Object.keys(filterParams).length > 0) {
      dispatch(setFilters(filterParams));
      dispatch(fetchFilteredRules(filterParams));
      const searchParams = new URLSearchParams();
      if (filterParams.priority)
        searchParams.set("priority", filterParams.priority);
      if (filterParams.status) searchParams.set("status", filterParams.status);
      setSearchParams(searchParams); // Update URL params for filters
    } else {
      dispatch(clearFilters());
      dispatch(fetchData());
      setSearchParams({}); // Clear all params
    }
  };

  useEffect(() => {
    dispatch(fetchData()); // Fetch all rules on component mount
  }, [dispatch]);

  // useEffect(() => {
  //   if (rulesData && rulesData.length > 0) {
  //     const priorities = Array.from(
  //       new Set(rulesData.map((rule) => rule.Priority))
  //     );
  //     setUniquePriorities(priorities);
  //   }
  // }, [rulesData]);

  useEffect(() => {
    applyFilters();
  }, [activeToggle, pausedToggle, selectedPriority, dispatch]);

  return (
    <>
      <style>
        {`
          @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");
          
          * {
            font-family: "Poppins", sans-serif !important;
          }
          
          .MuiTypography-root,
          .MuiButton-root,
          .MuiInputBase-root,
          .MuiMenuItem-root,
          .MuiSelect-select,
          .MuiFormControl-root {
            font-family: "Poppins", sans-serif !important;
          }
        `}
      </style>
      <Box sx={RulesStyle.globalstyle}>
        <Snackbar
          open={showDeleteAlert}
          autoHideDuration={3000}
          onClose={handleDeleteAlertClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            variant="filled"
            severity="error"
            sx={{ backgroundColor: "#d32f2f", color: "white", width: "100%" }}
          >
            Rule Deleted Successfully
          </Alert>
        </Snackbar>

        <Snackbar
          open={showCreateAlert}
          autoHideDuration={3000}
          onClose={handleCreateAlertClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            variant="filled"
            severity="success"
            sx={{ backgroundColor: "#2e7d32", color: "white", width: "100%" }}
          >
            New Rule Created Successfully
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
            sx={{ backgroundColor: "#0288d1", color: "white", width: "100%" }}
          >
            Rule Updated Successfully
          </Alert>
        </Snackbar>

        <Box sx={RulesStyle.sticky}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isSmallScreen ? 2 : 3,
              flexDirection: isSmallScreen ? "column" : "row",
            }}
          >
            <Box sx={RulesStyle.search}>
              <Typography sx={alarmStyles.filterText}>Search By</Typography>
              <TextField
                placeholder="Tags or Rule ID"
                variant="outlined"
                size="small"
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon style={{ cursor: "pointer" }} />
                    </InputAdornment>
                  ),
                }}
                sx={RulesStyle.search_2}
              />

              {/* <Typography sx={alarmStyles.filterText}>Filter By</Typography> */}

              <Select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                size="small"
                displayEmpty
                renderValue={(selected) =>
                  selected || <span style={{ color: "#1e3a8a" }}>Priority</span>
                }
                sx={RulesStyle.priority_dropdown}
                MenuProps={RulesStyle.priority_underline}
              >
                {/* <MenuItem value="">All Priorities</MenuItem> */}
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Moderate">Moderate</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                {/* Dynamically render unique priorities */}
                {/* {uniquePriorities.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))} */}
              </Select>

              {(selectedPriority || activeToggle || pausedToggle) && (
                <Typography
                  sx={alarmStyles.clearFilters}
                  onClick={() => {
                    setSelectedPriority("");
                    setActiveToggle(false);
                    setPausedToggle(false);
                    dispatch(clearFilters());
                    dispatch(fetchData());
                  }}
                >
                  Clear Filters
                </Typography>
              )}
            </Box>
            <Box sx={RulesStyle.toggle}>
              <Box sx={RulesStyle.active_toggle}>
                <Typography variant="body2" sx={RulesStyle.active_heading}>
                  Active
                </Typography>
                <Switch
                  checked={activeToggle}
                  onChange={(e) => {
                    setActiveToggle(e.target.checked);
                    if (e.target.checked) setPausedToggle(false);
                  }}
                  size="small"
                  sx={RulesStyle.active_paused_Track}
                />
              </Box>
              <Box sx={RulesStyle.pause}>
                <Typography variant="body2" sx={RulesStyle.paused_heading}>
                  Paused
                </Typography>
                <Switch
                  checked={pausedToggle}
                  onChange={(e) => {
                    setPausedToggle(e.target.checked);
                    if (e.target.checked) setActiveToggle(false);
                  }}
                  size="small"
                  sx={RulesStyle.active_paused_Track}
                />
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineIcon />}
                onClick={handleAddRule}
                sx={RulesStyle.button}
              >
                ADD RULE
              </Button>
            </Box>
          </Box>
        </Box>

        {loading ? (
          <Typography variant="body1" sx={{ textAlign: "center", py: 4 }}>
            Loading rules...
          </Typography>
        ) : (
          <RulesTable
            filteredRules={rulesData}
            handleDelete={handleDelete}
            handleEditRule={handleEditRule}
          />
        )}
        <Popup
          open={isPopupOpen}
          onClose={() => {
            dispatch(clearSelectedRule());
            dispatch(setPopupOpen(false));
          }}
        />
      </Box>
    </>
  );
};

export default Filters;
