import { Box, Typography, Paper } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface ValueCardProps {
  widgetName: string;
  data: {
    title: string;
    rtus: string[];
    sensors: {
      sensorId: string;
      sensorType: string;
      sensorValues: { value: number; timestamp: string }[];
    }[];
    date: {
      startDate: string;
      endDate: string;
    };
    aggregations: {
      max: boolean;
      min: boolean;
      average: boolean;
    };
    aggregationValues: {
      max: number;
      min: number;
      average: number;
    };
  };
}

export default function ValueCard({ data }: ValueCardProps) {
  if (!data.aggregationValues || 
      data.aggregationValues.max === null || data.aggregationValues.max === undefined ||
      data.aggregationValues.min === null || data.aggregationValues.min === undefined ||
      data.aggregationValues.average === null || data.aggregationValues.average === undefined) {
    return (
      <Paper 
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          backgroundColor: "#f8f9fa",
          width: "100%",
          maxWidth: 400,
          margin: "auto",
          textAlign: "center",
        }}
      >
        <Typography variant="subtitle1" color="text.secondary">
          No data to display
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid #E2E8F0',
        height: 330,
        width: '100%',
        display: "flex",
        flexDirection: "column",
        background: 'linear-gradient(to bottom, #FAFBFF, #FFFFFF)',
        p: 2,
        mb: -5
      }}
    >
      {data.title && (
        <Box sx={{ mb: 2, px: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: "#64748b",
              fontWeight: 500,
              fontFamily: "poppins",
              display: "flex",
              alignItems: "flex-start",
              flexWrap: "wrap"
            }}
          >
            <Typography 
              component="span" 
              sx={{ 
                color: "#1e3a8a", 
                fontFamily: "poppins", 
                fontWeight: 300,
                mr: 1,
                whiteSpace: "nowrap"
              }}
            >
              Title:
            </Typography>
            <Typography 
              component="span" 
              sx={{ 
                color: "#64748b",
                fontWeight: 500,
                fontFamily: "poppins",
                wordBreak: "break-word"
              }}
            >
              {data.title}
            </Typography>
          </Typography>
        </Box>
      )}

      {data.sensors.map((sensor, index) => (
        <Box 
          key={index} 
          sx={{ 
            mb: 1.5,
            pb: 1,
            px: 1,
            borderBottom: index !== data.sensors.length - 1 ? "1px solid #e0e7ff" : "none",
          }}
        >
          <Typography
            variant="body1"
            sx={{ 
              fontWeight: 600, 
              color: "#64748b",
              display: "flex",
              alignItems: "flex-start",
              flexWrap: "wrap"
            }}
          >
            <Typography 
              component="span" 
              sx={{ 
                color: "#1e3a8a", 
                fontFamily: "poppins", 
                fontWeight: 300,
                mr: 1,
                whiteSpace: "nowrap"
              }}
            >
              Sensor ID:
            </Typography>
            <Typography 
              component="span" 
              sx={{ 
                color: "#64748b",
                fontWeight: 600,
                wordBreak: "break-word"
              }}
            >
              {sensor.sensorId}
            </Typography>
          </Typography>
        </Box>
      ))}

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2,
          mt: 1,
          backgroundColor: "#f1f5f9",
          borderRadius: 1.5,
          p: 1,
        }}
      >
        <Typography
          variant="caption"
          sx={{ 
            color: "#64748b", 
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%"
          }}
        >
          <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5, color: '#64748B' }} />
          <Box component="span" sx={{ 
            whiteSpace: "nowrap", 
            overflow: "hidden", 
            textOverflow: "ellipsis",
            maxWidth: "calc(100% - 20px)"
          }}>
            {data.date.startDate} - {data.date.endDate}
          </Box>
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          mt: 2,
          pt: 2,
          borderTop: "1px solid #e0e7ff",
        }}
      >
        {data.aggregations.max && (
          <Box sx={{ textAlign: "center", flex: 1 }}>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
              Maximum
            </Typography>
            <Typography variant="h6" sx={{ color: "#1E40AF", fontWeight: 600 }}>
              {data.aggregationValues.max.toFixed(2)}
            </Typography>
          </Box>
        )}
        
        {data.aggregations.min && (
          <Box sx={{ textAlign: "center", flex: 1, borderLeft: data.aggregations.max ? "1px solid #e0e7ff" : "none" }}>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
              Minimum
            </Typography>
            <Typography variant="h6" sx={{ color: "#9A3412", fontWeight: 600 }}>
              {data.aggregationValues.min.toFixed(2)}
            </Typography>
          </Box>
        )}
        
        {data.aggregations.average && (
          <Box sx={{ 
            textAlign: "center", 
            flex: 1, 
            borderLeft: (data.aggregations.max || data.aggregations.min) ? "1px solid #e0e7ff" : "none" 
          }}>
            <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
              Average
            </Typography>
            <Typography variant="h6" sx={{ color: "#065F46", fontWeight: 600 }}>
              {data.aggregationValues.average.toFixed(2)}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}