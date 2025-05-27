import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getLayouts, getLayout, filterLayouts } from "@/services/api/apis";
import axios from "axios";
import { layoutData } from "@/utils/types";

export interface ReportData {
  id: number;
  layoutName: string;
  layoutType: string;
  createdAt: string;
}

interface ReportsState {
  LayoutsData: ReportData[];
  layout: layoutData | null;
  loading: boolean;
  error: string | null;
  loadingSearch: boolean;
  searchResults: ReportData[];
  errorSearch: string | null;
}

const initialState: ReportsState = {
  LayoutsData: [],
  layout: null,
  loading: false,
  error: null,
  loadingSearch: false,
  searchResults: [],
  errorSearch: null,
};

export const fetchLayoutsReports = createAsyncThunk(
  "Layouts/fetchLayoutsReports",
  async () => {
    const response = await getLayouts();
    return response;
  }
);

export const fetchFilteredLayouts = createAsyncThunk(
  "reports/fetchFilteredLayouts",
  async (filters: {
    layoutType: string;
    startDate: string;
    endDate: string;
    layoutName: string;
  }) => {
    const response = await filterLayouts(filters);
    return response;
  }
);

export const saveLayout = createAsyncThunk(
  "Layouts/saveLayout",
  async (layoutData: layoutData) => {
    const response = await axios.post(
      "http://localhost:8091/api/layouts",
      layoutData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }
);

export const fetchLayout = createAsyncThunk(
  "Layouts/fetchLayout",
  async (layoutId: string) => {
    const response = await getLayout(layoutId);
    return response;
  }
);

export const updateLayout = createAsyncThunk(
  "Layouts/updateLayout",
  async ({
    layoutId,
    updatedLayout,
  }: {
    layoutId: string;
    updatedLayout: layoutData;
  }) => {
    const response = await axios.put(
      `http://localhost:8091/api/layouts/${layoutId}`,
      updatedLayout,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  }
);

export const searchLayoutsByName = createAsyncThunk(
  "layouts/searchLayouts",
  async (q: string) => {
    const response = await axios.get("http://localhost:8091/api/layouts/search", {
      params: { q },
    });
    return response.data;
  }
);

const layoutsSlice = createSlice({
  name: "layouts",
  initialState,
  reducers: {
    addWidget: (state, action) => {
      if (state.layout) {
        state.layout.widgets.push(action.payload);
      }
    },
    removeWidget: (state, action) => {
      if (state.layout) {
        state.layout.widgets = state.layout.widgets.filter(
          (_, index) => index !== action.payload
        );
      }
    },
    setLayoutName: (state, action) => {
      if (state.layout) {
        state.layout.layoutName = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLayoutsReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLayoutsReports.fulfilled, (state, action) => {
        state.loading = false;
        state.LayoutsData = action.payload;
      })
      .addCase(fetchLayoutsReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch reports";
      })
      .addCase(fetchFilteredLayouts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilteredLayouts.fulfilled, (state, action) => {
        state.loading = false;
        state.LayoutsData = action.payload;
      })
      .addCase(fetchFilteredLayouts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed to fetch filtered Layouts";
      })
      .addCase(saveLayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveLayout.fulfilled, (state, action) => {
        state.loading = false;
        state.LayoutsData.push(action.payload);
      })
      .addCase(saveLayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to save layout";
      })
      .addCase(fetchLayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLayout.fulfilled, (state, action) => {
        state.loading = false;
        state.layout = action.payload;
      })
      .addCase(fetchLayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch layout";
      })
      .addCase(updateLayout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLayout.fulfilled, (state, action) => {
        state.loading = false;
        state.layout = action.payload;
      })
      .addCase(updateLayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to update layout";
      })
      .addCase(searchLayoutsByName.pending, (state) => {
        state.loadingSearch = true;
        state.errorSearch = null;
      })
      .addCase(searchLayoutsByName.fulfilled, (state, action) => {
        state.loadingSearch = false;
        state.searchResults = action.payload;
      })
      .addCase(searchLayoutsByName.rejected, (state, action) => {
        state.loadingSearch = false;
        state.errorSearch = action.error.message || "Search failed";
      });
  },
});

export default layoutsSlice.reducer;
