import { useState, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  AlertTitle,
} from "@mui/material";
import { RootState, AppDispatch } from "@/store/store";
import { fetchAlarms } from "@/store/alarmsSlice";
import { useAlarmsFilters } from "@/hooks/useAlarmsFilters";
import DashboardAlarms from "@/pages/dashboard/tables/AlarmsTable";
import DashboardRules from "@/pages/dashboard/tables/RulesTable";
import DashboardManualReports from "@/pages/dashboard/tables/ManualReportsTable";
import DashboardAutomatedReports from "@/pages/dashboard/tables/AutomatedReportsTable";
import { dashboardStyles } from "@/styles/dashboardStyles";
import { globalStyles } from "@/styles/globalStyles";
import { fetchReports } from "@/store/automatedReportsSlice";
import { fetchManualReports } from "@/store/ManualReportsSlice";
import { fetchData as fetchRules } from "@/store/rulesSlice";
import { SidebarContext } from "@/context/SidebarContext";

export default function DashboardTabs() {
  const [tabIndex, setTabIndex] = useState(0);
  const dispatch = useDispatch<AppDispatch>();

  const { automatedReportsData } = useSelector(
    (state: RootState) => state.automatedReports
  );
  const { manualReports } = useSelector(
    (state: RootState) => state.manualReports
  );

  const { alarmsData, loadingAlarms, errorAlarms } = useSelector(
    (state: RootState) => state.alarms
  );
  const { severity, status } = useAlarmsFilters();

  const { rules } = useSelector((state: RootState) => state.rules);

  const context = useContext(SidebarContext);
  const { isSidebarOpen } = context;
  const dbStyles = dashboardStyles(isSidebarOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch(fetchAlarms({ severity, status }));
        dispatch(fetchReports());
        dispatch(fetchManualReports());
        dispatch(fetchRules());
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };

    fetchData();
  }, [severity, status, dispatch]);

  return (
    <Box sx={dbStyles.tabsRootContainer}>
      <Box sx={dbStyles.tabsInnerContainer}>
        <Tabs
          value={tabIndex}
          onChange={(_, newValue) => setTabIndex(newValue)}
          sx={dbStyles.tabsTabs}
        >
          {["Alarms", "Rules", "Manual Reports", "Automated Reports"].map(
            (label, index) => (
              <Tab
                key={label}
                label={label}
                sx={dbStyles.tabsTab(index, tabIndex)}
              />
            )
          )}
        </Tabs>
      </Box>

      {loadingAlarms ? (
        loadingAlarms ? (
          <div style={globalStyles.loading}>
            <LinearProgress />
            <br />
            Loading alarms...
          </div>
        ) : (
          <Box>
            {tabIndex === 0 && <DashboardAlarms data={alarmsData} />}
            {tabIndex === 1 && <DashboardRules filteredRules={rules} />}
            {tabIndex === 2 && <DashboardManualReports data={manualReports} />}
            {tabIndex === 3 && (
              <DashboardAutomatedReports data={automatedReportsData} />
            )}
          </Box>
        )
      ) : errorAlarms ? (
        <div>
          <Alert severity="error" style={globalStyles.error}>
            <AlertTitle>Backend Error</AlertTitle>
            Unable to fetch data.
          </Alert>
        </div>
      ) : (
        <Box>
          {tabIndex === 0 && <DashboardAlarms data={alarmsData} />}
          {tabIndex === 1 && <DashboardRules filteredRules={rules} />}
          {tabIndex === 2 && <DashboardManualReports data={manualReports} />}
          {tabIndex === 3 && (
            <DashboardAutomatedReports data={automatedReportsData} />
          )}
        </Box>
      )}
    </Box>
  );
}
