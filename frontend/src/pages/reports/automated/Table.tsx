import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import { tableStyles } from "@/styles/table/tableStyles";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface ReportData {
  id: number;
  reportId: number;
  reportType: string;
  frequency: string;
  generatedDateTime: string;
}

interface TableProps {
  data: ReportData[];
  error: string | null;
}

export default function Table({ data = [], error }: TableProps) {
  const context = useContext(SidebarContext);
  const { isSidebarOpen } = context;

  const navigate = useNavigate();

  const columns: GridColDef[] = [
    {
      field: "reportId",
      headerName: "ID",
      // flex: 1,
      minWidth: 80,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "id",
      headerName: "Manual Report ID",
      // flex: 1,
      minWidth: 150,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "reportType",
      headerName: "Report Type",
      flex: 1,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "frequency",
      headerName: "Frequency",
      // flex: 1,
      width: 120,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "generatedDateTime",
      headerName: "Generated At",
      flex: 1,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "actions",
      headerName: "Actions",
      // flex: 1,
      minWidth: 100,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Tooltip title="View">
              <IconButton
                sx={{ color: "#1e3a8a" }}
                onClick={() => {
                  if (!params.row.reportId) {
                    console.error("Report ID is missing:", params.row);
                    return;
                  }
                  navigate(
                    `/reports-analytics/automated/${params.row.reportId}`,
                    {
                      state: { report: params.row },
                    }
                  );
                }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ];

  const processedData = data.map((row) => ({
    ...row,
    uniqueId: `report-${row.reportId}`, 
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
            rows={processedData}
            getRowId={(row) => row.uniqueId}
            columns={columns}
            rowHeight={45}
            hideFooter
            disableColumnMenu
            initialState={{
              sorting: {
                sortModel: [{ field: "generatedDateTime", sort: "desc" }],
              },
            }}
            sx={{ ...tableStyles.tableDataGrid, minHeight: "305px" }}
            //getRowId={(row) => row.reportId}
            localeText={{ noRowsLabel: "No Reports" }}
          />
        </Box>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
}
