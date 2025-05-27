package com.Project.DataAcquisition.DTO.Reports.Manual;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request body to update schedule details for a report")
public class UpdateScheduleRequest {

    @Schema(description = "Scheduling frequency (e.g., hourly, daily)", example = "daily")
    private String frequency;

    @Schema(description = "Start date for scheduling")
    private String startDate;

    @Schema(description = "End date for scheduling")
    private String endDate;

    // Getters and setters

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
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
}
