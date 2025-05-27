
package com.Project.DataAcquisition.Service.Reports.Automated;

import com.Project.DataAcquisition.Entity.Alarms.AlarmEntity;
import com.Project.DataAcquisition.Entity.Reports.Automated.AutomatedReport;
import com.Project.DataAcquisition.Entity.Reports.Automated.AutomatedReportWidget;
import com.Project.DataAcquisition.Entity.Reports.Layout.Layout;
import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import com.Project.DataAcquisition.Entity.Reports.Manual.Report;
import com.Project.DataAcquisition.Entity.Reports.Manual.Sensor;
import com.Project.DataAcquisition.Repository.Alarm.AlarmRepository;
import com.Project.DataAcquisition.Repository.Reports.Automated.AutomatedReportRepository;
import com.Project.DataAcquisition.Repository.Reports.Automated.AutomatedReportWidgetRepository;
import com.Project.DataAcquisition.Repository.Reports.Manual.ReportRepository;
import com.Project.DataAcquisition.Repository.Reports.Widget.ReportWidgetRepository;
import com.Project.DataAcquisition.Repository.Rule.SensorRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AutomatedReportService {

    @Autowired
    private AutomatedReportRepository automatedReportRepository;

    @Autowired
    private ReportWidgetRepository reportWidgetRepository;

    @Autowired
    private AutomatedReportWidgetRepository automatedReportWidgetRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private SensorRepository sensorRepository;

    @Autowired
    private AlarmRepository alarmRepository;

    private final ObjectMapper objectMapper;

    private static final Logger log = LoggerFactory.getLogger(AutomatedReportService.class);


    public static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public AutomatedReportService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<Map<String, Object>> getAllReports() {
        return automatedReportRepository.findAll().stream()
                .map(report -> {
                    Map<String, Object> automatedReportMap = new HashMap<>();
                    automatedReportMap.put("id", report.getId());
                    automatedReportMap.put("reportType", report.getReportType());
                    automatedReportMap.put("generatedTime", report.getGeneratedTime().format(DATE_TIME_FORMATTER));
                    automatedReportMap.put("frequency", report.getFrequency());
                    return automatedReportMap;
                })
                .collect(Collectors.toList());
    }

    public List<AutomatedReport> filterReports(String reportType, String frequency, String startDate, String endDate) {

        List<AutomatedReport> filteredReports = automatedReportRepository.findReportData().stream()
                .map(data -> {
                    AutomatedReport report = new AutomatedReport();
                    report.setId((Long) data[0]);
                    report.setReportId((Long) data[4]);
                    report.setReportType((String) data[1]);
                    report.setFrequency((String) data[2]);
                    report.setGeneratedTime((LocalDateTime) data[3]);
                    return report;
                })
                .collect(Collectors.toList());

        boolean hasFilterCriteria = (reportType != null && !reportType.isEmpty()) ||
                (frequency != null && !frequency.isEmpty()) ||
                (startDate != null && !startDate.isEmpty()) ||
                (endDate != null && !endDate.isEmpty());

        if (!hasFilterCriteria) {
            return filteredReports;
        }

        if (reportType != null && !reportType.isEmpty()) {
            System.out.println("Filtering reports by reportType: " + reportType);
            filteredReports = filteredReports.stream()
                    .filter(report -> report.getReportType().trim().equalsIgnoreCase(reportType.trim()))
                    .collect(Collectors.toList());
        }

        if (frequency != null && !frequency.isEmpty()) {
            System.out.println("Filtering reports by frequency: " + frequency);
            filteredReports = filteredReports.stream()
                    .filter(report -> report.getFrequency().trim().equalsIgnoreCase(frequency.trim()))
                    .collect(Collectors.toList());
        }

        if (startDate != null && !startDate.isEmpty() && endDate != null && !endDate.isEmpty()) {
            try {
                DateTimeFormatter formatterWithoutTime = DateTimeFormatter.ofPattern("yyyy-MM-dd");

                LocalDate start = tryParseDate(startDate, formatterWithoutTime);
                LocalDate end = tryParseDate(endDate, formatterWithoutTime);

                System.out.println("Filtering reports by date range: " + startDate + " to " + endDate);

                filteredReports = filteredReports.stream()
                        .filter(report -> {
                            LocalDate reportDate = report.getGeneratedTime().toLocalDate();
                            return !reportDate.isBefore(start) && !reportDate.isAfter(end);
                        })
                        .collect(Collectors.toList());

            } catch (Exception e) {
                System.out.println("Invalid date format. Please use 'yyyy-MM-dd'.");
                return new ArrayList<>();
            }
        } else if (startDate != null && !startDate.isEmpty()) {
            try {
                DateTimeFormatter formatterWithoutTime = DateTimeFormatter.ofPattern("yyyy-MM-dd");

                LocalDate start = tryParseDate(startDate, formatterWithoutTime);

                System.out.println("Filtering reports by startDate: " + startDate);

                filteredReports = filteredReports.stream()
                        .filter(report -> !report.getGeneratedTime().toLocalDate().isBefore(start))
                        .collect(Collectors.toList());

            } catch (Exception e) {
                System.out.println("Invalid date format. Please use 'yyyy-MM-dd'.");
                return new ArrayList<>();
            }
        } else if (endDate != null && !endDate.isEmpty()) {
            try {
                DateTimeFormatter formatterWithoutTime = DateTimeFormatter.ofPattern("yyyy-MM-dd");
                LocalDate end = tryParseDate(endDate, formatterWithoutTime);

                System.out.println("Filtering reports by endDate: " + endDate);

                filteredReports = filteredReports.stream()
                        .filter(report -> !report.getGeneratedTime().toLocalDate().isAfter(end))
                        .collect(Collectors.toList());

            } catch (Exception e) {
                System.out.println("Invalid date format. Please use 'yyyy-MM-dd'.");
                return new ArrayList<>();
            }
        }

        return filteredReports;
    }

    private LocalDate tryParseDate(String date, DateTimeFormatter formatter) {
        try {
            return LocalDate.parse(date, formatter);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    public Map<String, Object> getAutomatedReportById(Long automatedReportId) {
        AutomatedReport automatedReport = automatedReportRepository.findById(automatedReportId)
                .orElseThrow(() -> new NoSuchElementException("Automated Report not found"));

        String frequency = automatedReport.getFrequency();
        LocalDateTime generatedTime = automatedReport.getGeneratedTime();

        LinkedHashMap<String, Object> reportDetails = new LinkedHashMap<>();
        reportDetails.put("automatedReportId", automatedReport.getId());
        reportDetails.put("reportType", automatedReport.getReportType());
        reportDetails.put("generatedTime", generatedTime.format(DATE_TIME_FORMATTER));
        reportDetails.put("frequency", frequency);

        // Fetch the source manual report
        Report report = reportRepository.findById(automatedReport.getReportId())
                .orElseThrow(() -> new NoSuchElementException("Source Report not found"));

        Layout layout = report.getLayout();
        LinkedHashMap<String, Object> layoutDetails = new LinkedHashMap<>();
        layoutDetails.put("layoutName", layout.getLayoutName());
        layoutDetails.put("createdAt", layout.getCreatedAt().format(DATE_TIME_FORMATTER));

        // Fetch widgets for this automated report
        List<AutomatedReportWidget> automatedReportWidgets = automatedReportWidgetRepository.findByAutomatedReport_Id(automatedReportId);
        ObjectMapper objectMapper = new ObjectMapper();

        List<LinkedHashMap<String, Object>> widgetsList = automatedReportWidgets.stream()
                .map(autoWidget -> {
                    Widget widget = autoWidget.getWidget();
                    LinkedHashMap<String, Object> widgetDetails = new LinkedHashMap<>();
                    widgetDetails.put("widgetType", widget.getWidgetType());
                    widgetDetails.put("widgetName", widget.getWidgetName());

                    // Extract and parse widget data
                    LinkedHashMap<String, Object> widgetData = new LinkedHashMap<>();
                    String rawJsonData = autoWidget.getData();

                    if (rawJsonData != null && !rawJsonData.isEmpty()) {
                        try {
                            widgetData = objectMapper.readValue(rawJsonData, new TypeReference<>() {});
                        } catch (Exception e) {
                            System.err.println("Error parsing automated widget data: " + e.getMessage());
                        }
                    }

                    if (widgetData.isEmpty()) {
                        widgetDetails.put("data", null);
                    } else {
                        LinkedHashMap<String, Object> orderedData = new LinkedHashMap<>();
                        orderedData.put("title", getIgnoreCase(widgetData, "title", widget.getWidgetName()));
                        orderedData.put("rtus", widgetData.getOrDefault("rtus", null));
                        // Only include sensors in orderedData if it's not Alarm Table
                        if (!("Table".equalsIgnoreCase(widget.getWidgetType()) &&
                                "Alarms Table".equalsIgnoreCase(widget.getWidgetName()))) {
                            orderedData.put("sensors", widgetData.getOrDefault("sensors", null));
                        }


                        // Set date range based on frequency
                        LinkedHashMap<String, Object> adjustedDate = getDateRangeBasedOnGeneratedTime(frequency, generatedTime);
                        orderedData.put("date", adjustedDate);

                        // Include `showValues` if present
                        if (widgetData.containsKey("showValues")) {
                            orderedData.put("showValues", widgetData.get("showValues"));
                        }

                        // Include aggregations
                        if (widgetData.containsKey("aggregations")) {
                            orderedData.put("aggregations", widgetData.get("aggregations"));
                            orderedData.put("aggregationValues", getAggregationValues(widgetData, frequency, generatedTime));
                        }

                        // ✅ Sensor Data Table logic
                        if ("Table".equalsIgnoreCase(widget.getWidgetType()) && "Sensor Data Table".equalsIgnoreCase(widget.getWidgetName())) {
                            orderedData.put("sensorTableData", getSensorTableData(widgetData, frequency, generatedTime));

                            if (widgetData.containsKey("sensors")) {
                                List<Map<String, Object>> sensors = (List<Map<String, Object>>) widgetData.get("sensors");
                                sensors.forEach(sensor -> sensor.remove("sensorValues"));
                            }

                            widgetDetails.put("data", orderedData);
                        }

                        // ✅ Alarm Table logic
                        if ("Table".equalsIgnoreCase(widget.getWidgetType()) &&
                                "Alarms Table".equalsIgnoreCase(widget.getWidgetName())) {

                            String title = (String) widgetData.getOrDefault("title", "");
                            List<String> rtus = (List<String>) widgetData.getOrDefault("rtus", Collections.emptyList());
                            List<String> status = (List<String>) widgetData.getOrDefault("status", Collections.emptyList());
                            List<String> severity = (List<String>) widgetData.getOrDefault("severity", Collections.emptyList());

                            List<Map<String, Object>> sensorList = (List<Map<String, Object>>) widgetData.getOrDefault("sensors", Collections.emptyList());

                            List<String> sensorIds = new ArrayList<>();
                            List<String> sensorTypes = new ArrayList<>();

                            for (Map<String, Object> sensorMap : sensorList) {
                                // 👇 Properly fetch already parsed sensorId list
                                Object rawIds = sensorMap.get("sensorId");
                                if (rawIds instanceof List<?>) {
                                    for (Object id : (List<?>) rawIds) {
                                        if (id != null) {
                                            sensorIds.add(String.valueOf(id));
                                        }
                                    }
                                } else if (rawIds instanceof String) {
                                    sensorIds.add((String) rawIds);
                                }

                                // 👇 Handle "Type"
                                Object rawTypes = sensorMap.get("Type");
                                if (rawTypes instanceof List<?>) {
                                    for (Object type : (List<?>) rawTypes) {
                                        if (type != null) {
                                            sensorTypes.add(String.valueOf(type));
                                        }
                                    }
                                } else if (rawTypes instanceof String) {
                                    sensorTypes.add((String) rawTypes);
                                }
                            }


                            System.out.println("Sensor List: " + sensorList);
                            System.out.println("Sensor IDs: " + sensorIds);
                            System.out.println("Sensor Types: " + sensorTypes);


                            LocalDateTime startTime = switch (frequency.toUpperCase()) {
                                case "HOURLY" -> generatedTime.minusHours(1);
                                case "DAILY" -> generatedTime.minusDays(1);
                                case "WEEKLY" -> generatedTime.minusDays(7);
                                case "MONTHLY" -> generatedTime.minusDays(30);
                                default -> generatedTime.minusHours(1);
                            };

                            List<Map<String, Object>> alarmData = fetchAlarms(sensorIds, status, severity, startTime, generatedTime);

                            System.out.println("Alarm Data: " + alarmData);


                            Map<String, Object> sensors = new LinkedHashMap<>();
                            sensors.put("Type", sensorTypes);
                            sensors.put("sensorId", sensorIds);

                            Map<String, Object> alarmWidgetData = new LinkedHashMap<>();
                            alarmWidgetData.put("rtus", rtus);
                            alarmWidgetData.put("title", title);
                            alarmWidgetData.put("status", status);
                            alarmWidgetData.put("sensors", List.of(sensors));
                            alarmWidgetData.put("severity", severity);
                            alarmWidgetData.put("alarmTableData", alarmData);
                            alarmWidgetData.put("date",adjustedDate);


                            widgetDetails.put("data", alarmWidgetData);
                            System.out.println("Alarm Widget Data: " + alarmWidgetData);

                        }


                        // ✅ For all other widget types (if not already handled)
                        if (!widgetDetails.containsKey("data")) {
                            widgetDetails.put("data", orderedData);
                        }
                    }

                    return widgetDetails;
                })
                .collect(Collectors.toList());

        layoutDetails.put("widgets", widgetsList);
        reportDetails.put("layout", layoutDetails);

        return reportDetails;
    }



    private Map<String, Double> getAggregationValues(Map<String, Object> widgetData, String frequency, LocalDateTime generatedTime) {
        List<Double> values = fetchSensorValues(widgetData, frequency, generatedTime);

        Map<String, Double> aggregationMap = new HashMap<>();

        if (values.isEmpty()) {
            aggregationMap.put("max", null);
            aggregationMap.put("min", null);
            aggregationMap.put("average", null);
        } else {
            double max = values.stream().max(Double::compareTo).orElse(null);
            double min = values.stream().min(Double::compareTo).orElse(null);
            double average = values.stream().mapToDouble(Double::doubleValue).average().orElse(Double.NaN);
            aggregationMap.put("max", max);
            aggregationMap.put("min", min);
            aggregationMap.put("average", Double.isNaN(average) ? null : average);
        }

        return aggregationMap;
    }

    private List<Double> fetchSensorValues(Map<String, Object> widgetData, String frequency, LocalDateTime generatedTime) {
        List<Double> sensorValues = new ArrayList<>();

        List<Map<String, Object>> sensors = (List<Map<String, Object>>) widgetData.get("sensors");
        if (sensors == null || sensors.isEmpty()) {
            return sensorValues;
        }

        for (Map<String, Object> sensor : sensors) {
            String sensorId = (String) sensor.get("sensorId");
            if (sensorId != null) {
                sensorValues.addAll(getSensorReadings(sensorId, frequency, generatedTime));
            }
        }

        return sensorValues;
    }

    private List<Double> getSensorReadings(String sensorId, String frequency, LocalDateTime generatedTime) {
        LocalDateTime startTime = switch (frequency.toUpperCase()) {
            case "HOURLY" -> generatedTime.minusHours(1);
            case "DAILY" -> generatedTime.minusDays(1);
            case "WEEKLY" -> generatedTime.minusDays(7);
            case "MONTHLY" -> generatedTime.minusDays(30);
            default -> generatedTime;
        };

        return sensorRepository.findSensorValuesBetween(sensorId, startTime, generatedTime);
    }

    private List<Map<String, Object>> getSensorTableData(Map<String, Object> widgetData, String frequency, LocalDateTime generatedTime) {
        LocalDateTime startTime = switch (frequency.toUpperCase()) {
            case "HOURLY" -> generatedTime.minusHours(1);
            case "DAILY" -> generatedTime.minusDays(1);
            case "WEEKLY" -> generatedTime.minusDays(7);
            case "MONTHLY" -> generatedTime.minusDays(30);
            default -> generatedTime;
        };

        LocalDateTime endTime = generatedTime;

        return fetchSensorTableValues(widgetData, startTime, endTime);
    }


    private List<Map<String, Object>> fetchSensorTableValues(Map<String, Object> dataMap, LocalDateTime startTime, LocalDateTime endTime) {
        List<Map<String, Object>> sensorsList = (List<Map<String, Object>>) dataMap.get("sensors");

        if (sensorsList == null || sensorsList.isEmpty()) {
            log.warn("No sensors provided for fetching values in Sensor Data Table");
            return Collections.emptyList();
        }

        Set<String> addedEntries = new HashSet<>();
        List<Map<String, Object>> tableData = new ArrayList<>();

        for (Map<String, Object> sensorData : sensorsList) {
            Object rawSensorIds = sensorData.get("sensorId");
            Object rawSensorTypes = sensorData.get("sensorType");

            List<String> sensorIds = rawSensorIds instanceof List
                    ? (List<String>) rawSensorIds
                    : List.of(String.valueOf(rawSensorIds));

            List<String> sensorTypes = rawSensorTypes instanceof List
                    ? (List<String>) rawSensorTypes
                    : List.of(String.valueOf(rawSensorTypes));

            if (sensorIds.isEmpty() || sensorTypes.isEmpty()) {
                log.warn("Skipping sensor due to missing sensorId or sensorType");
                continue;
            }

            List<Sensor> validSensors = sensorRepository.findBySensorIdInAndSensorTypeIn(sensorIds, sensorTypes);

            for (Sensor sensor : validSensors) {
                String sensorId = sensor.getSensorId();
                List<Sensor> sensorValues = sensorRepository.findBySensorIdAndTimestampBetween(sensorId, startTime, endTime);

                for (Sensor sv : sensorValues) {
                    String valueStr = String.valueOf(sv.getValue());
                    String timestampStr = sv.getTimestamp().withNano(0).toString(); // remove nanoseconds

                    // Composite key to detect duplicates
                    String key = sensorId + "|" + valueStr + "|" + timestampStr;

                    if (addedEntries.contains(key)) {
                        continue; // skip duplicate
                    }

                    addedEntries.add(key);

                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("sensorId", sensorId);
                    row.put("value", sv.getValue());
                    row.put("timestamp", timestampStr);
                    tableData.add(row);
                }
            }
        }

        return tableData;
    }


    public List<Map<String, Object>> fetchAlarms(List<String> sensorIdList,
                                                 List<String> statusList,
                                                 List<String> severityList,
                                                 LocalDateTime startTime,
                                                 LocalDateTime endTime) {

        List<Map<String, Object>> allAlarms = new ArrayList<>();
        Set<String> seenAlarms = new HashSet<>();

        for (String sensorId : sensorIdList) {
            List<AlarmEntity> alarms = alarmRepository.findAlarmsBySensorId(
                    sensorId, statusList, severityList, startTime, endTime
            );

            for (AlarmEntity alarm : alarms) {
                // Get and sort the sensorIds for uniqueness check
                List<String> sensorIds = alarm.getSensorId(); // assuming it's List<String>
                List<String> sortedSensorIds = new ArrayList<>(sensorIds);
                Collections.sort(sortedSensorIds);

                // Unique key to avoid duplicates
                String uniqueKey = alarm.getAlarmId() + "|" +
                        String.join(",", sortedSensorIds) + "|" +
                        alarm.getStatus() + "|" +
                        alarm.getAlarmName();

                if (seenAlarms.add(uniqueKey)) {
                    Map<String, Object> alarmData = new LinkedHashMap<>();
                    alarmData.put("alarmId", alarm.getAlarmId());
                    alarmData.put("sensorId", sortedSensorIds);
                    alarmData.put("status", alarm.getStatus());
                    alarmData.put("alarmName", alarm.getAlarmName());
                    allAlarms.add(alarmData);
                }
            }
        }

        return allAlarms;
    }




    private String getIgnoreCase(Map<String, Object> map, String key, String defaultValue) {
        return map.entrySet().stream()
                .filter(entry -> entry.getKey().equalsIgnoreCase(key))
                .map(entry -> (String) entry.getValue())
                .findFirst()
                .orElse(defaultValue);
    }

    private LinkedHashMap<String, Object> getDateRangeBasedOnGeneratedTime(String frequency, LocalDateTime generatedTime) {
        LocalDateTime startDate;
        switch (frequency.toUpperCase()) {
            case "HOURLY" -> startDate = generatedTime.minusHours(1);
            case "DAILY" -> startDate = generatedTime.minusDays(1);
            case "WEEKLY" -> startDate = generatedTime.minusDays(7);
            case "MONTHLY" -> startDate = generatedTime.minusDays(30);
            default -> startDate = generatedTime; // fallback
        }

        LinkedHashMap<String, Object> dateRange = new LinkedHashMap<>();
        dateRange.put("startDate", startDate.format(DATE_TIME_FORMATTER));
        dateRange.put("endDate", generatedTime.format(DATE_TIME_FORMATTER));
        return dateRange;
    }
}
