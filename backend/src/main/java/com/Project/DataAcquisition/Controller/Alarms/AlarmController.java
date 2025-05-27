package com.Project.DataAcquisition.Controller.Alarms;

import com.Project.DataAcquisition.Entity.Alarms.AlarmEntity;
import com.Project.DataAcquisition.Exception.AlarmNotFoundException;
import com.Project.DataAcquisition.Service.Alarm.AlarmService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/alarms")
@CrossOrigin(origins = "*")
public class AlarmController {

    private final AlarmService alarmService;

    public AlarmController(AlarmService alarmService) {
        this.alarmService = alarmService;
    }

    // ✅ Get alarms (all or filtered)
    @Operation(summary = "Get alarms", description = "Retrieve all alarms or filter them by severity and/or status.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Alarms retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No alarms found")
    })
    @GetMapping({"/", ""})
    public ResponseEntity<List<Map<String, Object>>> getAlarms(
            @Parameter(description = "Filter by severity (High, Low, Moderate)", example = "High")
            @RequestParam(required = false) String severity,

            @Parameter(description = "Filter by status (Active, Acknowledged, Closed)", example = "Active")
            @RequestParam(required = false) String status) {

        List<Map<String, Object>> alarms = alarmService.filterAlarms(severity, status);
        return alarms.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(alarms);
    }

    // ✅ Get alarm by ID
    @Operation(summary = "Get alarm by ID", description = "Retrieve a specific alarm by its ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Alarm found"),
            @ApiResponse(responseCode = "404", description = "Alarm not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<AlarmEntity> getAlarmById(@PathVariable Long id) {
        try {
            AlarmEntity alarm = alarmService.getAlarmById(id);
            return ResponseEntity.ok(alarm);
        } catch (AlarmNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Update alarm description or status
    @Operation(summary = "Update alarm details", description = "Update the description and/or status of a specific alarm.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Alarm updated successfully"),
            @ApiResponse(responseCode = "404", description = "Alarm not found"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    @PutMapping("/{id}")
    public ResponseEntity<AlarmEntity> updateAlarm(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        String description = request.get("description");
        String status = request.get("status");

        if ((description == null || description.trim().isEmpty()) && (status == null || status.trim().isEmpty())) {
            return ResponseEntity.badRequest().body(null); // At least one field must be provided
        }

        try {
            AlarmEntity updatedAlarm = alarmService.updateAlarm(id, description, status);
            return ResponseEntity.ok(updatedAlarm);
        } catch (AlarmNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Delete alarm
    @Operation(summary = "Delete alarm by ID", description = "Delete a specific alarm by its ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Alarm deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Alarm not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAlarm(@PathVariable Long id) {
        boolean deleted = alarmService.deleteAlarm(id);
        return deleted ? ResponseEntity.ok("Alarm deleted successfully.") : ResponseEntity.notFound().build();
    }

    // ✅ Search alarms by name or tag
    @Operation(summary = "Search alarms", description = "Search alarms by name or tag.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search results returned successfully"),
            @ApiResponse(responseCode = "204", description = "No matching alarms found")
    })
    @GetMapping("/search")
    public ResponseEntity<List<AlarmEntity>> searchAlarms(@RequestParam(name = "q", required = false) String query) {
        List<AlarmEntity> alarms = alarmService.searchAlarms(query);
        return alarms.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(alarms);
    }
}