import Dashboard from "../pages/dashboard/Dashboard";
import Rules from "../pages/rules/Rules";
import Alarms from "../pages/alarms/Alarms";
import ReportsAnalytics from "../pages/reports/ReportsAnalytics";
import Layout from "../components/AppLayout";
import { 
  Box,
  Stack,
  Typography,
  Divider
} from "@mui/material";
import { 
  useState, 
  useEffect 
} from "react";
import { headerStyles } from "@/styles/headerStyles";
import { 
    AccountCircleRounded as AccountCircleRoundedIcon,
    MarkEmailUnreadRounded as MarkEmailUnreadRoundedIcon,
} from "@mui/icons-material";
import { dashboardStyles } from "../styles/dashboardStyles";
import AlarmsChart from "../pages/dashboard/charts/AlarmsChart";
import ReportsChart from "../pages/dashboard/charts/ReportsChart";
import DashboardCard from "../pages/dashboard/DashboardCard";
import RulesChart from "../pages/dashboard/charts/RulesChart";
import { 
  getAlarmsSummary, 
  getRulesSummary, 
  getReportsSummary 
} from "../services/api/apis";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { useLocation } from "react-router-dom";


export {
    headerStyles,
    AccountCircleRoundedIcon,
    MarkEmailUnreadRoundedIcon,
    Box, 
    Stack,
    Typography,
    Divider,
    useState,
    useEffect,
    dashboardStyles,
    AlarmsChart,
    ReportsChart,
    DashboardCard,
    RulesChart,
    getAlarmsSummary,
    getRulesSummary,
    getReportsSummary,
    Dashboard, 
    Rules, 
    Alarms, 
    ReportsAnalytics,
    Layout,
    Highcharts,
    HighchartsReact,
    useLocation
};