import React from "react";
import { useMediaQuery } from "@mui/material";
import { SidebarContext } from "@/context/SidebarContext";
import { ContextProviderProps } from "@/utils/types";

function ContextProvider({ children }: ContextProviderProps) {
  const isSmall = useMediaQuery("(max-width:600px)");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const contextValue = {
    isSidebarOpen,
    isSmall,
    handleToggle,
    setIsSidebarOpen,
  };

  return (
    <SidebarContext.Provider value={contextValue}>
      {children}
    </SidebarContext.Provider>
  );
}

export default ContextProvider;
