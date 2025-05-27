import React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CircleIcon from "@mui/icons-material/Circle";
import { RulesTableProps } from "@/utils/types";
import { useDispatch } from "react-redux";
import { setSelectedRule, setPopupOpen, setViewMode, setEditMode } from "../../store/rulesSlice";
import { tableStyles } from "@/styles/table/tableStyles";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";


const RulesTable: React.FC<RulesTableProps> = ({
  filteredRules,
  handleDelete,
}) => {
  const dispatch = useDispatch();
  const { isSidebarOpen } = useContext(SidebarContext);
  

const columns: GridColDef[] = [
    {
      field: "Rule_ID",
      headerName: "Rule Id",
      width: 80,
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
              icon={
                <CircleIcon
                  sx={tableStyles.tableRuleIcon(params)}
                />
              }
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
            title={Array.isArray(params.value) && params.value.length > 0 ? params.value.join(", ") : "No Tags"}
            slotProps={{tooltip: {sx: tableStyles.tableTextTooltip}}}
            disableInteractive
          >
            <Typography sx={tableStyles.tableText}>
              {Array.isArray(params.value) && params.value.length > 0 ? params.value.join(", ") : "No Tags"}
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
            <Typography sx={tableStyles.tableText}>
              {params.value}
            </Typography>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "Activation_Delay",
      headerName: "Actions",
      width: 120,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
      renderCell: (params) => (
        <Box sx={tableStyles.tableCellContainer}>
          <Tooltip title="View">
            <IconButton size="small" sx={{ p: "4px" }}
            onClick={() => {
              // console.log("Viewing Rule:", params.row); //  Debugging log
              dispatch(setSelectedRule(params.row)); //  Set selected rule
              dispatch(setPopupOpen(true)); 
              dispatch(setViewMode(true)); 
              dispatch(setEditMode(false));
            }}
            >
              <VisibilityIcon sx={{ fontSize: 16, color: "#1E3A8A" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" sx={{ p: "4px" }}
             onClick={() => {
              // console.log("clicked" , params.row);
              dispatch(setSelectedRule(params.row));
              dispatch(setPopupOpen(true)); 
              dispatch(setEditMode(true)); 
              dispatch(setViewMode(false));
            }}
            >
              <EditIcon sx={{ fontSize: 16, color: "#1E3A8A" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              sx={{ p: "4px" }}
              onClick={() => handleDelete(params.row.Rule_ID)}
            >
              <DeleteIcon sx={{ fontSize: 16, color: "#1E3A8A" }} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
];

const rows = Array.isArray(filteredRules) ? filteredRules.map((Rules, index) => ({
  id: Rules.Rule_ID || index,
  ...Rules,
})) : [];


return (
    <Box sx={{
        ...tableStyles.tableContainer,
        maxWidth: isSidebarOpen ? "85%" : "100%",
        marginLeft: isSidebarOpen ? "10%" : "",
      }}>
      <Box sx={{ ...tableStyles.tableOutline }}>
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooter
          disableColumnMenu
          rowHeight={45}
          initialState={{
            sorting: {
              sortModel: [{ field: "Last_Updated", sort: "desc" }],
            },
          }}
          sx={{...tableStyles.tableDataGrid, minHeight: "399px",maxHeight: "399px"}}
        />
      </Box>
    </Box>
  );
};

export default RulesTable;
