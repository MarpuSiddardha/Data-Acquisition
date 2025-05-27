package com.Project.DataAcquisition.Repository.Alarm;

import com.Project.DataAcquisition.Entity.Alarms.AlarmEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlarmRepository extends JpaRepository<AlarmEntity, Long> {

    List<AlarmEntity> findBySeverity(String severity);

    List<AlarmEntity> findByStatus(String status);

    List<AlarmEntity> findBySeverityAndStatus(String severity, String status);



    @Query("SELECT COUNT(a) FROM AlarmEntity a WHERE a.status = 'Active'")
    long countActiveAlarms();

    @Query("SELECT COUNT(a) FROM AlarmEntity a WHERE a.status = 'Acknowledged'")
    long countAcknowledgedAlarms();

    @Query("SELECT COUNT(a) FROM AlarmEntity a WHERE a.status = 'Closed'")
    long countClosedAlarms();

    @Query("SELECT COUNT(a) FROM AlarmEntity a")
    long countTotalAlarms();

    @Query("SELECT a.status, COUNT(a) FROM AlarmEntity a GROUP BY a.status")
    List<Object[]> countAlarmsByStatus();

    @Query("SELECT COUNT(a) FROM AlarmEntity a WHERE a.severity = 'High'")
    long countHighAlarms();

    @Query("SELECT COUNT(a) FROM AlarmEntity a WHERE a.severity = 'Low'")
    long countLowAlarms();

    @Query("SELECT COUNT(a) FROM AlarmEntity a WHERE a.severity = 'Moderate'")
    long countModerateAlarms();

    @Query(value = """
    SELECT DISTINCT * FROM alarms 
    WHERE EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(sensor_id) AS elem 
        WHERE elem = :sensorId
    )
    AND status IN :statusList 
    AND severity IN :severityList 
    AND created_at BETWEEN :startTime AND :endTime
    """, nativeQuery = true)
    List<AlarmEntity> findAlarmsBySensorId(
            @Param("sensorId") String sensorId,
            @Param("statusList") List<String> statusList,
            @Param("severityList") List<String> severityList,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );


    @Query(value = "SELECT COUNT(*) > 0 FROM alarms WHERE sensor_id @> CAST(:sensorId AS jsonb) AND type @> CAST(:type AS jsonb)", nativeQuery = true)
    boolean existsBySensorIdAndType(@Param("sensorId") String sensorId, @Param("type") String type);

}
