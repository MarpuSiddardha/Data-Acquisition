import { useLocation, Link } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  DashboardRounded as DashboardRoundedIcon,
  AccessAlarmsRounded as AccessAlarmsRoundedIcon,
  RuleRounded as RuleRoundedIcon,
  AnalyticsRounded as AnalyticsRoundedIcon,
} from "@mui/icons-material";
import { sidebarStyles } from "@/styles/sidebarStyles";

export default function SidebarMenuList(props: { Mobile: boolean }) {
  const navItems = [
    { label: "Dashboard", icon: <DashboardRoundedIcon />, path: "/" },
    { label: "Alarms", icon: <AccessAlarmsRoundedIcon />, path: "/alarms" },
    { label: "Rules", icon: <RuleRoundedIcon />, path: "/rules" },
    {
      label: "Reports & Analytics",
      icon: <AnalyticsRoundedIcon />,
      path: "/reports-analytics",
    },
  ];

  const location = useLocation();

  return (
    <List dense>
      {navItems.map((item) => {
        const isSelected =
          item.path === "/reports-analytics"
            ? location.pathname.startsWith("/reports-analytics")
            : location.pathname === item.path;

        return (
          <ListItem key={item.path} disablePadding>
            <Link
              to={item.path}
              style={{
                textDecoration: "none",
                width: props.Mobile ? "50%" : "100%",
              }}
            >
              <ListItemButton
                disableRipple
                selected={isSelected}
                sx={sidebarStyles.listItemButton(isSelected)}
              >
                <ListItemIcon sx={sidebarStyles.listItemIcon(isSelected)}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: sidebarStyles.listItemText(isSelected),
                    },
                  }}
                />
              </ListItemButton>
            </Link>
          </ListItem>
        );
      })}
    </List>
  );
}
