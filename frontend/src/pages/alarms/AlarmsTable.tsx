import { useState, useContext } from "react";
import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
  TurnRightRounded as TurnRightRoundedIcon,
  ModeEditRounded as ModeEditRoundedIcon,
} from "@mui/icons-material";
import { Alarm } from "@/utils/types";
import EditStatusModal from "@/pages/alarms/EditStatusModal";
import DetailsModal from "@/pages/alarms/DetailsModal";
import { tableStyles } from "@/styles/table/tableStyles";
import { SidebarContext } from "@/context/SidebarContext";

export default function AlarmsTable({
  data,
  error,
}: {
  data: Alarm[];
  error: boolean;
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const { isSidebarOpen } = useContext(SidebarContext);

  const columns: GridColDef[] = [
    {
      field: "createdAt",
      headerName: "Timestamp",
      width: 160,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "alarmName",
      headerName: "Alarm Name",
      minWidth: 200,
      flex: 1,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "ruleId",
      headerName: "Device ID",
      width: 90,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "severity",
      headerName: "Severity",
      width: 80,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
    },
    {
      field: "tags",
      headerName: "Tags",
      flex: 1,
      width: 180,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
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
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={tableStyles.tableCellContainer}>
          <Tooltip
            title={params.value}
            slotProps={{ tooltip: { sx: tableStyles.tableTextTooltip } }}
            disableInteractive
          >
            <Typography sx={{ ...tableStyles.tableText }}>
              {params.value}
            </Typography>
          </Tooltip>
          <IconButton
            size="small"
            sx={tableStyles.tableIconColor}
            onClick={() => {
              setSelectedAlarm(params.row);
              setIsEditModalOpen(true);
            }}
          >
            <ModeEditRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    {
      field: "description",
      headerName: "Details",
      width: 80,
      headerClassName: "super-app-theme--header",
      cellClassName: "super-app-theme--cell",
      resizable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={tableStyles.tableCellContainer}>
          <IconButton
            size="small"
            sx={tableStyles.tableIconColor}
            onClick={() => {
              setSelectedAlarm(params.row);
              setIsDetailsModalOpen(true);
            }}
          >
            <TurnRightRoundedIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        ...tableStyles.tableContainer,
        maxWidth: isSidebarOpen ? "80%" : "100%",
        padding: "1.25em 2em",
        marginLeft: isSidebarOpen ? "10%" : "",
      }}
    >
      {error ? (
        <Typography color="error" sx={{ padding: 3 }}>
          {error}
        </Typography>
      ) : (
        <Box sx={tableStyles.tableOutline}>
          <DataGrid
            rows={data}
            columns={columns}
            hideFooter
            initialState={{
              sorting: {
                sortModel: [{ field: "createdAt", sort: "desc" }],
              },
            }}
            rowHeight={45}
            getRowId={(row) => row.alarmId}
            sx={{
              ...tableStyles.tableDataGrid,
              minHeight: "399px",
              maxHeight: "399px",
            }}
          />
        </Box>
      )}
      {selectedAlarm && (
        <>
          <EditStatusModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            alarm={selectedAlarm}
          />
          <DetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            alarmProp={selectedAlarm}
          />
        </>
      )}
    </Box>
  );
}
