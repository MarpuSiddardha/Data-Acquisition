package com.Project.DataAcquisition.Model;

import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Represents a Time Series Chart Widget.")
public class TimeSeriesChartWidget extends Widget {

    @Schema(description = "Type of the widget.")
    private String widgetName = "Time Series Chart"; // Default value

    @Schema(description = "Title of the time series chart.")
    private String title;

    @Schema(description = "Array of RTU IDs associated with the time series chart.")
    private String[] rtuIds;

    @Schema(description = "Array of sensors used in the time series chart.")
    private Sensor[] sensors;

    @Override
    public String getWidgetName() {
        return widgetName;
    }

    @Override
    public void setWidgetName(String widgetName) {
        this.widgetName = widgetName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String[] getRtuIds() {
        return rtuIds;
    }

    public void setRtuIds(String[] rtuIds) {
        this.rtuIds = rtuIds;
    }

    public Sensor[] getSensors() {
        return sensors;
    }

    public void setSensors(Sensor[] sensors) {
        this.sensors = sensors;
    }
// Getters and Setters for other properties
    // ...
}