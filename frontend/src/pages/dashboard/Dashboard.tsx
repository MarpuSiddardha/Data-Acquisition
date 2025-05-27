import { useMemo, useEffect, useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import { Box } from "@mui/material";
import DashboardTabs from "@/pages/dashboard/DashboardTabs";
import DashboardCard from "@/pages/dashboard/DashboardCard";
import AlarmsChart from "@/pages/dashboard/charts/AlarmsChart";
import RulesChart from "@/pages/dashboard/charts/RulesChart";
import ReportsChart from "@/pages/dashboard/charts/ReportsChart";
import { dashboardStyles } from "@/styles/dashboardStyles";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAlarmsSummary,
  fetchRulesSummary,
  fetchReportsSummary,
} from "@/store/dashboardSlice";

function Dashboard() {
  const context = useContext(SidebarContext);
  const { isSidebarOpen } = context;
  const dbStyles = dashboardStyles(isSidebarOpen);
  const dispatch = useDispatch<AppDispatch>();

  const { alarmsSummary, rulesSummary, reportsSummary } = useSelector(
    (state: RootState) => state.dashboard
  );

  useEffect(() => {
    dispatch(fetchAlarmsSummary());
    dispatch(fetchRulesSummary());
    dispatch(fetchReportsSummary());
  }, [dispatch]);

  const alarmsChart = useMemo(
    () => alarmsSummary && <AlarmsChart data={alarmsSummary} />,
    [alarmsSummary]
  );
  const rulesChart = useMemo(
    () => rulesSummary && <RulesChart data={rulesSummary} />,
    [rulesSummary]
  );
  const reportsChart = useMemo(
    () => reportsSummary && <ReportsChart data={reportsSummary} />,
    [reportsSummary]
  );

  return (
    <Box sx={dbStyles.rootContainer}>
      <Box sx={dbStyles.cardsContainer}>
        <DashboardCard
          title="Total Alarms"
          stats={alarmsSummary}
          chart={() => alarmsChart}
        />
        <DashboardCard
          title="Total Rules"
          stats={rulesSummary}
          chart={() => rulesChart}
        />
        <DashboardCard
          title="Total Reports"
          stats={reportsSummary}
          chart={() => reportsChart}
        />
      </Box>
      <Box sx={dbStyles.tabsContainer}>
        <DashboardTabs />
      </Box>
    </Box>
  );
}

export default Dashboard;
