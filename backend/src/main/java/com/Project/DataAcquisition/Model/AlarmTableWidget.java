package com.Project.DataAcquisition.Model;

import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Represents an Alarm Table Widget.")
public class AlarmTableWidget extends Widget {

    public String[] getRtus() {
        return rtus;
    }

    public void setRtus(String[] rtus) {
        this.rtus = rtus;
    }

    public String[] getSensorTypes() {
        return sensorTypes;
    }

    public void setSensorTypes(String[] sensorTypes) {
        this.sensorTypes = sensorTypes;
    }

    public String[] getSensorIds() {
        return sensorIds;
    }

    public void setSensorIds(String[] sensorIds) {
        this.sensorIds = sensorIds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public DateRange getDateRange() {
        return dateRange;
    }

    public void setDateRange(DateRange dateRange) {
        this.dateRange = dateRange;
    }

    @Schema(description = "Name of the widget.")
    private String widgetName = "Alarm Table"; // Default value

    @Schema(description = "Array of RTU IDs associated with the alarm table.")
    private String[] rtus;

    @Schema(description = "Array of sensor types for the alarm table.")
    private String[] sensorTypes;

    @Schema(description = "Array of sensor IDs for the alarm table.")
    private String[] sensorIds;

    @Schema(description = "Status of the alarms in the table.")
    private String status;

    @Schema(description = "Severity level of the alarms in the table.")
    private String severity;

    @Schema(description = "Date range for the alarms in the table.")
    private DateRange dateRange;

    @Override
    public String getWidgetName() {
        return widgetName;
    }

    @Override
    public void setWidgetName(String widgetName) {
        this.widgetName = widgetName;
    }

    // Getters and Setters for other properties
    // ...
}