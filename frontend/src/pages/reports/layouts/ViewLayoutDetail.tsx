import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Typography,
  TextField,
  Divider,
  Toolbar,
} from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import ArrowBack from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import { automatedStyles } from "@/styles/automatedStyles";
import WidgetBundle from "./WidgetBundle";
import { alarmStyles } from "@/styles/alarmStyles";
import { getLayout, updateLayout } from "@/services/api/apis";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { Widget } from "@/utils/types";

const ViewLayout = () => {
  const { layoutId } = useParams();
  const navigate = useNavigate();
  const [layout, setLayout] = useState<{
    layoutId: number;
    layoutName: string;
    layoutType: string;
    widgets: Widget[];
  }>({ layoutId: 0, layoutName: "", layoutType: "", widgets: [] });
  const [layoutName, setLayoutName] = useState("");
  const [isError, setIsError] = useState(false);
  const [showWidgetBundlePopup, setShowWidgetBundlePopup] = useState(false);

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const fetchedLayout = await getLayout(layoutId as string);
        setLayout(fetchedLayout);
        setLayoutName(fetchedLayout.layoutName);
      } catch (error) {
        console.error("Error fetching layout:", error);
      }
    };

    fetchLayout();
  }, [layoutId]);

  const handleWidgetSelect = (widgetType: string, widgetName: string) => {
    setLayout((prev) => {
      const updatedWidgets = [...prev.widgets, { widgetType, widgetName }];
      return { ...prev, widgets: updatedWidgets };
    });
  };

  const removeWidget = (index: number) => {
    setLayout((prev) => ({
      ...prev,
      widgets: prev.widgets.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!layoutName.trim()) {
      setIsError(true);
      return;
    }
    setIsError(false);

    const updatedLayout = {
      layoutName: layoutName,
      layoutType: layout.layoutType,
      widgets: layout.widgets,
    };

    try {
      await updateLayout(layoutId as string, updatedLayout);
      console.log("Layout updated successfully");
      toast.success("Layout updated successfully!", { position: "top-right" });
      setTimeout(() => navigate("/reports-analytics/layouts"), 2000);
    } catch (error) {
      console.error("Error updating layout:", error);
    }
  };

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
          <Typography sx={alarmStyles.filterText}>Layout Name </Typography>

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
            placeholder="Enter Layout Name"
          />
          <Button
            variant="outlined"
            startIcon={<AddCircleOutlineRoundedIcon />}
            sx={{
              ...alarmStyles.modalCancelBtn,
              marginLeft: "auto",
              marginRight: "1em",
            }}
            onClick={() => setShowWidgetBundlePopup(true)}
          >
            Add Widget
          </Button>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              ...alarmStyles.modalSaveBtn,
              color: "#f0f4ff",
              backgroundColor: "#1e3a8a",
            }}
          >
            Update
          </Button>
        </Toolbar>
      </Box>

      <Box
        sx={{
          paddingLeft: 3,
          paddingTop: 1,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr",
            md: "1fr 1fr",
          },
          "@media (min-width: 900px)": {
            gridTemplateColumns: "1fr 1fr",
          },
          "@media (max-width: 899px)": {
            gridTemplateColumns: "1fr",
          },
          overflowY: "auto",
          height: "calc(100vh - 40px)",
          width: "100%",
          gap: "30px",
        }}
      >
        {layout.widgets.map((widget, index) => (
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
                fontFamily="Poppins, sans-serif"
                color="#1e3a8a"
              >
                Widget {index + 1}
              </Typography>

              <Box
                sx={{
                  marginLeft: "auto",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    backgroundColor: "#1e40af",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                    fontFamily: "Poppins",
                  }}
                >
                  {widget.widgetType}
                </Typography>

                <IconButton
                  sx={{
                    color: "#1e3a8a",
                  }}
                  onClick={() => removeWidget(index)}
                >
                  <CloseOutlinedIcon />
                </IconButton>
              </Box>
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
                  fontWeight: 500,
                  fontFamily: "Poppins",
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
        onClose={() => setShowWidgetBundlePopup(false)}
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

export default ViewLayout;
