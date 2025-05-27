package com.Project.DataAcquisition.Model;

import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Represents a Bar Chart Widget.")
public class BarChartWidget extends Widget {

    @Schema(description = "Type of the widget.")
    private String widgetName = "Bar Chart"; // Default value

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

    public DateRange getDate() {
        return date;
    }

    public void setDate(DateRange date) {
        this.date = date;
    }

    public ShowValues getShowValues() {
        return showValues;
    }

    public void setShowValues(ShowValues showValues) {
        this.showValues = showValues;
    }

    @Schema(description = "Title of the bar chart.")
    private String title;

    @Schema(description = "Array of RTU IDs associated with the bar chart.")
    private String[] rtuIds;

    @Schema(description = "Array of sensors used in the bar chart.")
    private Sensor[] sensors;

    @Schema(description = "Date range for the data displayed in the bar chart.")
    private DateRange date;

    @Schema(description = "Show values configuration for the bar chart.")
    private ShowValues showValues;

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