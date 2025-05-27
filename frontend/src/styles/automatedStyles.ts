const automatedStyles = {
    snfContainer: (isSidebarOpen: boolean) => ({
        display: "flex",
        flexDirection: "column",
        gap: "1.5em",
        width: "100%",
        maxWidth: !isSidebarOpen ? "1200px" : "80%",
        fontFamily: "Poppins",
        marginLeft: !isSidebarOpen ? "" : "10%",

        // alignItems: "center",
    }),
    search: {
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
    filterContainer: { display: "flex", gap: ".5em", alignItems: "center" },
    filterText: {
        fontFamily: "Poppins",
        fontSize: ".85rem",
        fontWeight: 500,
        color: "#1e3a8a",
      },
    severityFilters: {
        width: "110px",  
        height: "36px",
        fontFamily: "Poppins",
        fontSize: "0.8rem",  
        color: "#1e3a8a",
        borderRadius: "12px",
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
    severityFilterOptions: {
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
                }
              },
              "&.Mui-focusVisible": {
                display: "none"
              }
            }
          }
        }
      },


};

export { automatedStyles };