import { useNavigate } from "react-router-dom";
import { Box, IconButton, Tooltip } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  Visibility as VisibilityIcon,
  // Download as DownloadIcon,
} from "@mui/icons-material";
import { AutomatedReportData } from "@/utils/types";
import { tableStyles } from "@/styles/table/tableStyles";

export default function AutomatedReportsTable({
  data,
}: {
  data: AutomatedReportData[];
}) {
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
      flex: 1,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "generatedDateTime",
      headerName: "Timestamp",
      flex: 1,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
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

            {/* <Tooltip title="Download">
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
    id: report.reportId || index,
    ...report,
  }));

  return (
    <Box sx={{ ...tableStyles.tableContainer }}>
      <Box sx={{ ...tableStyles.tableOutline }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={35}
          hideFooter
          initialState={{
            sorting: {
              sortModel: [{ field: "generatedDateTime", sort: "desc" }],
            },
          }}
          disableColumnMenu
          sx={tableStyles.tableDataGrid}
          getRowId={(row) => row.reportId}
          localeText={{ noRowsLabel: "No Reports" }}
        />
      </Box>
    </Box>
  );
}
