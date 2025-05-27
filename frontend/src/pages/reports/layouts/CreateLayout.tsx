import React, { useState } from "react";
import {
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Card,
  CardContent,
  Divider,
  Toolbar,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import { Save as SaveIcon } from "@mui/icons-material";
import { automatedStyles } from "@/styles/automatedStyles";
import { alarmStyles } from "@/styles/alarmStyles";
import { useNavigate } from "react-router-dom";
import WidgetBundle from "./WidgetBundle";
import { ArrowBack } from "@mui/icons-material";
import { saveLayout } from "@/store/layoutsSlice";
import { getLayoutNames } from "@/services/api/apis";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

const CreateLayout: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [Widgets, setSelectedWidgets] = useState<
    { widgetType: string; widgetName: string }[]
  >([]);
  const [showWidgetBundlePopup, setShowWidgetBundlePopup] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();
  const [layoutName, setLayoutName] = useState<string>("");
  const handleWidgetBundlePopupOpen = () => {
    setShowWidgetBundlePopup(true);
  };

  const handleWidgetBundlePopupClose = () => {
    setShowWidgetBundlePopup(false);
  };

  const handleSave = async () => {
    if (!layoutName) {
      setIsError(true);
      toast.error("Layout Name is required!", { position: "top-right" });
      return;
    }
    const layoutNames = await getLayoutNames();
    const exists = layoutNames.some(
      (name: string) => name.toLowerCase() === layoutName.toLowerCase()
    );

    if (exists) {
      setIsError(true);
      toast.error("Layout Name already exists!", { position: "top-right" });
      return;
    }
    setIsError(false);

    const layoutData = {
      layoutName: layoutName,
      layoutType: "Customized",
      widgets: Widgets,
    };

    try {
      dispatch(saveLayout(layoutData));
      console.log("Layout saved successfully:", layoutData);
      toast.success("Layout saved successfully!", { position: "top-right" });
      setTimeout(() => navigate("/reports-analytics/layouts"), 2000);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to save layout. Please try again.", {
        position: "top-right",
      });
    }
  };

  const removeWidget = (index: number) => {
    const newItems = Widgets.filter((_, i) => i !== index);
    setSelectedWidgets(newItems);
  };

  // let count = 1;

  function handleWidgetSelect(widgetType: string, widgetName: string): void {
    const newWidget = { widgetType, widgetName };
    setSelectedWidgets((prevWidgets) => [...prevWidgets, newWidget]);
    setShowWidgetBundlePopup(false);
  }

  return (
    <Box
      id="container"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box
        sx={{
          height: "50px",
          bgcolor: "#D9e6ff",
          width: "100%",
          display: "flex",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Toolbar
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
        >
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack sx={{ color: "#1E3A8A" }} />
            <Typography
              sx={{
                fontSize: ".85rem",
                fontWeight: 500,
                color: "#1e3a8a",
                marginRight: 2,
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Back
            </Typography>
          </IconButton>
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              color: "black",
              height: "30px",
              marginTop: "1em",
              marginRight: "1em",
              border: "1px solid #1e3a8a",
            }}
          />
          <Typography sx={alarmStyles.filterText}>Layout Name</Typography>
          <TextField
            variant="outlined"
            size="small"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            sx={{
              border: isError ? "2px solid red" : "",
              borderRadius: "20px",
              marginLeft: 2,
              width: 200,
              fontFamily: "Poppins, sans-serif",
              backgroundColor: "#fff",
              ...automatedStyles.search,
            }}
            required
            placeholder="Enter LayoutName"
          />

          <Box sx={{ marginLeft: "auto" }}>
            <Button
              variant="outlined"
              startIcon={<AddCircleOutlineRoundedIcon />}
              sx={{
                ...alarmStyles.modalCancelBtn,
                marginLeft: "auto",
                fontFamily: "Poppins",
                marginRight: "1em",
              }}
              onClick={handleWidgetBundlePopupOpen}
            >
              Add Widget
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              sx={{
                ...alarmStyles.modalSaveBtn,
                fontWeight: "600",
                ":hover": {
                  fontWeight: "700",
                },
                fontFamily: "Poppins",
                color: "#f0f4ff",
                backgroundColor: "#1e3a8a",
              }}
            >
              Save
            </Button>
          </Box>
        </Toolbar>
      </Box>

      <Box
        sx={{
          paddingLeft: 3,
          paddingTop: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflowY: "auto",
          height: "calc(100vh - 40px)",
          width: "100%",
          gap: "30px",
        }}
      >
        {Widgets.map((widget, index) => (
          <Card
            key={index}
            sx={{
              position: "relative",
              width: "80%",
              height: "320px",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.02)",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <Box
              sx={{
                background: "#E0E7FF",
                color: "white",
                padding: "0.75rem 1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                variant="subtitle1"
                fontWeight="600"
                color="#1e3a8a"
                fontFamily="Poppins, sans-serif"
              >
                Widget {index + 1}
              </Typography>

              <IconButton
                sx={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  color: "#1e3a8a",
                }}
                onClick={() => removeWidget(index)}
              >
                <CloseOutlinedIcon />
              </IconButton>
            </Box>

            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "240px",
                padding: "2rem",
                gap: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: "500",
                  fontFamily: "Poppins",
                  color: "#1e3a8a",
                }}
              >
                Sub Type:
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  backgroundColor: "#f3f4f6",
                  padding: "0.4rem 0.8rem",
                  borderRadius: "6px",
                  color: "#1e3a8a",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                }}
              >
                {widget.widgetName}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <WidgetBundle
        open={showWidgetBundlePopup}
        onClose={handleWidgetBundlePopupClose}
        onWidgetSelect={handleWidgetSelect}
      />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        draggable
        theme="colored"
      />
    </Box>
  );
};

export default CreateLayout;
