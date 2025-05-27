package com.Project.DataAcquisition.Repository.Reports.Manual;

import com.Project.DataAcquisition.Entity.Reports.Manual.Report;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    @Query("SELECT r FROM Report r WHERE " +
            "(:reportType IS NULL OR LOWER(r.reportType) LIKE LOWER(CONCAT('%', :reportType, '%'))) AND " +
            "(:scheduleStatus IS NULL OR r.scheduleStatus = :scheduleStatus) AND " +
            "(:startDate IS NULL OR r.createdAt >= :startDate) AND " +
            "(:endDate IS NULL OR r.createdAt <= :endDate) AND " +
            "(:query IS NULL OR LOWER(r.reportType) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(r.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Report> filterReports(
            @Param("reportType") String reportType,
            @Param("scheduleStatus") Boolean scheduleStatus,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("query") String query
    );

    @Query("SELECT DISTINCT r.reportType FROM Report r WHERE " +
            "(:query IS NULL OR LOWER(r.reportType) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<String> findReportTypes(@Param("query") String query);

    @Modifying
    @Transactional
    @Query("UPDATE Report r SET r.scheduleStatus = :status WHERE r.id = :reportId")
    void updateScheduleStatus(@Param("reportId") Long reportId, @Param("status") boolean status);


    @Query("SELECT COUNT(r) FROM Report r WHERE r.scheduleStatus = true")
    long countAutomatedReports();

    @Query("SELECT COUNT(r) FROM Report r WHERE r.scheduleStatus = false")
    long countManualReports();

    @Query("SELECT COUNT(r) FROM Report r")
    long countTotalReports();

}

