import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Container, Typography, CircularProgress, Box } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface ChartData {
  rtus: string[];
  sensors: Sensor[];
  date: {
    startDate: string;
    endDate: string;
  };
  showValues: {
    showMax: boolean;
    showMin: boolean;
  };
  title?: string;
}

interface Sensor {
  sensorType: string;
  sensorId: string;
  yAxis: string;
  color: string;
  sensorValues: { timestamp: string; value: number }[];
}

interface LineHighChartProps {
  data: ChartData;
  loading?: boolean;
}

const LineChart: React.FC<LineHighChartProps> = ({ data, loading = false }) => {
  const [chartSeries, setChartSeries] = useState<
    Highcharts.SeriesOptionsType[]
  >([]);
  const [yAxisConfig, setYAxisConfig] = useState<Highcharts.YAxisOptions[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (!data) {
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    const startDate = new Date(data.date.startDate).getTime();
    const endDate = new Date(data.date.endDate).getTime();

    const newSeries: Highcharts.SeriesOptionsType[] = [];
    const yAxisMapping: Record<string, number> = {};
    const newYAxisConfig: Highcharts.YAxisOptions[] = [];

    data.sensors.forEach((sensor) => {
      const sensorData = sensor.sensorValues.map((point) => [
        new Date(point.timestamp).getTime(),
        point.value,
      ]);

      const filteredData = sensorData.filter(
        ([timestamp]) => timestamp >= startDate && timestamp <= endDate
      );

      if (filteredData.length === 0) return;

      const yAxisIndex =
        yAxisMapping[sensor.sensorType] ?? newYAxisConfig.length;

      if (yAxisMapping[sensor.sensorType] === undefined) {
        yAxisMapping[sensor.sensorType] = yAxisIndex;
        const unit =
          sensor.sensorType === "Temperature"
            ? "°C"
            : sensor.sensorType === "Humidity"
              ? "%"
              : "Pa";

        newYAxisConfig.push({
          title: {
            text: `${sensor.sensorType} (${unit})`,
            style: { color: sensor.color },
          },
          labels: {
            formatter: function () {
              return `${this.value} ${unit}`;
            },
            style: { color: sensor.color },
          },
          opposite: sensor.yAxis === "right",
        });
      }

      const min = filteredData.reduce((a, b) => (a[1] < b[1] ? a : b));
      const max = filteredData.reduce((a, b) => (a[1] > b[1] ? a : b));

      newSeries.push({
        name: `${sensor.sensorType} - ${sensor.sensorId}`,
        data: filteredData,
        color: sensor.color,
        type: "line",
        yAxis: yAxisIndex,
        marker: { enabled: true, radius: 4 },
        dataLabels: {
          enabled: data.showValues.showMin || data.showValues.showMax,
          formatter: function () {
            if (
              data.showValues.showMin &&
              this.x === min[0] &&
              this.y === min[1]
            )
              return `⬇ Min: ${this.y}`;
            if (
              data.showValues.showMax &&
              this.x === max[0] &&
              this.y === max[1]
            )
              return `⬆ Max: ${this.y}`;
            return null;
          },
        },
      });
    });

    setChartSeries(newSeries);
    setYAxisConfig(newYAxisConfig);
    setIsProcessing(false);
  }, [data]);

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "line",
      height: 250,
      backgroundColor: "white",
      zooming: { type: "x" },
    },
    title: {
      text: "",
    },
    xAxis: {
      type: "datetime",
      title: { text: "Time" },
      min: data?.date ? new Date(data.date.startDate).getTime() : undefined,
      max: data?.date ? new Date(data.date.endDate).getTime() : undefined,
      tickPixelInterval: 40,
      labels: {
        rotation: -30,
        style: {
          fontSize: "10px",
        },
        formatter: function () {
          return Highcharts.dateFormat("%d-%m-%Y %H:%M", Number(this.value));
        },
      },
    },
    yAxis: yAxisConfig,
    tooltip: {
      shared: true,
      xDateFormat: "%Y-%m-%d %H:%M",
      valueDecimals: 2,
    },
    series: chartSeries,
    plotOptions: {
      line: {
        marker: { enabled: true },
        connectNulls: true,
      },
    },
    legend: {
      enabled: true,
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
    },
    credits: { enabled: false },
  };

  const showLoading = loading || isProcessing;

  return (
    <Container maxWidth="md">
      {showLoading ? (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "23%",
            display: "flex",
            alignItems: "center",
            //bgcolor: "#fff",
            borderRadius: 2,
            padding: "8px 16px",
          }}
        >
          <CircularProgress size={24} sx={{ mr: 2, color: "#1E3A8A" }} />
          <Typography variant="body2" sx={{ fontFamily: "Poppins" }}>
            Loading Data
          </Typography>
        </Box>
      ) : chartSeries.length > 0 ? (
        <>
          {data?.title && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                textAlign: "center",
                mb: 1.5,
                color: "#64748b",
                fontWeight: 500,
                fontSize: "0.75rem",
                lineHeight: 1.5,
                fontFamily: "Poppins",
              }}
            >
              <span style={{ color: "#1e3a8a" }}>Title :</span> {data.title}
            </Typography>
          )}
          {data?.date && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                textAlign: "center",
                mb: 1.5,
                color: "#64748b",
                fontWeight: 500,
                fontSize: "0.75rem",
                lineHeight: 1.5,
                fontFamily: "Poppins",
              }}
            >
              <AccessTimeIcon
                sx={{ fontSize: 16, mr: 0.5, color: "#64748B" }}
              />{" "}
              {data.date.startDate} to {data.date.endDate}
            </Typography>
          )}

          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </>
      ) : (
        <Typography align="center">No data to display</Typography>
      )}
    </Container>
  );
};

export default LineChart;
