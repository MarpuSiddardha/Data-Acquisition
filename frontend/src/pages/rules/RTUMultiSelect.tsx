import React, { useState, useRef, useEffect } from "react";
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
  Chip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import CloseIcon from "@mui/icons-material/Close";
import { RTUData } from "@/utils/types";

interface RTUMultiSelectProps {
  rtuOptions: RTUData[];
  selectedRtus: string[];
  onChange: (selectedRtus: string[]) => void;
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
  borderRadius:"5px",
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

// Modified to make the entire option clickable and display full width
const StyledRTUOption = styled(Box)(() => ({
  marginBottom: "4px",
  width: "100%", // Full width for single column layout
  display: "flex",
  borderRadius: "5px",
  cursor: "pointer",
  padding: "2px 4px",
  "&:hover": {
    backgroundColor: "#D0DCF1", // Light blue color on hover
  },
}));

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
  rtuOptions,
  selectedRtus,
  onChange,
  disabled = false,
  maxSelections = 3,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!disabled) {
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
      const rtu = rtuOptions.find((r) => String(r.RTU_ID) === id);
      return rtu ? { id, name: rtu.RTU_Name } : { id, name: `RTU ${id}` };
    });
  };

  // Handle clicking the entire RTU option area
  const handleRTUOptionClick = (rtuId: string) => {
    if (!disabled) {
      handleChange(rtuId);
    }
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

  return (
    <Box sx={{ position: "relative" }} ref={anchorRef}>
      <StyledFormControl>
        <StyledInput
          readOnly
          value=""
          onClick={handleToggle}
          startAdornment={
            <>
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
              {selectedRTUs.length === 0 && (
                <Typography
                  sx={{
                    color: "#1E3A8A",
                    opacity: 0.7,
                    fontSize: "14px",
                    textAlign: "left",
                    position: "absolute",
                    left: "12px"
                  }}
                >
                  Select RTUs
                </Typography>
              )}
            </>
          }
        />
        <IconWrapper>
          {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        </IconWrapper>
      </StyledFormControl>

      {open && (
        <ClickAwayListener onClickAway={handleClose}>
          <StyledPaper>
            <FormGroup sx={{ 
              display: "flex", 
              flexDirection: "column", // Changed to column layout
              width: "100%"
            }}>
              {rtuOptions.map((rtu) => (
                <StyledRTUOption 
                  key={rtu.RTU_ID}
                  onClick={() => handleRTUOptionClick(String(rtu.RTU_ID))}
                  sx={{
                    opacity: disabled || (selectedRtus.length >= maxSelections && !selectedRtus.includes(String(rtu.RTU_ID))) 
                      ? 0.5 
                      : 1,
                    pointerEvents: disabled || (selectedRtus.length >= maxSelections && !selectedRtus.includes(String(rtu.RTU_ID))) 
                      ? "none" 
                      : "auto",
                  }}
                >
                  <StyledFormControlLabel
                    control={
                      <StyledCheckbox
                        checked={selectedRtus.includes(String(rtu.RTU_ID))}
                        onChange={() => {}} // Handled by parent click
                        disabled={
                          disabled ||
                          (selectedRtus.length >= maxSelections &&
                            !selectedRtus.includes(String(rtu.RTU_ID)))
                        }
                      />
                    }
                    label={`${rtu.RTU_Name}`}
                    sx={{ pointerEvents: "none" }}
                  />
                </StyledRTUOption>
              ))}
            </FormGroup>
            {error && (
              <Typography
                variant="caption"
                sx={{ color: "error.main", mt: 1, display: "block" }}
              >
                {error}
              </Typography>
            )}
          </StyledPaper>
        </ClickAwayListener>
      )}
    </Box>
  );
};

export default RTUMultiSelect;