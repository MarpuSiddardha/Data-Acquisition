import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Container, Typography, Box } from "@mui/material";

interface ChartData {
  title: string;
  rtus: string[];
  sensors: Sensor[];
  showValues: {
    showMax: boolean;
    showMin: boolean;
  };
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
}

const TimeSeriesChart: React.FC<LineHighChartProps> = ({ data }) => {
  const [chartSeries, setChartSeries] = useState<
    Highcharts.SeriesOptionsType[]
  >([]);
  const [yAxisConfig, setYAxisConfig] = useState<Highcharts.YAxisOptions[]>([]);
  const [latestValues, setLatestValues] = useState<
    {
      sensorType: string;
      sensorId: string;
      value: number;
      timestamp: string;
    }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate data function
  const validateData = (): { isValid: boolean; errorMessage?: string } => {
    if (!data) {
      return { isValid: false, errorMessage: "No data available" };
    }

    // // Check if sensors array exists and has items
    // if (!data.sensors || data.sensors.length === 0) {
    //   return { isValid: false, errorMessage: "This widget depends on MQTT" };
    // }

    // Check if any sensor has values
    const hasSensorValues = data.sensors.some(
      (sensor) => sensor.sensorValues && sensor.sensorValues.length > 0
    );

    if (!hasSensorValues) {
      return {
        isValid: false,
        errorMessage: "No data to display",
      };
    }

    return { isValid: true };
  };

  useEffect(() => {
    const validation = validateData();
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || "Unknown error");
      return;
    }

    setErrorMessage(null);
    const newSeries: Highcharts.SeriesOptionsType[] = [];
    const yAxisMapping: Record<string, number> = {};
    const newYAxisConfig: Highcharts.YAxisOptions[] = [];
    const newLatestValues: typeof latestValues = [];

    data.sensors.forEach((sensor) => {
      if (!sensor.sensorValues || sensor.sensorValues.length === 0) {
        return;
      }

      const sensorData = sensor.sensorValues.map((point) => [
        new Date(point.timestamp).getTime(),
        point.value,
        point.timestamp,
      ]);

      if (sensorData.length === 0) return;

      const latest = sensorData[sensorData.length - 1];

      newLatestValues.push({
        sensorId: sensor.sensorId,
        sensorType: sensor.sensorType,
        value: latest[1] as number,
        timestamp: new Date(latest[0] as number).toLocaleString(),
      });

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

      newSeries.push({
        name: `${sensor.sensorType} - ${sensor.sensorId}`,
        data: sensorData.map(([x, y]) => [x, y]),
        color: sensor.color,
        type: "line",
        yAxis: yAxisIndex,
        marker: { enabled: true, radius: 3 },
      });
    });

    // If after processing we have no series data, show error
    if (newSeries.length === 0) {
      setErrorMessage("No data available in sensorValues");
      return;
    }

    setChartSeries(newSeries);
    setYAxisConfig(newYAxisConfig);
    setLatestValues(newLatestValues);
  }, [data]);

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "line",
      backgroundColor: "white",
      height: 260,
      zooming: { type: "x" },
    },
    title: { text: "" },
    xAxis: {
      type: "datetime",
      title: { text: "Time" },
      labels: {
        formatter: function () {
          return Highcharts.dateFormat("%H:%M", Number(this.value));
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

  // Show error message if validation failed or no data processed
  if (errorMessage) {
    return (
      <Container maxWidth="md">
        <Box sx={{ textAlign: "center", padding: 2 }}>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontWeight: "medium" }}
          >
            {errorMessage}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ padding: "16px" }}>
      {data?.title && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mb: 1.5,
            mt: 6,
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
      <Box
        sx={{
          height: 350,

          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",

          width: "100%",
        }}
      >
        {/* Top - Last Updated Values */}
        <Box sx={{ mb: 1 }}>
          {latestValues.map((item) => (
            <Box
              key={item.sensorId}
              marginTop={1}
              display="flex"
              justifyContent="space-between"
              fontSize="0.85rem"
              mb={1}
            ></Box>
          ))}
        </Box>

        {/* Chart */}
        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
            marginRight: 0,

            pb: 4, // Bottom padding
          }}
        >
          {chartSeries.length > 0 ? (
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          ) : (
            <Typography align="center">No data to display</Typography>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default TimeSeriesChart;
