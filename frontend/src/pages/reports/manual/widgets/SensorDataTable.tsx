// import { Box, Typography, Paper } from "@mui/material";
// import { useEffect, useState } from "react";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";

// interface SensorTableItem {
//   sensorId: string;
//   value: number;
//   timestamp: string;
// }

// interface WidgetData {
//   sensorTableData: SensorTableItem[];
//   date: {
//     startDate: string;
//     endDate: string;
//   };
//   rtus: string[];
//   title: string;
//   sensors: {
//     sensorType: string[];
//     sensorId: string[];
//   }[];
// }

// interface SensorDataTableProps {
//   data?: WidgetData;
// }

// export default function SensorDataTable({ data }: SensorDataTableProps) {
//   const [tableData, setTableData] = useState<SensorTableItem[]>([]);

//   useEffect(() => {
//     if (data?.sensorTableData) {
//       setTableData(data.sensorTableData);
//     }
//   }, [data]);

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         mx: "auto",
//         fontFamily: "Poppins",
//         mt: 2,
//       }}
//     >
//       {data?.title && (
//         <Typography
//           variant="caption"
//           sx={{
//             display: "block",
//             textAlign: "center",
//             mb: 1.5,
//             color: "#64748b",
//             fontWeight: 500,
//             fontSize: "0.75rem",
//             lineHeight: 1.5,
//             fontFamily: "Poppins",
//           }}
//         >
//           <span style={{ color: "#1e3a8a" }}>Title :</span> {data.title}
//         </Typography>
//       )}
//       {data?.date && (
//         <Typography
//           variant="caption"
//           sx={{
//             display: "block",
//             mb: 1.5,
//             textAlign: "center",
//             color: "#64748b",
//             fontWeight: 500,
//             fontSize: "0.75rem",
//             lineHeight: 1.5,
//             fontFamily: "Poppins",
//           }}
//         >
//           <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: "#64748B" }} />{" "}
//           {data.date.startDate} {data.date.endDate}
//         </Typography>
//       )}

//       <Paper
//         elevation={0}
//         sx={{
//           borderRadius: 2,
//           overflow: "hidden",
//           border: "1px solid #e2e8f0",
//         }}
//       >
//         <Box
//           sx={{
//             height: "270px",
//             overflowY: "auto",
//             "&::-webkit-scrollbar": {
//               width: "8px",
//             },
//             "&::-webkit-scrollbar-track": {
//               background: "#f1f5f9",
//             },
//             "&::-webkit-scrollbar-thumb": {
//               background: "#cbd5e1",
//               borderRadius: "4px",
//             },
//             "&::-webkit-scrollbar-thumb:hover": {
//               background: "#94a3b8",
//             },
//             "@media print": {
//               height: "auto",
//               overflowY: "visible",
//             },
//           }}
//         >
//           <table
//             style={{
//               width: "100%",
//               borderCollapse: "separate",
//               borderSpacing: 0,
//               fontFamily: "Poppins",
//             }}
//           >
//             <thead>
//               <tr
//                 style={{
//                   backgroundColor: "#f8fafc",
//                   position: "sticky",
//                   top: 0,
//                   zIndex: 5,
//                 }}
//               >
//                 <th
//                   style={{
//                     padding: "12px 16px",
//                     fontWeight: 600,
//                     fontSize: "0.75rem",
//                     color: "#334155",
//                     textAlign: "center",
//                     borderBottom: "1px solid #e2e8f0",
//                   }}
//                 >
//                   TIMESTAMP
//                 </th>
//                 <th
//                   style={{
//                     padding: "12px 16px",
//                     fontWeight: 600,
//                     fontSize: "0.75rem",
//                     color: "#334155",
//                     textAlign: "center",
//                     borderBottom: "1px solid #e2e8f0",
//                   }}
//                 >
//                   VALUE
//                 </th>
//                 <th
//                   style={{
//                     padding: "12px 16px",
//                     fontWeight: 600,
//                     fontSize: "0.75rem",
//                     color: "#334155",
//                     fontFamily: "Poppins",
//                     textAlign: "center",
//                     borderBottom: "1px solid #e2e8f0",
//                   }}
//                 >
//                   SENSOR ID
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {tableData.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={3}
//                     style={{
//                       padding: "40px 16px",
//                       textAlign: "center",
//                       color: "#94a3b8",
//                       fontSize: "0.875rem",
//                     }}
//                   >
//                     No sensor data available
//                   </td>
//                 </tr>
//               ) : (
//                 tableData.map((item, index) => (
//                   <tr
//                     key={`${item.sensorId}-${index}`}
//                     style={{
//                       backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
//                       transition: "background-color 0.2s",
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.backgroundColor = "#f1f5f9";
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.backgroundColor =
//                         index % 2 === 0 ? "#ffffff" : "#f8fafc";
//                     }}
//                   >
//                     <td
//                       style={{
//                         padding: "10px 16px",
//                         fontSize: "0.75rem",
//                         color: "#475569",
//                         borderBottom: "1px solid #f1f5f9",
//                         textAlign: "center",
//                       }}
//                     >
//                       {item.timestamp}
//                     </td>
//                     <td
//                       style={{
//                         padding: "10px 16px",
//                         fontSize: "0.75rem",
//                         fontWeight: 500,
//                         color: "#1e3a8a",
//                         textAlign: "center",
//                         borderBottom: "1px solid #f1f5f9",
//                       }}
//                     >
//                       {item.value}
//                     </td>
//                     <td
//                       style={{
//                         padding: "10px 16px",
//                         fontSize: "0.75rem",
//                         color: "#475569",
//                         fontFamily: "Poppins",
//                         borderBottom: "1px solid #f1f5f9",
//                         textAlign: "center",
//                       }}
//                     >
//                       <span
//                         style={{
//                           backgroundColor: "#e0e7ff",
//                           color: "#3730a3",
//                           padding: "2px 6px",
//                           fontFamily: "Poppins",
//                           borderRadius: "4px",
//                           fontSize: "0.7rem",
//                         }}
//                       >
//                         {item.sensorId}
//                       </span>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </Box>
//       </Paper>
//     </Box>
//   );
// }

import { Box, Typography, Paper } from "@mui/material";

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
}

export default function SensorDataTable({ data }: SensorDataTableProps) {
  const [tableData, setTableData] = useState<SensorTableItem[]>([]);

  useEffect(() => {
    if (data?.sensorTableData) {
      setTableData(data.sensorTableData);
    }
  }, [data]);

  // Check if there's actual date content to display

  const hasDateContent =
    data?.date && (data.date.startDate || data.date.endDate);

  return (
    <Box
      sx={{
        width: "100%",

        mx: "auto",

        fontFamily: "Poppins",

        mt: 2,
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

      {hasDateContent && (
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
          {data.date.startDate} {data.date.endDate}
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
              {tableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      padding: "40px 16px",

                      textAlign: "center",

                      color: "#94a3b8",

                      fontSize: "0.875rem",
                    }}
                  >
                    No sensor data available
                  </td>
                </tr>
              ) : (
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

                        fontFamily: "Poppins",

                        borderBottom: "1px solid #f1f5f9",

                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: "#e0e7ff",

                          color: "#3730a3",

                          padding: "2px 6px",

                          fontFamily: "Poppins",

                          borderRadius: "4px",

                          fontSize: "0.7rem",
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
