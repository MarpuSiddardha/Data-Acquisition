import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Container, Typography } from "@mui/material";
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
}

const LineChart: React.FC<LineHighChartProps> = ({ data }) => {
  const [chartSeries, setChartSeries] = useState<
    Highcharts.SeriesOptionsType[]
  >([]);
  const [yAxisConfig, setYAxisConfig] = useState<Highcharts.YAxisOptions[]>([]);

  useEffect(() => {
    Highcharts.setOptions({
      time: {
        useUTC: false,
      } as Highcharts.TimeOptions,
    });
  }, []);

  useEffect(() => {
    if (!data || !data.date || !data.date.startDate || !data.date.endDate) {
      setChartSeries([]);
      setYAxisConfig([]);
      return;
    }

    function parseLocalDate(dateStr: string): Date {
      const [datePart, timePart = "00:00:00"] = dateStr.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute, second] = timePart.split(":").map(Number);
      return new Date(year, month - 1, day, hour, minute, second);
    }

    const startDate = parseLocalDate(data.date.startDate).getTime();
    const endDate = parseLocalDate(data.date.endDate).getTime();

    const newSeries: Highcharts.SeriesOptionsType[] = [];
    const yAxisMapping: Record<string, number> = {};
    const newYAxisConfig: Highcharts.YAxisOptions[] = [];

    data.sensors.forEach((sensor) => {
      const sensorData = sensor.sensorValues.map((point) => [
        new Date(point.timestamp).getTime(),
        point.value,
      ]);

      const filteredData = sensorData.filter(
        ([timestamp]) =>
          timestamp >= startDate && timestamp <= endDate + 86400000 // Include the entire day
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
              : "atm";

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
  }, [data]);

  const chartOptions: Highcharts.Options = {
    chart: {
      type: "line",
      height: 300,
      backgroundColor: "white",
      zooming: { type: "x" },
    },
    title: {
      text: "",
    },
    xAxis: {
      tickPixelInterval: 50,
      type: "datetime",
      title: { text: "Time" },

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
      useHTML: true,
      formatter: function () {
        return `<b>${Highcharts.dateFormat("%Y-%m-%d %H:%M", this.x)}</b><br/>${this.series.name}: <b>${this.y}</b>`;
      },
      // xDateFormat: "%Y-%m-%d %H:%M",
      shared: true,
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

  return (
    <>
      <Container maxWidth="md">
        {chartSeries.length > 0 ? (
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
            {data.date && (
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
          <Typography sx={{ color: "text.secondary" }} align="center">
            No data to display
          </Typography>
        )}
      </Container>
    </>
  );
};

export default LineChart;
