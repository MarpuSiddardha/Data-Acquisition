package com.Project.DataAcquisition.Repository.Reports.Automated;

import com.Project.DataAcquisition.Entity.Reports.Automated.AutomatedReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AutomatedReportRepository extends JpaRepository<AutomatedReport, Long> {

    List<AutomatedReport> findByReportIdAndFrequency(Long reportId, String frequency);
    Optional<AutomatedReport> findByReportId(Long reportId);

    @Query("SELECT r FROM AutomatedReport r WHERE LOWER(r.reportType) LIKE LOWER(CONCAT('%', :reportType, '%'))")
    List<AutomatedReport> searchByReportType(String reportType);

    @Query("SELECT r.id, r.reportType, r.frequency, r.generatedTime, r.reportId FROM AutomatedReport r")
    List<Object[]> findReportData();

}