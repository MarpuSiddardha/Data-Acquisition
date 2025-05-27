package com.Project.DataAcquisition.DTO.Reports.Layout;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class LayoutRequest {
    private String layoutName;  // Must match JSON key
    private String layoutType;
    private List<WidgetRequest> widgets;

    @Getter
    @Setter
    public static class WidgetRequest {
        private Long widgetId;
        private String widgetType;  // Optional: only if JSON contains it
        private String widgetName;  // Optional
        private Map<String, Object> data;  // Optional
    }


}

