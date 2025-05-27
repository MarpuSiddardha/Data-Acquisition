import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Card,
  CardContent,
  Typography,
  Box,
  Slide,
} from "@mui/material";
import { Cancel as CancelIcon } from "@mui/icons-material";
import { ArrowBack } from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { alarmStyles } from "@/styles/alarmStyles";
import { WidgetBundleDialogProps, WidgetType } from "@/utils/types";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="left" ref={ref} {...props} />;
});



const WidgetBundle: React.FC<WidgetBundleDialogProps> = ({
  open,
  onClose,
  onWidgetSelect,
}) => {
  const [widgetTypes, setWidgetTypes] = useState<WidgetType[]>([]);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedParent(null);
    }
  }, [open]);

  useEffect(() => {
    fetch("http://localhost:8091/api/layouts/widget-types")
      .then((response) => response.json())
      .then((data) => setWidgetTypes(data))
      .catch((error) => console.error("Error fetching widget types:", error));
  }, []);

  const handleCardClick = (index: number) => {
    setSelectedParent(index);
  };

  const handleBackClick = () => {
    setSelectedParent(null);
  };

  const handleWidgetSelect = (widgetType: string, widgetName: string) => {
    onWidgetSelect(widgetType, widgetName);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      PaperProps={{
        sx: {
          position: "fixed",
          right: 0,
          top: 0,
          height: "100%",
          width: "60vw",
          maxWidth: "none",
          margin: 0,
          color: "#1e3a8a",
          borderRadius: 0,
          backgroundColor: "#F9FAFB",
        },
      }}
    >
      <DialogTitle sx={{ bgcolor: "#F0F4FF" }}>
        {selectedParent !== null ? (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              aria-label="back"
              onClick={handleBackClick}
              sx={{ marginRight: 1, color: "#1e3a8a", fontWeight: 600 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{fontWeight: "400", fontSize: "1.25rem", fontFamily: "Poppins" }}>Select Sub Widget</Typography>
          </Box>
        ) : (
          <Typography variant="h6" sx={{fontWeight: "400", fontSize: "1.25rem", fontFamily: "Poppins" }}>Select Widget Bundle</Typography>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "flex-start",
          }}
        >
          {selectedParent === null
            ? widgetTypes.map((widget, index) => (
                <Card
                  key={index}
                  sx={{
                    width: "170px",
                    height: "170px",
                    cursor: "pointer",
                    boxShadow: 3,
                    color: "#1e3a8a",
                    borderRadius: 3,
                    display: "flex",
                    justifyContent: "center",
                    transition: "0.3s",
                    ":hover": { boxShadow: 6 },
                  }}
                  onClick={() => handleCardClick(index)}
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, textAlign: "center" }}
                    >
                      {widget.widgetType}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            : widgetTypes[selectedParent].widgetName.map((subWidget, index) => (
                <Card
                  key={index}
                  sx={{
                    width: "170px",
                    height: "170px",
                    display: "flex",
                    color: "#1e3a8a",
                    cursor: "pointer",
                    boxShadow: 3,
                    borderRadius: 3,
                    transition: "0.3s",
                    ":hover": { boxShadow: 6 },
                  }}
                  onClick={() =>
                    handleWidgetSelect(
                      widgetTypes[selectedParent].widgetType,
                      subWidget
                    )
                  }
                >
                  <CardContent>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      }}
                    >
                      {subWidget}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          color="secondary"
          onClick={onClose}
          sx={alarmStyles.modalCancelBtn}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WidgetBundle;
