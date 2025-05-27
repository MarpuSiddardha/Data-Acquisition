import { 
  BrowserRouter, 
  Routes, 
  Route 
} from "react-router-dom";
import ContextProvider from "@/context/ContextProvider";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/dashboard/Dashboard";
import Rules from "@/pages/rules/Rules";
import Alarms from "@/pages/alarms/Alarms";
import ReportsAnalytics from "@/pages/reports/ReportsAnalytics";
import AutomatedReports from "@/pages/reports/automated/AutomatedReports";
import ManualReports from "@/pages/reports/manual/ManualReports";
import ReportLayouts from "@/pages/reports/layouts/ReportLayouts";
import CreateLayout from "@/pages/reports/layouts/CreateLayout";
import ViewLayoutDetail from "@/pages/reports/layouts/ViewLayoutDetail";
import ViewManualReport from "@/pages/reports/manual/ViewManualReport";
import ViewReport from "./pages/reports/automated/ViewReport";
import LayoutView from "./pages/reports/layouts/LayoutView";

export default function App() {
  return (
    <ContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="rules" element={<Rules />} />
            <Route path="rules/search" element={<Rules />} />
            <Route path="rules/filter" element={<Rules />} />
            <Route path="alarms" element={<Alarms />} />
            <Route path="reports-analytics" element={<ReportsAnalytics />}>
              <Route path="layouts" element={<ReportLayouts />} />
              <Route path="manual" element={<ManualReports />} />
              <Route path="automated" element={<AutomatedReports />} />
            </Route>
            <Route
              path="reports-analytics/automated/:reportId"
              element={<ViewReport />}
            />
            <Route
              path="reports-analytics/layouts/:layoutId"
              element={<ViewLayoutDetail />}
            />
              <Route path="/reports-analytics/layouts/view/:layoutId" element={<LayoutView />} />
            <Route 
              path="reports-analytics/layouts/create-layout" 
              element={<CreateLayout />} 
            />
             <Route
              path="/reports-analytics/manual/:reportId"
              element={<ViewManualReport />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ContextProvider>
  );
}