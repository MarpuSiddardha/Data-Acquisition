import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Container, Typography, Box, Paper, Chip } from "@mui/material";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";

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

const ValueAndChart: React.FC<LineHighChartProps> = ({ data }) => {
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
      color: string;
      unit: string;
    }[]
  >([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const getUnitSymbol = (type: string) => {
    switch (type) {
      case "Temperature":
        return "°C";
      case "Humidity":
        return "%";
      case "Pressure":
        return "Pa";
      default:
        return "";
    }
  };

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
      const unit = getUnitSymbol(sensor.sensorType);

      newLatestValues.push({
        sensorId: sensor.sensorId,
        sensorType: sensor.sensorType,
        value: latest[1] as number,
        timestamp: new Date(latest[0] as number).toLocaleString(),
        color: sensor.color,
        unit: unit,
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
      height: 250,
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
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",

        border: "1px solid #E2E8F0",
        height: 330,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(to bottom, #FAFBFF, #FFFFFF)",
        p: 2,
        mb: -5,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        {data?.title && (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              mb: 1,
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
      </Box>
      {/* <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: "#64748B" }} />
        <Typography
          variant="caption"
          color="#64748B"
          fontFamily="Poppins, sans-serif"
        > */}
      {/* {data.date.startDate} - {data.date.endDate} */}
      {/* </Typography>
      </Box> */}

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        {latestValues.map((item) => (
          <Box
            key={item.sensorId}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              border: "1px solid #E2E8F0",
              background: "#FFFFFF",
              flexGrow: 1,
              minWidth: "150px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                width: "4px",
                height: "100%",
                backgroundColor: item.color,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 0.5,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                color="#334155"
                fontFamily="Poppins, sans-serif"
              >
                {item.sensorType}
              </Typography>
              <Chip
                label={item.sensorId}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  backgroundColor: "#F1F5F9",
                  color: "#475569",
                  fontFamily: "Poppins, sans-serif",
                }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <Typography
                variant="h6"
                fontWeight={600}
                color={item.color}
                fontFamily="Poppins, sans-serif"
              >
                {item.value}
                <span style={{ fontSize: "0.75rem", marginLeft: "2px" }}>
                  {item.unit}
                </span>
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Chart */}
      <Box sx={{ flexGrow: 1 }}>
        {chartSeries.length > 0 ? (
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              color: "#94A3B8",
              flexDirection: "column",
            }}
          >
            <Typography
              align="center"
              variant="body2"
              fontFamily="Poppins, sans-serif"
            >
              No data available for the selected time period
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default ValueAndChart;
