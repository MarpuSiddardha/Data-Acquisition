import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import DownloadIcon from "@mui/icons-material/Download";
import { tableStyles } from "@/styles/table/tableStyles";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useNavigate } from "react-router-dom";

interface ReportData {
  report_id: number;
  reportType: string;
  scheduleStatus: string;
  description: string;
  generatedDateTime: string;
}

interface TableProps {
  data: ReportData[];
  error: string | null;
}

export default function ManualReportsTable({ data = [], error }: TableProps) {
  const context = useContext(SidebarContext);
  const { isSidebarOpen } = context;
  const navigate = useNavigate();
  const columns: GridColDef[] = [
    {
      field: "reportType",
      headerName: "Report Type",
      width: 220,
      // flex: 1,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "scheduleStatus",
      headerName: "Schedule Status",
      width: 130,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "createdAt",
      headerName: "Last Updated",
      // flex: 1,
      width: 180,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "actions",
      headerName: "Actions",
      // flex: 1,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Tooltip title="Edit">
              <IconButton
                sx={{ color: "#1e3a8a" }}
                onClick={() => {
                  if (!params.row.id) {
                    console.error("Report ID is missing:", params.row);
                    return;
                  }
                  navigate(`/reports-analytics/manual/${params.row.id}`);
                }}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* <Tooltip title="download">     
                <IconButton sx={{ color: "#1e3a8a" }}>
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Tooltip> */}
          </Box>
        );
      },
    },
  ];

  const rows = data.map((report, index) => ({
    id: report.report_id || index,
    ...report,
  }));

  return (
    <Box sx={{ ...tableStyles.tableContainer(isSidebarOpen) }}>
      {error ? (
        <Typography color="error" sx={{ padding: 3 }}>
          {error}
        </Typography>
      ) : (
        <Box sx={{ ...tableStyles.tableOutline }}>
          <DataGrid
            rows={rows}
            columns={columns}
            rowHeight={45}
            initialState={{
              sorting: {
                sortModel: [{ field: "createdAt", sort: "desc" }],
              },
            }}
            hideFooter
            disableColumnMenu
            sx={{ ...tableStyles.tableDataGrid, minHeight: "305px" }}
            localeText={{ noRowsLabel: "No Reports" }}
          />
        </Box>
      )}
    </Box>
  );
}
