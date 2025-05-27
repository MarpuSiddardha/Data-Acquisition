import { useState } from "react";
import { Box, IconButton, Typography, Tooltip } from "@mui/material";
import {
  TurnRightRounded as TurnRightRoundedIcon,
  ModeEditRounded as ModeEditRoundedIcon,
} from "@mui/icons-material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Alarm } from "@/utils/types";
import EditStatusModal from "@/pages/alarms/EditStatusModal";
import DetailsModal from "@/pages/alarms/DetailsModal";
import { tableStyles } from "@/styles/table/tableStyles";

export default function AlarmsTable({ data }: { data: Alarm[] }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);

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
          <Tooltip 
            title="Edit"
            slotProps={{ tooltip: { sx: tableStyles.tableTextTooltip } }}
            disableInteractive
          >
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
          </Tooltip>
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
          <Tooltip 
            title="Details"
            slotProps={{ tooltip: { sx: tableStyles.tableTextTooltip } }}
            disableInteractive
          >
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
          </Tooltip>
        </Box>
      ),
    },
  ];

  const rows = data.map((alarm: Alarm) => ({ ...alarm }));

  return (
    <Box sx={{ ...tableStyles.tableContainer }}>
      <Box sx={{ ...tableStyles.tableOutline }}>
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooter
          disableColumnMenu
          getRowId={(row) => row.alarmId}
          rowHeight={35}
          initialState={{
            sorting: {
              sortModel: [{ field: "createdAt", sort: "desc" }],
            },
          }}
          sx={{ ...tableStyles.tableDataGrid }}
        />
      </Box>
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
