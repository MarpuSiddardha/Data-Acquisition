package com.Project.DataAcquisition.Controller.Reports.Manual;

import com.Project.DataAcquisition.DTO.Reports.Manual.ToggleScheduleRequest;
import com.Project.DataAcquisition.DTO.Reports.Manual.UpdateScheduleRequest;
import com.Project.DataAcquisition.Entity.Reports.Manual.ScheduledReport;
import com.Project.DataAcquisition.Service.Reports.Manual.ReportSchedulerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reports")
@CrossOrigin(origins = "*")
@Tag(name = "scheduler APIs for reports", description = "APIs for managing scheduling")
public class ScheduleController {

    @Autowired
    private final ReportSchedulerService reportSchedulerService;

    private static final Logger logger = LoggerFactory.getLogger(ScheduleController.class);

    public ScheduleController(ReportSchedulerService reportSchedulerService) {
        this.reportSchedulerService = reportSchedulerService;
    }

    // 1️⃣ Toggle schedule for a report
    @PutMapping("/{reportId}/toggle-schedule")
    @Operation(summary = "Enable or Disable the Schedule", description = "Toggle on or off to enable or disable the schedule")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Schedule enabled/disabled successfully"),
            @ApiResponse(responseCode = "404", description = "Report not found")
    })
    public ResponseEntity<Map<String, Object>> toggleSchedule(
            @PathVariable Long reportId,
            @RequestBody ToggleScheduleRequest request) {

        boolean isEnabled = request.isScheduleEnabled();
        String frequency = request.getFrequency();

        logger.info("🛠️ Toggle Schedule API Called for Report ID={}, Enable={}", reportId, isEnabled);

        if (isEnabled) {
            logger.info("⏳ Scheduling report...");
            reportSchedulerService.scheduleReport(reportId, frequency, request.getStartDate(), request.getEndDate());
        }

        Map<String, Object> response = reportSchedulerService.toggleSchedule(reportId, frequency, isEnabled);
        return ResponseEntity.ok(response);
    }

    // 2️⃣ Update schedule
    @PutMapping("/{reportId}/update-schedule")
    @Operation(summary = "Update schedule details", description = "Updates scheduling details for a report.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Schedule updated successfully"),
            @ApiResponse(responseCode = "404", description = "Report not found")
    })
    public ResponseEntity<Map<String, String>> updateSchedule(
            @PathVariable Long reportId,
            @RequestBody UpdateScheduleRequest request) {

        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);

        LocalDateTime newStartDate = null;
        if (request.getStartDate() != null && !request.getStartDate().isEmpty()) {
            newStartDate = LocalDateTime.parse(request.getStartDate());
            if (newStartDate.isBefore(now)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Start date cannot be in the past."));
            }
        }

        LocalDateTime newEndDate = null;
        if (request.getEndDate() != null && !request.getEndDate().isEmpty()) {
            newEndDate = LocalDateTime.parse(request.getEndDate());
        }

        try {
            reportSchedulerService.scheduleReport(reportId, request.getFrequency(), newStartDate, newEndDate);
            return ResponseEntity.ok(Map.of("status", "Schedule updated successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    //  Get all schedules for a report
    @Operation(summary = "Get all schedules for a report")
    @GetMapping("/{reportId}/schedules")
    public ResponseEntity<List<Map<String, Object>>> getSchedulesByReportId(@PathVariable Long reportId) {
        logger.info("📥 Fetching all schedules for Report ID={}", reportId);
        return ResponseEntity.ok(reportSchedulerService.getAllSchedulesByReportId(reportId));
    }


    // Get a specific schedule for a report and frequency
    @Operation(summary = "Get specific schedule by report ID and frequency")
    @GetMapping("/{reportId}/schedules/{frequency}")
    public ResponseEntity<?> getScheduleByReportIdAndFrequency(@PathVariable Long reportId,
                                                               @PathVariable String frequency) {
        logger.info("📥 Fetching schedule for Report ID={} with frequency={}", reportId, frequency);
        Map<String, Object> schedule = reportSchedulerService.getScheduleByReportIdAndFrequency(reportId, frequency);
        if (schedule != null) {
            return ResponseEntity.ok(schedule);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Schedule not found for report ID " + reportId + " and frequency " + frequency));
        }
    }


    // Get only active/enabled schedules for a report
    @Operation(summary = "Get all active schedules for a report")
    @GetMapping("/{reportId}/schedules/active")
    public ResponseEntity<List<Map<String, Object>>> getActiveSchedules(@PathVariable Long reportId) {
        logger.info("📥 Fetching ACTIVE schedules for Report ID={}", reportId);
        return ResponseEntity.ok(reportSchedulerService.getActiveSchedulesByReportId(reportId));
    }

    @Operation(summary = "Get all the schedules", description = "Fetches all the schedules.")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Successfully retrieved schedules") })
    @GetMapping("/all-schedules")
    public ResponseEntity<List<Map<String, Object>>> getSchedules() {
        return ResponseEntity.ok(reportSchedulerService.getAllSchedules());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteScheduledReport(@PathVariable Long id) {
        return reportSchedulerService.deleteScheduledReport(id);
    }

}
