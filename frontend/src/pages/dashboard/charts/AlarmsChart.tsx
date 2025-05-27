import { Box } from "@mui/material";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { AlarmsSummary } from "@/utils/types";
import { dashboardChartStyles } from "@/styles/dashboardStyles";

export default function AlarmsChart({ data }: { data: AlarmsSummary | null }) {
  const active = data?.chartInfo?.active ?? 0;
  const acknowledged = data?.chartInfo?.acknowledged ?? 0;
  const closed = data?.chartInfo?.closed ?? 0;

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "column",
      backgroundColor: "white",
      height: "60%",
    },
    title: { text: "" },
    xAxis: {
      categories: ["Active", "Acknowledged", "Closed"],
      labels: {
        style: { fontSize: ".75rem", fontWeight: "500", color: "#1E3A8A " },
      },
    },
    yAxis: {
      title: { text: "" },
      labels: {
        style: { fontSize: ".85rem", fontWeight: "bold", color: "#1E3A8A" },
      },
    },
    series: [
      {
        name: "Alarms",
        data: [active, acknowledged, closed],
        type: "column",
        color: "#3A7CA5",
      },
    ],
    legend: { enabled: false },
    plotOptions: {
      column: { pointWidth: 30 },
    },
    credits: { enabled: false },
    accessibility: {
      enabled: false,
    },
  };

  return (
    <Box sx={dashboardChartStyles.chartContainer}>
      <HighchartsReact highcharts={Highcharts} options={chartOptions} />
    </Box>
  );
}
