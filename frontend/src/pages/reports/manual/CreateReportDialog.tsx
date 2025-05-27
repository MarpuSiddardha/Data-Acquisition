// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   TextField,
//   Button,
//   IconButton,
//   FormHelperText,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "react-toastify/dist/ReactToastify.css";
// import { toast } from "react-toastify";
// import { useDispatch } from "react-redux";
// import { AppDispatch } from "@/store/store";
// import { saveReport } from "@/store/ManualReportsSlice";
// import { fetchManualReports } from "@/store/ManualReportsSlice";

// interface CreateReportDialogProps {
//   open: boolean;
//   onClose: () => void;
// }

// const CreateReportDialog: React.FC<CreateReportDialogProps> = ({
//   open,
//   onClose,
// }) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const [reportType, setReportType] = useState<string>("");
//   const [customReportType, setCustomReportType] = useState<string>("");
//   const [description, setDescription] = useState<string>("");
//   const [layouts, setLayouts] = useState<string[]>([]);
//   const [selectedLayout, setSelectedLayout] = useState<string>("");
//   const [layoutError, setLayoutError] = useState<string>("");

//   const navigate = useNavigate();

//   const manualReportData = {
//     reportType: reportType,
//     customReportType: customReportType,
//     layoutName: selectedLayout,
//     description: description,
//   };

//   const handleCreateReport = async () => {
//     // Validate layout selection
//     if (!selectedLayout) {
//       setLayoutError("Please select layout");
//       return;
//     }

//     console.log(manualReportData);
//     await dispatch(saveReport(manualReportData));
//     toast.success("Report created successfully!", { position: "top-right" });

//     // Close the dialog immediately
//     onClose();

//     setCustomReportType("");
//     setDescription("");
//     setReportType("");
//     setSelectedLayout("");
//     setLayoutError("");

//     // Navigate after a slight delay to ensure state updates complete
//     setTimeout(() => {
//       navigate("/reports-analytics/manual");
//       // Refresh the data after navigation
//       dispatch(fetchManualReports());
//     }, 500);
//   };

//   useEffect(() => {
//     const fetchLayouts = async () => {
//       try {
//         if (layouts.length > 0) return;

//         const response = await axios.get(
//           "http://localhost:8091/manual-reports/layouts"
//         );
//         console.log("Fetched layouts: ", response.data);

//         if (Array.isArray(response.data)) {
//           setLayouts(response.data);
//         } else {
//           console.error("Invalid layout data structure:", response.data);
//         }
//       } catch (error) {
//         console.error("Error fetching layouts:", error);
//       }
//     };

//     if (open) {
//       fetchLayouts();
//     }
//   }, [open, layouts.length, dispatch]);

//   // Clear error when user selects a layout
//   const handleLayoutChange = (e: React.ChangeEvent<{ value: unknown }>) => {
//     const value = e.target.value as string;
//     setSelectedLayout(value);
//     if (value) {
//       setLayoutError("");
//     }
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       PaperProps={{
//         sx: {
//           width: "550px",
//           maxWidth: "90vw",
//           minHeight: "400px", // Set minimum height to match the larger dialog
//           m: 0,
//         },
//       }}
//     >
//       <DialogTitle
//         variant="h5"
//         color="#1E3A8A"
//         textAlign="left"
//         fontWeight="bolder"
//         sx={{
//           color: "#1E3A8A",
//           padding: "14px",
//         }}
//       >
//         Create Report
//         <IconButton
//           aria-label="close"
//           onClick={onClose}
//           sx={{
//             position: "absolute",
//             right: 8,
//             top: 8,
//             color: "#1E3A8A",
//           }}
//         >
//           <CloseIcon />
//         </IconButton>
//       </DialogTitle>
//       <DialogContent sx={{ pb: 2 }}>
//         <FormControl fullWidth margin="dense">
//           <InputLabel id="dropdown1-label">Report Type</InputLabel>
//           <Select
//             labelId="dropdown1-label"
//             id="dropdown1"
//             name="dropdown1"
//             label="Report Type"
//             value={reportType}
//             onChange={(e) => setReportType(e.target.value as string)}
//             sx={{
//               backgroundColor: "#FAFBFF",
//             }}
//           >
//             <MenuItem value="Custom">Custom</MenuItem>
//             <MenuItem value="No Comms Report">No commos Report</MenuItem>
//             <MenuItem value="Sensor Analysis">Sensor Analysis Report</MenuItem>
//             <MenuItem value="Alarm Analysis">Alarm Analysis Report</MenuItem>
//           </Select>
//         </FormControl>

//         {reportType === "Custom" && (
//           <TextField
//             margin="dense"
//             id="customReportType"
//             name="customReportType"
//             label="Enter Report Type"
//             fullWidth
//             variant="outlined"
//             value={customReportType}
//             onChange={(e) => setCustomReportType(e.target.value)}
//             sx={{
//               backgroundColor: "#FAFBFF",
//             }}
//           />
//         )}

//         <FormControl fullWidth margin="dense" error={!!layoutError}>
//           <InputLabel id="dropdown2-label">Select Layout</InputLabel>
//           <Select
//             labelId="dropdown2-label"
//             id="dropdown2"
//             name="dropdown2"
//             label="Select Layout"
//             onChange={handleLayoutChange}
//             value={selectedLayout}
//             sx={{
//               backgroundColor: "#FAFBFF",
//             }}
//           >
//             {layouts.length === 0 ? (
//               <MenuItem value="">
//                 <em>Loading...</em>
//               </MenuItem>
//             ) : (
//               layouts.map((layoutItem: string) => (
//                 <MenuItem key={layoutItem} value={layoutItem}>
//                   {layoutItem}
//                 </MenuItem>
//               ))
//             )}
//           </Select>
//           {layoutError && <FormHelperText>{layoutError}</FormHelperText>}
//         </FormControl>

//         <TextField
//           fullWidth
//           margin="dense"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           id="textField"
//           name="textField"
//           label="Description"
//           variant="outlined"
//           multiline
//           rows={2}
//           sx={{
//             backgroundColor: "#FAFBFF",
//           }}
//         />
//       </DialogContent>

//       <DialogActions sx={{ pb: 3, px: 3 }}>
//         <Button
//           variant="outlined"
//           size="small"
//           sx={{
//             fontFamily: "Poppins, sans-serif",
//           }}
//           onClick={onClose}
//         >
//           Cancel
//         </Button>
//         <Button
//           variant="contained"
//           size="small"
//           sx={{
//             backgroundColor: "#003366",
//             "&:hover": {
//               backgroundColor: "#002244",
//             },
//             fontFamily: "Poppins, sans-serif",
//           }}
//           onClick={handleCreateReport}
//         >
//           Create Report
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default CreateReportDialog;

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  IconButton,
  FormHelperText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { saveReport } from "@/store/ManualReportsSlice";
import { fetchManualReports } from "@/store/ManualReportsSlice";

interface CreateReportDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateReportDialog: React.FC<CreateReportDialogProps> = ({
  open,
  onClose,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [reportType, setReportType] = useState<string>("");
  const [customReportType, setCustomReportType] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [layouts, setLayouts] = useState<string[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<string>("");
  const [layoutError, setLayoutError] = useState<string>("");
  const [reportTypeError, setReportTypeError] = useState<string>("");

  const navigate = useNavigate();

  const manualReportData = {
    reportType: reportType === "Custom" ? customReportType : reportType,
    customReportType: customReportType,
    layoutName: selectedLayout,
    description: description,
  };

  const handleCreateReport = async () => {
    // Validate report type selection
    if (!reportType) {
      setReportTypeError("Please select report type");
      return;
    }

    // Validate custom report type if "Custom" is selected
    if (reportType === "Custom" && !customReportType.trim()) {
      setReportTypeError("Please enter custom report type");
      return;
    }

    // Validate layout selection
    if (!selectedLayout) {
      setLayoutError("Please select layout");
      return;
    }

    console.log(manualReportData);
    await dispatch(saveReport(manualReportData));
    toast.success("Report created successfully!", { position: "top-right" });

    // Close the dialog immediately
    onClose();

    setCustomReportType("");
    setDescription("");
    setReportType("");
    setSelectedLayout("");
    setLayoutError("");
    setReportTypeError("");

    // Navigate after a slight delay to ensure state updates complete
    setTimeout(() => {
      navigate("/reports-analytics/manual");
      // Refresh the data after navigation
      dispatch(fetchManualReports());
    }, 500);
  };

  useEffect(() => {
    const fetchLayouts = async () => {
      try {
        if (layouts.length > 0) return;

        const response = await axios.get(
          "http://localhost:8091/manual-reports/layouts"
        );
        console.log("Fetched layouts: ", response.data);

        if (Array.isArray(response.data)) {
          setLayouts(response.data);
        } else {
          console.error("Invalid layout data structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching layouts:", error);
      }
    };

    if (open) {
      fetchLayouts();
    }
  }, [open, layouts.length, dispatch]);

  // Clear error when user selects a layout
  const handleLayoutChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as string;
    setSelectedLayout(value);
    if (value) {
      setLayoutError("");
    }
  };

  // Clear error when user selects a report type
  const handleReportTypeChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    const value = e.target.value as string;
    setReportType(value);
    if (value) {
      setReportTypeError("");
    }
  };

  // Clear error when user enters custom report type
  const handleCustomReportTypeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setCustomReportType(value);
    if (value.trim()) {
      setReportTypeError("");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: "550px",
          maxWidth: "90vw",
          minHeight: "400px", // Set minimum height to match the larger dialog
          m: 0,
        },
      }}
    >
      <DialogTitle
        variant="h5"
        color="#1E3A8A"
        textAlign="left"
        fontWeight="bolder"
        sx={{
          color: "#1E3A8A",
          padding: "14px",
        }}
      >
        Create Report
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
      <DialogContent sx={{ pb: 2 }}>
        <FormControl fullWidth margin="dense" error={!!reportTypeError}>
          <InputLabel id="dropdown1-label">Report Type</InputLabel>
          <Select
            labelId="dropdown1-label"
            id="dropdown1"
            name="dropdown1"
            label="Report Type"
            value={reportType}
            onChange={handleReportTypeChange}
            sx={{
              backgroundColor: "#FAFBFF",
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 224, // Fixed height for dropdown menu (8 items × 28px)
                },
              },
            }}
          >
            <MenuItem value="Custom">Custom</MenuItem>
            <MenuItem value="No Comms Report">No commos Report</MenuItem>
            <MenuItem value="Sensor Analysis">Sensor Analysis Report</MenuItem>
            <MenuItem value="Alarm Analysis">Alarm Analysis Report</MenuItem>
          </Select>
          {reportTypeError && (
            <FormHelperText>{reportTypeError}</FormHelperText>
          )}
        </FormControl>

        {reportType === "Custom" && (
          <TextField
            margin="dense"
            id="customReportType"
            name="customReportType"
            label="Enter Report Type"
            fullWidth
            variant="outlined"
            value={customReportType}
            onChange={handleCustomReportTypeChange}
            error={reportType === "Custom" && !!reportTypeError}
            helperText={
              reportType === "Custom" && reportTypeError ? reportTypeError : ""
            }
            sx={{
              backgroundColor: "#FAFBFF",
            }}
          />
        )}

        <FormControl fullWidth margin="dense" error={!!layoutError}>
          <InputLabel id="dropdown2-label">Select Layout</InputLabel>
          <Select
            labelId="dropdown2-label"
            id="dropdown2"
            name="dropdown2"
            label="Select Layout"
            onChange={handleLayoutChange}
            value={selectedLayout}
            sx={{
              backgroundColor: "#FAFBFF",
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 224, // Fixed height for dropdown menu (8 items × 28px)
                  position: "absolute",
                  zIndex: 1300, // Ensure dropdown appears above other elements
                },
              },
            }}
          >
            {layouts.length === 0 ? (
              <MenuItem value="">
                <em>Loading...</em>
              </MenuItem>
            ) : (
              layouts.map((layoutItem: string) => (
                <MenuItem key={layoutItem} value={layoutItem}>
                  {layoutItem}
                </MenuItem>
              ))
            )}
          </Select>
          {layoutError && <FormHelperText>{layoutError}</FormHelperText>}
        </FormControl>

        <TextField
          fullWidth
          margin="dense"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          id="textField"
          name="textField"
          label="Description"
          variant="outlined"
          multiline
          rows={2}
          sx={{
            backgroundColor: "#FAFBFF",
          }}
        />
      </DialogContent>

      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button
          variant="outlined"
          size="small"
          sx={{
            fontFamily: "Poppins, sans-serif",
          }}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          size="small"
          sx={{
            backgroundColor: "#003366",
            "&:hover": {
              backgroundColor: "#002244",
            },
            fontFamily: "Poppins, sans-serif",
          }}
          onClick={handleCreateReport}
        >
          Create Report
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateReportDialog;
