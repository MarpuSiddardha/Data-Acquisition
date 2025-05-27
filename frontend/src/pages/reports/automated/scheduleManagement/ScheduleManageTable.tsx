import { Box, IconButton, Tooltip } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { ScheduledReport } from "@/utils/types";
import { tableStyles } from "@/styles/table/tableStyles";

export default function ScheduleManageTable({
  data,
  handleDelete,
}: {
  data: ScheduledReport[];
  handleDelete: (id: number) => void;
}) {
  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 30,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "reportId",
      headerName: "Report ID",
      width: 90,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 150,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 150,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "frequency",
      headerName: "Frequency",
      width: 100,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "isActive",
      headerName: "Delete",
      width: 70,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={tableStyles.tableCellContainer}>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              sx={tableStyles.tableIconColor}
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ ...tableStyles.tableContainer }}>
      <Box sx={{ ...tableStyles.tableOutline }}>
        <DataGrid
          rows={data}
          columns={columns}
          hideFooter
          disableColumnMenu
          getRowId={(row) => row.id}
          rowHeight={35}
          // initialState={{
          //   sorting: {
          //     sortModel: [{ field: "reportId", sort: "asc" }],
          //   },
          // }}
          sx={{ ...tableStyles.tableDataGrid }}
        />
      </Box>
    </Box>
  );
}
