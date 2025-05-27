package com.Project.DataAcquisition.Model;

import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Represents a Line Chart Widget.")
public class LineChartWidget extends Widget {

    @Schema(description = "Type of the widget.")
    private String widgetName = "Line Chart"; // Default value

    @Schema(description = "Title of the line chart.")
    private String title;

    @Schema(description = "Array of RTU IDs associated with the line chart.")
    private String[] rtuIds;

    @Schema(description = "Array of sensors used in the line chart.")
    private Sensor[] sensors;

    @Schema(description = "Date range for the data displayed in the line chart.")
    private DateRange date;

    @Schema(description = "Show values configuration for the line chart.")
    private ShowValues showValues;

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
// Getters and Setters for other properties
    // ...
}