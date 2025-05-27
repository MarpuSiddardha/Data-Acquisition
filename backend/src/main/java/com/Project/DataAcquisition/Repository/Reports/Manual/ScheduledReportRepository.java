package com.Project.DataAcquisition.Repository.Reports.Manual;

import com.Project.DataAcquisition.Entity.Reports.Manual.ScheduledReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduledReportRepository extends JpaRepository<ScheduledReport, Long> {

    @Query("SELECT COUNT(sr) > 0 FROM ScheduledReport sr " +
            "WHERE sr.frequency = :frequency " +
            "AND sr.nextRun <= :now " +
            "AND sr.isActive = true")
    boolean existsByFrequencyAndNextRunBefore(@Param("frequency") String frequency, @Param("now") LocalDateTime now);


    @Query("SELECT r FROM ScheduledReport r " +
            "WHERE r.frequency = 'HOURLY' " +
            "AND r.nextRun <= :now " +  // Run reports due for execution
            "AND r.isActive = true " +  // Only active schedules
            "AND (r.endDate IS NULL OR r.nextRun < r.endDate)") // Not expired
    List<ScheduledReport> findHourlyReportsToRun(@Param("now") LocalDateTime now);

    @Query("SELECT r FROM ScheduledReport r " +
            "WHERE r.frequency = 'DAILY' " +
            "AND r.nextRun <= :now " +
            "AND r.isActive = true " +
            "AND (r.endDate IS NULL OR r.nextRun < r.endDate)")
    List<ScheduledReport> findDailyReportsToRun(@Param("now") LocalDateTime now);

    @Query("SELECT r FROM ScheduledReport r " +
            "WHERE r.frequency = 'WEEKLY' " +
            "AND r.nextRun <= :now " +
            "AND r.isActive = true " +
            "AND (r.endDate IS NULL OR r.nextRun < r.endDate)")
    List<ScheduledReport> findWeeklyReportsToRun(@Param("now") LocalDateTime now);

    @Query("SELECT r FROM ScheduledReport r " +
            "WHERE r.frequency = 'MONTHLY' " +
            "AND r.nextRun <= :now " +
            "AND r.isActive = true " +
            "AND (r.endDate IS NULL OR r.nextRun < r.endDate)")
    List<ScheduledReport> findMonthlyReportsToRun(@Param("now") LocalDateTime now);

    Optional<ScheduledReport> findByReportIdAndFrequency(Long reportId, String frequency);

    Optional<ScheduledReport> findByReportId(Long reportId);

    boolean existsByReportId(Long reportId);


    List<ScheduledReport> findByReportIdAndIsActiveTrue(Long reportId);
}
