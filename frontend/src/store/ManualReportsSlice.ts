import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getManualReports } from "@/services/api/apis"; // Assume you have an API function for manual reports
import axios from "axios";

interface ReportData {
  report_id: number;
  reportType: string;
  scheduleStatus: string;
  description: string;
  generatedDateTime: string;
}

interface ReportsState {
  manualReports: ReportData[];
  loading: boolean;
  error: string | null;
  loadingSearch: boolean;
  searchResults: ReportData[];
  errorSearch: string | null;
}

const initialState: ReportsState = {
  manualReports: [],
  loading: false,
  error: null,
  loadingSearch: false,
  searchResults: [],
  errorSearch: null,
};

export const fetchManualReports = createAsyncThunk(
  "manualReports/fetchManualReports",
  async () => {
    const response = await getManualReports();

    return response.Manual_Reports;
  }
);

export const fetchFilteredReports = createAsyncThunk(
  "reports/fetchFilteredReports",
  async (filters: {
    startDate: string;
    endDate: string;
    reportType: string | null;
    scheduleStatus: string | null;
  }) => {
    const { startDate, endDate, reportType, scheduleStatus } =
      filters;
    const response = await axios.get("http://localhost:8091/manual-reports", {
      params: {
        reportType: reportType,
        scheduleStatus: scheduleStatus,
        startDate,
        endDate,
      },
    });
    return response.data.Manual_Reports;
  }
);

export const saveReport = createAsyncThunk(
  "Reports/saveReport",
  async (reportData: {reportType: string; customReportType: string; layoutName: string; description: string}, { dispatch }) => {
    console.log("reportData", reportData);
    const response = await axios.post("http://localhost:8091/manual-reports/create-report", reportData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    dispatch(fetchManualReports());
    return response.data;
  }
);

export const searchmanualreports = createAsyncThunk(
  "layouts/searchLayouts",
  async (query: string) => {
    const response = await axios.get(
      "http://localhost:8091/manual-reports",
      {
        params: { query }, 
      }
    );
    // console.log(response.data);
    return response.data;
  }
);

const manualReportsSlice = createSlice({
  name: "Manual_Reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchManualReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManualReports.fulfilled, (state, action) => {
        state.loading = false;
        state.manualReports = action.payload;
      })
      .addCase(fetchManualReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch reports";
      })
      .addCase(fetchFilteredReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilteredReports.fulfilled, (state, action) => {
        state.loading = false;
        state.manualReports = action.payload;
      })
      .addCase(fetchFilteredReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch filtered reports";
      })
      .addCase(saveReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveReport.fulfilled, (state) => {
        state.loading = false;
        // Don"t push to array here since we"ll fetch fresh data
        // state.manualReports.push(action.payload);
      })
      .addCase(saveReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to save layout";
      })
      .addCase(searchmanualreports.pending, (state) => {
        state.loadingSearch = true;
        state.errorSearch = null;
      })
      .addCase(searchmanualreports.fulfilled, (state, action) => {
        state.loadingSearch = false;
        state.searchResults = action.payload.Manual_Reports; 
      })
     .addCase(searchmanualreports.rejected, (state, action) => {
        state.loadingSearch = false;
        state.errorSearch = action.error.message || "Search failed";
      });

  },
});

export default manualReportsSlice.reducer;
