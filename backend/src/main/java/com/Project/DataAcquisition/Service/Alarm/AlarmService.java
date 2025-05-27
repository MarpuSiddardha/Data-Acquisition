//package com.Project.DataAcquisition.Service.Alarm;
//
//import com.Project.DataAcquisition.Entity.Alarms.AlarmEntity;
//import com.Project.DataAcquisition.Exception.AlarmNotFoundException;
//import com.Project.DataAcquisition.Repository.Alarm.AlarmRepository;
//import jakarta.transaction.Transactional;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.stereotype.Service;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.Optional;
//import java.util.stream.Collectors;
//
//@Service
//public class AlarmService {
//
//    private static final Logger logger = LoggerFactory.getLogger(AlarmService.class);
//    private final AlarmRepository alarmRepository;
//
//    public AlarmService(AlarmRepository alarmRepository) {
//        this.alarmRepository = alarmRepository;
//    }
//
//    public List<AlarmEntity> getAllAlarms() {
//        return alarmRepository.findAll();
//    }
//
//    public AlarmEntity getAlarmById(Long alarmId) {
//        return alarmRepository.findById(alarmId)
//                .orElseThrow(() -> new AlarmNotFoundException("Alarm not found with id: " + alarmId));
//    }
//
//    public AlarmEntity saveAlarm(AlarmEntity alarm) {
//        return alarmRepository.save(alarm);
//    }
//
//    @Transactional
//    public boolean deleteAlarm(Long alarmId) {
//        if (alarmRepository.existsById(alarmId)) {
//            alarmRepository.deleteById(alarmId);
//            logger.info("Deleted alarm with id: {}", alarmId);
//            return true;
//        }
//        return false; // Alarm not found
//    }
//
//    @Transactional
//    public AlarmEntity updateAlarm(Long alarmId, String description, String status) {
//        return alarmRepository.findById(alarmId).map(alarm -> {
//            boolean updated = false;
//            if (description != null && !description.trim().isEmpty()) {
//                alarm.setDescription(description.trim());
//                updated = true;
//            }
//            if (status != null && !status.trim().isEmpty()) {
//                alarm.setStatus(status.trim());
//                updated = true;
//            }
//            return updated ? alarmRepository.save(alarm) : alarm;
//        }).orElseThrow(() -> new AlarmNotFoundException("Alarm not found with id: " + alarmId));
//    }
//
//    public List<AlarmEntity> searchAlarms(String query) {
//        if (query == null || query.trim().isEmpty()) {
//            return alarmRepository.findAll(); // If query is empty, return all alarms
//        }    return alarmRepository.findAll().stream()
//                .filter(alarm -> alarm.getAlarmName().toLowerCase().contains(query.toLowerCase()) ||
//                        Optional.ofNullable(alarm.getTags()).orElse(List.of())
//                                .stream().anyMatch(tag -> tag.toLowerCase().contains(query.toLowerCase())))
//                .collect(Collectors.toList());
//    }
//
//    public List<AlarmEntity> filterAlarms(String severity, String status) {
//        if (severity != null && status != null) {
//            return alarmRepository.findBySeverityAndStatus(severity, status);
//        } else if (severity != null) {
//            return alarmRepository.findBySeverity(severity);
//        } else if (status != null) {
//            return alarmRepository.findByStatus(status);
//        }
//        return alarmRepository.findAll(); // Return all if no filters applied
//    }
//
//    public Map<String, Object> getAlarmSummary() {
//        // Retrieve counts of active, acknowledged, closed, and total alarms
//        long activeCount = alarmRepository.countActiveAlarms();
//        long acknowledgedCount = alarmRepository.countAcknowledgedAlarms();
//        long closedCount = alarmRepository.countClosedAlarms();
//        long totalCount = alarmRepository.countTotalAlarms();
//        long HighCount=alarmRepository.countHighAlarms();
//        long LowCount=alarmRepository.countLowAlarms();
//        long ModerateCount=alarmRepository.countModerateAlarms();
//
//        // Prepare the chart information (Active, Acknowledged, Closed, Total)
//        Map<String, Object> chartInfo = new HashMap<>();
//        chartInfo.put("Active", activeCount);
//        chartInfo.put("Acknowledged", acknowledgedCount);
//        chartInfo.put("Closed", closedCount);
//        chartInfo.put("Total", totalCount);
//
//        Map<String, Object> severity= new HashMap<>();
//        severity.put("High", HighCount);
//        severity.put("Moderate", LowCount);
//        severity.put("Low", ModerateCount);
//        List<Object[]> statusCounts = alarmRepository.countAlarmsByStatus();
//
//        // Populate the status map with actual counts
//        for (Object[] result : statusCounts) {
//            String statusKey = (String) result[0];  // Assuming status is a String ("High", "Moderate", "Low")
//            Long count = (Long) result[1];
//            if (severity.containsKey(statusKey)) {
//                severity.put(statusKey, count);  // Update status count if the status exists
//            }
//        }
//
//        // Prepare the final response map
//        Map<String, Object> response = new HashMap<>();
//        response.put("ChartInfo", chartInfo);
//        response.put("Status", severity);
//
//        return response;
//    }
//}

package com.Project.DataAcquisition.Service.Alarm;

import com.Project.DataAcquisition.Entity.Alarms.AlarmEntity;
import com.Project.DataAcquisition.Exception.AlarmNotFoundException;
import com.Project.DataAcquisition.Repository.Alarm.AlarmRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AlarmService {

    private static final Logger logger = LoggerFactory.getLogger(AlarmService.class);
    private final AlarmRepository alarmRepository;

    // Static date formatter
    public static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public AlarmService(AlarmRepository alarmRepository) {
        this.alarmRepository = alarmRepository;
    }

    public List<Map<String, Object>> getAllAlarms() {
        return alarmRepository.findAll().stream()
                .map(alarm -> {
                    Map<String, Object> alarmsMap = new HashMap<>();
                    alarmsMap.put("id", alarm.getAlarmId());
                    alarmsMap.put("alarmName", alarm.getAlarmName());
                    alarmsMap.put("createdAt", alarm.getCreatedAt().format(DATE_TIME_FORMATTER));
                    alarmsMap.put("sensorId", alarm.getSensorId());
                    alarmsMap.put("ruleId", alarm.getRuleId());
                    alarmsMap.put("severity", alarm.getSeverity());
                    alarmsMap.put("status", alarm.getStatus());
                    alarmsMap.put("type", alarm.getType());
                    alarmsMap.put("acknowledgedBy", alarm.getAcknowledgedBy());
                    alarmsMap.put("acknowledgedAt", alarm.getAcknowledgedAt());
                    alarmsMap.put("description", alarm.getDescription());
                    alarmsMap.put("tags", alarm.getTags());
                    return alarmsMap;
                })
                .collect(Collectors.toList());
    }

    public AlarmEntity getAlarmById(Long alarmId) {
        return alarmRepository.findById(alarmId)
                .orElseThrow(() -> new AlarmNotFoundException("Alarm not found with id: " + alarmId));
    }

    public AlarmEntity saveAlarm(AlarmEntity alarm) {
        AlarmEntity saved = alarmRepository.save(alarm);
        String formattedTime = saved.getCreatedAt() != null
                ? saved.getCreatedAt().format(DATE_TIME_FORMATTER)
                : LocalDateTime.now().format(DATE_TIME_FORMATTER);

        logger.info("Alarm saved at: {}", formattedTime);
        return saved;
    }

    @Transactional
    public boolean deleteAlarm(Long alarmId) {
        if (alarmRepository.existsById(alarmId)) {
            alarmRepository.deleteById(alarmId);
            logger.info("Deleted alarm with id: {}", alarmId);
            return true;
        }
        return false; // Alarm not found
    }

    @Transactional
    public AlarmEntity updateAlarm(Long alarmId, String description, String status) {
        return alarmRepository.findById(alarmId).map(alarm -> {
            boolean updated = false;

            if (description != null && !description.trim().isEmpty()) {
                alarm.setDescription(description.trim());
                updated = true;
            }

            if (status != null && !status.trim().isEmpty()) {
                alarm.setStatus(status.trim());
                updated = true;
            }

            if (updated) {
                AlarmEntity updatedAlarm = alarmRepository.save(alarm);
                String formattedTime = LocalDateTime.now().format(DATE_TIME_FORMATTER);
                logger.info("Alarm updated at: {}", formattedTime);
                return updatedAlarm;
            }

            return alarm;
        }).orElseThrow(() -> new AlarmNotFoundException("Alarm not found with id: " + alarmId));
    }

    // Search Alarms by Name or Tag
    public List<AlarmEntity>    searchAlarms(String query) {
        if (query == null || query.trim().isEmpty()) {
            return alarmRepository.findAll(); // If query is empty, return all alarms
        }

        return alarmRepository.findAll().stream()
            .filter(alarm -> alarm.getAlarmName().toLowerCase().contains(query.toLowerCase()) ||
                Optional.ofNullable(alarm.getTags()).orElse(List.of())
                    .stream().anyMatch(tag -> tag.toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
    }

    public List<Map<String, Object>> filterAlarms(String severity, String status) {
        List<AlarmEntity> alarms;

        if (severity != null && status != null) {
            alarms = alarmRepository.findBySeverityAndStatus(severity, status);
        } else if (severity != null) {
            alarms = alarmRepository.findBySeverity(severity);
        } else if (status != null) {
            alarms = alarmRepository.findByStatus(status);
        } else {
            alarms = alarmRepository.findAll();
        }

        // Transform all AlarmEntity objects to maps with formatted dates
        return alarms.stream()
                .map(alarm -> {
                    Map<String, Object> alarmsMap = new HashMap<>();
                    alarmsMap.put("alarmId", alarm.getAlarmId());
                    alarmsMap.put("alarmName", alarm.getAlarmName());
                    alarmsMap.put("createdAt", alarm.getCreatedAt().format(DATE_TIME_FORMATTER));
                    alarmsMap.put("sensorId", alarm.getSensorId());
                    alarmsMap.put("ruleId", alarm.getRuleId());
                    alarmsMap.put("severity", alarm.getSeverity());
                    alarmsMap.put("status", alarm.getStatus());
                    alarmsMap.put("type", alarm.getType());
                    alarmsMap.put("acknowledgedBy", alarm.getAcknowledgedBy());
                    alarmsMap.put("acknowledgedAt", alarm.getAcknowledgedAt());
                    alarmsMap.put("description", alarm.getDescription());
                    alarmsMap.put("tags", alarm.getTags());
                    return alarmsMap;
                })
                .collect(Collectors.toList());
    }

    public Map<String, Object> getAlarmSummary() {
        // Retrieve counts
        long activeCount = alarmRepository.countActiveAlarms();
        long acknowledgedCount = alarmRepository.countAcknowledgedAlarms();
        long closedCount = alarmRepository.countClosedAlarms();
        long totalCount = alarmRepository.countTotalAlarms();
        long HighCount = alarmRepository.countHighAlarms();
        long LowCount = alarmRepository.countLowAlarms();
        long ModerateCount = alarmRepository.countModerateAlarms();

        // Chart Info
        Map<String, Object> chartInfo = new HashMap<>();
        chartInfo.put("active", activeCount);
        chartInfo.put("acknowledged", acknowledgedCount);
        chartInfo.put("closed", closedCount);
        chartInfo.put("total", totalCount);

        // Severity Info
        Map<String, Object> severity = new HashMap<>();
        severity.put("high", HighCount);
        severity.put("moderate", ModerateCount);
        severity.put("low", LowCount);

        List<Object[]> statusCounts = alarmRepository.countAlarmsByStatus();

        for (Object[] result : statusCounts) {
            String statusKey = (String) result[0];
            Long count = (Long) result[1];
            if (severity.containsKey(statusKey)) {
                severity.put(statusKey, count);
            }
        }

        // Final Summary Response
        Map<String, Object> response = new HashMap<>();
        response.put("chartInfo", chartInfo);
        response.put("status", severity);

        return response;
    }
}
