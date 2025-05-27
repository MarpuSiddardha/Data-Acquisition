import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Typography,
  Toolbar,
  Divider,
} from "@mui/material";
import { Widget } from "@/utils/types";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { alarmStyles } from "@/styles/alarmStyles";
import { getLayout } from "@/services/api/apis";
import "react-toastify/dist/ReactToastify.css";

const LayoutView = () => {
  const { layoutId } = useParams();
  const navigate = useNavigate();
  const [layout, setLayout] = useState<{
    layoutId: number;
    layoutName: string;
    layoutType: string;
    widgets: Widget[];
  }>({ layoutId: 0, layoutName: "", layoutType: "", widgets: [] });
  const [layoutName, setLayoutName] = useState("");

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

          <Typography sx={alarmStyles.filterText}>{layoutName}</Typography>
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
            {/* Header */}
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
              <Typography variant="subtitle1" fontWeight="600" color="#1e3a8a">
                Widget {index + 1}
              </Typography>
              <Box
                sx={{
                  backgroundColor: "#1e40af",
                  padding: "0.2rem 0.6rem",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                }}
              >
                {widget.widgetType}
              </Box>
            </Box>

            {/* Content */}
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
              <Typography sx={{ fontSize: "1.1rem", fontWeight: "500" }}>
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
                }}
              >
                {widget.widgetName}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
      {/* </Box> */}
    </Box>
  );
};

export default LayoutView;
