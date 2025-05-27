import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { AlarmsSummary, ReportsSummary, RulesSummary } from "@/utils/types";
import { dashboardStyles } from "@/styles/dashboardStyles";
import { SidebarContext } from "@/context/SidebarContext";

export default function DashboardCard({
  title,
  stats,
  chart: ChartComponent,
}: {
  title: string;
  stats: AlarmsSummary | RulesSummary | ReportsSummary | null;
  chart: React.ComponentType<{
    data: AlarmsSummary | RulesSummary | ReportsSummary | null;
  }> | null;
}) {
  const context = React.useContext(SidebarContext);
  const { isSidebarOpen } = context;
  const dbStyles = dashboardStyles(isSidebarOpen);

  return (
    <Box sx={dbStyles.card} id={title.replace(/\s+/g, "")}>
      <Box sx={dbStyles.notifProfileDetail}>
        <Typography sx={dbStyles.notifProfileLabel} component="div">
          {title}:{" "}
          <span style={dbStyles.notifProfileNumber}>
            {stats ? stats.chartInfo.total : 0}
          </span>
        </Typography>
      </Box>
      <Stack sx={dbStyles.statsRow}>
        {stats ? (
          Object.entries(stats).map(([key, value]) =>
            typeof value === "object" && key === "status"
              ? Object.entries(value).map(
                  ([subKey, subValue]) =>
                    subKey !== "total" && (
                      <Box
                        key={`${key}-${subKey}`}
                        sx={dbStyles.notifProfileDetail}
                      >
                        <Typography sx={dbStyles.notifProfileLabel}>
                          {`${subKey.charAt(0).toUpperCase()+subKey.slice(1)} `}{" "}
                          <span style={dbStyles.notifProfileNumber}>
                            {subValue as number}
                          </span>
                        </Typography>
                      </Box>
                    )
                )
              : null
          )
        ) : (
          <Typography component="div">Loading...</Typography>
        )}
      </Stack>
      {ChartComponent && (
        <Box sx={dbStyles.chartBox}>
          <ChartComponent data={stats} />
        </Box>
      )}
    </Box>
  );
}
