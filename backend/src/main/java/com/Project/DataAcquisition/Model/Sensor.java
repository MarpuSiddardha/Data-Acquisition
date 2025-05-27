package com.Project.DataAcquisition.Model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Represents a sensor used in widgets.")
public class Sensor {

    @Schema(description = "Type of the sensor.")
    private String sensortype;

    @Schema(description = "Unique identifier for the sensor.")
    private String sensorid;

    @Schema(description = "YAxis of the sensor in the UI.")
    private String yAxis;

    @Schema(description = "Color associated with the sensor.")
    private String color;

    public String getSensortype() {
        return sensortype;
    }

    public void setSensortype(String sensortype) {
        this.sensortype = sensortype;
    }

    public String getSensorid() {
        return sensorid;
    }

    public void setSensorid(String sensorid) {
        this.sensorid = sensorid;
    }

    public String getyAxis() {
        return yAxis;
    }

    public void setyAxis(String yAxis) {
        this.yAxis = yAxis;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Sensor(String sensortype, String sensorid, String yAxis , String color) {
        this.sensortype = sensortype;
        this.sensorid = sensorid;
        this.yAxis = yAxis;
        this.color = color;
    }

// Getters and Setters
    // ...
}