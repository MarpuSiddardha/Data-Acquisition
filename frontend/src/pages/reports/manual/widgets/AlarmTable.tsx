// import { alarmStyles } from "@/styles/alarmStyles";
import { Box, Typography, Paper } from "@mui/material";
import React, { useEffect, useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface WidgetData {
  rtus: string[];
  title: string;
  status: string[];
  sensors: {
    Type: string[];
    sensorId: string[];
  }[];
  severity: string[];
  alarmTableData: AlarmRow[];
  date: {
    startDate: string;
    endDate: string;
  };
}

interface AlarmRow {
  alarmId: number;
  sensorId: string[];
  status: string;
  alarmName: string;
}

interface FlattenedAlarmRow {
  alarmId: number;
  sensorId: string;
  status: string;
  alarmName: string;
}

interface AlarmTableProps {
  widgetData: WidgetData;
}

const AlarmTable: React.FC<AlarmTableProps> = ({ widgetData }) => {
  const [flattenedTableData, setFlattenedTableData] = useState<
    FlattenedAlarmRow[]
  >([]);

  useEffect(() => {
    if (widgetData?.alarmTableData) {
      const flattened: FlattenedAlarmRow[] = [];
      widgetData.alarmTableData.forEach((alarm) => {
        alarm.sensorId.forEach((sensor) => {
          flattened.push({
            alarmId: alarm.alarmId,
            sensorId: sensor,
            status: alarm.status,
            alarmName: alarm.alarmName,
          });
        });
      });
      setFlattenedTableData(flattened);
    }
  }, [widgetData]);

  const hasDateContent =
    widgetData?.date && (widgetData.date.startDate || widgetData.date.endDate);

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        fontFamily: "Poppins",
        mt: 2,
      }}
    >
      {widgetData?.title && (
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
          <span style={{ color: "#1e3a8a" }}>Title :</span> {widgetData.title}
        </Typography>
      )}
      {hasDateContent && (
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
          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: "#64748B" }} />{" "}
          {widgetData.date.startDate} to {widgetData.date.endDate}
        </Typography>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
        }}
      >
        <Box
          sx={{
            height: "270px",
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f5f9",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#cbd5e1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#94a3b8",
            },
            "@media print": {
              height: "auto",
              overflowY: "visible",
            },
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: 0,
              fontFamily: "Poppins",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8fafc",
                  position: "sticky",
                  top: 0,
                  zIndex: 5,
                }}
              >
                <th
                  style={{
                    padding: "12px 16px",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "#334155",
                    textAlign: "center",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  ALARM ID
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "#334155",
                    textAlign: "center",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  SENSOR ID
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "#334155",
                    textAlign: "center",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  STATUS
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "#334155",
                    textAlign: "center",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  ALARM NAME
                </th>
              </tr>
            </thead>
            <tbody>
              {flattenedTableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: "40px 16px",
                      textAlign: "center",
                      color: "#94a3b8",
                      fontSize: "0.875rem",
                    }}
                  >
                    No alarm data available
                  </td>
                </tr>
              ) : (
                flattenedTableData.map((item, index) => (
                  <tr
                    key={`${item.alarmId}-${item.sensorId}-${index}`}
                    style={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#f1f5f9";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        index % 2 === 0 ? "#ffffff" : "#f8fafc";
                    }}
                  >
                    <td
                      style={{
                        padding: "10px 16px",
                        fontSize: "0.75rem",
                        color: "#475569",
                        borderBottom: "1px solid #f1f5f9",
                        textAlign: "center",
                      }}
                    >
                      {item.alarmId}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        fontSize: "0.75rem",
                        color: "#475569",
                        borderBottom: "1px solid #f1f5f9",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#e0e7ff",
                          color: "#3730a3",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          textAlign: "center",
                        }}
                      >
                        {item.sensorId}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        fontSize: "0.75rem",
                        color: "#475569",
                        borderBottom: "1px solid #f1f5f9",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor:
                            item.status.toLowerCase() === "active"
                              ? "#fef2f2"
                              : "#f0fdf4",
                          color:
                            item.status.toLowerCase() === "active"
                              ? "#b91c1c"
                              : "#166534",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          fontWeight: 500,
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "#334155",
                        borderBottom: "1px solid #f1f5f9",
                        textAlign: "center",
                      }}
                    >
                      {item.alarmName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Paper>
    </Box>
  );
};

export default AlarmTable;
