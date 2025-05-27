import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  OutlinedInput,
  ClickAwayListener,
  Paper,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import CloseIcon from "@mui/icons-material/Close";

// Detailed interfaces to match backend structure
interface Sensor {
  id: number;
  sensorId: string;
  sensorType: string;
  sensorName?: string; // Make sensorName optional to accommodate both structures
}

interface RTUData {
  rtuId: number;
  rtuName: string;
  sensors: Sensor[];
}

interface RTUMultiSelectProps {
  selectedRtus: string[];
  onChange: (selectedRtus: string[]) => void;
  onSensorsChange?: (sensors: Sensor[]) => void;
  onRtusChange?: (rtus: RTUData[]) => void; // New prop to pass RTU data to parent
  disabled?: boolean;
  maxSelections?: number;
}

const StyledFormControl = styled(FormControl)({
  width: "250px",
});

const StyledInput = styled(OutlinedInput)(() => ({
  backgroundColor: "#F8FAFF",
  width: "250px",
  position: "relative",
  "& .MuiOutlinedInput-input": {
    padding: "8px 12px",
    fontSize: "14px",
    height: "18px",
    textAlign: "left !important",
    justifyContent: "flex-start !important",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#1E3A8A",
    borderRadius: 4,
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#1E3A8A",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#1E3A8A",
  },
}));

const ChipContainer = styled(Box)({
  display: "flex",
  flexWrap: "nowrap",
  gap: "1px",
  alignItems: "center",
  maxWidth: "100%",
  paddingRight: "24px",
});

const StyledChip = styled(Chip)({
  margin: "2px",
  backgroundColor: "#E0E7FF",
  color: "#1E3A8A",
  maxWidth: "90px",
  borderRadius: "5px",
  "& .MuiChip-label": {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  "& .MuiChip-deleteIcon": {
    color: "ash",
    "&:hover": {
      color: "#1e3a8a",
    },
  },
});

const IconWrapper = styled("div")({
  position: "absolute",
  right: "8px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#1E3A8A",
  display: "flex",
  alignItems: "center",
});

const StyledPaper = styled(Paper)({
  position: "absolute",
  marginTop: "2px",
  width: "250px",
  maxHeight: "150px",
  overflow: "auto",
  zIndex: 1000,
  boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
  padding: "8px",
  backgroundColor: "#ffffff",
  border: "1px solid #1E3A8A",
  borderRadius: 6,
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  // "&::-webkit-scrollbar-thumb": {
  //   backgroundColor: "#cbd5e1",
  //   borderRadius: "3px",
  // }
});

const StyledCheckbox = styled(Checkbox)({
  color: "#1E3A8A",
  "&.Mui-checked": {
    color: "#1E3A8A",
  },
  padding: "4px",
});

const StyledFormControlLabel = styled(FormControlLabel)({
  marginLeft: 0,
  width: "100%",
  "& .MuiFormControlLabel-label": {
    fontSize: "14px",
    color: "#1E3A8A",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
});

const RTUMultiSelect: React.FC<RTUMultiSelectProps> = ({
  selectedRtus,
  onChange,
  onSensorsChange,
  onRtusChange,
  disabled = false,
  maxSelections = 3,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [rtuOptions, setRtuOptions] = useState<RTUData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Fetch RTU options from API - fixed to use empty dependency array
  useEffect(() => {
    const fetchRTUs = async () => {
      if (isInitialized) return; // Avoid refetch if already initialized

      try {
        setLoading(true);
        const response = await axios.get<RTUData[]>(
          "http://localhost:8091/api/rtu"
        );
        setRtuOptions(response.data);
        // console.log(response.data)

        // Pass RTU data to parent component if the callback exists
        if (onRtusChange) {
          onRtusChange(response.data);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Error fetching RTU data:", error);
        setError("Failed to load RTU options");
      } finally {
        setLoading(false);
      }
    };

    fetchRTUs();
  }, [isInitialized, onRtusChange]); // Include onRtusChange in dependencies

  // UPDATED: Normalize sensor data when passing to parent component
  useEffect(() => {
    if (!onSensorsChange || rtuOptions.length === 0) {
      return;
    }

    // Collect sensors from selected RTUs
    const selectedSensors = rtuOptions
      .filter((rtu) => selectedRtus.includes(String(rtu.rtuId)))
      .flatMap((rtu) => rtu.sensors);

    // Remove duplicates and normalize sensor structure
    const uniqueSensors = Array.from(
      new Set(selectedSensors.map((sensor) => sensor.id))
    ).map((id) => {
      const sensor = selectedSensors.find((s) => s.id === id)!;
      return {
        id: sensor.id,
        sensorId: sensor.sensorId || sensor.id.toString(), // Ensure sensorId exists
        sensorName: sensor.sensorName || `Sensor ${sensor.id}`, // Ensure sensorName exists
        sensorType: sensor.sensorType,
      };
    });

    onSensorsChange(uniqueSensors);
  }, [selectedRtus, rtuOptions, onSensorsChange]);

  const handleToggle = () => {
    if (!disabled && !loading) {
      setOpen((prevOpen) => !prevOpen);
    }
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }
    setOpen(false);
  };

  const handleChange = (rtuId: string) => {
    if (selectedRtus.includes(rtuId)) {
      onChange(selectedRtus.filter((id) => id !== rtuId));
      setError("");
      return;
    }

    if (selectedRtus.length >= maxSelections) {
      setError(`Maximum ${maxSelections} selections allowed`);
      return;
    }

    onChange([...selectedRtus, rtuId]);
    setError("");
  };

  const handleDelete = (rtuId: string) => {
    onChange(selectedRtus.filter((id) => id !== rtuId));
    setError("");
  };

  const getSelectedRTUNames = () => {
    return selectedRtus.map((id) => {
      const rtu = rtuOptions.find((r) => String(r.rtuId) === id);
      // console.log(rtuOptions)
      return rtu ? { id, name: rtu.rtuName } : { id, name: `${id}` };
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        anchorRef.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedRTUs = getSelectedRTUNames();

  if (loading) {
    return (
      <Box sx={{ position: "relative" }} ref={anchorRef}>
        <StyledFormControl>
          <StyledInput
            readOnly
            value=""
            placeholder="Loading RTUs..."
            disabled
          />
        </StyledFormControl>
      </Box>
    );
  }

  return (
    <Box sx={{ position: "relative" }} ref={anchorRef}>
      <StyledFormControl>
        <StyledInput
          readOnly
          value=""
          placeholder={selectedRTUs.length === 0 ? "Select RTUs" : ""}
          onClick={handleToggle}
          startAdornment={
            <ChipContainer>
              {selectedRTUs.map((rtu) => (
                <StyledChip
                  key={rtu.id}
                  label={rtu.name}
                  size="small"
                  onDelete={disabled ? undefined : () => handleDelete(rtu.id)}
                  deleteIcon={<CloseIcon style={{ fontSize: 14 }} />}
                />
              ))}
            </ChipContainer>
          }
        />
        <IconWrapper>
          {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        </IconWrapper>
      </StyledFormControl>

      {open && (
        <ClickAwayListener onClickAway={handleClose}>
          <StyledPaper>
            {error && (
              <Typography
                variant="caption"
                sx={{ color: "error.main", mb: 1, display: "block" }}
              >
                {error}
              </Typography>
            )}
            <FormGroup
              sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {rtuOptions.map((rtu) => (
                <StyledFormControlLabel
                  key={rtu.rtuId}
                  control={
                    <StyledCheckbox
                      checked={selectedRtus.includes(String(rtu.rtuId))}
                      onChange={() => handleChange(String(rtu.rtuId))}
                      disabled={
                        disabled ||
                        (selectedRtus.length >= maxSelections &&
                          !selectedRtus.includes(String(rtu.rtuId)))
                      }
                    />
                  }
                  label={`${rtu.rtuName}`}
                />
              ))}
            </FormGroup>
          </StyledPaper>
        </ClickAwayListener>
      )}
    </Box>
  );
};

export default RTUMultiSelect;
