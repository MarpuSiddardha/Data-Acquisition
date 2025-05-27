import axios from "axios";
import {
  AlarmsSummary,
  RulesSummary,
  ReportsSummary,
  Rule,
  AlarmFilters,
  CreateRuleApiRequest,
  layoutData,
  ApiRule,
} from "@/utils/types";

export const api = axios.create({
  baseURL: "http://localhost:8091/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/* Dashboard APIs */
export const getAlarmsSummary = async (): Promise<AlarmsSummary> => {
  const response = await api.get<AlarmsSummary>(
    "/dashboard/alarms-summary"
  );
  return response.data;
};

export const getRulesSummary = async (): Promise<RulesSummary> => {
  const response = await api.get<RulesSummary>(
    "/dashboard/rules-summary"
  );
  return response.data;
};

export const getReportsSummary = async (): Promise<ReportsSummary> => {
  const response = await api.get<ReportsSummary>(
    "/dashboard/reports-summary"
  );
  return response.data;
};

/* Alarms APIs */
export const getAlarms = async (filters: AlarmFilters) => {
  try {
    const params: Record<string, string> = {};
    if (filters.severity) params.severity = filters.severity;
    if (filters.status) params.status = filters.status;

    const response = await api.get("/alarms", {
      params,
    });

    return response.status === 204 ? [] : response.data;
  } catch (error) {
    console.error("Error fetching alarms:", error);
    return [];
  }
};

export const getAlarmById = async (alarmId: number) => {
  const response = await api.get(
    `/alarms/${alarmId}`
  );
  return response.data;
};

export const getAlarmBySearch = async (q: string) => {
  const response = await api.get(`/alarms/search?q=${q}`);
  return response.data;
};

export const updateAlarm = async (
  alarmId: number,
  data: { status?: string; description?: string }
) => {
  const response = await api.put(
    `/alarms/${alarmId}`,
    data
  );
  return response.data;
};

/* Layouts APIs */

export const getLayouts = async () => {
  const response = await api.get("/layouts");
  return response.data;
};

export const getLayout = async (layoutId: string | number) => {
  const response = await api.get(
    `/layouts/${layoutId}`
  );
  return response.data;
};

export const updateLayout = async (
  layoutId: string | number,
  updatedLayout: layoutData
) => {
  try {
    const response = await api.put(
      `/layouts/${layoutId}`,
      updatedLayout
    );
    return response.data;
  } catch (error) {
    console.error("Error updating layout:", error);
    throw error;
  }
};

export const filterLayouts = async (filters: {
    layoutType: string;
    startDate: string;
    endDate: string;
    layoutName: string;
  }) => {
  const { startDate, endDate, layoutType, layoutName } = filters;
  const response = await api.get("/layouts/filters",{
        params: {
          layoutType: layoutType,
          layoutName: layoutName,
          startDate,
          endDate,
        },
      });
  return response.data;
};

/* Reports APIs */
export const getManualReports = async () => {
  const response = await axios.get("http://localhost:8091/manual-reports");
  return response.data;
};

export const getScheduledReports = async () => {
  const response = await axios.get(
    `http://localhost:8091/reports/all-schedules`
  );
  return response.data;
};

export const deleteActiveReport = async (id: number) => {
  const response = await axios.delete(
    `http://localhost:8091/reports/${id}`
  );
  return response.data
}

export const getAutomatedReports = async () => {
  const response = await axios.get(
    "http://localhost:8091/api/automated-reports"
  );
  return response.data;
};

export const getLayoutNames = async () => {
  const response = await axios.get(
    "http://localhost:8091/manual-reports/layouts"
  );
  return response.data;
};

export const getAlarm = async () => {
  try {
    const response = await axios.get(
      "http://localhost:8091/automated-reports/automatedreportdetails"
    );

    // Extract widgets from layout
    const widgets = response.data?.layout?.widgets || [];

    // Find the Alarm Table widget
    const alarmTableWidget = widgets.find(
      (widget: { widgetName: string; data?: { rows?: any[] } }) =>
        widget.widgetName === "Alarm Table"
    );

    return alarmTableWidget?.data?.rows || []; // Return extracted rows
  } catch (error) {
    console.error("Error getting alarm data", error);
    throw error;
  }
};

export const viewautomatedreport = async (reportId: number) => {
  const response = await axios.get(
    `http://localhost:8091/api/automated-reports/${reportId}`
  );
  return response.data;
};

/* Rules APIs */
// Get Rule table
export const ruleTableAPI = async (): Promise<Rule[]> => {
  const response = await axios.get("http://localhost:8091/api/rules");
  return response.data;
};

//To Create Rule
export const createRuleAPI = async (rule: CreateRuleApiRequest) => {
  try {
    const rtuIdList = Array.isArray(rule.rtuIds)
      ? rule.rtuIds.flat().map((id) => Number(id))
      : [Number(rule.rtuId)];
    const requestData = {
      ruleName: rule.ruleName,
      description: rule.description,
      status: rule.status,
      priority: rule.priority,
      activationDelay: Number(rule.activationDelay),
      tags: rule.tags,
      rtuId: rtuIdList,
      conditions: rule.conditions.map((condition) => ({
        sensorType: condition.sensorType,
        sensorId: condition.sensorId,
        operator: condition.operator,
        value: condition.value,
        function: condition.function,
        conditionOrder: condition.condition_order || 1,
        logicalOperator: condition.logicalOperator || null,
      })),
    };
    const response = await axios.post(
      "http://localhost:8091/api/rules",
      requestData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating rule:", error);
    throw error;
  }
};

//Delete Rule
export const deleteRuleAPI = async (Rule_ID: number) => {
  const response = await axios.delete(
    `http://localhost:8091/api/rules/${Rule_ID}`
  );
  return response.data;
};

// Get a rule by ID
export const viewRuleByIdAPI = async (ruleId: number) => {
  try {
    const response = await axios.get(
      `http://localhost:8091/api/rules/${ruleId}`
    );
    return response.data;
  } catch (error) {
    console.log("Error in view from api side:", error);
    throw error;
  }
};

//Update Rule
export const updateRuleAPI = async (
  ruleId: number,
  updatedRule: Partial<Rule>
) => {
  try {
    const response = await axios.put(
      `http://localhost:8091/api/rules/${ruleId}`,
      updatedRule
    );
    return response.data;
  } catch (error) {
    console.error("Error updating rule:", error);
    throw error;
  }
};

// Get all RTUs
export const getRTUs = async () => {
  try {
    const response = await axios.get("http://localhost:8091/api/rtu");
    return response.data;
  } catch (error) {
    console.error("Error fetching RTU data:", error);
    throw error;
  }
};

// Fetch RTU by ID
export const getRTUById = async (rtuId: string | number) => {
  try {
    const response = await axios.get(`http://localhost:8091/api/rtus/${rtuId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching RTU with ID ${rtuId}:`, error);
    throw error;
  }
};

//Search Rules
export const searchRules = async (
  searchType: "tags" | "ruleId",
  searchValue: string
) => {
  try {
    const params =
      searchType === "tags" ? { tags: searchValue } : { ruleId: searchValue };

    const response = await axios.get("http://localhost:8091/api/rules/search", {
      params,
    });

    const rulesData = Array.isArray(response.data)
      ? response.data
      : response.data?.data ||
        response.data?.rules ||
        response.data?.results ||
        [];
    if (!rulesData || rulesData.length === 0) {
      console.log("No matching rules found");
      return [];
    }

    return response.data.map((rule: ApiRule) => ({
      Rule_ID: rule.id || rule.ruleId,
      Rule_Name: rule.ruleName,
      RTU_ID: rule.rtuId,
      RTU_Name: rule.rtuName,
      description: rule.description,
      Status: rule.status,
      Priority: rule.priority,
      Tags: Array.isArray(rule.tags)
        ? rule.tags
        : typeof rule.tags === "string"
          ? rule.tags.split(",").map((tag: string) => tag.trim())
          : [],
      activationDelay: rule.activationDelay || 0,
      Last_Updated: rule.lastUpdated,
      Condition: rule.conditions || [],
    }));
  } catch (error) {
    console.error("Error searching rules:", error);
    throw error;
  }
};

//Filters Active & Paused
export const getFilteredRules = async (params?: {
  priority?: string;
  status?: string;
  tags?: string;
  rtuId?: string;
}) => {
  const response = await axios.get("http://localhost:8091/api/rules/filter", {
    params,
  });
  return response.data;
};
