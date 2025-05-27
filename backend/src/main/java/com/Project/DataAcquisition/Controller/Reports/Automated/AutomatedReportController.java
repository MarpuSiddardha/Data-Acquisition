package com.Project.DataAcquisition.Controller.Reports.Automated;

import com.Project.DataAcquisition.Entity.Reports.Automated.AutomatedReport;
import com.Project.DataAcquisition.Repository.Reports.Automated.AutomatedReportRepository;
import com.Project.DataAcquisition.Service.Reports.Automated.AutomatedReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/automated-reports")
@CrossOrigin(origins = "*")
public class AutomatedReportController {

    public static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private AutomatedReportRepository automatedReportRepository;

    @Autowired
    private AutomatedReportService automatedReportService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> filterReports(
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false) String frequency,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        List<AutomatedReport> filteredReports = automatedReportService.filterReports(reportType, frequency, startDate, endDate);

        Map<String, Object> response = new HashMap<>();

        List<Map<String, Object>> simplifiedReports = filteredReports.stream()
                .map(report -> {
                    Map<String, Object> simplifiedReport = new HashMap<>();
                    simplifiedReport.put("reportId", report.getId());
                    simplifiedReport.put("id", report.getReportId());
                    simplifiedReport.put("reportType", report.getReportType());
                    simplifiedReport.put("frequency", report.getFrequency());
                    simplifiedReport.put("generatedDateTime", report.getGeneratedTime().format(DATE_TIME_FORMATTER));
                    return simplifiedReport;
                })
                .collect(Collectors.toList());

        response.put("reports", simplifiedReports);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<Object> searchReports(@RequestParam(required = false) String q)
    {
        List<AutomatedReport> filteredReports = automatedReportRepository.searchByReportType(q);
        List<Map<String, Object>> simplifiedReports = filteredReports.stream()
                .map(report -> {
                    Map<String, Object> simplifiedReport = new HashMap<>();
                    simplifiedReport.put("reportType", report.getReportType());
                    simplifiedReport.put("id", report.getReportId());
                    simplifiedReport.put("reportId", report.getId());
                    simplifiedReport.put("generatedDateTime", report.getGeneratedTime());
                    simplifiedReport.put("frequency", report.getFrequency());
                    return simplifiedReport;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("reports", simplifiedReports);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/{automatedReportId}")
    public ResponseEntity<Map<String, Object>> viewReport(@PathVariable Long automatedReportId) {
        Map<String, Object> reportData = automatedReportService.getAutomatedReportById(automatedReportId);

        if (reportData == null || reportData.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Not Found");
            errorResponse.put("message", "No report found with the ID '" + automatedReportId + "'.");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }

        return ResponseEntity.ok(reportData);
    }

}

