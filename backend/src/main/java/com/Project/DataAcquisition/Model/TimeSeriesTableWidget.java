package com.Project.DataAcquisition.Model;

import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Represents a Time Series Table Widget.")
public class TimeSeriesTableWidget extends Widget {

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

    @Schema(description = "Name of the widget.")
    private String widgetName = "Time Series Table"; // Default value

    @Schema(description = "Array of RTU IDs associated with the time series table.")
    private String[] rtus;

    @Schema(description = "Array of sensor types for the time series table.")
    private String[] sensorTypes;

    @Schema(description = "Array of sensor IDs for the time series table.")
    private String[] sensorIds;

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