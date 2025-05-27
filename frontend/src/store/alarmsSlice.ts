import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAlarms, updateAlarm, getAlarmBySearch } from "@/services/api/apis";
import { AlarmFilters, Alarm } from "@/utils/types";

export const fetchAlarms = createAsyncThunk(
  "alarms/fetchAlarms",
  async (filters: AlarmFilters) => {
    const response = await getAlarms(filters);
    return response;
  }
);

export const updateAlarmStatus = createAsyncThunk(
  "alarms/updateAlarmStatus",
  async ({ alarmId, status }: { alarmId: number; status: string }) => {
    const response = await updateAlarm(alarmId, { status });
    if (!response) {
      throw new Error("Failed to update the alarm status.");
    }
    return { alarmId, status };
  }
);

export const updateAlarmDescription = createAsyncThunk(
  "alarms/updateAlarmDescription",
  async ({ alarmId, description }: { alarmId: number; description: string }) => {
    const response = await updateAlarm(alarmId, { description });
    if (!response) {
      throw new Error("Failed to update the alarm description.");
    }
    return { alarmId, description };
  }
);

export const searchAlarm = createAsyncThunk(
  "alarms/searchAlarms",
  async (q: string) => {
    const response = await getAlarmBySearch(q);

    return response;
  }
);

const alarmsSlice = createSlice({
  name: "alarms",
  initialState: {
    alarmsData: [] as Alarm[],
    loadingAlarms: false,
    errorAlarms: false,
    loadingSearch: false,
    searchedAlarms: [],
    updateSuccess: false,
    updateError: false,
    errorSearch: false,
  },
  reducers: {
    clearUpdateStatus: (state) => {
      state.updateSuccess = false;
    },
    clearErrorStatus: (state) => {
      state.updateError = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlarms.pending, (state) => {
        state.loadingAlarms = true;
      })
      .addCase(fetchAlarms.fulfilled, (state, action) => {
        state.loadingAlarms = false;
        state.alarmsData = action.payload;
        state.searchedAlarms = [];
      })
      .addCase(fetchAlarms.rejected, (state) => {
        state.loadingAlarms = false;
        state.errorAlarms = true;
      })
      .addCase(updateAlarmStatus.fulfilled, (state, action) => {
        const { alarmId, status } = action.payload;
        state.updateSuccess = true;
        state.updateError = false;
        const alarmIndex = state.alarmsData.findIndex((alarm) => alarm.alarmId === alarmId);
        if (alarmIndex !== -1) {
          state.alarmsData[alarmIndex].status = status as "Active" | "Closed" | "Acknowledged";
        }
      })
      .addCase(updateAlarmStatus.rejected, (state, action) => {
        console.log("Error occurred", action);
        state.updateSuccess = false;
        state.updateError = true;
      })
      .addCase(updateAlarmDescription.fulfilled, (state, action) => {
        const { alarmId, description } = action.payload;
        state.updateSuccess = true;
        state.updateError = false;
        const alarmIndex = state.alarmsData.findIndex((alarm) => alarm.alarmId === alarmId);
        if (alarmIndex !== -1) {
          state.alarmsData[alarmIndex].description = description as string;
        }
      })
      .addCase(updateAlarmDescription.rejected, (state, action) => {
        console.log("Error occurred", action);
        state.updateSuccess = false;
        state.updateError = true;
      })
      .addCase(searchAlarm.pending, (state) => {
        state.loadingAlarms = true;
        state.errorAlarms = false;
      })
      .addCase(searchAlarm.fulfilled, (state, action) => {
        state.loadingAlarms = false;
        state.searchedAlarms = action.payload; 

      })
      .addCase(searchAlarm.rejected, (state) => {
        state.loadingAlarms = false;
        state.errorAlarms = true;
      });
  },
});

export const {
  clearUpdateStatus,
  clearErrorStatus
} = alarmsSlice.actions;

export default alarmsSlice.reducer;