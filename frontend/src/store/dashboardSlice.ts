import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAlarmsSummary, getRulesSummary, getReportsSummary } from "@/services/api/apis";
import { AlarmsSummary, RulesSummary, ReportsSummary } from "@/utils/types";

export const fetchAlarmsSummary = createAsyncThunk(
  "dashboard/fetchAlarmsSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAlarmsSummary();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchRulesSummary = createAsyncThunk(
  "dashboard/fetchRulesSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getRulesSummary();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchReportsSummary = createAsyncThunk(
  "dashboard/fetchReportsSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getReportsSummary();
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    alarmsSummary: null as AlarmsSummary | null,
    rulesSummary: null as RulesSummary | null,
    reportsSummary: null as ReportsSummary | null,
    loading: false,
    error: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlarmsSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAlarmsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.alarmsSummary = action.payload;
      })
      .addCase(fetchAlarmsSummary.rejected, (state) => {
        state.loading = false;
        state.error = true;
      })

      .addCase(fetchRulesSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRulesSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.rulesSummary = action.payload;
      })
      .addCase(fetchRulesSummary.rejected, (state) => {
        state.loading = false;
        state.error = true;
      })

      .addCase(fetchReportsSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReportsSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.reportsSummary = action.payload;
      })
      .addCase(fetchReportsSummary.rejected, (state) => {
        state.loading = false;
        state.error = true;
      });
  },
});

export default dashboardSlice.reducer;
