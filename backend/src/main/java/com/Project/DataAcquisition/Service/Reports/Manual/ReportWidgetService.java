package com.Project.DataAcquisition.Service.Reports.Manual;

import com.Project.DataAcquisition.Entity.Alarms.AlarmEntity;
import com.Project.DataAcquisition.Entity.Reports.Layout.LayoutWidget;
import com.Project.DataAcquisition.Entity.Reports.Layout.ReportWidget;
import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import com.Project.DataAcquisition.Entity.Reports.Manual.Report;
import com.Project.DataAcquisition.Entity.Reports.Manual.Sensor;
import com.Project.DataAcquisition.Entity.Rules.RtuData;
import com.Project.DataAcquisition.Exception.GlobalExceptionHandler;
import com.Project.DataAcquisition.Repository.Alarm.AlarmRepository;
import com.Project.DataAcquisition.Repository.Reports.Manual.*;
import com.Project.DataAcquisition.Repository.Reports.Widget.LayoutWidgetRepository;
import com.Project.DataAcquisition.Repository.Reports.Widget.ReportWidgetRepository;
import com.Project.DataAcquisition.Repository.Reports.Widget.WidgetRepository;
import com.Project.DataAcquisition.Repository.Rule.SensorRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.Project.DataAcquisition.Exception.GlobalExceptionHandler.InvalidSensorDataException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportWidgetService {

    private final ReportRepository reportRepository;
    private final WidgetRepository widgetRepository;
    private final LayoutWidgetRepository layoutWidgetRepository;
    private final ReportWidgetRepository reportWidgetRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final Logger log = LoggerFactory.getLogger(ReportWidgetService.class);

    @Autowired
    private RtuRepository rtuRepository;

    @Autowired
    private SensorRepository sensorRepository;

    @Autowired
    private AlarmRepository alarmRepository;

    private static final Map<String, String> SENSOR_UNIT_MAP = Map.of(
            "Temperature", "°C",
            "Humidity", "%",
            "Pressure", "Pa"
    );

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    private static final DateTimeFormatter DATE_ONLY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");


    public ReportWidgetService(ReportRepository reportRepository, WidgetRepository widgetRepository, ReportWidgetRepository reportWidgetRepository, LayoutWidgetRepository layoutWidgetRepository) {
        this.reportRepository = reportRepository;
        this.widgetRepository = widgetRepository;
        this.reportWidgetRepository = reportWidgetRepository;
        this.layoutWidgetRepository = layoutWidgetRepository;
    }

    public Optional<LinkedHashMap<String, Object>> getWidgetInReport(Long reportId, Long widgetId) {
        Optional<Report> reportOptional = reportRepository.findById(reportId);
        if (reportOptional.isEmpty()) {
            return Optional.empty();
        }

        Report report = reportOptional.get();
        Long layoutId = report.getLayout().getId();

        Optional<ReportWidget> reportWidgetOptional = reportWidgetRepository.findByReport_IdAndWidget_WidgetId(reportId, widgetId);
        Widget widget;
        Map<String, Object> widgetData = new LinkedHashMap<>();

        if (reportWidgetOptional.isPresent()) {
            ReportWidget reportWidget = reportWidgetOptional.get();
            widget = reportWidget.getWidget();

            // Fetch stored JSON data
            String jsonData = reportWidget.getData();
            if (jsonData != null && !jsonData.isEmpty()) {
                try {
                    widgetData = objectMapper.readValue(jsonData, new TypeReference<>() {});
                } catch (Exception e) {
                    widgetData.put("error", "Invalid JSON format in ReportWidget data");
                }
            }
        } else {
            Optional<LayoutWidget> layoutWidgetOptional = layoutWidgetRepository.findByWidget_WidgetIdAndLayout_Id(widgetId, layoutId);
            if (layoutWidgetOptional.isEmpty()) {
                return Optional.empty();
            }
            widget = layoutWidgetOptional.get().getWidget();
            widgetData = widget.getData();
        }

        // ✅ Remove "sensorValues" if present inside "sensors"
        Object sensorsObj = widgetData.get("sensors");
        if (sensorsObj instanceof List<?>) {
            List<?> sensorsRaw = (List<?>) sensorsObj;
            List<LinkedHashMap<String, Object>> cleanedSensors = new ArrayList<>();

            for (Object sensorObj : sensorsRaw) {
                if (sensorObj instanceof Map<?, ?>) {
                    Map<?, ?> sensorMapRaw = (Map<?, ?>) sensorObj;
                    LinkedHashMap<String, Object> cleanedSensor = new LinkedHashMap<>();

                    // ✅ Retain only original keys and EXCLUDE "sensorValues"
                    for (Object key : sensorMapRaw.keySet()) {
                        if (!String.valueOf(key).equalsIgnoreCase("sensorValues")) {
                            cleanedSensor.put(String.valueOf(key), sensorMapRaw.get(key));
                        }
                    }

                    cleanedSensors.add(cleanedSensor);
                }
            }
            widgetData.put("sensors", cleanedSensors); // Replace with cleaned sensors
        }

        // ✅ Remove "aggregationValues" if present
        widgetData.remove("aggregationValues");

        // ✅ Build final response
        LinkedHashMap<String, Object> response = new LinkedHashMap<>();
        response.put("widgetType", widget.getWidgetType());
        response.put("widgetName", widget.getWidgetName());
        response.put("data", widgetData); // Updated to exclude extra fields

        return Optional.of(response);
    }


    @Transactional
    public boolean deleteWidgetInReport(Long reportId, Long widgetId) {
        Optional<ReportWidget> reportWidgetOptional =
                reportWidgetRepository.findByReport_IdAndWidget_WidgetId(reportId, widgetId);

        if (reportWidgetOptional.isPresent()) {
            reportWidgetRepository.delete(reportWidgetOptional.get());
            return true;
        }

        return false; // Widget not found in report
    }

    /**
     * Updates an existing widget in a report. If the widget does not exist in the report,
     * it creates a new ReportWidget entry.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> updateWidget(Long reportID, Long widgetID, Widget widget) {
        log.info("updateWidget method called with reportID: {}, widgetID: {}", reportID, widgetID);

        Optional<ReportWidget> reportWidgetOptional = reportWidgetRepository.findByReport_IdAndWidget_WidgetId(reportID, widgetID);

        if (reportWidgetOptional.isPresent()) {
            ReportWidget reportWidget = reportWidgetOptional.get();

            // Update widget metadata
            reportWidget.getWidget().setWidgetName(widget.getWidgetName());

            reportWidget.getWidget().setWidgetType(widget.getWidgetType().toString());

            // Validate widget data
            Map<String, Object> dataMap = (Map<String, Object>) widget.getData();
            if (dataMap == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Widget data is missing.");
            }
            try {
                validateWidgetData(widget.getWidgetName(), dataMap);
            } catch (Exception e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Validation failed: " + e.getMessage());
            }


            if (dataMap != null) {
                String widgetName = widget.getWidgetName();
                Map<String, Object> orderedDataMap = new LinkedHashMap<>(dataMap);

                try {
                    log.info("Updating widget with ID {} in report {}: {}", widgetID, reportID, dataMap);

                    // Ensure 'rtus' is treated correctly (can be a string or list)
                    if (dataMap.get("rtus") instanceof String) {
                        orderedDataMap.put("rtus", List.of(dataMap.get("rtus")));
                    } else if (dataMap.get("rtus") instanceof List) {
                        orderedDataMap.put("rtus", dataMap.get("rtus"));
                    }

                    // Ensure that if sensorType and sensorId are provided, they are processed correctly
                    if (dataMap.containsKey("sensorType") && dataMap.containsKey("sensorId")) {
                        Map<String, Object> sensorData = new LinkedHashMap<>();
                        sensorData.put("sensorType", dataMap.get("sensorType"));
                        sensorData.put("sensorId", dataMap.get("sensorId"));
                        orderedDataMap.put("sensors", List.of(sensorData));
                    }

                    // Handle widget-specific cases
                    if ("Time Series Chart".equalsIgnoreCase(widgetName)) {
                        LocalDateTime endTime = LocalDateTime.now();
                        LocalDateTime startTime = endTime.minusHours(24);
                        orderedDataMap.put("sensors", fetchSensorValues(orderedDataMap, startTime, endTime));

                    } else if ("Line Chart".equalsIgnoreCase(widgetName) || "Bar Chart".equalsIgnoreCase(widgetName)) {
                        if (!dataMap.containsKey("date") || dataMap.get("date") == null) {
                            throw new IllegalArgumentException("Date range is missing for " + widgetName);
                        }

                        Map<String, String> dateRange = (Map<String, String>) dataMap.get("date");
                        if (!dateRange.containsKey("startDate") || !dateRange.containsKey("endDate")) {
                            throw new IllegalArgumentException("Invalid date range format for " + widgetName);
                        }

                        LocalDateTime startTime = parseDateOrDateTime(dateRange.get("startDate"), false);
                        LocalDateTime endTime = parseDateOrDateTime(dateRange.get("endDate"), true);


                        orderedDataMap.put("sensors", fetchSensorValues(orderedDataMap, startTime, endTime));

                    } else if ("Value Card".equalsIgnoreCase(widgetName)) {

                        if (!dataMap.containsKey("date") || dataMap.get("date") == null) {
                            throw new IllegalArgumentException("Date is missing for Value Card.");
                        }

                        String sensorId = getSensorId(orderedDataMap);
                        if (sensorId == null || sensorId.isEmpty()) {
                            throw new IllegalArgumentException("Sensor ID is missing or empty in Value Card.");
                        }

                        String dateInput = dataMap.get("date").toString();
                        LocalDateTime startTime;
                        LocalDateTime endTime;
                        try {
                            startTime = parseDateOrDateTime(dateInput, false);
                            endTime = parseDateOrDateTime(dateInput, true);
                        } catch (DateTimeParseException e) {
                            throw new IllegalArgumentException("Invalid date format: " + dateInput);
                        }


                        // Fetch aggregation values like max, min, average for the Value Card
                        Map<String, Boolean> requestedAggregations = (Map<String, Boolean>) dataMap.get("aggregations");
                        if (requestedAggregations == null) {
                            throw new IllegalArgumentException("Aggregations data is missing in Value Card.");
                        }

                        Map<String, Double> aggregationValues = new LinkedHashMap<>();

                        if (requestedAggregations.getOrDefault("max", false)) {
                            Double maxValue = sensorRepository.findMaxValue(sensorId, startTime, endTime);
                            aggregationValues.put("max", maxValue != null ? maxValue : 0.0);
                        }
                        if (requestedAggregations.getOrDefault("min", false)) {
                            Double minValue = sensorRepository.findMinValue(sensorId, startTime, endTime);
                            aggregationValues.put("min", minValue != null ? minValue : 0.0);
                        }
                        if (requestedAggregations.getOrDefault("average", false)) {
                            Double avgValue = sensorRepository.findAverageValue(sensorId, startTime, endTime);
                            aggregationValues.put("average", avgValue != null ? avgValue : 0.0);
                        }

                        orderedDataMap.put("aggregationValues", aggregationValues);

                    } else if ("Value and Chart Card".equalsIgnoreCase(widgetName)) {
                        LocalDateTime endTime = LocalDateTime.now();
                        LocalDateTime startTime = endTime.minusHours(24);

                        // Directly fetch sensor values
                        orderedDataMap.put("sensors", fetchSensorValues(orderedDataMap, startTime, endTime));

                    } else if ("Sensor Data Table".equalsIgnoreCase(widgetName)) {
                        if (!dataMap.containsKey("date") || dataMap.get("date") == null) {
                            throw new IllegalArgumentException("Date range is missing for Sensor Data Table.");
                        }

                        Map<String, String> dateRange = (Map<String, String>) dataMap.get("date");
                        if (!dateRange.containsKey("startDate") || !dateRange.containsKey("endDate")) {
                            throw new IllegalArgumentException("Invalid date range format for Sensor Data Table.");
                        }

                        LocalDateTime startTime = parseDateOrDateTime(dateRange.get("startDate"), false);
                        LocalDateTime endTime = parseDateOrDateTime(dateRange.get("endDate"), true);

                        // Fetch sensor data list
                        List<Map<String, Object>> sensorData = fetchSensorTableValues(orderedDataMap, startTime, endTime);

                        // ✅ Store it in a single key to ensure proper JSON response
                        orderedDataMap.put("sensorTableData", sensorData);

                    } else if ("Alarms Table".equalsIgnoreCase(widgetName)) {
                        List<Map<String, Object>> sensorsList = (List<Map<String, Object>>) dataMap.get("sensors");
                        List<String> sensorId = new ArrayList<>();
                        List<String> sensorTypes = new ArrayList<>();

                        if (sensorsList != null && !sensorsList.isEmpty()) {
                            for (Map<String, Object> sensorEntry : sensorsList) {
                                Object sensorIdsObj = sensorEntry.get("sensorId");
                                Object typesObj = sensorEntry.get("Type"); // Capital T matches your JSON

                                if (sensorIdsObj instanceof List<?> && typesObj instanceof List<?>) {
                                    List<?> idsList = (List<?>) sensorIdsObj;
                                    List<?> typesList = (List<?>) typesObj;

                                    boolean idsValid = idsList.stream().allMatch(id -> id instanceof String);
                                    boolean typesValid = typesList.stream().allMatch(t -> t instanceof String);

                                    if (idsValid && typesValid && !idsList.isEmpty() && !typesList.isEmpty()) {
                                        sensorId.addAll((List<String>) idsList);
                                        sensorTypes.addAll((List<String>) typesList);
                                    } else {
                                        log.error("Sensor data contains non-string or empty values: {}", sensorEntry);
                                    }
                                } else {
                                    log.error("Sensor data is incomplete or wrong type: {}", sensorEntry);
                                }
                            }
                        } else {
                            log.warn("Sensor list is null or empty.");
                        }

                        List<String> statusList = (List<String>) dataMap.get("status");
                        List<String> severityList = (List<String>) dataMap.get("severity");

                        Map<String, String> dateRange = (Map<String, String>) dataMap.get("date");

                        LocalDateTime startTime = parseDateOrDateTime(dateRange.get("startDate"), false);
                        LocalDateTime endTime = parseDateOrDateTime(dateRange.get("endDate"), true);


                        List<Map<String, Object>> alarmTableData = fetchAlarms(sensorId, statusList, severityList, startTime, endTime);
                        orderedDataMap.put("alarmTableData", alarmTableData);
                    }


                } catch (Exception e) {
                    log.error("Error while processing widget {}: {}", widgetName, e.getMessage(), e);
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid data: " + e.getMessage());
                }

                // Convert updated data to JSON and save
                String updatedDataJson = convertDataToJson(orderedDataMap);
                reportWidget.setData(updatedDataJson);
                reportWidgetRepository.save(reportWidget);

                // Prepare response
                Map<String, Object> formattedResponse = new LinkedHashMap<>();
                Map<String, Object> widgetDetails = new LinkedHashMap<>();

                widgetDetails.put("widgetType", widget.getWidgetType().toString());
                widgetDetails.put("widgetName", widget.getWidgetName());
                widgetDetails.put("data", orderedDataMap);

                formattedResponse.put(widget.getWidgetType().toString(), widgetDetails);

                return formattedResponse;
            }
        }

        throw new EntityNotFoundException("Widget not found with ID: " + widgetID + " in report ID: " + reportID);
    }


    private LocalDateTime parseDateOrDateTime(String input, boolean isEndDate) {
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try {
            // Try parsing full datetime
            return LocalDateTime.parse(input, dateTimeFormatter);
        } catch (DateTimeParseException e) {
            // If only date is given
            LocalDate date = LocalDate.parse(input, dateFormatter);
            return isEndDate ? date.atTime(23, 59, 59) : date.atStartOfDay();
        }
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

    private List<Map<String, Object>> fetchSensorValues(Map<String, Object> dataMap, LocalDateTime startTime, LocalDateTime endTime) {
        List<Map<String, Object>> sensors = (List<Map<String, Object>>) dataMap.get("sensors");
        if (sensors == null || sensors.isEmpty()) {
            throw new GlobalExceptionHandler.InvalidInputException("Sensors  must not be empty"); // Return empty list if no sensors
        }

        List<Map<String, Object>> updatedSensors = new ArrayList<>();
        for (Map<String, Object> sensor : sensors) {
            String sensorId = sensor.get("sensorId").toString();
            log.info("Fetching sensor values for Sensor ID: {} from {} to {}", sensorId, startTime, endTime);

            // Fetch sensor values from DB within the given time range
            List<Sensor> sensorValues = sensorRepository.findBySensorIdAndTimestampBetween(sensorId, startTime, endTime);
            log.info("Fetched {} values for Sensor: {}", sensorValues.size(), sensorId);

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


    private List<Map<String, Object>> fetchSensorTableValues(Map<String, Object> dataMap, LocalDateTime startTime, LocalDateTime endTime) {
        List<Map<String, Object>> sensorsList = (List<Map<String, Object>>) dataMap.get("sensors");

        if (sensorsList == null || sensorsList.isEmpty()) {
            throw new GlobalExceptionHandler.InvalidInputException("Sensors  must not be empty");
        }

        Set<String> addedEntries = new HashSet<>();
        List<Map<String, Object>> tableData = new ArrayList<>();

        for (Map<String, Object> sensorData : sensorsList) {
            // Extract sensorIds and sensorTypes from each sensorData entry
            Object rawSensorIds = sensorData.get("sensorId");
            Object rawSensorTypes = sensorData.get("sensorType");

            List<String> sensorIds = rawSensorIds instanceof List
                    ? (List<String>) rawSensorIds
                    : List.of(String.valueOf(rawSensorIds));

            List<String> sensorTypes = rawSensorTypes instanceof List
                    ? (List<String>) rawSensorTypes
                    : List.of(String.valueOf(rawSensorTypes));

            if (sensorIds.isEmpty() || sensorTypes.isEmpty()) {
                throw new GlobalExceptionHandler.InvalidInputException("Sensors  must not be empty");
            }

            log.info("Validating sensors using sensorIds={} and sensorTypes={}", sensorIds, sensorTypes);
            List<Sensor> validSensors = sensorRepository.findBySensorIdInAndSensorTypeIn(sensorIds, sensorTypes);

            if (validSensors.isEmpty()) {
                throw new GlobalExceptionHandler.InvalidSensorDataException("Invalid Sensors");
            }

            for (Sensor sensor : validSensors) {
                String sensorId = sensor.getSensorId();
                log.info("Fetching sensor data table values for Sensor ID: {} from {} to {}", sensorId, startTime, endTime);

                List<Sensor> sensorValues = sensorRepository.findBySensorIdAndTimestampBetween(sensorId, startTime, endTime);

                log.info("Fetched {} values for Sensor: {} in Sensor Data Table", sensorValues.size(), sensorId);

                for (Sensor sv : sensorValues) {
                    String valueStr = String.valueOf(sv.getValue());
                    String timestampStr = sv.getTimestamp().withNano(0).toString(); // Normalize timestamp
                    String key = sensorId + "|" + valueStr + "|" + timestampStr;

                    if (addedEntries.contains(key)) {
                        continue; // Skip duplicate
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
                // Sort the sensorId array (assuming it's stored as JSON array)
                List<String> sensorIds = alarm.getSensorId(); // assuming it's List<String>
                List<String> sortedSensorIds = new ArrayList<>(sensorIds);
                Collections.sort(sortedSensorIds);

                // Create a unique string key for this alarm
                String uniqueKey = alarm.getAlarmId() + "|" +
                        String.join(",", sortedSensorIds) + "|" +
                        alarm.getStatus() + "|" +
                        alarm.getAlarmName();

                // Add only if not seen before
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


    private Map<String, Double> fetchAggregatedValues(String sensorId, LocalDateTime startTime, LocalDateTime endTime) {
        Double maxValue = sensorRepository.findMaxValue(sensorId, startTime, endTime);
        Double minValue = sensorRepository.findMinValue(sensorId, startTime, endTime);
        Double avgValue = sensorRepository.findAverageValue(sensorId, startTime, endTime);

        Map<String, Double> aggregationMap = new LinkedHashMap<>();
        aggregationMap.put("max", maxValue);
        aggregationMap.put("min", minValue);
        aggregationMap.put("average", avgValue);

        return aggregationMap;
    }

    private void validateWidgetData(String widgetName, Object rawData) {
        Map<String, Object> dataMap = (Map<String, Object>) rawData;
        log.info(">> Raw widget data received for validation: {}", rawData);
        log.info(">> Parsed dataMap: {}", dataMap);

        // ✅ RTU Validation
        List<Object> rawRtus = (List<Object>) dataMap.get("rtus");
        log.info(">> Extracted rawRtus: {}", rawRtus);

        if (rawRtus == null || rawRtus.isEmpty()) {
            log.error("RTUs list is missing or empty.");
            throw new IllegalArgumentException("RTUs list cannot be null or empty.");
        }

        List<String> rtuNames = rawRtus.stream().map(Object::toString).collect(Collectors.toList());
        log.info(">> Converted RTU names: {}", rtuNames);

        List<RtuData> rtus = rtuRepository.findAllByRtuNameIn(rtuNames);
        log.info(">> Retrieved RTU entries from DB: {}", rtus);

        if (rtus.size() != rtuNames.size()) {
            log.error("Invalid RTU names found. Expected: {}, Found: {}", rtuNames, rtus);
            throw new GlobalExceptionHandler.InvalidSensorDataException("Invalid RTU names found in widget data.");
        }

        // ✅ Sensor Validation
        Object sensorsObject = dataMap.get("sensors");
        log.info(">> Raw sensors object: {}", sensorsObject);

        if (!(sensorsObject instanceof List<?> sensorsRaw)) {
            log.error("Invalid or missing sensors list.");
            throw new IllegalArgumentException("Sensors list must be a non-null list.");
        }

        if (sensorsRaw.isEmpty()) {
            log.error("Sensors list is empty.");
            throw new IllegalArgumentException("Sensors list cannot be empty.");
        }

        if (sensorsRaw.size() > 5) {
            log.error("Too many sensors: {}", sensorsRaw.size());
            throw new IllegalArgumentException("Maximum of 5 sensors allowed per widget.");
        }

        for (Object sensorObj : sensorsRaw) {
            log.info(">> Validating sensor object: {}", sensorObj);

            if (!(sensorObj instanceof Map<?, ?>)) {
                throw new IllegalArgumentException("Each sensor entry must be a map.");
            }

            Map<String, Object> sensorMap = (Map<String, Object>) sensorObj;
            log.info(">> Parsed sensorMap: {}", sensorMap);

            boolean isAlarmTable = "Alarms Table".equalsIgnoreCase(widgetName);

            if (isAlarmTable) {
                List<String> sensorIds = toStringList(sensorMap.get("sensorId"));
                List<String> types = toStringList(sensorMap.get("Type"));

                if (types.size() == 1) {
                    String type = types.get(0);
                    for (String sensorId : sensorIds) {
                        String sensorIdJson = wrapInJsonArray(sensorId);
                        String typeJson = wrapInJsonArray(type);

                        log.info("Calling existsBySensorIdAndType with sensorIdJson={}, typeJson={}", sensorIdJson, typeJson);
                        if (!alarmRepository.existsBySensorIdAndType(sensorIdJson, typeJson)) {
                            throw new IllegalArgumentException("Alarm entry not found for sensorId=" + sensorId + " and type=" + type);
                        }
                    }
                } else if (sensorIds.size() == types.size()) {
                    for (int i = 0; i < sensorIds.size(); i++) {
                        String sensorIdJson = wrapInJsonArray(sensorIds.get(i));
                        String typeJson = wrapInJsonArray(types.get(i));

                        log.info("Checking alarm existence for sensorId={} and type={}", sensorIds.get(i), types.get(i));
                        if (!alarmRepository.existsBySensorIdAndType(sensorIdJson, typeJson)) {
                            throw new IllegalArgumentException("Alarm entry not found for sensorId=" + sensorIds.get(i) + " and type=" + types.get(i));
                        }
                    }
                } else {
                    throw new IllegalArgumentException("Sensor ID and Type lists must either be of the same size or only one type provided.");
                }

            } else {
                Object sensorIdObj = sensorMap.get("sensorId");
                Object sensorTypeObj = sensorMap.get("sensorType");

                if (sensorIdObj == null || sensorTypeObj == null) {
                    throw new IllegalArgumentException("Sensor ID or Sensor Type is missing.");
                }

                String sensorId = sensorIdObj.toString();
                String sensorType = sensorTypeObj.toString();

                log.info("Checking sensor existence for sensorId={} and sensorType={}", sensorId, sensorType);

                log.info(">> Extracted sensorId: {}, sensorType: {}", sensorId, sensorType);
                log.info("Calling sensorRepository.findBySensorIdAndSensorType()...");

                try {
                    List<Sensor> sensors = sensorRepository.findBySensorIdAndSensorType(sensorId, sensorType);
                    log.info("Sensor lookup completed. Found: {}", sensors);
                    if (sensors == null) {
                        throw new IllegalArgumentException("Sensor not found for sensorId=" + sensorId + ", sensorType=" + sensorType);
                    }
                } catch (Exception e) {
                    log.error("Exception during sensor lookup: {}", e.getMessage(), e);
                    throw e;
                }

            }
        }
    }


    private List<String> toStringList(Object value) {
        if (value == null) {
            return Collections.emptyList();
        }

        if (value instanceof List<?>) {
            return ((List<?>) value).stream()
                    .map(Object::toString)
                    .collect(Collectors.toList());
        }

        if (value instanceof String) {
            return List.of((String) value);
        }

        throw new IllegalArgumentException("Expected a List or String but got: " + value.getClass());
    }

    private String wrapInJsonArray(String value) {
        return "[\"" + value + "\"]"; // ✅ Manual, fast & safe for a single string
    }


    private String convertDataToJson(Object data) {
        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error converting widget data to JSON", e);
        }
    }




}