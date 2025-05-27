package com.Project.DataAcquisition.Controller.DashBoard;

import com.Project.DataAcquisition.Service.Alarm.AlarmService;
import com.Project.DataAcquisition.Service.Reports.Manual.ReportSchedulerService;
import com.Project.DataAcquisition.Service.Reports.Manual.ReportService;
import com.Project.DataAcquisition.Service.Rule.RuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/dashboard/")
public class DashboardController {

    @Autowired
    private AlarmService alarmService;

    @Autowired
    private RuleService ruleService;

    @Autowired
    private ReportService reportService;

    @GetMapping("/alarms-summary")
    public ResponseEntity<Map<String, Object>> getAlarmStats() {
        Map<String, Object> alarmSummary = alarmService.getAlarmSummary();
        return new ResponseEntity<>(alarmSummary, HttpStatus.OK);
    }
    @GetMapping("/rules-summary")
    public ResponseEntity<Map<String, Object>> getRulesSummary() {
        Map<String, Object> summary = ruleService.getRulesSummary();
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/reports-summary")
    public ResponseEntity<Map<String, Object>> getReportsSummary() {
        Map<String, Object> reportsSummary = reportService.getReportsSummary();
        return ResponseEntity.ok(reportsSummary);
    }

}
