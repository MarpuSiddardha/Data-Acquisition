import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { ApiRule, Condition, CreateRuleApiRequest, Rule, RulesState } from "@/utils/types";
import { 
  updateRuleAPI, 
  viewRuleByIdAPI, 
  ruleTableAPI, 
  createRuleAPI, 
  deleteRuleAPI, 
  searchRules,
  getFilteredRules 
} from "@/services/api/apis";

const initialState: RulesState = {
  rules: [],
  selectedRule: null,
  isPopupOpen: false,
  isEditMode: false,
  isViewMode: false,
  loading: false,
  error: false,
  activationDelay: "",
  loadingSearch: false,
  searchResults: [],
  errorSearch: null,
  deleteSuccess: false,
  createSuccess: false,  
  updateSuccess: false, 
  filters: {
    priority: null,
    status: null,
    tags: null,
    rtuId: null
  }
};


export const createRuleAsync = createAsyncThunk(
  "rules/createRule",
  async (newRule: Omit<Rule, 'Rule_ID'>, { rejectWithValue }) => {
    try {
      const apiRule: CreateRuleApiRequest = {
        ruleName: newRule.Rule_Name,
        rtuId: newRule.RTU_ID,
        description: newRule.description,
        status: newRule.Status,
        priority: newRule.Priority,
        activationDelay: newRule.activationDelay,
        tags: newRule.Tags,
        conditions: newRule.Condition,
        rtuIds: newRule.selectedRTUs ? newRule.selectedRTUs : [newRule.RTU_ID]
      };
      const response = await createRuleAPI(apiRule);

      return {
        Rule_ID: response.ruleId,
        Rule_Name: response.ruleName,
        RTU_ID: response.rtuId,
        RTU_Name: response.rtuName || "Unknown RTU",
        description: response.description,
        Status: response.status,
        Priority: response.priority,
        Tags: response.tags,
        activationDelay: response.activationDelay,
        Last_Updated: response.lastUpdated,
        Condition: response.conditions || [],
        selectedRTUs: response.rtuIds || [response.rtuId]
      } as Rule;
    } catch (error: unknown) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }
    return rejectWithValue("An unknown error occurred");
  }
});

export const fetchData = createAsyncThunk(
  "rules/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const rulesData = await ruleTableAPI();
      if (!rulesData || rulesData.length === 0) {
        console.warn("API returned empty data");
        return [];
      }
      return rulesData.map((rule: any) => {
        return {
          Rule_ID: rule.id || rule.ruleId,
          Rule_Name: rule.ruleName,
          RTU_ID: rule.rtuId,
          RTU_Name: rule.rtuName,
          description: rule.description,
          Status: rule.status, 
          Priority: rule.priority,
          Tags: Array.isArray(rule.tags) 
          ? rule.tags 
          : (typeof rule.tags === 'string' 
              ? rule.tags.split(",").map((tag: string) => tag.trim())
              : []),
          activationDelay: rule.activationDelay || 0,
          Last_Updated: rule.lastUpdated,
          Condition: rule.conditions || []
        };
      }) as Rule[];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("API Error:", error.message);
        return rejectWithValue(error.message);
      }
      console.error("Unknown error:", error);
      return rejectWithValue("Failed to fetch rules");
    }
  }
);

export const updateRuleAsync = createAsyncThunk(
  "rules/updateRule",
  async (updateRule: Rule, { rejectWithValue }) => {
    try {
      console.log("Updating rule with frontend data:", updateRule);
      let rtuIdList: number[];
      if (updateRule.selectedRTUs && updateRule.selectedRTUs.length > 0) {
        rtuIdList = updateRule.selectedRTUs.map(id => Number(id));
      } else {
        rtuIdList = Array.isArray(updateRule.RTU_ID) 
          ? updateRule.RTU_ID.map(id => Number(id))
          : [Number(updateRule.RTU_ID)];
      }
      const apiRule = {
        ruleId: updateRule.Rule_ID,
        ruleName: updateRule.Rule_Name,
        description: updateRule.description,
        status: updateRule.Status,
        priority: updateRule.Priority,
        activationDelay: Number(updateRule.activationDelay),
        tags: updateRule.Tags,
        rtuId: rtuIdList, // Send as direct property, not nested
        conditions: updateRule.Condition.map(condition => ({
          sensorType: condition.sensorType,
          sensorId: condition.sensorId,
          operator: condition.operator,
          value: condition.value,
          function: condition.function,
          conditionOrder: condition.condition_order || 1,
          logicalOperator: condition.logicalOperator 
        }))
      };
      const response = await updateRuleAPI(updateRule.Rule_ID, apiRule);
      console.log("edit rules response:", response);
      // Convert API response back to frontend format
      const updatedRule: Rule = {
        Rule_ID: response.ruleId,
        Rule_Name: response.ruleName,
        RTU_ID: response.rtuId,
        RTU_Name: response.rtuName || "Unknown RTU",
        description: response.description,
        Status: response.status,
        Priority: response.priority,
        Tags: response.tags || [],
        activationDelay: response.activationDelay,
        Last_Updated: response.lastUpdated,
        Condition: response.conditions || [],
        selectedRTUs: response.rtuId 
      };
      console.log("Final updated rule object:", updatedRule);
      return updatedRule;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("API Error:", error.message);
        return rejectWithValue(error.message);
      }
      console.error("Unknown error:", error);
      return rejectWithValue("Failed to Update rule");
    }
  }
);


export const viewRuleAsync = createAsyncThunk(
  "rules/viewRule",
  async(ruleId: number, { rejectWithValue }) => {
    try {
      console.log("Fetching rule details for ID:", ruleId);
      const response = await viewRuleByIdAPI(ruleId);
      console.log("API response for rule details:", response);
      const transformedRule: Rule = {
        Rule_ID: response.ruleId,
        Rule_Name: response.ruleName,
        RTU_ID: response.rtuId, 
        RTU_Name: response.rtuName, 
        description: response.description,
        Status: response.status,
        Priority: response.priority,
        Tags: Array.isArray(response.tags) ? response.tags : [],
        activationDelay: response.activationDelay,
        Last_Updated: response.lastUpdated,
        Condition: Array.isArray(response.conditions) ? response.conditions.map((c:Condition) => ({
          sensorType: c.sensorType,
          sensorId: c.sensorId,
          operator: c.operator,
          value: c.value,
          function: c.function,
          logicalOperator: c.logicalOperator === null ? null : c.logicalOperator
        })) : []
      };
      console.log("Transformed rule for frontend:", transformedRule);
      return transformedRule;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("API Error:", error.message);
        return rejectWithValue(error.message);
      }
      console.error("Unknown error:", error);
      return rejectWithValue("Failed to View rule");
    }
  }
);



export const deleteRuleAsync = createAsyncThunk(
  "rules/deleteRule",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteRuleAPI(id)
      return id;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("API Error:", error.message);
        return rejectWithValue(error.message);
      }
      console.error("Unknown error:", error);
      return rejectWithValue("Failed to Delete rule");
    }
  }
);

export const searchRulesAsync = createAsyncThunk(
  'rules/searchRules',
  async ({ searchType, searchValue }:{ searchType: 'tags' | 'ruleId', searchValue: string }, { rejectWithValue }) => {
    try {
      const response = await searchRules(searchType, searchValue);
      console.log("search Value", response);
      return response;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("API Error:", error.message);
        return rejectWithValue(error.message);
      }
      console.error("Unknown error:", error);
      return rejectWithValue("Failed to Search rules");
    }
  }
);

// export const fetchFilteredRules = createAsyncThunk(
//   "rules/fetchFiltered",
//   async (filters: { priority?: string; status?: string; tags?: string; rtuId?: string }, { rejectWithValue }) => {
//     try {
//       const response = await getFilteredRules(filters);
//       if (!response || response.length === 0) {
//         console.warn("API returned empty data for filters");
//         return [];
//       }
//       return response.map((rule: ApiRule) => ({
//         Rule_ID: rule.id || rule.ruleId,
//         Rule_Name: rule.ruleName,
//         RTU_ID: rule.rtuId,
//         RTU_Name: rule.rtuName,
//         description: rule.description,
//         Status: rule.status, 
//         Priority: rule.priority,
//         Tags: Array.isArray(rule.tags) 
//           ? rule.tags 
//           : (typeof rule.tags === 'string' 
//               ? rule.tags.split(",").map((tag: string) => tag.trim())
//               : []),
//         activationDelay: rule.activationDelay || 0,
//         Last_Updated: rule.lastUpdated,
//         Condition: rule.conditions || []
//       })) as Rule[];
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         console.error("API Error:", error.message);
//         return rejectWithValue(error.message);
//       }
//       console.error("Unknown error:", error);
//       return rejectWithValue("Failed to Filter rules");
//     }
//   }
// );


export const fetchFilteredRules = createAsyncThunk(
  "rules/fetchFiltered",
  async (filter: { priority?: string; status?: string; tags?: string; rtuId?: string }, { rejectWithValue }) => {
    const searchParams = new URLSearchParams();
    if (filter.priority) searchParams.set('priority', filter.priority);
    if (filter.status) searchParams.set('status', filter.status);
    try {
      const response = await getFilteredRules(filter);
      if (!response || response.length === 0) {
        console.warn("API returned empty data for filters");
        return [];
      }
      return response.map((rule: ApiRule) => ({
        Rule_ID: rule.id || rule.ruleId,
        Rule_Name: rule.ruleName,
        RTU_ID: rule.rtuId,
        RTU_Name: rule.rtuName,
        description: rule.description,
        Status: rule.status, 
        Priority: rule.priority,
        Tags: Array.isArray(rule.tags) 
          ? rule.tags 
          : (typeof rule.tags === 'string' 
              ? rule.tags.split(",").map((tag: string) => tag.trim())
              : []),
        activationDelay: rule.activationDelay || 0,
        Last_Updated: rule.lastUpdated,
        Condition: rule.conditions || []
      })) as Rule[];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("API Error:", error.message);
        return rejectWithValue(error.message);
      }
      console.error("Unknown error:", error);
      return rejectWithValue("Failed to Filter rules");
    }
  }
);

const rulesSlice = createSlice({
  name: "rules",
  initialState,
  reducers: {
    // Add to your reducers section in rulesSlice
    clearSelectedRule: (state) => {
      state.selectedRule = null;
    },
    setRules: (state, action: PayloadAction<Rule[]>) => {
      state.rules = action.payload;
    },
    editRule: (state, action: PayloadAction<Rule>) => {
      const index = state.rules.findIndex((r) => r.Rule_ID === action.payload.Rule_ID);
      if (index !== -1) {
        state.rules[index] = action.payload;
      }
    },
    setSelectedRule: (state, action: PayloadAction<Rule | null>) => {
      // console.log("Before setting selectedRule:", action.payload);
      state.selectedRule = action.payload;
      // console.log("After setting selectedRule:", state.selectedRule);
      state.isViewMode = false;
    },
    setPopupOpen: (state, action: PayloadAction<boolean>) => {
      state.isPopupOpen = action.payload;
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.isEditMode = action.payload;
    },
    setViewMode: (state, action: PayloadAction<boolean>) => {
      state.isViewMode = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<{
      priority?: string | null;
      status?: string | null;
      tags?: string | null;
      rtuId?: string | null;
    }>) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    clearFilters: (state) => {
      state.filters = {
        priority: null,
        status: null,
        tags: null,
        rtuId: null
      };
    },
    clearDeleteStatus: (state) => {
      state.deleteSuccess = false;
    },
    clearCreateStatus: (state) => {
      state.createSuccess = false;
    },
    clearUpdateStatus: (state) => {
      state.updateSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder

    .addCase(createRuleAsync.pending, (state) => {
      state.loading = true;
    })
    .addCase(createRuleAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.rules.push(action.payload);
      state.isPopupOpen = false;
      state.createSuccess = true;
    })
    .addCase(createRuleAsync.rejected, (state) => {
      state.loading = false;
      state.error = true;
    })
    .addCase(viewRuleAsync.pending, (state) => {
      state.loading = true;
      state.error = true;
    })
    .addCase(viewRuleAsync.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedRule = action.payload; 
      state.isViewMode = true; 
      state.isPopupOpen = true; 
    })
    .addCase(fetchData.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchData.fulfilled, (state, action) => {
      state.loading = false;
      state.rules = action.payload;
    })
    .addCase(fetchData.rejected, (state) => {
      state.error = true;
      state.loading = false;
    })
    .addCase(updateRuleAsync.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateRuleAsync.fulfilled, (state, action) => {
      state.loading = false;
      const index = state.rules.findIndex(
        (r) => r.Rule_ID === action.payload.Rule_ID
      );
      if (index !== -1) {
        state.rules[index] = action.payload;
      }
      state.isPopupOpen = false;
      state.updateSuccess = true;
    })
    .addCase(updateRuleAsync.rejected, (state) => {
      state.loading = false;
      state.error = true;
    })
    .addCase(deleteRuleAsync.fulfilled, (state, action) => {
      state.rules = state.rules.filter(
        (rule) => rule.Rule_ID !== action.payload
      );
      state.deleteSuccess = true;
    })
    .addCase(fetchFilteredRules.pending, (state) => {
      state.loading = true;
    })
    .addCase(fetchFilteredRules.fulfilled, (state, action) => {
      state.loading = false;
      state.rules = action.payload;
    })
    .addCase(fetchFilteredRules.rejected, (state) => {
      state.loading = false;
      state.error = true;
    })
    .addCase(searchRulesAsync.pending, (state) => {
      state.loadingSearch = true;
      state.errorSearch = null;
      // state.noResultsFound = false;
    })
    .addCase(searchRulesAsync.fulfilled, (state, action) => {
      state.loadingSearch = false;
      state.rules = action.payload;
      //  if (!action.payload || (Array.isArray(action.payload) && action.payload.length === 0)) {
      //   state.noResultsFound = true;
      //   state.rules = []; // Clear rules when no results
      // } else {
      //   state.noResultsFound = false;
      //   state.rules = action.payload;
      // }
    })
  
    .addCase(searchRulesAsync.rejected, (state,action) => {
      state.loadingSearch = false;
      state.errorSearch = action.error.message || "Search Failed";
      // state.noResultsFound = true;
      // state.rules = [];
    });
    
  },
});

export const {
  editRule,
  setRules,
  setSelectedRule,
  setPopupOpen,
  setEditMode,
  setViewMode,
  setFilters,
  clearFilters,
  clearSelectedRule,
  clearDeleteStatus,
  clearCreateStatus,
  clearUpdateStatus
} = rulesSlice.actions;
export default rulesSlice.reducer;