import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getAutomatedReports } from "@/services/api/apis";

interface ReportData {
  id: number;
  reportId: number;
  reportType: string;
  frequency: string;
  generatedDateTime: string;
}

interface ReportsState {
  automatedReportsData: ReportData[];
  loadingAutomated: boolean;
  errorAutomated: string | null;
  loadingSearch: boolean;
  searchResults: ReportData[]; 
  errorSearch: string | null;
}

const initialState: ReportsState = {
  automatedReportsData: [],
  loadingAutomated: false,
  errorAutomated: null,
  loadingSearch: false,
  searchResults: [],
  errorSearch: null,
};

export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async () => {
    const response = await getAutomatedReports();
    return response.reports;
  }
);

export const fetchFilteredReports = createAsyncThunk(
  "reports/fetchFilteredReports",
  async (filters: {
    frequency: string | null;
    startDate: string;
    endDate: string;
    reportType: string | null;
  }) => {
    const { frequency, startDate, endDate, reportType } =
      filters;
    const response = await axios.get(
      "http://localhost:8091/api/automated-reports",
      {
        params: {
          reportType: reportType,
          frequency: frequency,
          startDate,
          endDate,
        },
      }
    );
    return response.data.reports;
  }
);

export const searchautomatedreports = createAsyncThunk(
  "layouts/searchLayouts",
  async (q: string) => {
    const response = await axios.get(
      "http://localhost:8091/api/automated-reports/search",
      {
        params: { q }, 
      }
    );
    return response.data.reports;
  }
);



const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loadingAutomated = true;
        state.errorAutomated = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loadingAutomated = false;
        state.automatedReportsData = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loadingAutomated = false;
        state.errorAutomated = action.error.message || "Failed to fetch reports";
      })
      .addCase(fetchFilteredReports.pending, (state) => {
        state.loadingAutomated = true;
        state.errorAutomated = null;
      })
      .addCase(fetchFilteredReports.fulfilled, (state, action) => {
        state.loadingAutomated = false;
        state.automatedReportsData = action.payload;
      })
      .addCase(fetchFilteredReports.rejected, (state, action) => {
        state.loadingAutomated = false;
        state.errorAutomated =
          action.error.message || "Failed to fetch filtered reports";
      })
      .addCase(searchautomatedreports.pending, (state) => {
       state.loadingSearch = true;
      state.errorSearch = null;
     })
     .addCase(searchautomatedreports.fulfilled, (state, action) => {
     state.loadingSearch = false;
     state.searchResults = action.payload;
     })
    .addCase(searchautomatedreports.rejected, (state, action) => {
    state.loadingSearch = false;
    state.errorSearch = action.error.message || "Search failed";
    });
  },
});

export default reportsSlice.reducer;
