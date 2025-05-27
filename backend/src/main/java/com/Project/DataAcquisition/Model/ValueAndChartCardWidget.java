package com.Project.DataAcquisition.Model;


import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Represents a Value and Chart Card Widget.")
public class ValueAndChartCardWidget extends Widget {

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCardType() {
        return cardType;
    }

    public void setCardType(String cardType) {
        this.cardType = cardType;
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

    @Schema(description = "Type of the widget.")
    private String widgetName = "Value and Chart Card"; // Default value

    @Schema(description = "Title of the value and chart card.")
    private String title;

    @Schema(description = "Type of the card.")
    private String cardType;

    @Schema(description = "RTU ID associated with the value and chart card.")
    private String rtuId;

    @Schema(description = "Type of sensor for the value and chart card.")
    private String sensorType;

    @Schema(description = "Sensor ID for the value and chart card.")
    private String sensorId;

    @Schema(description = "Units of measurement for the value and chart card.")
    private String units;

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