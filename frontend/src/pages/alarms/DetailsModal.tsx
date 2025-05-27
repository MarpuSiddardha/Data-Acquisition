import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  Stack,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import { updateAlarmDescription } from "@/store/alarmsSlice";
import { AppDispatch, RootState } from "@/store/store";
import { AlarmModalProps } from "@/utils/types";
import { alarmStyles } from "@/styles/alarmStyles";

export default function DetailsModal({
  isOpen,
  onClose,
  alarmProp,
}: AlarmModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const selectedAlarm = useSelector((state: RootState) =>
    state.alarms.alarmsData.find((alarm) => alarm.alarmId === alarmProp.alarmId)
  );
  const [newDescription, setNewDescription] = useState<string>(
    selectedAlarm?.description || ""
  );

  useEffect(() => {
    if (isOpen && selectedAlarm) {
      setNewDescription(selectedAlarm.description);
    }
  }, [isOpen, selectedAlarm]);

  const handleSave = () => {
    if (selectedAlarm) {
      dispatch(
        updateAlarmDescription({
          alarmId: selectedAlarm.alarmId,
          description: newDescription,
        })
      );
      onClose();
    }
  };

  const DetailList = [
    "Alarm ID: ",
    "Created At: ",
    "Alarm Name: ",
    "Sensor ID: ",
    "Rule ID: ",
    "Severity: ",
    "Type: ",
    "Status: ",
    "Acknowledged By: ",
    "Acknowledged At: ",
    "Tags: ",
  ];

  const SelectedList = [
    selectedAlarm?.alarmId,
    selectedAlarm?.createdAt,
    selectedAlarm?.alarmName,
    selectedAlarm?.sensorId.join(", "),
    selectedAlarm?.ruleId,
    selectedAlarm?.severity,
    selectedAlarm?.type.join(", "),
    selectedAlarm?.status,
    selectedAlarm?.acknowledgedBy,
    selectedAlarm?.acknowledgedAt,
    selectedAlarm?.tags.join(", "),
  ];

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="edit-description-modal"
      aria-describedby="modal-to-edit-alarm-description"
    >
      <Box sx={alarmStyles.modalContainer}>
        <Typography variant="h6" component="h2" sx={alarmStyles.modalTitle}>
          Alarm Detail
        </Typography>
        <Stack sx={alarmStyles.detailModalListContainer}>
          {DetailList.map((detail, index) => (
            <Box key={index} sx={alarmStyles.detailModalList}>
              <Box sx={alarmStyles.detailModalListDetailBox1}>
                <Typography sx={alarmStyles.detailModalListText}>
                  {detail}
                </Typography>
              </Box>
              <Box sx={alarmStyles.detailModalListDetailBox2}>
                <Typography sx={alarmStyles.detailModalListDetail}>
                  {SelectedList[index]}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
        <TextField
          sx={alarmStyles.detailModalInput}
          label="Description"
          variant="outlined"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          multiline
          rows={1}
        />
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
}
