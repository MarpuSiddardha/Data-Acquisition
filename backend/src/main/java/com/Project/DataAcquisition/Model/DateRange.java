package com.Project.DataAcquisition.Model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Represents a date range for data filtering.")
public class DateRange {

    @Schema(description = "Start date of the range.")
    private String startDate;

    @Schema(description = "End date of the range.")
    private String endDate;

    public DateRange(String startDate, String endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
// Getters and Setters
    // ...
}