package com.Project.DataAcquisition.Model;

import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Represents a Value Card Widget.")
public class ValueCardWidget extends Widget {

    @Schema(description = "Name of the widget.")
    private String widgetName = "Value Card"; // Default value

    @Schema(description = "Title of the value card.")
    private String title;

    @Schema(description = "RTU ID associated with the value card.")
    private String rtuId;

    @Schema(description = "Type of sensor for the value card.")
    private String sensorType;

    @Schema(description = "Sensor ID for the value card.")
    private String sensorId;

    @Schema(description = "Units of measurement for the value card.")
    private String units;

    @Schema(description = "Array of aggregation methods for the value card.")
    private String[] aggregationMethods;

    @Schema(description = "Date for the value card.")
    private String date;

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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getRtuId() {
        return rtuId;
    }

    public void setRtuId(String rtuId) {
        this.rtuId = rtuId;
    }

    public String getSensorType() {
        return sensorType;
    }

    public void setSensorType(String sensorType) {
        this.sensorType = sensorType;
    }

    public String getSensorId() {
        return sensorId;
    }

    public void setSensorId(String sensorId) {
        this.sensorId = sensorId;
    }

    public String getUnits() {
        return units;
    }

    public void setUnits(String units) {
        this.units = units;
    }

    public String[] getAggregationMethods() {
        return aggregationMethods;
    }

    public void setAggregationMethods(String[] aggregationMethods) {
        this.aggregationMethods = aggregationMethods;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }
}