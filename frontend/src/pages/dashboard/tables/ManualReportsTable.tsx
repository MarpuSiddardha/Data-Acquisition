import { Box, IconButton, Tooltip } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { tableStyles } from "@/styles/table/tableStyles";
import { ManualReportData } from "@/utils/types";
import { useNavigate } from "react-router-dom";

export default function ManualReportsTable({
  data,
}: {
  data: ManualReportData[];
}) {
  const navigate = useNavigate();

  const columns: GridColDef[] = [
    {
      field: "reportType",
      headerName: "Report Type",
      flex: 1,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "scheduleStatus",
      headerName: "Schedule Status",
      flex: 1,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "createdAt",
      headerName: "Timestamp",
      flex: 1,
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
      flex: 1,
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
    <Box sx={{ ...tableStyles.tableContainer }}>
      <Box sx={{ ...tableStyles.tableOutline }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowHeight={35}
          hideFooter
          initialState={{
            sorting: {
              sortModel: [{ field: "createdAt", sort: "desc" }],
            },
          }}
          disableColumnMenu
          sx={tableStyles.tableDataGrid}
          localeText={{ noRowsLabel: "No Reports" }}
        />
      </Box>
    </Box>
  );
}
