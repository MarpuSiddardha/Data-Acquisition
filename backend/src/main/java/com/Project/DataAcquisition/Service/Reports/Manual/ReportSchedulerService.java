//package com.Project.DataAcquisition.Service.Reports.Manual;
//
//import com.Project.DataAcquisition.Entity.Reports.Automated.AutomatedReport;
//import com.Project.DataAcquisition.Entity.Reports.Automated.AutomatedReportWidget;
//import com.Project.DataAcquisition.Entity.Reports.Layout.ReportWidget;
//import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
//import com.Project.DataAcquisition.Entity.Reports.Manual.Report;
//import com.Project.DataAcquisition.Entity.Reports.Manual.ScheduledReport;
//import com.Project.DataAcquisition.Entity.Reports.Manual.Sensor;
//import com.Project.DataAcquisition.Repository.Reports.Automated.AutomatedReportRepository;
//import com.Project.DataAcquisition.Repository.Reports.Automated.AutomatedReportWidgetRepository;
//import com.Project.DataAcquisition.Repository.Reports.Manual.ReportRepository;
//import com.Project.DataAcquisition.Repository.Reports.Widget.ReportWidgetRepository;
//import com.Project.DataAcquisition.Repository.Reports.Manual.ScheduledReportRepository;
//import com.Project.DataAcquisition.Repository.Rule.SensorRepository;
//import com.fasterxml.jackson.core.JsonProcessingException;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.scheduling.annotation.Scheduled;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//import org.springframework.web.server.ResponseStatusException;
//
//import java.io.IOException;
//import java.time.LocalDate;
//import java.time.LocalDateTime;
//import java.time.YearMonth;
//import java.util.*;
//import java.util.stream.Collectors;
//
//@Service
//public class ReportSchedulerService {
//
//    private static final Logger logger = LoggerFactory.getLogger(ReportSchedulerService.class);
//
//
//    private final ScheduledReportRepository scheduledReportRepository;
//    private final AutomatedReportRepository automatedReportRepository;
//    private final ReportRepository reportRepository;
//    private final ReportWidgetRepository reportWidgetRepository;
//    private final SensorRepository sensorRepository;
//    private final AutomatedReportWidgetRepository automatedReportWidgetRepository;
//    private final Object lock = new Object();
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    public ReportSchedulerService(ScheduledReportRepository scheduledReportRepository,
//                                  AutomatedReportRepository automatedReportRepository,
//                                  ReportRepository reportRepository,
//                                  ReportWidgetRepository reportWidgetRepository,
//                                  SensorRepository sensorRepository,
//                                  AutomatedReportWidgetRepository automatedReportWidgetRepository) {
//        this.scheduledReportRepository = scheduledReportRepository;
//        this.automatedReportRepository = automatedReportRepository;
//        this.reportRepository = reportRepository;
//        this.reportWidgetRepository = reportWidgetRepository;
//        this.sensorRepository = sensorRepository;
//        this.automatedReportWidgetRepository = automatedReportWidgetRepository;
//    }
//
//    public Map<String, Object> toggleSchedule(Long reportId, String frequency, boolean enable) {
//        Map<String, Object> response = new HashMap<>();
//
//        logger.info("🔍 toggleSchedule() called with Report ID={} Frequency={} Enable={}", reportId, frequency, enable);
//
//        Optional<Report> reportOptional = reportRepository.findById(reportId);
//        if (reportOptional.isEmpty()) {
//            throw new IllegalArgumentException("❌ Report with ID " + reportId + " not found.");
//        }
//
//        Report report = reportOptional.get();
//
//        if (!enable && (frequency == null || frequency.trim().isEmpty())) {
//            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "❌ Frequency is required when disabling a schedule.");
//        }
//
//        Optional<ScheduledReport> existingSchedule = scheduledReportRepository.findByReportIdAndFrequency(reportId, frequency);
//
//        if (existingSchedule.isPresent()) {
//            ScheduledReport scheduledReport = existingSchedule.get();
//            scheduledReport.setActive(enable);
//            scheduledReportRepository.save(scheduledReport);
//
//            if (!enable) {
//                logger.info("❌ Schedule disabled for Report ID={} Frequency={}", reportId, frequency);
//            }
//        } else if (enable) {
//            throw new IllegalArgumentException("❌ No existing schedule found for Report ID=" + reportId + " and Frequency=" + frequency);
//        }
//
//        report.setScheduleStatus(enable);
//        reportRepository.save(report);
//
//        logger.info("✅ Schedule {} for Report ID={} Frequency={}. Updated scheduleStatus to {}",
//                enable ? "enabled" : "disabled", reportId, frequency, enable);
//
//        if (enable && existingSchedule.isPresent()) {
//            response.put("status", "Schedule enabled");
//            response.put("isScheduleEnabled", true);
//            response.put("frequency", existingSchedule.get().getFrequency());
//            response.put("startDate", existingSchedule.get().getStartDate());
//            response.put("endDate", existingSchedule.get().getEndDate());
//        } else {
//            response.put("status", "Schedule disabled");
//            response.put("isScheduleEnabled", false);
//        }
//
//        return response;
//    }
//
//
//    @Transactional
//    public void scheduleReport(Long reportId, String frequency, LocalDateTime startDate, LocalDateTime endDate) {
//        logger.info("📌 Scheduling/updating report: Report ID={}, Frequency={}, StartDate={}, EndDate={}",
//                reportId, frequency, startDate, endDate);
//
//        Optional<Report> reportOptional = reportRepository.findById(reportId);
//        if (reportOptional.isEmpty()) {
//            throw new IllegalArgumentException("Report with ID " + reportId + " not found.");
//        }
//
//        Report report = reportOptional.get();
//
//        Optional<ScheduledReport> existingScheduleOptional;
//
//        if (frequency != null && !frequency.isEmpty()) {
//            // Fetch existing schedule by Report ID and Frequency
//            existingScheduleOptional = scheduledReportRepository.findByReportIdAndFrequency(reportId, frequency);
//        } else {
//            // Fetch any existing schedule by Report ID if frequency is not provided
//            existingScheduleOptional = scheduledReportRepository.findByReportId(reportId);
//        }
//
//        ScheduledReport scheduledReport = existingScheduleOptional.orElseGet(ScheduledReport::new);
//        scheduledReport.setReport(report);
//
//        // ✅ If frequency is provided, update it. Otherwise, keep the existing one.
//        if (frequency != null && !frequency.isEmpty()) {
//            scheduledReport.setFrequency(frequency);
//        } else if (existingScheduleOptional.isPresent()) {
//            frequency = existingScheduleOptional.get().getFrequency(); // Use existing frequency
//        }
//
//        if (frequency == null || frequency.isEmpty()) {
//            throw new IllegalArgumentException("Frequency is required for new schedules.");
//        }
//
//        // ✅ If startDate is provided, update it. Otherwise, keep the existing one.
//        if (startDate != null) {
//            scheduledReport.setStartDate(startDate);
//            scheduledReport.setNextRun(startDate.withSecond(0).withNano(0)); // Update nextRun only if startDate changes
//        } else if (existingScheduleOptional.isPresent()) {
//            scheduledReport.setStartDate(existingScheduleOptional.get().getStartDate());
//        }
//
//        // ✅ If endDate is provided, update it. Otherwise, keep the existing one.
//        if (endDate != null) {
//            scheduledReport.setEndDate(endDate);
//        } else if (existingScheduleOptional.isPresent()) {
//            scheduledReport.setEndDate(existingScheduleOptional.get().getEndDate());
//        }
//
//        scheduledReport.setActive(true); // Ensure schedule remains active
//
//        scheduledReportRepository.save(scheduledReport);
//        logger.info("✅ Report schedule updated successfully: Report ID={}, Frequency={}, StartDate={}, EndDate={}, NextRun={}",
//                reportId, scheduledReport.getFrequency(), scheduledReport.getStartDate(), scheduledReport.getEndDate(), scheduledReport.getNextRun());
//    }
//
//    @Scheduled(cron = "0 * * * * *") // Runs every hour at HH:00:00
//    public void checkHourlyReports() {
//        processScheduledReports("HOURLY");
//    }
//
//    @Scheduled(cron = "0 * * * * *") // Runs daily at 10:30 AM
//    public void checkDailyReports() {
//        processScheduledReports("DAILY");
//    }
//
//    @Scheduled(cron = "0 * * * * *") // Runs every day at 10:30 AM
//    public void checkWeeklyReports() {
//        processScheduledReports("WEEKLY");
//    }
//
//    @Scheduled(cron = "0 * * * * *") // Runs every day at 10:30 AM
//    public void checkMonthlyReports() {
//        processScheduledReports("MONTHLY");
//    }
//
//
//    @Transactional
//    public void processScheduledReports(String frequency) {
//        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
//
//        List<ScheduledReport> scheduledReports;
//        synchronized (lock) { // Ensure thread safety
//            // ✅ **Avoid Unnecessary Queries by Checking if Reports Exist First**
//            boolean hasScheduledReports = scheduledReportRepository.existsByFrequencyAndNextRunBefore(frequency, now);
//            if (!hasScheduledReports) {
//                return; // 🚀 Exit early to avoid unnecessary DB query
//            }
//
//            // ✅ **Run the Query Only When Necessary**
//            scheduledReports = switch (frequency) {
//                case "HOURLY" -> scheduledReportRepository.findHourlyReportsToRun(now);
//                case "DAILY" -> scheduledReportRepository.findDailyReportsToRun(now);
//                case "WEEKLY" -> scheduledReportRepository.findWeeklyReportsToRun(now);
//                case "MONTHLY" -> scheduledReportRepository.findMonthlyReportsToRun(now);
//                default -> throw new IllegalArgumentException("Unsupported frequency: " + frequency);
//            };
//        }
//
//// 🚨 **Exit Early if No Reports Exist After Query**
//        if (scheduledReports.isEmpty()) {
//            logger.info("⏳ No reports scheduled for frequency: {}", frequency);
//            return;
//        }
//
//        for (ScheduledReport report : scheduledReports) {
//            LocalDateTime nextRunNormalized = report.getNextRun();
//
//            // 🚨 **Immediate Deletion Check (Handles Expired Schedules)**
//            if (report.getEndDate() != null &&
//                    (nextRunNormalized.isAfter(report.getEndDate()) || nextRunNormalized.isEqual(report.getEndDate()))) {
//                deleteExpiredSchedule(report);
//                continue;
//            }
//
//
//            // 🚀 **Execute Only if It's the Correct Time (No Waiting)**
//            if (now.isAfter(nextRunNormalized.minusMinutes(1)) && now.isBefore(nextRunNormalized.plusMinutes(1))) {
//                synchronized (lock) {
//                    if (!report.getIsActive()) {
//                        logger.warn("⚠️ Report ID={} schedule is inactive. Skipping report generation.", report.getReport().getId());
//                        continue;
//                    }
//                    generateReport(report, frequency);
//                }
//            }
//        }
//    }
//
//    @Transactional
//    private void deleteExpiredSchedule(ScheduledReport report) {
//        Long reportId = report.getReport().getId();
//        logger.info("⏳ Report ID={} reached end date. Deleting schedule and updating report status.", reportId);
//        scheduledReportRepository.delete(report);
//
//        boolean hasActiveSchedules = scheduledReportRepository.existsByReportId(reportId);
//        if (!hasActiveSchedules) {
//            reportRepository.updateScheduleStatus(reportId, false);
//            logger.info("✅ Updated schedule status to false for Report ID={}", reportId);
//        }
//
//    }
//
//
//    @Transactional
//    public void generateReport(ScheduledReport scheduledReport, String frequency) {
//        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);
//
//        if (scheduledReport == null) return;
//
//        Report report = scheduledReport.getReport();
//        if (report == null) {
//            logger.error("❌ ScheduledReport is not linked to a valid Report.");
//            throw new IllegalStateException("ScheduledReport is not linked to a valid Report.");
//        }
//
//        Long reportId = report.getId();
//        logger.info("🕒 [START] Generating {} report for Report ID={}", frequency, reportId);
//
//        if (!scheduledReport.getIsActive()) {
//            logger.warn("⚠️ Report ID={} has an inactive schedule. Skipping report generation.", reportId);
//            return;
//        }
//
//        try {
//            AutomatedReport automatedReport = new AutomatedReport();
//            automatedReport.setReportId(reportId);
//            automatedReport.setReportType(report.getReportType());
//            automatedReport.setFrequency(scheduledReport.getFrequency());
//            automatedReport.setGeneratedTime(now);
//            automatedReportRepository.save(automatedReport);
//
//            List<ReportWidget> manualWidgets = reportWidgetRepository.findByReport_Id(reportId);
//
//            for (ReportWidget manualWidget : manualWidgets) {
//                Widget originalWidget = manualWidget.getWidget();
//                String widgetJson = manualWidget.getData();
//                Map<String, Object> updatedData;
//
//                if (widgetJson == null) {
//                    logger.warn("⚠️ Widget ID={} has null data. Proceeding with empty data.", manualWidget.getId());
//                    updatedData = new HashMap<>();
//                } else {
//                    Map<String, Object> widgetData = parseJsonToMap(widgetJson);
//                    updatedData = generateWidgetDataByFrequency(widgetData, frequency);
//                }
//
//                String updatedJson = convertDataToJson(updatedData);
//
//                AutomatedReportWidget arw = new AutomatedReportWidget();
//                arw.setAutomatedReport(automatedReport);
//                arw.setWidget(originalWidget);
//                arw.setData(updatedJson);
//                automatedReportWidgetRepository.save(arw);
//            }
//
//            // Next Run Time
//            LocalDateTime nextRun;
//            LocalDateTime currentNextRun = scheduledReport.getNextRun();
//
//            switch (frequency) {
//                case "HOURLY":
//                    nextRun = currentNextRun.plusHours(1);
//                    break;
//                case "DAILY":
//                    nextRun = currentNextRun.plusDays(1);
//                    break;
//                case "WEEKLY":
//                    nextRun = currentNextRun.plusWeeks(1);
//                    break;
//                case "MONTHLY":
//                    LocalDate currentDate = currentNextRun.toLocalDate();
//                    LocalDate nextMonthDate = currentDate.plusMonths(1);
//                    int lastDayOfMonth = YearMonth.from(nextMonthDate).lengthOfMonth();
//                    int day = Math.min(currentDate.getDayOfMonth(), lastDayOfMonth);
//                    nextRun = LocalDateTime.of(nextMonthDate.getYear(), nextMonthDate.getMonth(), day,
//                            currentNextRun.getHour(), currentNextRun.getMinute());
//                    break;
//                default:
//                    throw new IllegalArgumentException("Unsupported frequency: " + frequency);
//            }
//
//            scheduledReport.setNextRun(nextRun.withSecond(0).withNano(0));
//            scheduledReportRepository.save(scheduledReport);
//
//            logger.info("✅ [SUCCESS] {} report generated for Report ID={} at {}. Next Run at {}",
//                    frequency, reportId, now, nextRun);
//
//        } catch (Exception e) {
//            logger.error("❌ [ERROR] Failed to generate {} report for Report ID={}. Error: {}",
//                    frequency, reportId, e.getMessage(), e);
//        }
//    }
//
//
//    public Map<String, Object> generateWidgetDataByFrequency(Map<String, Object> originalData, String frequency) {
//        Map<String, Object> updatedData = new HashMap<>(originalData);
//        LocalDateTime now = LocalDateTime.now();
//        LocalDateTime from;
//
//        // Determine the correct time range based on frequency
//        switch (frequency) {
//            case "HOURLY":
//                from = now.minusHours(1);
//                break;
//            case "DAILY":
//                from = now.minusDays(1);
//                break;
//            case "WEEKLY":
//                from = now.minusWeeks(1);
//                break;
//            case "MONTHLY":
//                from = now.minusMonths(1);
//                break;
//            default:
//                throw new IllegalArgumentException("Unsupported frequency: " + frequency);
//        }
//
//        // Update widgets' date fields based on frequency
//        updateWidgetDates(updatedData, from, now);
//
//        // Extract sensors, showValues, and aggregation safely
//        List<Map<String, Object>> sensors = convertToListOfMaps(originalData.get("sensors"));
//        boolean hasShowValues = originalData.containsKey("showValues");
//        boolean hasAggregation = originalData.containsKey("aggregation");
//
//        if (!sensors.isEmpty()) {
//            for (Map<String, Object> sensor : sensors) {
//                // Handle sensorId safely
//                Object sensorIdObj = sensor.get("sensorId");
//                String sensorId = "";
//                if (sensorIdObj instanceof List) {
//                    List<String> sensorIds = (List<String>) sensorIdObj;
//                    sensorId = String.join(",", sensorIds); // Convert list to a comma-separated string
//                } else if (sensorIdObj instanceof String) {
//                    sensorId = (String) sensorIdObj;
//                }
//
//                // Handle sensorType safely
//                Object sensorTypeObj = sensor.get("sensorType");
//                String sensorType = "";
//                if (sensorTypeObj instanceof List) {
//                    List<String> sensorTypes = (List<String>) sensorTypeObj;
//                    sensorType = String.join(",", sensorTypes);
//                } else if (sensorTypeObj instanceof String) {
//                    sensorType = (String) sensorTypeObj;
//                }
//
//                // Debugging (optional)
//                System.out.println("Processing sensorId: " + sensorId + " | sensorType: " + sensorType);
//
//                // Fetch sensor readings within the specified time range
//                List<Sensor> sensorReadings = sensorRepository.findBySensorIdAndTimestampBetween(sensorId, from, now);
//
//                // If the widget has showValues or aggregation, calculate min, max, avg
//                if (hasShowValues || hasAggregation) {
//                    double avg = sensorReadings.stream().mapToDouble(Sensor::getValue).average().orElse(0);
//                    double max = sensorReadings.stream().mapToDouble(Sensor::getValue).max().orElse(0);
//                    double min = sensorReadings.stream().mapToDouble(Sensor::getValue).min().orElse(0);
//
//                    // Store calculated values at the widget level, not under each sensor
//                    updatedData.put("average", avg);
//                    updatedData.put("max", max);
//                    updatedData.put("min", min);
//                }
//
//                // For line charts, add sensorValues (timestamp, value)
//                List<Map<String, Object>> sensorValues = sensorReadings.stream().map(reading -> {
//                    Map<String, Object> valMap = new HashMap<>();
//                    valMap.put("timestamp", reading.getTimestamp().toString());
//                    valMap.put("value", reading.getValue());
//                    return valMap;
//                }).collect(Collectors.toList());
//
//                sensor.put("sensorValues", sensorValues); // Add sensorValues under each sensor
//            }
//        }
//
//        updatedData.put("sensors", sensors); // Update processed sensors
//        return updatedData;
//    }
//
//    /**
//     * Updates the date fields inside widgets to ensure they match the selected frequency.
//     */
//    private void updateWidgetDates(Map<String, Object> widgetData, LocalDateTime from, LocalDateTime now) {
//        for (Map.Entry<String, Object> entry : widgetData.entrySet()) {
//            Object value = entry.getValue();
//
//            if (value instanceof Map) { // If it's a nested object, check for date fields
//                Map<String, Object> field = (Map<String, Object>) value;
//
//                // If widget has "startDate" & "endDate", override them
//                if (field.containsKey("startDate") && field.containsKey("endDate")) {
//                    field.put("startDate", from.toString());
//                    field.put("endDate", now.toString());
//                }
//                // If widget has a single "date" field, override it with "from" timestamp
//                else if (field.containsKey("date")) {
//                    field.put("date", from.toString());
//                }
//            }
//        }
//    }
//
//    /**
//     * Converts any object to a Map<String, Object>.
//     * If it's already a Map, it returns it.
//     * If it's a String, it wraps it in a map.
//     * If it's something else, it returns an empty map.
//     */
//    private Map<String, Object> convertToMap(Object obj) {
//        if (obj instanceof Map) {
//            return (Map<String, Object>) obj;
//        } else if (obj instanceof String) {
//            Map<String, Object> map = new HashMap<>();
//            map.put("value", obj);
//            return map;
//        }
//        return new HashMap<>(); // Default empty map
//    }
//
//    /**
//     * Converts any object to a List<String>.
//     * If it's already a List, it returns it.
//     * If it's a String, it wraps it in a list.
//     * If it's something else, it returns an empty list.
//     */
//    private List<String> convertToList(Object obj) {
//        if (obj instanceof List) {
//            return (List<String>) obj;
//        } else if (obj instanceof String) {
//            return Collections.singletonList((String) obj);
//        }
//        return new ArrayList<>(); // Default empty list
//    }
//
//    /**
//     * Converts any object to a List<Map<String, Object>>.
//     * If it's already a List of Maps, it returns it.
//     * If it's a single Map, it wraps it in a list.
//     */
//    private List<Map<String, Object>> convertToListOfMaps(Object obj) {
//        if (obj instanceof List) {
//            return (List<Map<String, Object>>) obj;
//        } else if (obj instanceof Map) {
//            return Collections.singletonList((Map<String, Object>) obj);
//        }
//        return new ArrayList<>(); // Default empty list
//    }
//
//
//
//    private Map<String, Object> fetchSensorValues(List<Map<String, Object>> sensors, LocalDateTime from, LocalDateTime to) {
//        Map<String, Object> valuesMap = new HashMap<>();
//
//        for (Map<String, Object> sensor : sensors) {
//            String sensorId = sensor.get("sensorid").toString();
//
//            // Fetch readings
//            List<Sensor> sensorReadings = sensorRepository.findBySensorIdAndTimestampBetween(sensorId, from, to);
//
//            // Calculate statistics
//            double avg = sensorReadings.stream().mapToDouble(Sensor::getValue).average().orElse(0);
//            double max = sensorReadings.stream().mapToDouble(Sensor::getValue).max().orElse(0);
//            double min = sensorReadings.stream().mapToDouble(Sensor::getValue).min().orElse(0);
//
//            Map<String, Object> statMap = new HashMap<>();
//            statMap.put("avg", avg);
//            statMap.put("max", max);
//            statMap.put("min", min);
//
//            valuesMap.put(sensorId, statMap);
//        }
//
//        return valuesMap;
//    }
//
//    // Parses JSON string to Map<String, Object>
//    public Map<String, Object> parseJsonToMap(String content) throws IOException {
//        if (content == null || content.trim().isEmpty()) {
//            throw new IllegalArgumentException("Content for JSON parsing is null or empty");
//        }
//        return objectMapper.readValue(content, Map.class);
//    }
//
//
//    // Converts Map<String, Object> to JSON string
//    private String convertDataToJson(Map<String, Object> dataMap) {
//        if (dataMap == null || dataMap.isEmpty()) {
//            // Return an empty JSON object or handle it as needed
//            return "{}";
//        }
//        try {
//            return objectMapper.writeValueAsString(dataMap);
//        } catch (JsonProcessingException e) {
//            throw new RuntimeException("Failed to convert Map to JSON string", e);
//        }
//    }
//
//    // 🟢 Get all schedules for a report
//    public List<Map<String, Object>> getAllSchedulesByReportId(Long reportId) {
//        return scheduledReportRepository.findAll()
//                .stream()
//                .filter(schedule -> schedule.getReport().getId().equals(reportId))
//                .map(schedule -> {
//                    Map<String, Object> scheduleMap = new HashMap<>();
//                    scheduleMap.put("id", schedule.getId());
//                    scheduleMap.put("reportId", schedule.getReport().getId());
//                    scheduleMap.put("frequency", schedule.getFrequency());
//                    scheduleMap.put("isActive", schedule.getIsActive());
//                    scheduleMap.put("startDate", schedule.getStartDate());
//                    scheduleMap.put("endDate", schedule.getEndDate());
//                    return scheduleMap;
//                })
//                .toList();
//    }
//
//
//    // 🟢 Get a specific schedule by reportId and frequency
//    public Map<String, Object> getScheduleByReportIdAndFrequency(Long reportId, String frequency) {
//        return scheduledReportRepository.findByReportIdAndFrequency(reportId, frequency)
//                .map(schedule -> {
//                    Map<String, Object> scheduleMap = new HashMap<>();
//                    scheduleMap.put("id", schedule.getId());
//                    scheduleMap.put("reportId", schedule.getReport().getId());
//                    scheduleMap.put("frequency", schedule.getFrequency());
//                    scheduleMap.put("isActive", schedule.getIsActive());
//                    scheduleMap.put("startDate", schedule.getStartDate());
//                    scheduleMap.put("endDate", schedule.getEndDate());
//                    return scheduleMap;
//                })
//                .orElse(null);
//    }
//
//
//    // 🟢 Get only enabled schedules
//    public List<Map<String, Object>> getActiveSchedulesByReportId(Long reportId) {
//        return scheduledReportRepository.findByReportIdAndIsActiveTrue(reportId)
//                .stream()
//                .map(schedule -> {
//                    Map<String, Object> scheduleMap = new HashMap<>();
//                    scheduleMap.put("id", schedule.getId());
//                    scheduleMap.put("reportId", schedule.getReport().getId());
//                    scheduleMap.put("frequency", schedule.getFrequency());
//                    scheduleMap.put("isActive", schedule.getIsActive());
//                    scheduleMap.put("startDate", schedule.getStartDate());
//                    scheduleMap.put("endDate", schedule.getEndDate());
//                    return scheduleMap;
//                })
//                .toList();
//    }
//
//    public ResponseEntity<?> deleteScheduledReport(Long id) {
//        Optional<ScheduledReport> scheduledReportOptional = scheduledReportRepository.findById(id);
//        if (scheduledReportOptional.isPresent()) {
//            scheduledReportRepository.deleteById(id);
//            return ResponseEntity.ok("Scheduled Report deleted successfully.");
//        } else {
//            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Scheduled Report not found with id: " + id);
//        }
//    }
//
//
//}
//


package com.Project.DataAcquisition.Service.Reports.Manual;

import com.Project.DataAcquisition.Entity.Reports.Automated.AutomatedReport;
import com.Project.DataAcquisition.Entity.Reports.Automated.AutomatedReportWidget;
import com.Project.DataAcquisition.Entity.Reports.Layout.ReportWidget;
import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import com.Project.DataAcquisition.Entity.Reports.Manual.Report;
import com.Project.DataAcquisition.Entity.Reports.Manual.ScheduledReport;
import com.Project.DataAcquisition.Entity.Reports.Manual.Sensor;
import com.Project.DataAcquisition.Repository.Reports.Automated.AutomatedReportRepository;
import com.Project.DataAcquisition.Repository.Reports.Automated.AutomatedReportWidgetRepository;
import com.Project.DataAcquisition.Repository.Reports.Manual.ReportRepository;
import com.Project.DataAcquisition.Repository.Reports.Widget.ReportWidgetRepository;
import com.Project.DataAcquisition.Repository.Reports.Manual.ScheduledReportRepository;
import com.Project.DataAcquisition.Repository.Rule.SensorRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportSchedulerService {

    private static final Logger logger = LoggerFactory.getLogger(ReportSchedulerService.class);


    private final ScheduledReportRepository scheduledReportRepository;
    private final AutomatedReportRepository automatedReportRepository;
    private final ReportRepository reportRepository;
    private final ReportWidgetRepository reportWidgetRepository;
    private final SensorRepository sensorRepository;
    private final AutomatedReportWidgetRepository automatedReportWidgetRepository;
    private final Object lock = new Object();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ReportSchedulerService(ScheduledReportRepository scheduledReportRepository,
                                  AutomatedReportRepository automatedReportRepository,
                                  ReportRepository reportRepository,
                                  ReportWidgetRepository reportWidgetRepository,
                                  SensorRepository sensorRepository,
                                  AutomatedReportWidgetRepository automatedReportWidgetRepository) {
        this.scheduledReportRepository = scheduledReportRepository;
        this.automatedReportRepository = automatedReportRepository;
        this.reportRepository = reportRepository;
        this.reportWidgetRepository = reportWidgetRepository;
        this.sensorRepository = sensorRepository;
        this.automatedReportWidgetRepository = automatedReportWidgetRepository;
    }

    public Map<String, Object> toggleSchedule(Long reportId, String frequency, boolean enable) {
        Map<String, Object> response = new HashMap<>();

        logger.info("🔍 toggleSchedule() called with Report ID={} Frequency={} Enable={}", reportId, frequency, enable);

        Optional<Report> reportOptional = reportRepository.findById(reportId);
        if (reportOptional.isEmpty()) {
            throw new IllegalArgumentException("❌ Report with ID " + reportId + " not found.");
        }

        Report report = reportOptional.get();

        if (!enable && (frequency == null || frequency.trim().isEmpty())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "❌ Frequency is required when disabling a schedule.");
        }

        Optional<ScheduledReport> existingSchedule = scheduledReportRepository.findByReportIdAndFrequency(reportId, frequency);

        if (existingSchedule.isPresent()) {
            ScheduledReport scheduledReport = existingSchedule.get();
            scheduledReport.setActive(enable);
            scheduledReportRepository.save(scheduledReport);

            if (!enable) {
                logger.info("❌ Schedule disabled for Report ID={} Frequency={}", reportId, frequency);
            }
        } else if (enable) {
            throw new IllegalArgumentException("❌ No existing schedule found for Report ID=" + reportId + " and Frequency=" + frequency);
        }

        report.setScheduleStatus(enable);
        reportRepository.save(report);

        logger.info("✅ Schedule {} for Report ID={} Frequency={}. Updated scheduleStatus to {}",
                enable ? "enabled" : "disabled", reportId, frequency, enable);

        if (enable && existingSchedule.isPresent()) {
            response.put("status", "Schedule enabled");
            response.put("isScheduleEnabled", true);
            response.put("frequency", existingSchedule.get().getFrequency());
            response.put("startDate", existingSchedule.get().getStartDate());
            response.put("endDate", existingSchedule.get().getEndDate());
        } else {
            response.put("status", "Schedule disabled");
            response.put("isScheduleEnabled", false);
        }

        return response;
    }


    @Transactional
    public void scheduleReport(Long reportId, String frequency, LocalDateTime startDate, LocalDateTime endDate) {
        logger.info("📌 Scheduling/updating report: Report ID={}, Frequency={}, StartDate={}, EndDate={}",
                reportId, frequency, startDate, endDate);

        Optional<Report> reportOptional = reportRepository.findById(reportId);
        if (reportOptional.isEmpty()) {
            throw new IllegalArgumentException("Report with ID " + reportId + " not found.");
        }

        Report report = reportOptional.get();

        Optional<ScheduledReport> existingScheduleOptional;

        if (frequency != null && !frequency.isEmpty()) {
            // Fetch existing schedule by Report ID and Frequency
            existingScheduleOptional = scheduledReportRepository.findByReportIdAndFrequency(reportId, frequency);
        } else {
            // Fetch any existing schedule by Report ID if frequency is not provided
            existingScheduleOptional = scheduledReportRepository.findByReportId(reportId);
        }

        ScheduledReport scheduledReport = existingScheduleOptional.orElseGet(ScheduledReport::new);
        scheduledReport.setReport(report);

        // ✅ If frequency is provided, update it. Otherwise, keep the existing one.
        if (frequency != null && !frequency.isEmpty()) {
            scheduledReport.setFrequency(frequency);
        } else if (existingScheduleOptional.isPresent()) {
            frequency = existingScheduleOptional.get().getFrequency(); // Use existing frequency
        }

        if (frequency == null || frequency.isEmpty()) {
            throw new IllegalArgumentException("Frequency is required for new schedules.");
        }

        // ✅ If startDate is provided, update it. Otherwise, keep the existing one.
        if (startDate != null) {
            scheduledReport.setStartDate(startDate);
            scheduledReport.setNextRun(startDate.withSecond(0).withNano(0)); // Update nextRun only if startDate changes
        } else if (existingScheduleOptional.isPresent()) {
            scheduledReport.setStartDate(existingScheduleOptional.get().getStartDate());
        }

        // ✅ If endDate is provided, update it. Otherwise, keep the existing one.
        if (endDate != null) {
            scheduledReport.setEndDate(endDate);
        } else if (existingScheduleOptional.isPresent()) {
            scheduledReport.setEndDate(existingScheduleOptional.get().getEndDate());
        }

        scheduledReport.setActive(true); // Ensure schedule remains active

        scheduledReportRepository.save(scheduledReport);
        logger.info("✅ Report schedule updated successfully: Report ID={}, Frequency={}, StartDate={}, EndDate={}, NextRun={}",
                reportId, scheduledReport.getFrequency(), scheduledReport.getStartDate(), scheduledReport.getEndDate(), scheduledReport.getNextRun());

        if (scheduledReport.getEndDate() != null &&
                scheduledReport.getNextRun().isAfter(scheduledReport.getEndDate())) {

            logger.info("🛑 End date {} is before nextRun {}. Deleting schedule immediately.",
                    scheduledReport.getEndDate(), scheduledReport.getNextRun());

            scheduledReportRepository.delete(scheduledReport);

        }

    }

    @Scheduled(cron = "0 * * * * *") // Runs every hour at HH:00:00
    public void checkHourlyReports() {
        processScheduledReports("HOURLY");
    }

    @Scheduled(cron = "0 * * * * *") // Runs daily at 10:30 AM
    public void checkDailyReports() {
        processScheduledReports("DAILY");
    }

    @Scheduled(cron = "0 * * * * *") // Runs every day at 10:30 AM
    public void checkWeeklyReports() {
        processScheduledReports("WEEKLY");
    }

    @Scheduled(cron = "0 * * * * *") // Runs every day at 10:30 AM
    public void checkMonthlyReports() {
        processScheduledReports("MONTHLY");
    }


    @Transactional
    public void processScheduledReports(String frequency) {
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);

        List<ScheduledReport> scheduledReports;
        synchronized (lock) { // Ensure thread safety
            // ✅ **Avoid Unnecessary Queries by Checking if Reports Exist First**
            boolean hasScheduledReports = scheduledReportRepository.existsByFrequencyAndNextRunBefore(frequency, now);
            if (!hasScheduledReports) {
                return; // 🚀 Exit early to avoid unnecessary DB query
            }

            // ✅ **Run the Query Only When Necessary**
            scheduledReports = switch (frequency) {
                case "HOURLY" -> scheduledReportRepository.findHourlyReportsToRun(now);
                case "DAILY" -> scheduledReportRepository.findDailyReportsToRun(now);
                case "WEEKLY" -> scheduledReportRepository.findWeeklyReportsToRun(now);
                case "MONTHLY" -> scheduledReportRepository.findMonthlyReportsToRun(now);
                default -> throw new IllegalArgumentException("Unsupported frequency: " + frequency);
            };
        }

// 🚨 **Exit Early if No Reports Exist After Query**
        if (scheduledReports.isEmpty()) {
            logger.info("⏳ No reports scheduled for frequency: {}", frequency);
            return;
        }

        for (ScheduledReport report : scheduledReports) {
            LocalDateTime nextRunNormalized = report.getNextRun();

            // 🚨 **Immediate Deletion Check (Handles Expired Schedules)**
            if (report.getEndDate() != null &&
                    (now.isAfter(report.getEndDate()) || now.isEqual(report.getEndDate()) ||
                            report.getNextRun().isAfter(report.getEndDate()) || report.getNextRun().isEqual(report.getEndDate()))) {
                deleteExpiredSchedule(report);
                continue;
            }


            // 🚀 **Execute Only if It's the Correct Time (No Waiting)**
            if (now.isAfter(nextRunNormalized.minusMinutes(1)) && now.isBefore(nextRunNormalized.plusMinutes(1))) {
                synchronized (lock) {
                    if (!report.getIsActive()) {
                        logger.warn("⚠️ Report ID={} schedule is inactive. Skipping report generation.", report.getReport().getId());
                        continue;
                    }
                    generateReport(report, frequency);
                }
            }
        }
    }

    @Transactional
    private void deleteExpiredSchedule(ScheduledReport report) {
        Long reportId = report.getReport().getId();
        Long deletedScheduleId = report.getId(); // Save ID before deletion

        logger.info("⏳ Report ID={} reached end date. Deleting schedule and checking remaining schedules.", reportId);

        scheduledReportRepository.delete(report);

        // 🛡 Check if there are still any other schedules remaining for this report
        boolean hasOtherSchedules = scheduledReportRepository.existsByReportId(reportId);

        if (!hasOtherSchedules) {
            reportRepository.updateScheduleStatus(reportId, false);
            logger.info("✅ Updated schedule status to false for Report ID={}", reportId);
        } else {
            logger.info("ℹ️ Other schedules exist for Report ID={}. Not updating schedule status.");
        }
    }


    @Transactional
    public void generateReport(ScheduledReport scheduledReport, String frequency) {
        LocalDateTime now = LocalDateTime.now().withSecond(0).withNano(0);

        if (scheduledReport == null) return;

        Report report = scheduledReport.getReport();
        if (report == null) {
            logger.error("❌ ScheduledReport is not linked to a valid Report.");
            throw new IllegalStateException("ScheduledReport is not linked to a valid Report.");
        }

        Long reportId = report.getId();
        logger.info("🕒 [START] Generating {} report for Report ID={}", frequency, reportId);

        if (!scheduledReport.getIsActive()) {
            logger.warn("⚠️ Report ID={} has an inactive schedule. Skipping report generation.", reportId);
            return;
        }

        try {
            AutomatedReport automatedReport = new AutomatedReport();
            automatedReport.setReportId(reportId);
            automatedReport.setReportType(report.getReportType());
            automatedReport.setFrequency(scheduledReport.getFrequency());
            automatedReport.setGeneratedTime(now);
            automatedReportRepository.save(automatedReport);

            List<ReportWidget> manualWidgets = reportWidgetRepository.findByReport_Id(reportId);

            for (ReportWidget manualWidget : manualWidgets) {
                Widget originalWidget = manualWidget.getWidget();
                String widgetJson = manualWidget.getData();
                Map<String, Object> updatedData;

                if (widgetJson == null) {
                    logger.warn("⚠️ Widget ID={} has null data. Proceeding with empty data.", manualWidget.getId());
                    updatedData = new HashMap<>();
                } else {
                    Map<String, Object> widgetData = parseJsonToMap(widgetJson);
                    updatedData = generateWidgetDataByFrequency(widgetData, frequency);
                }

                String updatedJson = convertDataToJson(updatedData);

                AutomatedReportWidget arw = new AutomatedReportWidget();
                arw.setAutomatedReport(automatedReport);
                arw.setWidget(originalWidget);
                arw.setData(updatedJson);
                automatedReportWidgetRepository.save(arw);
            }

            // Next Run Time
            LocalDateTime nextRun;
            LocalDateTime currentNextRun = scheduledReport.getNextRun();

            switch (frequency) {
                case "HOURLY":
                    nextRun = currentNextRun.plusHours(1);
                    break;
                case "DAILY":
                    nextRun = currentNextRun.plusDays(1);
                    break;
                case "WEEKLY":
                    nextRun = currentNextRun.plusWeeks(1);
                    break;
                case "MONTHLY":
                    LocalDate currentDate = currentNextRun.toLocalDate();
                    LocalDate nextMonthDate = currentDate.plusMonths(1);
                    int lastDayOfMonth = YearMonth.from(nextMonthDate).lengthOfMonth();
                    int day = Math.min(currentDate.getDayOfMonth(), lastDayOfMonth);
                    nextRun = LocalDateTime.of(nextMonthDate.getYear(), nextMonthDate.getMonth(), day,
                            currentNextRun.getHour(), currentNextRun.getMinute());
                    break;
                default:
                    throw new IllegalArgumentException("Unsupported frequency: " + frequency);
            }

            // Set nextRun with seconds/nanos cleared
            nextRun = nextRun.withSecond(0).withNano(0);



            logger.info("✅ [SUCCESS] {} report generated for Report ID={} at {}. Next Run at {}",
                    frequency, reportId, now, nextRun);


// 🔥 Check if nextRun exceeds endDate (then delete schedule)
            if (scheduledReport.getEndDate() != null && nextRun.isAfter(scheduledReport.getEndDate())) {
                logger.info("🛑 Next run {} is after end date {}. Deleting schedule for Report ID={}.",
                        nextRun, scheduledReport.getEndDate(), reportId);
                deleteExpiredSchedule(scheduledReport);
            } else {
                scheduledReport.setNextRun(nextRun);
                scheduledReportRepository.save(scheduledReport);
            }


        } catch (Exception e) {
            logger.error("❌ [ERROR] Failed to generate {} report for Report ID={}. Error: {}",
                    frequency, reportId, e.getMessage(), e);
        }
    }


    public Map<String, Object> generateWidgetDataByFrequency(Map<String, Object> originalData, String frequency) {
        Map<String, Object> updatedData = new HashMap<>(originalData);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime from;

        // Determine the correct time range based on frequency
        switch (frequency) {
            case "HOURLY":
                from = now.minusHours(1);
                break;
            case "DAILY":
                from = now.minusDays(1);
                break;
            case "WEEKLY":
                from = now.minusWeeks(1);
                break;
            case "MONTHLY":
                from = now.minusMonths(1);
                break;
            default:
                throw new IllegalArgumentException("Unsupported frequency: " + frequency);
        }

        // Update widgets' date fields based on frequency
        updateWidgetDates(updatedData, from, now);

        // Extract sensors, showValues, and aggregation safely
        List<Map<String, Object>> sensors = convertToListOfMaps(originalData.get("sensors"));
        boolean hasShowValues = originalData.containsKey("showValues");
        boolean hasAggregation = originalData.containsKey("aggregation");

        if (!sensors.isEmpty()) {
            for (Map<String, Object> sensor : sensors) {
                // Handle sensorId safely
                Object sensorIdObj = sensor.get("sensorId");
                String sensorId = "";
                if (sensorIdObj instanceof List) {
                    List<String> sensorIds = (List<String>) sensorIdObj;
                    sensorId = String.join(",", sensorIds); // Convert list to a comma-separated string
                } else if (sensorIdObj instanceof String) {
                    sensorId = (String) sensorIdObj;
                }

                // Handle sensorType safely
                Object sensorTypeObj = sensor.get("sensorType");
                String sensorType = "";
                if (sensorTypeObj instanceof List) {
                    List<String> sensorTypes = (List<String>) sensorTypeObj;
                    sensorType = String.join(",", sensorTypes);
                } else if (sensorTypeObj instanceof String) {
                    sensorType = (String) sensorTypeObj;
                }

                // Debugging (optional)
                System.out.println("Processing sensorId: " + sensorId + " | sensorType: " + sensorType);

                // Fetch sensor readings within the specified time range
                List<Sensor> sensorReadings = sensorRepository.findBySensorIdAndTimestampBetween(sensorId, from, now);

                // If the widget has showValues or aggregation, calculate min, max, avg
                if (hasShowValues || hasAggregation) {
                    double avg = sensorReadings.stream().mapToDouble(Sensor::getValue).average().orElse(0);
                    double max = sensorReadings.stream().mapToDouble(Sensor::getValue).max().orElse(0);
                    double min = sensorReadings.stream().mapToDouble(Sensor::getValue).min().orElse(0);

                    // Store calculated values at the widget level, not under each sensor
                    updatedData.put("average", avg);
                    updatedData.put("max", max);
                    updatedData.put("min", min);
                }

                // For line charts, add sensorValues (timestamp, value)
                List<Map<String, Object>> sensorValues = sensorReadings.stream().map(reading -> {
                    Map<String, Object> valMap = new HashMap<>();
                    valMap.put("timestamp", reading.getTimestamp().toString());
                    valMap.put("value", reading.getValue());
                    return valMap;
                }).collect(Collectors.toList());

                sensor.put("sensorValues", sensorValues); // Add sensorValues under each sensor
            }
        }

        updatedData.put("sensors", sensors); // Update processed sensors
        return updatedData;
    }

    /**
     * Updates the date fields inside widgets to ensure they match the selected frequency.
     */
    private void updateWidgetDates(Map<String, Object> widgetData, LocalDateTime from, LocalDateTime now) {
        for (Map.Entry<String, Object> entry : widgetData.entrySet()) {
            Object value = entry.getValue();

            if (value instanceof Map) { // If it's a nested object, check for date fields
                Map<String, Object> field = (Map<String, Object>) value;

                // If widget has "startDate" & "endDate", override them
                if (field.containsKey("startDate") && field.containsKey("endDate")) {
                    field.put("startDate", from.toString());
                    field.put("endDate", now.toString());
                }
                // If widget has a single "date" field, override it with "from" timestamp
                else if (field.containsKey("date")) {
                    field.put("date", from.toString());
                }
            }
        }
    }

    /**
     * Converts any object to a Map<String, Object>.
     * If it's already a Map, it returns it.
     * If it's a String, it wraps it in a map.
     * If it's something else, it returns an empty map.
     */
    private Map<String, Object> convertToMap(Object obj) {
        if (obj instanceof Map) {
            return (Map<String, Object>) obj;
        } else if (obj instanceof String) {
            Map<String, Object> map = new HashMap<>();
            map.put("value", obj);
            return map;
        }
        return new HashMap<>(); // Default empty map
    }

    /**
     * Converts any object to a List<String>.
     * If it's already a List, it returns it.
     * If it's a String, it wraps it in a list.
     * If it's something else, it returns an empty list.
     */
    private List<String> convertToList(Object obj) {
        if (obj instanceof List) {
            return (List<String>) obj;
        } else if (obj instanceof String) {
            return Collections.singletonList((String) obj);
        }
        return new ArrayList<>(); // Default empty list
    }

    /**
     * Converts any object to a List<Map<String, Object>>.
     * If it's already a List of Maps, it returns it.
     * If it's a single Map, it wraps it in a list.
     */
    private List<Map<String, Object>> convertToListOfMaps(Object obj) {
        if (obj instanceof List) {
            return (List<Map<String, Object>>) obj;
        } else if (obj instanceof Map) {
            return Collections.singletonList((Map<String, Object>) obj);
        }
        return new ArrayList<>(); // Default empty list
    }



    private Map<String, Object> fetchSensorValues(List<Map<String, Object>> sensors, LocalDateTime from, LocalDateTime to) {
        Map<String, Object> valuesMap = new HashMap<>();

        for (Map<String, Object> sensor : sensors) {
            String sensorId = sensor.get("sensorid").toString();

            // Fetch readings
            List<Sensor> sensorReadings = sensorRepository.findBySensorIdAndTimestampBetween(sensorId, from, to);

            // Calculate statistics
            double avg = sensorReadings.stream().mapToDouble(Sensor::getValue).average().orElse(0);
            double max = sensorReadings.stream().mapToDouble(Sensor::getValue).max().orElse(0);
            double min = sensorReadings.stream().mapToDouble(Sensor::getValue).min().orElse(0);

            Map<String, Object> statMap = new HashMap<>();
            statMap.put("avg", avg);
            statMap.put("max", max);
            statMap.put("min", min);

            valuesMap.put(sensorId, statMap);
        }

        return valuesMap;
    }

    // Parses JSON string to Map<String, Object>
    public Map<String, Object> parseJsonToMap(String content) throws IOException {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("Content for JSON parsing is null or empty");
        }
        return objectMapper.readValue(content, Map.class);
    }


    // Converts Map<String, Object> to JSON string
    private String convertDataToJson(Map<String, Object> dataMap) {
        if (dataMap == null || dataMap.isEmpty()) {
            // Return an empty JSON object or handle it as needed
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(dataMap);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert Map to JSON string", e);
        }
    }

    // 🟢 Get all schedules for a report
    public List<Map<String, Object>> getAllSchedulesByReportId(Long reportId) {
        return scheduledReportRepository.findAll()
                .stream()
                .filter(schedule -> schedule.getReport().getId().equals(reportId))
                .map(schedule -> {
                    Map<String, Object> scheduleMap = new HashMap<>();
                    scheduleMap.put("reportId", schedule.getReport().getId());
                    scheduleMap.put("frequency", schedule.getFrequency());
                    scheduleMap.put("isActive", schedule.getIsActive());
                    scheduleMap.put("startDate", schedule.getStartDate());
                    scheduleMap.put("endDate", schedule.getEndDate());
                    return scheduleMap;
                })
                .toList();
    }


    // 🟢 Get a specific schedule by reportId and frequency
    public Map<String, Object> getScheduleByReportIdAndFrequency(Long reportId, String frequency) {
        return scheduledReportRepository.findByReportIdAndFrequency(reportId, frequency)
                .map(schedule -> {
                    Map<String, Object> scheduleMap = new HashMap<>();
                    scheduleMap.put("reportId", schedule.getReport().getId());
                    scheduleMap.put("frequency", schedule.getFrequency());
                    scheduleMap.put("isActive", schedule.getIsActive());
                    scheduleMap.put("startDate", schedule.getStartDate());
                    scheduleMap.put("endDate", schedule.getEndDate());
                    return scheduleMap;
                })
                .orElse(null);
    }


    // 🟢 Get only enabled schedules
    public List<Map<String, Object>> getActiveSchedulesByReportId(Long reportId) {
        return scheduledReportRepository.findByReportIdAndIsActiveTrue(reportId)
                .stream()
                .map(schedule -> {
                    Map<String, Object> scheduleMap = new HashMap<>();
                    scheduleMap.put("reportId", schedule.getReport().getId());
                    scheduleMap.put("frequency", schedule.getFrequency());
                    scheduleMap.put("isActive", schedule.getIsActive());
                    scheduleMap.put("startDate", schedule.getStartDate());
                    scheduleMap.put("endDate", schedule.getEndDate());
                    return scheduleMap;
                })
                .toList();
    }


    public List<Map<String, Object>> getAllSchedules() {
        return scheduledReportRepository.findAll()
                .stream()
                .map(schedule -> {
                    Map<String, Object> scheduleMap = new HashMap<>();
                    scheduleMap.put("id" , schedule.getId());
                    scheduleMap.put("reportId", schedule.getReport().getId());
                    scheduleMap.put("frequency", schedule.getFrequency());
                    scheduleMap.put("isActive", schedule.getIsActive());
                    scheduleMap.put("startDate", schedule.getStartDate());
                    scheduleMap.put("endDate", schedule.getEndDate());
                    return scheduleMap;
                })

                .toList();
    }

    public ResponseEntity<?> deleteScheduledReport(Long id) {
        Optional<ScheduledReport> scheduledReportOptional = scheduledReportRepository.findById(id);
        if (scheduledReportOptional.isPresent()) {
            scheduledReportRepository.deleteById(id);
            return ResponseEntity.ok("Scheduled Report deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Scheduled Report not found with id: " + id);
        }
    }
}

