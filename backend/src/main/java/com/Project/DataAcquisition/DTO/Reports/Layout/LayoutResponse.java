package com.Project.DataAcquisition.DTO.Reports.Layout;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class LayoutResponse {

    private Long layoutId;
    private String layoutName;
    private String layoutType;
    private LocalDateTime createdAt;
    private List<WidgetResponse> widgets;

    public static class WidgetResponse {
        private Long widgetId;
        private String widgetType;
        private String widgetName;
        private Map<String, Object> data;

        // Getters and Setters
        public Long getWidgetId() {
            return widgetId;
        }

        public void setWidgetId(Long widgetId) {
            this.widgetId = widgetId;
        }

        public String getWidgetType() {
            return widgetType;
        }

        public void setWidgetType(String widgetType) {
            this.widgetType = widgetType;
        }

        public String getWidgetName() {
            return widgetName;
        }

        public void setWidgetName(String widgetName) {
            this.widgetName = widgetName;
        }

        public Map<String, Object> getData() {
            return data;
        }

        public void setData(Map<String, Object> data) {
            this.data = data;
        }
    }

    // Getters and Setters
    public Long getLayoutId() {
        return layoutId;
    }

    public void setLayoutId(Long layoutId) {
        this.layoutId = layoutId;
    }

    public String getLayoutName() {
        return layoutName;
    }

    public void setLayoutName(String layoutName) {
        this.layoutName = layoutName;
    }

    public String getLayoutType() {
        return layoutType;
    }

    public void setLayoutType(String layoutType) {
        this.layoutType = layoutType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<WidgetResponse> getWidgets() {
        return widgets;
    }

    public void setWidgets(List<WidgetResponse> widgets) {
        this.widgets = widgets;
    }
}