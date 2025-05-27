import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { tableStyles } from "@/styles/table/tableStyles";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { TableProps } from "@/utils/types";

export default function Table({ data = [], error }: TableProps) {
  const navigate = useNavigate();
  const context = useContext(SidebarContext);
  const { isSidebarOpen } = context;

  const columns: GridColDef[] = [
    {
      field: "layoutName",
      headerName: "Layout Name",
      width: 250,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 250,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "layoutType",
      headerName: "Layout Type",
      width: 250,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },

    {
      field: "actions",
      headerName: "Actions",

      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
            <Tooltip title="edit">
              <IconButton
                sx={{ color: "#1e3a8a" }}
                onClick={() => {
                  if (!params.row.id) {
                    console.error("Layout ID is missing:", params.row);
                    return;
                  }
                  navigate(`/reports-analytics/layouts/${params.row.id}`);
                }}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="View">
              <IconButton
                sx={{ color: "#1e3a8a" }}
                onClick={() => {
                  if (!params.row.id) {
                    console.error("Layout ID is missing:", params.row);
                    return;
                  }
                  navigate(`/reports-analytics/layouts/view/${params.row.id}`);
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

  const rows = Array.isArray(data)
    ? data.map((layout, index) => ({
        id: layout.id || index,
        layoutName: layout.layoutName,
        layoutType: layout.layoutType,
        createdAt: layout.createdAt,
      }))
    : [];

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
            hideFooter
            disableColumnMenu
            initialState={{
              sorting: {
                sortModel: [{ field: "createdAt", sort: "desc" }],
              },
            }}
            sx={{ ...tableStyles.tableDataGrid, minHeight: "305px" }}
            getRowId={(row) => row.id}
            localeText={{ noRowsLabel: "No Layouts" }}
          />
        </Box>
      )}
    </Box>
  );
}
