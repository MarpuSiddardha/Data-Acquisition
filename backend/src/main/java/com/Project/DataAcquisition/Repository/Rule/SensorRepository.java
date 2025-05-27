package com.Project.DataAcquisition.Repository.Rule;

import com.Project.DataAcquisition.Entity.Reports.Manual.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SensorRepository extends JpaRepository<Sensor, Long> {
    // Check if a sensor exists by sensor ID, sensor type, and RTU ID
    boolean existsBySensorIdAndSensorTypeIgnoreCaseAndRtu_RtuId(
            String sensorId, String sensorType, Long rtuId);

    boolean existsBySensorIdIgnoreCaseAndSensorTypeIgnoreCase(String sensorId, String sensorType);

    @Query("SELECT DISTINCT s.sensorType FROM Sensor s WHERE s.rtu.rtuId IN :rtuIds")
    List<String> findDistinctSensorTypesByRtuIds(@Param("rtuIds") List<Long> rtuIds);

    // Optional: Find sensors for a given RTU
    @Query("SELECT s FROM Sensor s WHERE s.rtu.rtuId = :rtuId")
    List<Sensor> findByRtuId(@Param("rtuId") Long rtuId);

    @Query("SELECT s.sensorId FROM Sensor s WHERE s.rtu.rtuId IN :rtuIds AND s.sensorType = :sensorType")
    List<String> findSensorIdsByRtu_RtuIdsAndSensorType(@Param("rtuIds") List<Long> rtuIds, @Param("sensorType") String sensorType);

    List<Sensor> findBySensorIdAndTimestampBetween(String sensorId, LocalDateTime from, LocalDateTime to);

    List<Sensor> findBySensorIdAndTimestampBetweenOrderByTimestamp(String sensorIdStr, LocalDateTime fromDate, LocalDateTime toDate);

    @Query("SELECT MAX(s.value) FROM Sensor s WHERE s.sensorId = :sensorId AND s.timestamp BETWEEN :startTime AND :endTime")
    Double findMaxValue(@Param("sensorId") String sensorId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Query("SELECT MIN(s.value) FROM Sensor s WHERE s.sensorId = :sensorId AND s.timestamp BETWEEN :startTime AND :endTime")
    Double findMinValue(@Param("sensorId") String sensorId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Query("SELECT AVG(s.value) FROM Sensor s WHERE s.sensorId = :sensorId AND s.timestamp BETWEEN :startTime AND :endTime")
    Double findAverageValue(@Param("sensorId") String sensorId, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    @Query("SELECT s FROM Sensor s WHERE s.rtu.rtuId IN :rtuIds")
    List<Sensor> findByRtuIds(@Param("rtuIds") List<Long> rtuIds);

    @Query("SELECT s FROM Sensor s WHERE s.sensorId IN :sensorIds AND s.sensorType IN :sensorTypes AND s.timestamp BETWEEN :startTime AND :endTime")
    List<Sensor> findBySensorIdAndTypeAndTimestampBetween(
            @Param("sensorIds") List<String> sensorIds,
            @Param("sensorTypes") List<String> sensorTypes,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    List<Sensor> findBySensorIdInAndSensorTypeIn(List<String> sensorIds, List<String> sensorTypes);

    @Query("SELECT s.value FROM Sensor s WHERE s.sensorId = :sensorId AND s.timestamp BETWEEN :startTime AND :endTime")
    List<Double> findSensorValuesBetween(@Param("sensorId") String sensorId,
                                         @Param("startTime") LocalDateTime startTime,
                                         @Param("endTime") LocalDateTime endTime);

    @Query("SELECT s FROM Sensor s WHERE s.sensorId = :sensorId AND s.timestamp BETWEEN :startTime AND :endTime")
    List<Sensor> findSensorDataBetween(@Param("sensorId") String sensorId,
                                       @Param("startTime") LocalDateTime startTime,
                                       @Param("endTime") LocalDateTime endTime);


    List<Sensor> findBySensorIdAndSensorType(String sensorId, String sensorType);
}

