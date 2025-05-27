import { Box } from "@mui/material";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { RulesSummary } from "@/utils/types";
import { dashboardChartStyles } from "@/styles/dashboardStyles";

export default function RulesChart({ data }: { data: RulesSummary | null }) {
  const active = data?.chartInfo?.active ?? 0;
  const paused = data?.chartInfo?.paused ?? 0;
  // const total = data?.ChartInfo?.Total ?? 0;

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "pie",
      backgroundColor: "white",
      height: "60%",
    },
    title: { text: "" },
    tooltip: {
      pointFormat: "<b>{point.name}: {point.y}</b>",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      borderColor: "gray",
      style: { color: "white" },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.y}",
          style: {
            color: "#1E3A8A",
            fontWeight: "bold",
            fontSize: "10px",
          },
        },
        colors: ["#3A7CA5", "#A4C3D7", "#345995"],
        borderWidth: 0,
        innerSize: "60%",
      },
    },
    series: [
      {
        type: "pie",
        name: "Rules Status",
        data: [
          { name: "Active", y: active, sliced: true },
          { name: "Paused", y: paused },
          // { name: "Total", y: total },
        ],
      },
    ],
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
