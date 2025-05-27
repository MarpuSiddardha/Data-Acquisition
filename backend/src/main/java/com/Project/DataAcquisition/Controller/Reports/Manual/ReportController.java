package com.Project.DataAcquisition.Controller.Reports.Manual;

import com.Project.DataAcquisition.DTO.Reports.Manual.CreateReportRequest;
import com.Project.DataAcquisition.Exception.ReportNotFoundException;
import com.Project.DataAcquisition.Service.Reports.Manual.ReportSchedulerService;
import com.Project.DataAcquisition.Service.Reports.Manual.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/manual-reports")
@CrossOrigin(origins = "*")
@Tag(name = "Manual Reports Screen APIs", description = "APIs for managing Manual-reports")
public class ReportController {

    private final ReportService reportService;
    private final ReportSchedulerService reportSchedulerService;
    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);

    @Autowired
    public ReportController(ReportService reportService, ReportSchedulerService reportSchedulerService) {
        this.reportService = reportService;
        this.reportSchedulerService=reportSchedulerService;
    }



    // 1. Get all report types for report type dropdown
    @Operation(summary = "Get all report types", description = "Fetches all available report types.")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Successfully retrieved report types") })
    @GetMapping("/report-types")
    public ResponseEntity<List<String>> getReportTypes() {
        return ResponseEntity.ok(reportService.getReportTypes());
    }



    // 2. Get all layouts for layout dropdown
    @Operation(summary = "Get all layouts", description = "Fetches all available report layouts.")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Successfully retrieved layouts") })
    @GetMapping("/layouts")
    public ResponseEntity<List<String>> getLayouts() {
        return ResponseEntity.ok(reportService.getLayouts());
    }



    // 3. Create a new report
    @Operation(summary = "Create a new report", description = "Creates a new report with the given details.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Report created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters")
    })
    @PostMapping("/create-report")
    public ResponseEntity<Map<String, Object>> createReport(@RequestBody CreateReportRequest request) {
        try {
            Map<String, Object> response = reportService.createReport(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            throw new ReportNotFoundException("Invalid report data provided.");
        }
    }




    // 4. Get all reports
    @Operation(summary = "Get reports", description = "Retrieves all reports or filters reports based on optional criteria.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Successfully retrieved reports")
    })
    @GetMapping
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getReports(
            @Parameter(description = "Select a report type") @RequestParam(required = false) String reportType,
            @RequestParam(required = false) Boolean scheduleStatus,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String query) {

        LocalDate start = null;
        LocalDate end = null;

        try {
            if (startDate != null && !startDate.trim().isEmpty()) {
                start = LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE); // yyyy-MM-dd
            }
            if (endDate != null && !endDate.trim().isEmpty()) {
                end = LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE);
            }
        } catch (DateTimeParseException e) {
            return ResponseEntity.badRequest().body(Map.of("error",
                    List.of(Map.of("message", "Invalid date format. Expected format: yyyy-MM-dd"))));
        }

        List<Map<String, Object>> reports;

        // If no filters are provided, return all reports
        if (reportType == null && scheduleStatus == null && start == null && end == null && query == null) {
            reports = reportService.getAllReports();
        } else {
            reports = reportService.filterReports(reportType, scheduleStatus, start, end, query);
        }

        Map<String, List<Map<String, Object>>> response = Map.of("Manual_Reports", reports);
        return ResponseEntity.ok(response);
    }


    // 5. API to view a particular report with layout and widgets
    @GetMapping("/{reportID}/view")
    public ResponseEntity<Map<String, Object>> getReportByIdWithLayoutAndWidgets(@PathVariable Long reportID) {


        // Get the detailed report from the service
        Map<String, Object> reportDetails = reportService.getReportById(reportID);

        // If the reportDetails is null or empty, return a NOT_FOUND response
        if (reportDetails == null || reportDetails.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Report not found."));
        }

        // Simply return the response from the service directly
        return ResponseEntity.ok(reportDetails);
    }

    // 9. Delete a report
    @Operation(summary = "Delete a report", description = "Deletes a report by its ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Report deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Report not found")
    })
    @DeleteMapping("/{reportId}")
    public ResponseEntity<Map<String, String>> deleteReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(reportService.deleteReport(reportId));
    }


    //  Global Exception Handling
    @ExceptionHandler(ReportNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleReportNotFoundException(ReportNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", e.getMessage(), "timestamp", LocalDateTime.now().toString()));
    }
}
