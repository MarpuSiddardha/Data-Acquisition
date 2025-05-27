package com.Project.DataAcquisition.DTO.Reports.Manual;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Request body to create a new report")
public class CreateReportRequest {

    @Schema(description = "Predefined report type from dropdown", example = "Sensor Analysis Report")
    private String reportType;

    @Schema(description = "Custom report type (only if 'Custom' is selected)", example = "My Custom Report")
    private String customReportType;

    @Schema(description = "Selected layout name")
    private String layoutName;

    @Schema(description = "Report description")
    private String description;

    public String getReportType() {
        return reportType;
    }

    public void setReportType(String reportType) {
        this.reportType = reportType;
    }

    public String getCustomReportType() {
        return customReportType;
    }

    public void setCustomReportType(String customReportType) {
        this.customReportType = customReportType;
    }

    public String getLayoutName() {
        return layoutName;
    }

    public void setLayoutName(String layoutName) {
        this.layoutName = layoutName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
// Getters and Setters
}
