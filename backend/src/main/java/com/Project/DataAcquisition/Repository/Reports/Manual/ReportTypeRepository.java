package com.Project.DataAcquisition.Repository.Reports.Manual;

import com.Project.DataAcquisition.Entity.Reports.Manual.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReportTypeRepository extends JpaRepository<ReportType, Long> {
    Optional<ReportType> findByReportType(String reportType);
}

