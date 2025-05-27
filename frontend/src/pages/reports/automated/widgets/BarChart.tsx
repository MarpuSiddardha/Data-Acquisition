import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Container, Typography, Box, CircularProgress } from "@mui/material";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
interface ChartData {
  title: string;
  rtus: string[];
  sensors: Sensor[];
  date: DateRange;
  showValues: ValueRange;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ValueRange {
  showMax: boolean;
  showMin: boolean;
}

interface Sensor {
  sensorType: string;
  sensorId: string;
  yAxis: string;
  color: string;
  sensorValues: { timestamp: string; value: number }[];
}

interface BarHighchartProps {
  data: ChartData;
  loading?: boolean;
}

const BarHighchart: React.FC<BarHighchartProps> = ({
  data,
  loading = false,
}) => {
  const [options, setOptions] = useState<Highcharts.Options | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    Highcharts.setOptions({
      time: {
        //  useUTC: false,
      },
    });
  }, []);

  useEffect(() => {
    // if (!data || !data.sensors || data.sensors.length === 0) return;
    if (!data) {
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    const startDate = new Date(data.date.startDate);
    const endDate = new Date(data.date.endDate);

    const startTimestamp = new Date(data.date.startDate).getTime();
    const endTimestamp = new Date(data.date.endDate).getTime() + 86400000;
    const timeInterval = endTimestamp - startTimestamp;

    const isSameDay = startDate.toDateString() === endDate.toDateString();

    // If same day, set the end time to 23:59:59.999 of that day
    if (isSameDay) {
      endDate.setHours(23, 59, 59, 999);
    }

    const yAxisMap: Record<string, number> = {};
    const yAxes: Highcharts.YAxisOptions[] = [];
    const series: Highcharts.SeriesOptionsType[] = [];

    data.sensors.forEach((sensor) => {
      if (!sensor.sensorValues?.length) return;

      const unit =
        sensor.sensorType === "Temperature"
          ? "°C"
          : sensor.sensorType === "Humidity"
            ? "%"
            : "Pa";

      if (yAxisMap[sensor.sensorType] === undefined) {
        yAxisMap[sensor.sensorType] = yAxes.length;
        yAxes.push({
          title: {
            text: `${sensor.sensorType} (${unit})`,
            style: { color: sensor.color },
          },
          labels: { style: { color: sensor.color } },
          opposite: sensor.yAxis === "right",
        });
      }

      const formattedData = sensor.sensorValues.map(({ timestamp, value }) => {
        const time = new Date(
          timestamp.length === 16 ? timestamp + ":00" : timestamp
        ).getTime();
        return [time, value];
      });

      if (formattedData.length === 0) return;

      const minPoint = formattedData.reduce(
        (min, p) => (p[1] < min[1] ? p : min),
        formattedData[0]
      );
      const maxPoint = formattedData.reduce(
        (max, p) => (p[1] > max[1] ? p : max),
        formattedData[0]
      );

      series.push({
        name: `${sensor.sensorType} - ${sensor.sensorId}`,
        type: "column",
        color: sensor.color,
        yAxis: yAxisMap[sensor.sensorType],
        data: formattedData,
        dataLabels: {
          enabled: data.showValues.showMin || data.showValues.showMax,
          formatter: function (this: Highcharts.Point) {
            const isMin =
              data.showValues.showMin &&
              this.x === minPoint[0] &&
              this.y === minPoint[1];
            const isMax =
              data.showValues.showMax &&
              this.x === maxPoint[0] &&
              this.y === maxPoint[1];
            if (isMin) return `Min: ${this.y}`;
            if (isMax) return `Max: ${this.y}`;
            return null;
          },
          style: { color: "black", fontWeight: "bold" },
        },
      });
    });

    setOptions({
      chart: {
        type: "column",
        backgroundColor: "white",
        height: "250",
        zooming: { type: "x" },
      },
      title: { text: "" },

      xAxis: {
        type: "datetime",
        title: { text: "Timestamp" },
        tickPixelInterval: 50,
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
      yAxis: yAxes,
      series,

      tooltip: {
        useHTML: true,
        formatter: function () {
          return `<b>${Highcharts.dateFormat("%Y-%m-%d %H:%M", this.x)}</b><br/>${this.series.name}: <b>${this.y}</b>`;
        },
        shared: true,

        valueDecimals: 2,
      },

      legend: {
        enabled: true,
        layout: "horizontal",
        align: "center",
        verticalAlign: "bottom",
      },
      credits: { enabled: false },

      plotOptions: {
        series: {
          pointStart: startTimestamp,
          pointInterval: timeInterval,
        },
        column: {
          pointPadding: 0.1,
          borderWidth: 0,
          groupPadding: 0.1,
          pointWidth: 10,
        },
      },
    });

    setIsProcessing(false);
  }, [data]);

  const showLoading = loading || isProcessing;

  return (
    <>
      <Container maxWidth="md">
        {showLoading ? (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "23%",
              display: "flex",
              alignItems: "center",

              borderRadius: 2,
              padding: "8px 16px",
            }}
          >
            <CircularProgress size={24} sx={{ mr: 2, color: "#1E3A8A" }} />
            <Typography variant="body2" sx={{ fontFamily: "Poppins" }}>
              Loading Data
            </Typography>
          </Box>
        ) : options ? (
          <Box>
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

            <HighchartsReact highcharts={Highcharts} options={options} />
          </Box>
        ) : (
          <Typography align="center">No data to display.</Typography>
        )}
      </Container>
    </>
  );
};

export default BarHighchart;
