import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface SensorTableItem {
  sensorId: string;
  value: number;
  timestamp: string;
}

interface WidgetData {
  sensorTableData: SensorTableItem[];
  date: {
    startDate: string;
    endDate: string;
  };
  rtus: string[];
  title: string;
  sensors: {
    sensorType: string[];
    sensorId: string[];
  }[];
}

interface SensorDataTableProps {
  data?: WidgetData;
  loading?: boolean;
}

export default function SensorDataTable({
  data,
  loading = false,
}: SensorDataTableProps) {
  const [tableData, setTableData] = useState<SensorTableItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    if (data?.sensorTableData) {
      setTableData(data.sensorTableData);
    }
    // Set processing to false after data is loaded
    setIsProcessing(false);
  }, [data]);

  // Combined loading state
  const showLoading = loading || isProcessing;

  return (
    <Box
      sx={{
        width: "100%",
        mx: "auto",
        fontFamily: "Poppins",
        mt: 2,
        position: "relative",
      }}
    >
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
            mb: 1.5,
            textAlign: "center",
            color: "#64748b",
            fontWeight: 500,
            fontSize: "0.75rem",
            lineHeight: 1.5,
            fontFamily: "Poppins",
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: "#64748B" }} />{" "}
          {data.date.startDate} to {data.date.endDate}
        </Typography>
      )}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          position: "relative",
          height: "270px",
          width: "100%",
        }}
      >
        {showLoading && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              borderRadius: 2,
              padding: "8px 16px",
              bgcolor: "rgba(255, 255, 255, 0.8)",
              zIndex: 10,
            }}
          >
            <CircularProgress size={24} sx={{ mr: 2, color: "#1E3A8A" }} />
            <Typography variant="body2" sx={{ fontFamily: "Poppins" }}>
              Loading Data
            </Typography>
          </Box>
        )}

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
                    fontFamily: "Poppins",
                  }}
                >
                  TIMESTAMP
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "#334155",
                    textAlign: "center",
                    borderBottom: "1px solid #e2e8f0",
                    fontFamily: "Poppins",
                  }}
                >
                  VALUE
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "#334155",
                    fontFamily: "Poppins",
                    textAlign: "center",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  SENSOR ID
                </th>
              </tr>
            </thead>
            <tbody>
              {!showLoading && tableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{ textAlign: "center", padding: "40px 0" }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "Poppins", color: "#64748b" }}
                    >
                      No data available
                    </Typography>
                  </td>
                </tr>
              ) : (
                !showLoading &&
                tableData.map((item, index) => (
                  <tr
                    key={`${item.sensorId}-${index}`}
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
                        fontFamily: "poppins",
                        borderBottom: "1px solid #f1f5f9",
                        textAlign: "center",
                      }}
                    >
                      {item.timestamp}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        fontSize: "0.75rem",
                        fontWeight: 500,
                        color: "#1e3a8a",
                        textAlign: "center",
                        fontFamily: "Poppins",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      {item.value}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        fontSize: "0.75rem",
                        color: "#475569",
                        fontFamily: "poppins",
                        borderBottom: "1px solid #f1f5f9",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#e0e7ff",
                          color: "#3730a3",
                          fontFamily: "Poppins",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "0.7rem",
                          textAlign: "center",
                        }}
                      >
                        {item.sensorId}
                      </span>
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
}
