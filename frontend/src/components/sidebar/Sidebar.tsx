import { Box, Divider, Stack } from "@mui/material";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import SidebarMenuList from "@/components/sidebar/SidebarMenuList";
import { sidebarStyles } from "@/styles/sidebarStyles";

export default function Sidebar() {
  const context = useContext(SidebarContext);
  const { isSmall } = context;

  return (
    <Box sx={sidebarStyles.root(isSmall)}>
      <Divider />
      <Stack sx={sidebarStyles.list}>
        <SidebarMenuList Mobile={isSmall} />
      </Stack>
    </Box>
  );
}
