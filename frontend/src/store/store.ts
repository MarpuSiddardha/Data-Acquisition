import { configureStore } from "@reduxjs/toolkit";
import dashboardReducer from "@/store/dashboardSlice";
import alarmsReducer from "@/store/alarmsSlice";
import automatedReportsReducer from "@/store/automatedReportsSlice";
import manualReportsReducer from "@/store/ManualReportsSlice";
import layoutsReducer from "@/store/layoutsSlice";
import rulesReducer from "@/store/rulesSlice";
import scheduledReportsReducer from "@/store/scheduledSlice";

export const store = configureStore({
  reducer: {
    dashboard: dashboardReducer,
    alarms: alarmsReducer,
    rules: rulesReducer,
    automatedReports: automatedReportsReducer,
    manualReports: manualReportsReducer,
    layouts:layoutsReducer,
    scheduledReports: scheduledReportsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;