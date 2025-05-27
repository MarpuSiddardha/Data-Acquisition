import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getScheduledReports, deleteActiveReport } from "@/services/api/apis";
import { ScheduledReport } from "@/utils/types";

export const fetchScheduledReports = createAsyncThunk(
  "scheduled/fetchScheduledReports",
  async () => {
    const response = await getScheduledReports();
    console.log("Scheduled REports: ", response)
    return response;
  }
);

export const deleteSchedule = createAsyncThunk(
  "scheduled/deleteSchedule",
  async (id: number) => {
    const response = await deleteActiveReport(id);
    console.log("deleted", response);
    return response;
  }
);

const scheduledSlice = createSlice({
  name: "scheduled",
  initialState: {
    scheduledReportsData: [] as ScheduledReport[],
    loadingScheduledReports: false,
    errorScheduledReports: false,
    deleteSuccess: false
  },
  reducers: {
    clearDeleteStatus: (state) => {
      state.deleteSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchScheduledReports.pending, (state) => {
        state.loadingScheduledReports = true;
      })
      .addCase(fetchScheduledReports.fulfilled, (state, action) => {
        state.loadingScheduledReports = false;
        state.errorScheduledReports = false;
        state.deleteSuccess = false;
        state.scheduledReportsData = action.payload;
      })
      .addCase(fetchScheduledReports.rejected, (state) => {
        state.loadingScheduledReports = false;
        state.errorScheduledReports = true;
      })
      .addCase(deleteSchedule.fulfilled, (state) => {
        state.deleteSuccess = true;
      })
  },
});

export const { clearDeleteStatus } = scheduledSlice.actions;
export default scheduledSlice.reducer;