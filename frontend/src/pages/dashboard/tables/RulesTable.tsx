import { Box, Tooltip, Typography, Chip } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import CircleIcon from "@mui/icons-material/Circle";
import { Rule } from "@/utils/types";
import { tableStyles } from "@/styles/table/tableStyles";

export default function RulesTable({
  filteredRules,
}: {
  filteredRules: Rule[];
}) {
  const columns: GridColDef[] = [
    {
      field: "Rule_ID",
      headerName: "Rule Id",
      width: 70,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "Status",
      headerName: "Status",
      width: 105,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={tableStyles.tableCellContainer}>
          <Tooltip title={`${params.value}`}>
            <Chip
              icon={<CircleIcon sx={tableStyles.tableRuleIcon(params)} />}
              label={params.value}
              sx={tableStyles.tableRuleChip(params)}
            />
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "Priority",
      headerName: "Priority",
      width: 100,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "Rule_Name",
      headerName: "Rule Name",
      flex: 1,
      minWidth: 200,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "Tags",
      headerName: "Tags",
      flex: 1,
      minWidth: 220,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={tableStyles.tableCellContainer}>
          <Tooltip
            title={
              Array.isArray(params.value) && params.value.length > 0
                ? params.value.join(", ")
                : "No Tags"
            }
            slotProps={{ tooltip: { sx: tableStyles.tableTextTooltip } }}
            disableInteractive
          >
            <Typography sx={tableStyles.tableText}>
              {Array.isArray(params.value) && params.value.length > 0
                ? params.value.join(", ")
                : "No Tags"}
            </Typography>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "Last_Updated",
      headerName: "Last Updated",
      flex: 1,
      minWidth: 140,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={tableStyles.tableCellContainer}>
          <Tooltip title={params.value}>
            <Typography sx={tableStyles.tableText}>{params.value}</Typography>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows = filteredRules.map((Rules) => ({ id: Rules.Rule_ID, ...Rules }));

  return (
    <Box sx={{ ...tableStyles.tableContainer }}>
      <Box sx={{ ...tableStyles.tableOutline }}>
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooter
          disableColumnMenu
          initialState={{
            sorting: {
              sortModel: [{ field: "Last_Updated", sort: "desc" }],
            },
          }}
          rowHeight={35}
          sx={{ ...tableStyles.tableDataGrid }}
        />
      </Box>
    </Box>
  );
}
