import { ReactNode, Dispatch, SetStateAction } from "react";

/* Context Type Definitions */

export type ContextProviderProps = {
  children: ReactNode;
};

export type SidebarContextType = {
  isSidebarOpen: boolean;
  isSmall: boolean;
  handleToggle: () => void;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

/* Dashboard Type Definitions */

export type AlarmsSummary = {
  chartInfo: {
    active: number;
    acknowledged: number;
    closed: number;
    total: number;
  };
  status: {
    high: number;
    moderate: number;
    low: number;
  };
};

export type RulesSummary = {
  chartInfo: {
    active: number;
    paused: number;
    total: number;
  };
  status: {
    high: number;
    moderate: number;
    low: number;
  };
};

export type ReportsSummary = {
  chartInfo: {
    manual: number;
    cheduled: number;
    total: number;
  };
};

/* Alarm Type Definition */

export type Alarm = {
  alarmId: number;
  createdAt: string;
  alarmName: string;
  sensorId: string[];
  ruleId: number;
  severity: "Low" | "Moderate" | "High";
  type: string[];
  status: "Active" | "Closed" | "Acknowledged";
  acknowledgedBy: string | "NA";
  acknowledgedAt: string | "NA";
  description: string;
  tags: string[];
  action: string;
};

export type AlarmFilters = {
  severity?: string;
  status?: string;
  search?: string;
};

export type AlarmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  alarmProp: Alarm;
};

export type EditAlarmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  alarm: Alarm;
};

/* Reports and Analytics Type Definitions */

/* Layout Type Definitions */

export type ReportData = {
  id: number;
  layoutName: string;
  layoutType: string;
  createdAt: string;
}
export type TableProps = {
  data: ReportData[];
  error: string | null;
}

export type Widget = {
  widgetName: string;
  widgetType: string;
}

export type WidgetBundleDialogProps = {
  open: boolean;
  onClose: () => void;
  onWidgetSelect: (widgetType: string, widgetName: string) => void;
}

export type WidgetType = {
  widgetType: string;
  widgetName: string[];
}

export type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

export type AutomatedReportData = {
  reportId: number;
  reportType: string;
  frequency: string;
  generatedDateTime: string;
};

export type ReportsState = {
  Automated_Reports_data: AutomatedReportData[];
  loading: boolean;
  error: string | null;
};

export type ManualReportData = {
  report_id: number;
  reportType: string;
  scheduleStatus: string;
  description: string;
  generatedDateTime: string;
};

type widgetData = { widgetType: string; widgetName: string };
export type layoutData = {
  layoutName: string;
  layoutType: string;
  widgets: widgetData[];
};

export type LayoutReportData = {
  id: number;
  layoutName: string;
  layoutType: string;
  createdAt: string;
};

export type LayoutReportsState = {
  LayoutsData: LayoutReportData[];
  loading: boolean;
  error: boolean | false;
};

interface AlarmRow {
  alarmId: number;
  sensorId: string[];
  status: string;
  alarmName: string;
}

export type WidgetData = {
  rtus: string[];
  title: string;
  status: string[];
  sensors: {
    Type: string[];
    sensorId: string[];
  }[];
  severity: string[];
  alarmTableData: AlarmRow[];
  date: {
    startDate: string;
    endDate: string;
  };
};

export type ScheduledReport = {
  reportId: number;
  startDate: string;
  isActive: boolean;
  endDate: string;
  frequency: string;
}
/* Rule Type Definitions */

export type ApiRule = {
  id?: number;
  ruleId?: number;
  ruleName: string;
  rtuId: string | string[];
  rtuName: string;
  description: string;
  status: string;
  priority: string;
  tags?: string | string[];
  activationDelay?: number;
  lastUpdated: string;
  conditions?: Condition[];
  selectedRTUs?: string[];
};

export type RtuApiResponse = {
  rtuId: string;
  rtuName: string;
  sensors: SensorApiResponse[];
};

export type SensorApiResponse = {
  type?: string;
  sensorType?: string;
  sensor_type?: string;
  sensorId?: string;
  id?: string;
  sensor_id?: string;
  ID?: number;
};

export type CreateRuleApiRequest = {
  ruleName: string;
  rtuId: string | string[];
  description: string;
  status: string;
  priority: string;
  activationDelay: number;
  tags: string[];
  conditions: Condition[];
  rtuIds?: (string | string[])[];
};

export type Rule = {
  Rule_ID: number;
  Rule_Name: string;
  RTU_ID: string | string[]; // Updated to handle single string or array of strings
  RTU_Name: string;
  description: string;
  Status: string;
  Priority: string;
  Tags: string[];
  activationDelay: number;
  Last_Updated: string;
  Condition: Condition[];
  selectedRTUs?: string[]; // New field to store all selected RTUs
};

export type Sensor = {
  id: string | number;
  name: string | number;
};

export type RTUData = {
  RTU_Name: string;
  RTU_ID: string | number;
  Sensors: {
    [key: string]: string[];
  };
};

export type RulesTableProps = {
  filteredRules: Rule[];
  handleDelete: (Rule_ID: number) => void;
  handleEditRule: (rule: Rule) => void;
};

export type FiltersProps = {
  className?: string;
};

type SensorType = "Temperature" | "Humidity" | "Pressure";

export type Condition = {
  sensorType: SensorType | "";
  sensorId: string;
  operator: string;
  value: string;
  function: string;
  condition_order?: number;
  logicalOperator?: "AND" | "OR" | null;
};

export type RulesState = {
  rules: Rule[];
  selectedRule: Rule | null;
  isPopupOpen: boolean;
  isEditMode: boolean;
  isViewMode: boolean;
  loading: boolean;
  error: boolean;
  activationDelay: string;
  loadingSearch: boolean;
  searchResults: Rule[];
  deleteSuccess: boolean;
  createSuccess: boolean;
  updateSuccess: boolean;
  errorSearch: string | null;
  filters: {
    priority: string | null;
    status: string | null;
    tags: string | null;
    rtuId: string | null;
  };
};

export type PopupProps = {
  open: boolean;
  onClose: () => void;
};
