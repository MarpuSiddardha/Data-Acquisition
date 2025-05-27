import { createContext } from "react";
import { SidebarContextType } from "@/utils/types";

const defaultContextValue: SidebarContextType = {
  isSidebarOpen: true,
  isSmall: false,
  handleToggle: () => {},
  setIsSidebarOpen: () => {},
};

export const SidebarContext =
  createContext<SidebarContextType>(defaultContextValue);
