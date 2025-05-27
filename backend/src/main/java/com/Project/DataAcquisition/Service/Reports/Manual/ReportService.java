package com.Project.DataAcquisition.Service.Reports.Manual;

import com.Project.DataAcquisition.DTO.Reports.Manual.CreateReportRequest;
import com.Project.DataAcquisition.Entity.Alarms.AlarmEntity;
import com.Project.DataAcquisition.Entity.Reports.Layout.Layout;
import com.Project.DataAcquisition.Entity.Reports.Layout.LayoutWidget;
import com.Project.DataAcquisition.Entity.Reports.Layout.ReportWidget;
import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import com.Project.DataAcquisition.Entity.Reports.Manual.Report;
import com.Project.DataAcquisition.Entity.Reports.Manual.ReportType;
import com.Project.DataAcquisition.Entity.Reports.Manual.Sensor;
import com.Project.DataAcquisition.Repository.Alarm.AlarmRepository;
import com.Project.DataAcquisition.Repository.Reports.Widget.LayoutRepository;
import com.Project.DataAcquisition.Repository.Reports.Manual.ReportRepository;
import com.Project.DataAcquisition.Repository.Reports.Manual.ReportTypeRepository;
import com.Project.DataAcquisition.Repository.Reports.Widget.ReportWidgetRepository;
import com.Project.DataAcquisition.Repository.Rule.SensorRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final ReportTypeRepository reportTypeRepository;
    private final LayoutRepository layoutRepository;
    private final ReportWidgetRepository reportWidgetRepository;
    public static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");


    @Autowired
    private SensorRepository sensorRepository;


    @Autowired
    private AlarmRepository alarmRepository;

    @Autowired
    public ReportService(ReportRepository reportRepository, ReportTypeRepository reportTypeRepository, LayoutRepository layoutRepository, ReportWidgetRepository reportWidgetRepository) {
        this.reportRepository = reportRepository;
        this.reportTypeRepository = reportTypeRepository;
        this.layoutRepository = layoutRepository;
        this.reportWidgetRepository=reportWidgetRepository;
    }

    // 1. Get all report types for report type dropdown
    public List<String> getReportTypes() {
        return reportTypeRepository.findAll()
                .stream()
                .map(ReportType::getReportType)
                .collect(Collectors.toList());
    }

    public List<String> getLayouts() {
        return layoutRepository.findAll()
                .stream()
                .map(Layout::getLayoutName) // Assuming Layout has a `getLayoutName()` method
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createReport(CreateReportRequest request) {
        String selectedReportType;

        if (request.getReportType().equalsIgnoreCase("Custom")) {
            if (request.getCustomReportType() == null || request.getCustomReportType().isBlank()) {
                throw new IllegalArgumentException("Custom report type cannot be empty.");
            }
            selectedReportType = request.getCustomReportType();

            // Check if the custom report type already exists
            Optional<ReportType> existingType = reportTypeRepository.findByReportType(selectedReportType);
            if (existingType.isEmpty()) {
                // Save the new custom report type
                ReportType newReportType = new ReportType();
                newReportType.setReportType(selectedReportType);
                reportTypeRepository.save(newReportType);
            }
        } else {
            selectedReportType = request.getReportType();
        }

        // Get the Layout by name
        Optional<Layout> layoutOptional = layoutRepository.findByLayoutName(request.getLayoutName());
        if (layoutOptional.isEmpty()) {
            throw new IllegalArgumentException("Layout with name " + request.getLayoutName() + " not found.");
        }

        // Create the new report with the layout_id from the found Layout entity
        Layout layout = layoutOptional.get();

        Report newReport = Report.builder()
                .reportType(selectedReportType)
                .layout(layout)  // Assign the Layout entity directly
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .scheduleStatus(false)  // Default schedule status is "Off"
                .build();

        reportRepository.save(newReport);

        // 🔹 Fetch Widgets from LayoutWidgets & insert them into report_widgets
        List<ReportWidget> reportWidgets = new ArrayList<>();
        for (LayoutWidget layoutWidget : layout.getLayoutWidgets()) {  // Access widgets via LayoutWidget
            ReportWidget reportWidget = new ReportWidget();
            reportWidget.setReport(newReport);
            reportWidget.setWidget(layoutWidget.getWidget()); // Get Widget from LayoutWidget
            reportWidget.setData(null); // Initially set data as null
            reportWidgets.add(reportWidget);
        }

        reportWidgetRepository.saveAll(reportWidgets);

        return Map.of(
                "message", "Report created successfully.",
                "report", newReport
        );
    }


    // 4. Get all reports
    public List<Map<String, Object>> getAllReports() {
        return reportRepository.findAll().stream()
                .map(report -> {
                    Map<String, Object> reportMap = new HashMap<>();
                    reportMap.put("id", report.getId());
                    reportMap.put("reportType", report.getReportType());
                    reportMap.put("createdAt", report.getCreatedAt().format(DATE_TIME_FORMATTER));
                    reportMap.put("scheduleStatus", report.isScheduleStatus() ? "on" : "off");
                    reportMap.put("description", report.getDescription());
                    return reportMap;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getReportById(Long reportId) {
        Optional<Report> reportOptional = reportRepository.findById(reportId);
        if (reportOptional.isEmpty()) {
            throw new NoSuchElementException("Report not found");
        }

        Report report = reportOptional.get();
        LinkedHashMap<String, Object> reportDetails = new LinkedHashMap<>();

        reportDetails.put("reportId", report.getId());
        reportDetails.put("reportType", report.getReportType());
        reportDetails.put("createdAt", report.getCreatedAt().format(DATE_TIME_FORMATTER));
        reportDetails.put("scheduleStatus", report.isScheduleStatus() ? "on" : "off");
        reportDetails.put("description", report.getDescription());

        Layout layout = report.getLayout();
        LinkedHashMap<String, Object> layoutDetails = new LinkedHashMap<>();
        layoutDetails.put("layoutName", layout.getLayoutName());
        layoutDetails.put("createdAt", layout.getCreatedAt().format(DATE_TIME_FORMATTER));

        List<ReportWidget> reportWidgets = reportWidgetRepository.findByReport_Id(reportId);
        ObjectMapper objectMapper = new ObjectMapper();

        List<LinkedHashMap<String, Object>> widgetsList = reportWidgets.stream()
                .map(reportWidget -> {
                    Widget widget = reportWidget.getWidget();
                    LinkedHashMap<String, Object> widgetData = new LinkedHashMap<>();
                    String rawJsonData = reportWidget.getData();

                    // ✅ Safely parse stored JSON data
                    try {
                        widgetData = (rawJsonData != null && !rawJsonData.isEmpty()) ?
                                objectMapper.readValue(rawJsonData, new TypeReference<>() {}) :
                                new LinkedHashMap<>();
                    } catch (Exception e) {
                        System.err.println("Error parsing widget data: " + e.getMessage());
                    }

                    // ✅ Handle date parsing
                    Object dateObj = getIgnoreCase(widgetData, "date");
                    LocalDateTime startTime = null;
                    LocalDateTime endTime = LocalDateTime.now(); // Default to now

                    LinkedHashMap<String, Object> dateMap = new LinkedHashMap<>();
                    if (dateObj instanceof Map) {
                        dateMap.putAll((Map<String, String>) dateObj);
                        try {
                            startTime = LocalDate.parse(dateMap.get("startDate").toString()).atStartOfDay();
                            endTime = LocalDate.parse(dateMap.get("endDate").toString()).atTime(23, 59, 59);
                        } catch (Exception e) {
                            System.err.println("Error parsing date range: " + e.getMessage());
                        }
                    } else if (dateObj instanceof String) {
                        dateMap.put("startDate", dateObj);
                        try {
                            startTime = LocalDate.parse(dateObj.toString()).atStartOfDay();
                        } catch (Exception e) {
                            System.err.println("Error parsing single date: " + e.getMessage());
                        }
                    }

                    // ✅ Fetch Sensor Values and Aggregations if required
                    String widgetName = widget.getWidgetName();
                    if (widgetName.equalsIgnoreCase("Time Series Chart") ||
                            widgetName.equalsIgnoreCase("Line Chart") ||
                            widgetName.equalsIgnoreCase("Bar Chart") ||
                            widgetName.equalsIgnoreCase("Value and Chart Card")) {

                        if (startTime == null) {
                            startTime = endTime.minusHours(24); // Default to last 24 hours if missing
                        }
                        widgetData.put("sensors", fetchSensorValues(widgetData, startTime, endTime));
                    }

                    if (widgetName.equalsIgnoreCase("Value Card")) {
                        String sensorId = getSensorId(widgetData);
                        if (sensorId != null && startTime != null) {
                            LocalDateTime startOfDay = startTime;
                            LocalDateTime endOfDay = startTime.withHour(23).withMinute(59).withSecond(59);

                            Map<String, Boolean> requestedAggregations = (Map<String, Boolean>) widgetData.get("aggregations");
                            Map<String, Double> aggregationValues = new LinkedHashMap<>();

                            if (requestedAggregations.getOrDefault("max", false)) {
                                aggregationValues.put("max", sensorRepository.findMaxValue(sensorId, startOfDay, endOfDay));
                            }
                            if (requestedAggregations.getOrDefault("min", false)) {
                                aggregationValues.put("min", sensorRepository.findMinValue(sensorId, startOfDay, endOfDay));
                            }
                            if (requestedAggregations.getOrDefault("average", false)) {
                                aggregationValues.put("average", sensorRepository.findAverageValue(sensorId, startOfDay, endOfDay));
                            }

                            widgetData.put("aggregationValues", aggregationValues);
                        }
                    }

                    // ✅ Handle "Sensor Data Table" - Remove sensorValues from sensors list
                    if (widgetName.equalsIgnoreCase("Sensor Data Table")) {
                        List<Map<String, Object>> sensorsList = (List<Map<String, Object>>) widgetData.get("sensors");
                        if (sensorsList != null) {
                            for (Map<String, Object> sensorEntry : sensorsList) {
                                sensorEntry.remove("sensorValues");  // ✅ Remove sensorValues key
                            }
                        }

                        // ✅ Move "date" field after "sensors"
                        widgetData.remove("date");
                        widgetData.put("date", dateMap);
                    }

                    if (widgetName.equalsIgnoreCase("Alarms Table")) {
                        // ✅ Extract sensorIds from inside the sensors list
                        List<String> sensorIds = new ArrayList<>();
                        List<Map<String, Object>> sensorsList = (List<Map<String, Object>>) widgetData.get("sensors");
                        if (sensorsList != null) {
                            for (Map<String, Object> sensorEntry : sensorsList) {
                                Object sensorIdObj = getIgnoreCase(sensorEntry, "sensorId");
                                if (sensorIdObj instanceof List<?>) {
                                    for (Object sid : (List<?>) sensorIdObj) {
                                        if (sid != null) sensorIds.add(sid.toString());
                                    }
                                } else if (sensorIdObj instanceof String) {
                                    sensorIds.add(sensorIdObj.toString());
                                }

                                // ✅ Also remove "sensorValues" if present
                                sensorEntry.remove("sensorValues");
                            }
                        }

                        // ✅ Get status and severity
                        List<String> statusList = (List<String>) getIgnoreCase(widgetData, "status");
                        List<String> severityList = (List<String>) getIgnoreCase(widgetData, "severity");

                        List<Map<String, Object>> alarmTableData = new ArrayList<>();

                        if (sensorIds != null && startTime != null && endTime != null) {
                            for (String sensorId : sensorIds) {
                                List<AlarmEntity> alarms = alarmRepository.findAlarmsBySensorId(
                                        sensorId,
                                        statusList != null ? statusList : Collections.emptyList(),
                                        severityList != null ? severityList : Collections.emptyList(),
                                        startTime,
                                        endTime
                                );

                                for (AlarmEntity alarm : alarms) {
                                    Map<String, Object> alarmMap = new LinkedHashMap<>();
                                    alarmMap.put("alarmId", alarm.getAlarmId());
                                    alarmMap.put("alarmName", alarm.getAlarmName());
                                    alarmMap.put("status", alarm.getStatus());
                                    alarmMap.put("severity", alarm.getSeverity());
                                    alarmMap.put("sensorId", alarm.getSensorId());
                                    alarmMap.put("createdAt", alarm.getCreatedAt().format(DATE_TIME_FORMATTER));
                                    alarmTableData.add(alarmMap);
                                }
                            }
                        }

                        widgetData.remove("date");        // move date to end
                        widgetData.put("date", dateMap);
                        widgetData.put("alarmTableData", alarmTableData);
                    }



                    // ✅ Build Final Widget Response
                    LinkedHashMap<String, Object> widgetDetails = new LinkedHashMap<>();
                    widgetDetails.put("widgetId", widget.getWidgetId());
                    widgetDetails.put("widgetType", widget.getWidgetType());
                    widgetDetails.put("widgetName", widget.getWidgetName());
                    widgetDetails.put("data", widgetData);

                    return widgetDetails;
                })
                .collect(Collectors.toList());

        layoutDetails.put("widgets", widgetsList);
        reportDetails.put("layout", layoutDetails);

        return reportDetails;
    }


    private List<Map<String, Object>> fetchTableSensorValues(List<String> sensorIds, LocalDateTime startTime, LocalDateTime endTime) {
        List<Map<String, Object>> sensorDataList = new ArrayList<>();

        for (String sensorId : sensorIds) {
            List<Sensor> sensorValues = sensorRepository.findBySensorIdAndTimestampBetween(sensorId, startTime, endTime);

            List<Map<String, Object>> valuesList = new ArrayList<>();
            for (Sensor sv : sensorValues) {
                Map<String, Object> sensorValueMap = new LinkedHashMap<>();
                sensorValueMap.put("timestamp", sv.getTimestamp().toString());
                sensorValueMap.put("value", sv.getValue());
                valuesList.add(sensorValueMap);
            }

            Map<String, Object> sensorData = new LinkedHashMap<>();
            sensorData.put("sensorId", sensorId);
            sensorData.put("sensorValues", valuesList);
            sensorDataList.add(sensorData);
        }

        return sensorDataList;
    }


    private String getSensorId(Map<String, Object> dataMap) {
        if (dataMap.get("sensors") instanceof List) {
            List<Map<String, Object>> sensorList = (List<Map<String, Object>>) dataMap.get("sensors");
            if (!sensorList.isEmpty()) {
                return sensorList.get(0).get("sensorId").toString();
            }
        } else if (dataMap.get("sensors") instanceof Map) {
            return ((Map<String, Object>) dataMap.get("sensors")).get("sensorId").toString();
        }
        return null;
    }

    // ✅ Helper method to get values ignoring case
    private Object getIgnoreCase(Map<?, ?> map, String key) {
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (entry.getKey().toString().equalsIgnoreCase(key)) {
                return entry.getValue();
            }
        }
        return null;
    }


    private List<Map<String, Object>> fetchSensorValues(Map<String, Object> dataMap, LocalDateTime startTime, LocalDateTime endTime) {
        List<Map<String, Object>> sensors = (List<Map<String, Object>>) dataMap.get("sensors");
        if (sensors == null || sensors.isEmpty()) {
            return Collections.emptyList(); // Return empty list if no sensors
        }

        List<Map<String, Object>> updatedSensors = new ArrayList<>();
        for (Map<String, Object> sensor : sensors) {
            String sensorId = sensor.get("sensorId").toString();

            // Fetch sensor values from DB within the given time range
            List<Sensor> sensorValues = sensorRepository.findBySensorIdAndTimestampBetween(sensorId, startTime, endTime);

            // Convert sensor values to required format
            List<Map<String, Object>> sensorValuesList = new ArrayList<>();
            for (Sensor sv : sensorValues) {
                Map<String, Object> sensorValueMap = new LinkedHashMap<>();
                sensorValueMap.put("timestamp", sv.getTimestamp().toString());
                sensorValueMap.put("value", sv.getValue());
                sensorValuesList.add(sensorValueMap);
            }

            // Update sensor structure with sensorValues
            LinkedHashMap<String, Object> updatedSensor = new LinkedHashMap<>(sensor);
            updatedSensor.put("sensorValues", sensorValuesList);
            updatedSensors.add(updatedSensor);
        }

        return updatedSensors;
    }



    // 7. Filter reports based on various criteria
    public List<Map<String, Object>> filterReports(String reportType, Boolean scheduleStatus, LocalDate startDate, LocalDate endDate, String query) {
        List<Report> reports = reportRepository.findAll();

        // Apply filters
        if (reportType != null && !reportType.isEmpty()) {
            reports.removeIf(report -> !report.getReportType().equalsIgnoreCase(reportType));
        }
        if (scheduleStatus != null) {
            reports.removeIf(report -> report.isScheduleStatus() != scheduleStatus);
        }
        if (startDate != null) {
            reports.removeIf(report -> report.getCreatedAt().toLocalDate().isBefore(startDate));
        }
        if (endDate != null) {
            reports.removeIf(report -> report.getCreatedAt().toLocalDate().isAfter(endDate));
        }
        if (query != null && !query.isEmpty()) {
            reports.removeIf(report -> !report.getReportType().toLowerCase().contains(query.toLowerCase()));
        }

        // Convert reports to a list of HashMap to maintain key order
        List<Map<String, Object>> filteredReports = new ArrayList<>();
        for (Report report : reports) {
            Map<String, Object> reportMap = new HashMap<>();
            reportMap.put("id", report.getId());
            reportMap.put("reportType", report.getReportType());
            reportMap.put("scheduleStatus", report.isScheduleStatus() ? "on" : "off");
            reportMap.put("createdAt", report.getCreatedAt().format(DATE_TIME_FORMATTER));
            reportMap.put("description", report.getDescription());

            filteredReports.add(reportMap);
        }

        return filteredReports;
    }

    // 8. Download a report
    public Map<String, String> downloadReport(Long reportId) {
        if (reportRepository.existsById(reportId)) {
            return Map.of("message", "Report downloaded successfully.", "reportId", reportId.toString());
        }
        throw new NoSuchElementException("Report not found");
    }

    // 9. Delete a report
    public Map<String, String> deleteReport(Long reportId) {
        if (reportRepository.existsById(reportId)) {
            reportRepository.deleteById(reportId);
            return Map.of("message", "Report deleted successfully.");
        }
        throw new NoSuchElementException("Report not found");
    }

    // 11. Export report to PDF
    public Map<String, String> exportReportToPDF(Long reportId) {
        return Map.of("message", "Report exported successfully.", "reportId", reportId.toString());
    }

    public Map<String, Object> getReportsSummary() {
        long automatedCount = countAutomatedReports();
        long manualCount = countManualReports();
        long totalCount = countTotalReports();

        // Creating ChartInfo section
        Map<String, Object> chartInfo = new HashMap<>();
        chartInfo.put("manual", manualCount);
        chartInfo.put("scheduled", automatedCount);
        chartInfo.put("total", totalCount);

        // Creating Status section
        Map<String, Object> status = new HashMap<>();
        status.put("manual", manualCount);
        status.put("scheduled", automatedCount);
        status.put("total", totalCount);

        // Final response structure
        Map<String, Object> response = new HashMap<>();
        response.put("chartInfo", chartInfo);
        response.put("status", status);

        return response;
    }

    public long countAutomatedReports() {
        return reportRepository.countAutomatedReports();
    }

    public long countManualReports() {
        return reportRepository.countManualReports();
    }

    public long countTotalReports() {
        return reportRepository.countTotalReports();
    }

}
