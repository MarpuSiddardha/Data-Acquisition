import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
  Modal,
  Stack,
  InputLabel,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { updateAlarmStatus } from "@/store/alarmsSlice";
import { EditAlarmModalProps } from "@/utils/types";
import { AppDispatch } from "@/store/store";
import { alarmStyles } from "@/styles/alarmStyles";

const EditAlarmModal: React.FC<EditAlarmModalProps> = ({
  isOpen,
  onClose,
  alarm,
}) => {
  const [newStatus, setNewStatus] = useState<string>(alarm.status);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isOpen) {
      setNewStatus(alarm.status);
    }
  }, [isOpen, alarm]);

  const handleSave = () => {
    dispatch(updateAlarmStatus({ alarmId: alarm.alarmId, status: newStatus }));
    setNewStatus("");
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="edit-status-modal"
      aria-describedby="modal-to-edit-alarm-status"
    >
      <Box sx={alarmStyles.modalContainer}>
        <Typography variant="h6" component="h2" sx={alarmStyles.modalTitle}>
          Alarm Action
        </Typography>
        <Stack>
          <Typography sx={alarmStyles.statusModalText}>
            Alarm ID:{" "}
            <span style={alarmStyles.statusModalTextSpan}>
              {alarm?.alarmId}
            </span>
          </Typography>
          <Typography sx={alarmStyles.statusModalText}>
            Alarm Name:{" "}
            <span style={alarmStyles.statusModalTextSpan}>
              {alarm?.alarmName}
            </span>
          </Typography>
        </Stack>
        <Stack sx={{display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2}}>
          <InputLabel id="Status" sx={alarmStyles.statusModalInputLabel}>
            Status
          </InputLabel>

          <Select
            labelId="Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={alarmStyles.filter}
            MenuProps={alarmStyles.filterOptions}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Closed">Closed</MenuItem>
            <MenuItem value="Acknowledged">Acknowledged</MenuItem>
          </Select>
        </Stack>

        <Box sx={alarmStyles.modalBtnsContainer}>
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            color="secondary"
            onClick={onClose}
            sx={alarmStyles.modalCancelBtn}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={alarmStyles.modalSaveBtn}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditAlarmModal;
