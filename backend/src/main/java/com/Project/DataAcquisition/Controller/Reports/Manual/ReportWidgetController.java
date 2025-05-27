package com.Project.DataAcquisition.Controller.Reports.Manual;

import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import com.Project.DataAcquisition.Model.*;
import com.Project.DataAcquisition.Service.Reports.Manual.ReportWidgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/reports/{reportID}/widgets")
public class ReportWidgetController {

    private static final Logger logger = LoggerFactory.getLogger(ReportWidgetController.class);

    private final ReportWidgetService reportWidgetService;

    public ReportWidgetController(ReportWidgetService reportWidgetService) {
        this.reportWidgetService = reportWidgetService;
    }

    // 1️⃣ View a specific widget inside a particular report
    @GetMapping("/{widgetID}/view")
    public ResponseEntity<?> getWidgetInReport(@PathVariable Long reportID, @PathVariable Long widgetID) {
        logger.debug("Fetching widget with ID: {} for report ID: {}", widgetID, reportID);
        Optional<LinkedHashMap<String, Object>> widgetData = reportWidgetService.getWidgetInReport(reportID, widgetID);
        return widgetData.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 2️⃣ Delete a specific widget inside a particular report
    @DeleteMapping("/{widgetID}/delete")
    public ResponseEntity<?> deleteWidgetInReport(@PathVariable Long reportID, @PathVariable Long widgetID) {
        boolean deleted = reportWidgetService.deleteWidgetInReport(reportID, widgetID);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Widget deleted successfully"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 3️⃣ Update a specific widget inside a particular report
    @Operation(summary = "Edit a widget", description = "Updates the details of a specific widget.")
    @ApiResponse(responseCode = "200", description = "Widget updated successfully.")
    @ApiResponse(responseCode = "400", description = "Invalid widget type.")
    @ApiResponse(responseCode = "404", description = "Widget not found.")
    @ApiResponse(responseCode = "500", description = "Server error.")
    @PutMapping("/{widgetID}")
    public ResponseEntity<?> updateWidgetInReport(@PathVariable Long reportID,
                                                  @PathVariable Long widgetID,
                                                  @RequestBody Widget widgetRequest) {
        try {
            Map<String, Object> updatedWidget = reportWidgetService.updateWidget(reportID, widgetID, widgetRequest);
            return ResponseEntity.ok(updatedWidget);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

}