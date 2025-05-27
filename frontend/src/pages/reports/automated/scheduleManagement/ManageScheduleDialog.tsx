import { useEffect } from "react";
import {Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Alert,
  AlertTitle,
  Snackbar
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { fetchScheduledReports, deleteSchedule, clearDeleteStatus } from "@/store/scheduledSlice";
import { useParams } from "react-router-dom";
import ScheduleManageTable from "@/pages/reports/automated/scheduleManagement/ScheduleManageTable";
import { globalStyles } from "@/styles/globalStyles";
import { useState } from "react";


interface CreateReportDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateReportDialog: React.FC<CreateReportDialogProps> = ({
  open,
  onClose,
}) => {
  const { reportId } = useParams<{ reportId: string | undefined }>();
  const [showDeleteAlert, setDeleteShowAlert] = useState(false);
  

  const dispatch = useDispatch<AppDispatch>();
  const { scheduledReportsData, loadingScheduledReports, errorScheduledReports } = useSelector(
    (state: RootState) => state.scheduledReports
  );

  useEffect(() => {
    dispatch(fetchScheduledReports());
  }, [dispatch, reportId, onClose]);

  const handleDelete = (id: number) => {
    console.log(id)
    dispatch(deleteSchedule(id)).then(() =>{
      dispatch(clearDeleteStatus());
      setDeleteShowAlert(true);
      setTimeout(() => {
        onClose();
        onClose();
        setDeleteShowAlert(false)
      }, 2000 );
    })
  };

  const handleDeleteAlertClose = () => {
    setDeleteShowAlert(false);
  };

  return(
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        variant="h5"
        color="#1E3A8A"
        textAlign="left"
        fontWeight="bolder"
        sx={{
          color: "#1E3A8A",
          padding: "14px",
          fontSize: '1rem'
        }}
      >
        Manage Schedule
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#1E3A8A",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {
          loadingScheduledReports ? (
            <div style={globalStyles.loading}>
              <LinearProgress />
              <br />
              Loading Scheduled Reports...
            </div>
          ) : errorScheduledReports ? (
            <div>
              <Alert severity="error" style={globalStyles.error}>
                <AlertTitle>Backend Error</AlertTitle>
                Unable to fetch data.
              </Alert>
            </div>
          ) : (
            <ScheduleManageTable 
              data={scheduledReportsData} 
              handleDelete={handleDelete} 
            />
          )
        }
        
      </DialogContent>
      <Snackbar
        open={showDeleteAlert}
        autoHideDuration={4000}
        onClose={handleDeleteAlertClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          variant="filled"
          severity="error"
          onClose={handleDeleteAlertClose}
          sx={{
            backgroundColor: "#d32f2f",
            color: "white",
            width: "100%",
          }}
        >
          Scheduled Report Deleted Successfully
        </Alert>
      </Snackbar>
    </Dialog>
  )
};

export default CreateReportDialog;
