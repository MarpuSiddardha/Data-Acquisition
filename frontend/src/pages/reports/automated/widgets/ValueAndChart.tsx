import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Typography, Box, Paper, Chip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CircularProgress from "@mui/material/CircularProgress";
interface ChartData {
  title: string;
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

const ValueAndChart: React.FC<LineHighChartProps> = ({
  data,
  loading = false,
}) => {
  const [chartSeries, setChartSeries] = useState<
    Highcharts.SeriesOptionsType[]
  >([]);
  const [yAxisConfig, setYAxisConfig] = useState<Highcharts.YAxisOptions[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);
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
    const newLatestValues: typeof latestValues = [];

    data.sensors.forEach((sensor) => {
      const sensorData = sensor.sensorValues
        .map((point) => [
          new Date(point.timestamp).getTime(),
          point.value,
          point.timestamp,
        ])
        .filter(
          ([timestamp]) =>
            Number(timestamp) >= startDate && Number(timestamp) <= endDate
        );

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

        newYAxisConfig.push({
          title: {
            text: `${sensor.sensorType} (${unit})`,
            style: {
              color: sensor.color,
              fontWeight: "500",
              fontFamily: "Poppins, sans-serif",
            },
          },
          labels: {
            formatter: function () {
              return `${this.value} ${unit}`;
            },
            style: {
              color: sensor.color,
              fontFamily: "Poppins, sans-serif",
            },
          },
          opposite: sensor.yAxis === "right",
          gridLineColor: "#E2E8F0",
          gridLineDashStyle: "Dash",
        });
      }

      newSeries.push({
        name: `${sensor.sensorType} - ${sensor.sensorId}`,
        data: sensorData.map(([x, y]) => [x, y]),
        color: sensor.color,
        type: "line",
        yAxis: yAxisIndex,
        marker: {
          enabled: true,
          radius: 4,
          symbol: "circle",
        },
        lineWidth: 2,
      });
    });

    setChartSeries(newSeries);
    setYAxisConfig(newYAxisConfig);
    setLatestValues(newLatestValues);
    setIsProcessing(false);
  }, [data]);

  const calculateDateFormat = () => {
    const startDate = new Date(data.date.startDate);
    const endDate = new Date(data.date.endDate);
    const diffDays = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 1) {
      return "%b %d, %H:%M";
    } else if (diffDays === 1) {
      return "%a %H:%M";
    } else {
      return "%H:%M";
    }
  };

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "line",
      backgroundColor: "transparent",
      height: 260,
      zooming: { type: "x" },
      style: {
        fontFamily: "Poppins, sans-serif",
      },
    },
    title: { text: "" },
    xAxis: {
      type: "datetime",
      title: {
        text: "Time",
        style: {
          color: "#64748B",
          fontWeight: "500",
          fontFamily: "Poppins, sans-serif",
        },
      },
      min: new Date(data.date.startDate).getTime(),
      max: new Date(data.date.endDate).getTime(),
      labels: {
        formatter: function () {
          return Highcharts.dateFormat(
            calculateDateFormat(),
            Number(this.value)
          );
        },
        style: {
          color: "#64748B",
          fontFamily: "Poppins, sans-serif",
        },
        rotation: -45,
        align: "right",
      },
      lineColor: "#E2E8F0",
      tickColor: "#E2E8F0",
    },
    yAxis: yAxisConfig,
    tooltip: {
      shared: true,
      xDateFormat: "%Y-%m-%d %H:%M",
      valueDecimals: 2,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#E2E8F0",
      borderRadius: 8,
      shadow: true,
      style: {
        fontFamily: "Poppins, sans-serif",
      },
    },
    series: chartSeries,
    plotOptions: {
      line: {
        marker: { enabled: false },
        connectNulls: true,
        states: {
          hover: {
            lineWidth: 3,
          },
        },
      },
    },
    legend: {
      enabled: true,
      layout: "horizontal",
      align: "center",
      verticalAlign: "bottom",
      itemStyle: {
        color: "#334155",
        fontWeight: "500",
        fontFamily: "Poppins, sans-serif",
      },
      itemHoverStyle: {
        color: "#1E3A8A",
      },
    },
    credits: { enabled: false },
  };

  const showLoading = loading || isProcessing;

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
      {showLoading && (
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
      )}

      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: "#64748B" }} />
        <Typography
          variant="caption"
          color="#64748B"
          fontFamily="Poppins, sans-serif"
        >
          {data.date.startDate} - {data.date.endDate}
        </Typography>
      </Box>

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

      <Box sx={{ flexGrow: 1 }}>
        {!showLoading && chartSeries.length === 0 ? (
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
        ) : (
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        )}
      </Box>
    </Paper>
  );
};

export default ValueAndChart;
