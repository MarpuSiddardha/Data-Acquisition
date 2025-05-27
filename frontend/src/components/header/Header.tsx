import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

import { Box, Divider, Typography, IconButton } from "@mui/material";
import {
  AccountCircleRounded as AccountCircleRoundedIcon,
  MarkEmailUnreadRounded as MarkEmailUnreadRoundedIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import { headerStyles } from "@/styles/headerStyles";
import { SidebarContext } from "@/context/SidebarContext";

export default function Header() {
  const location = useLocation();
  const context = useContext(SidebarContext);
  const { isSmall, isSidebarOpen, handleToggle } = context;

  const headerItems = [
    { label: "Dashboard", path: "/" },
    { label: "Alarms", path: "/alarms" },
    { label: "Rules", path: "/rules" },
    { label: "Reports & Analytics", path: "/reports-analytics" },
  ];

  return (
    <>
      <Box sx={headerStyles.container}>
        <IconButton color="inherit" edge="start" onClick={handleToggle}>
          {isSidebarOpen ? (
            isSmall ? (
              <CloseIcon />
            ) : (
              <MenuIcon />
            )
          ) : (
            <MenuIcon />
          )}
        </IconButton>
        <Link to="/">
          <Typography sx={headerStyles.title}>Data Acquisition</Typography>
        </Link>
        <div style={{ marginLeft: isSmall ? "auto" : "3em" }}>
          {headerItems.find((item) => location.pathname === item.path)?.label ||
            "Reports & Analytics"}
        </div>
        <Box
          sx={{
            marginLeft: isSmall ? "none" : "auto",
            alignItems: "center",
            gap: 2,
            display: isSmall ? "none" : "flex",
          }}
        >
          <Box sx={headerStyles.notifProfileDetail}>
            <MarkEmailUnreadRoundedIcon
              sx={headerStyles.notifProfileIcon}
              id="notifications"
            />
            <label
              htmlFor="notifications"
              style={headerStyles.notifProfileLabel}
            >
              Notifications
            </label>
          </Box>

          <Box sx={headerStyles.notifProfileDetail}>
            <AccountCircleRoundedIcon
              sx={headerStyles.notifProfileIcon}
              id="profile"
            />
            <label htmlFor="profile" style={headerStyles.notifProfileLabel}>
              Alice
            </label>
          </Box>
        </Box>
      </Box>
      <Divider />
    </>
  );
}
