import { 
  styled, 
  Typography, 
  InputBase,
  Switch,
  Select,
  Box,
  } from "@mui/material"

  export const priorityOptions = [
    { value: "High" },
    { value: "Moderate" },
    { value: "Low" },
  ];

  export const operatorOptions = [
    { value: "<", label: "Less Than (<)",displayValue: "Less Than (<)"  },
    { value: ">", label: "Greater Than (>)",displayValue: "Greater Than (>)"},
    { value: "==", label: "Equal To (=)" ,displayValue: "Equal To (=)"},
    { value: "!=", label: "Not Equal To (≠)",displayValue: "Not Equal To (≠)" },
    { value: "<=", label: "Less Than or Equal To (≤)",displayValue: "Less Than or Equal To (≤)"},
    { value: ">=", label: "Greater Than or Equal To (≥)",displayValue: "Greater Than or Equal To (≥)" },
  ];

  export const functionOptions = ["Min", "Max", "Avg", "Raw", "Sum"];
  
export const viewModeStyle = {
    "& .MuiInputBase-input.Mui-disabled ,& .MuiSelect-select.Mui-disabled": {
      color: "#1E3A8A !important",
      WebkitTextFillColor: "#1E3A8A !important",
      opacity: 1,
      fontWeight: 400,
    },
    "& .MuiChip-root": {
      backgroundColor: "#E6EDFF", // Light blue background
      // border: "1px solid #1E3A8A", // Blue border
      height: "24px", // Consistent height
      margin: "2px",
      borderRadius: "4px", // Fully rounded corners
     },
    "& .MuiChip-label": {
      color: "#1E3A8A !important", // Dark blue text
      fontWeight: 400, // Bold font
      fontSize: "13px", // Slightly larger font
      padding: "0 8px", // Horizontal padding
    }
};
  
  export const StyledLabel = styled(Typography)({
    color: "#1E3A8A",
    fontWeight: 500,
    fontSize: "14px",
    minWidth: "120px",
    paddingTop: "4px",
  });
  
  export const CustomInput = styled(InputBase)(({ theme }) => ({
    flex: 1,
    width: "250px",
    "& .MuiInputBase-input": {
      borderRadius: 4,
      require: true,
      backgroundColor: "#F8FAFF",
      border: "1px solid #1E3A8A",
      fontSize: 14,
      padding: "8px 12px",
      height: "18px",
      // width: "250px",
      color: "#1E3A8A", // Ensure input text is #1E3A8A
      transition: theme.transitions.create([
        "border-color",
        "background-color",
        "box-shadow",
      ]),
      "&:focus": {
        borderColor: "#1E3A8A",
        backgroundColor: "#FFFFFF",
      },
      "&:hover": {
        borderColor: "#1E3A8A",
      },
    },
    "& input": {
      color: "#1E3A8A",
    },
  }));
  
  export const CustomSwitch = styled(Switch)(({ }) => ({
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: "#1E3A8A",
      "&:hover": { backgroundColor: "rgba(30, 58, 138, 0.08)" },
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      bgcolor: "#1E3A8A",
    },
  }));
  
 //dropdown color  
 export const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 150,
    },
    sx: {
      "& .MuiMenuItem-root": {
        color: "#1E3A8A",
        "&:hover": {
          backgroundColor: "#E0E7FF",
        },
        "&.Mui-selected": {
          backgroundColor: "#E0E7FF",
          color: "#1E3A8A",
        },
      },
    },
  },
};

  export const CustomSelect = styled(Select)({
    flex: 1,
    width: "250px",
    backgroundColor: "#F8FAFF",
    "& .MuiSelect-select": {
      padding: "8px 12px",
      fontSize: "14px",
      height: "18px",
      border: "1px solid #1E3A8A",
      borderRadius: 4,
      color: "#1E3A8A", 
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#1E3A8A",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#1E3A8A",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#1E3A8A",
    },
    "& .MuiSvgIcon-root": {
      color: "#1E3A8A",
    },
    // Update the Menu and MenuItem styles
    "& + .MuiMenu-paper, & + .MuiPopover-paper": {
      "& .MuiMenuItem-root": {
        color: "#1E3A8A",
        "&:hover": {
          backgroundColor: "#E0E7FF",
        },
        "&.Mui-selected": {
          backgroundColor: "#E0E7FF",
          color: "#1E3A8A",
          "&:hover": {
            backgroundColor: "#D0DCF1",
          }
        },
      },
    },
  });


  export const ChipInput = styled(Box)({
    display: "flex",
    flexWrap: "wrap", 
    gap: "4px",
    padding: "4px 8px", 
    border: "1px solid #1E3A8A",
    borderRadius: 4,
    backgroundColor: "#F8FAFF",
    minHeight: "90px", 
    cursor: "text",
    width: "250px",
    alignItems: "flex-start", // Changed from "center" to "flex-start"
    "&:focus-within": {
      borderColor: "#1E3A8A",
      backgroundColor: "#FFFFFF",
    },
    overflow: "auto", // Changed from "visible" to "auto"
    position: "relative", // Added position relative
  });
  
  export const ChipContainer = styled(Box)({
    display: "flex",
    flexWrap: "wrap", // Changed from "nowrap" to "wrap"
    gap: "4px", // Added gap between chips
    overflow: "visible", // Changed from "hidden" to "visible"
    flex: "1 1 auto",
  });
  
  export const TagInput = styled(InputBase)({
    flex: "1 0 60px", // Changed to allow growing but with minimum width
    minWidth: 60,
    "& input": {
      padding: "4px 8px", // Reduced padding to fit better
      fontSize: 14,
      color: "#1E3A8A",
    },
  });
  
  export const LoadingWrapper = styled(Box)({
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    padding: "20px",
    "& .MuiCircularProgress-root": {
      color: "#1E3A8A",
    },
  });


export const RulesStyle = {
  globalstyle: {
    padding: 2,
    bgcolor: "white",
    maxWidth: "1200px",
    mx: "auto",
  },
  sticky: {
    position: "sticky",
    top: 0,
    bgcolor: "white",
    zIndex: 1000,
    paddingBottom: 2,
    color: "#1E3A8A",
  },
  space: {
    display: "flex",
    alignItems: "center",
  },
  search: {
    display: "flex",
    gap: "1.5em",
    fontFamily: "Poppins",
    padding: ".em 2em 0 2em",
    alignItems: "center",
    paddingTop: "7px",
  },
  search_2: {
    "& .MuiOutlinedInput-root": {
      borderRadius: "20px",
      fontFamily: "Poppins",
      fontSize: ".85rem",
      color: "#1e3a8a",
      "& fieldset": {
        borderColor: "#1e3a8a",
      },
      "&:hover fieldset": {
        borderColor: "#1e3a8a",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#1e3a8a",
      },
    },
    "& .MuiInputLabel-root": {
      display: "none",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1rem",
      color: "#1e3a8a",
    },
  },

  toggle: {
    marginLeft: "auto",
    // position: "absolute", // Makes it float in the top-right
    right: 10,
    display: "flex",
    alignItems: "center",
    gap: 1,
    p: "6px 10px",
    borderRadius: "12px",
    bgcolor: "rgba(240, 244, 255, 0.13)", // Subtle transparent background
    // boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", // Soft depth effect
    backdropFilter: "blur(10px)", // Glassmorphism effect
  },

  active_toggle: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    // bgcolor: "linear-gradient(135deg, #E0EAFC 0%, #CFDEF3 100%)", // Soft gradient
    borderRadius: "30px",
    p: "5px 10px",
    // boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.1)", // Inner depth effec
    border: "1px solid #1e3a8a"
  },

  active_heading: {
    color: "#1e3a8a",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },

  Navbar_space: {
    ml: "auto",
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  },

  color_chnage: {
    ml: 0,
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: "#1E3A8A",
      "&:hover": {
        backgroundColor: "rgba(141, 160, 211, 0.08)",
      },
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      bgcolor: "#1E3A8A",
    },
  },

  // active_red_alert: {
  //   bgcolor: "#FF3B30", // Red alert badge
  //   color: "white",
  //   borderRadius: "50%",
  //   width: "20px",
  //   height: "20px",
  //   fontSize: "0.8rem",
  //   fontWeight: "bold",
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   transition: "0.3s ease-in-out",
  //   "&:hover": { transform: "scale(1.1)" }, // Subtle hover effect
  // },

  active_paused_Track:{
    "& .MuiSwitch-switchBase.Mui-checked": { color: "#1E40AF" },
    "& .MuiSwitch-track": { bgcolor: "#A3C5FF" },
  },
pause:{
  display: "flex",
  alignItems: "center",
  gap: 1,
  // bgcolor: "linear-gradient(135deg, #F3F4F6 0%, #D1D5DB 100%)", // Soft gradient
  borderRadius: "30px",
  p: "5px 10px",
  // boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.08)", // Inner depth effect
  border: "0.1px solid #1e3a8a"
},

  paused_heading: {
    color: "#1e3a8a",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },

  color_change2: {
    "& .MuiSwitch-switchBase.Mui-checked": {
      color: "#1E3A8A",
      "&:hover": { backgroundColor: "rgba(30, 58, 138, 0.08)" },
    },
    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
      bgcolor: "#1E3A8A",
    },
  },

  priority_dropdown: {
    // color: "#1E3A8A",
    // "&:hover": { backgroundColor: "#D0DCF1" },

    width: "110px",
    height: "36px",
    fontFamily: "Poppins",
    fontSize: "0.8rem",
    color: "#1e3a8a",
    borderRadius: "20px",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#1e3a8a",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#1e3a8a",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#1e3a8a",
    },
    "& .MuiSelect-icon": {
      color: "#1e3a8a",
    },
  },

  priority_underline: {
    PaperProps: {
      sx: {
        width: "110px",
        fontFamily: "Poppins",
        borderRadius: "10px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        color: "#1e3a8a",
        "& .MuiMenuItem-root": {
          color: "#1e3a8a",
          fontSize: ".8rem",
          height: "25px",
          "&:hover": {
            backgroundColor: "#f0f4ff",
          },
          "&.Mui-selected": {
            backgroundColor: "#e0eaff",
            "&:hover": {
              backgroundColor: "#d0e0ff",
            },
          },
          "&.Mui-focusVisible": {
            display: "none",
          },
        },
      },
    },
  },

  // button: {
  //   textTransform: "none",
  //   borderRadius: 12,
  //   fontWeight: "bold",
  //   bgcolor: "#1E3A8A",
  //   color: "white",
  //   "&:hover": { bgcolor: "#17468A" },
  //   ml: 2,
  //   px: 2,
  //   py: 1,
  // },

  button: {
  textTransform: "none",
  borderRadius: 12,
  fontWeight: "bold",
  bgcolor: "#1E3A8A",
  color: "white",
  "&:hover": { 
    // bgcolor: "#D1D5F6", // Light whitish-blue color
    bgcolor:"#ffffff",
    color: "#1E3A8A"    // Change text color to blue for better contrast
  },
  ml: 2,
  px: 2,
  py: 1,
},

  popup_heading:{
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    px: 2,
    pt: 2
  },

  popup_mode:{
    display: "flex", 
    alignItems: "center", 
    gap: 1,
    backgroundColor: "#F0F4FF",
    padding: "4px 8px",
    borderRadius: "20px",
    height:"30px"
  },

  popup_toggle:{
    color: "#1E3A8A",
    fontWeight: 500,
    width:"50px"
  },

  popup_condition:{
    flex: 1,
    border: "1px solid #1e3a8a",
    borderRadius: 1,
    p: 2,
    mb: 1,
    backgroundColor: "#FFFFFF",
    marginLeft: "31px", // Align with RTU dropdown"s left margin
    // width:"100px !important"
  },

  popup_conditionbox:{
    height: "150px",
    overflowY: "auto",
    // width:"500px"
  },

  popup_addcondition:{
    borderRadius: 8,
    borderColor: "#1E3A8A",
    color: "#1E3A8A",
    "&:hover": {
      borderColor: "#1e3a8a",
      backgroundColor: "#F8FAFF"
    }
  },

  popup_tags:
  {
    backgroundColor: "#E0E7FF",
    borderRadius: "4px",
    height: "24px",
    margin: "0 2px",
    "& .MuiChip-label": {
      fontSize: "12px",
      color: "#1E3A8A",
    },
  },

  popup_chip:{ 
    minHeight: "90px", 
    overflow: "auto",
    alignContent: "flex-start"
  },

  popup_conforrmbutton:{
    borderRadius: 2,
    fontWeight: "bold",
    backgroundColor: "#1E3A8A",
    color: "white",
    "&:hover": { backgroundColor: "#17468A" },
  },

  popup_description:{
    "& .MuiInputBase-input": {
      width: "250px",
      height: "78px !important",
      alignItems: "flex-start",
      resize: "none",
      color: "#1E3A8A",
      overflowY:"auto",
      // maxHeight: "78px",
  }
},



}

