package com.Project.DataAcquisition.Repository.Reports.Automated;

import com.Project.DataAcquisition.Entity.Reports.Automated.AutomatedReportWidget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AutomatedReportWidgetRepository extends JpaRepository<AutomatedReportWidget, Long> {

    // Find all widgets by automated report ID
    List<AutomatedReportWidget> findByAutomatedReport_Id(Long automatedReportId);

    // Optional: Delete widgets by automated report ID (e.g., during cleanup)
    void deleteByAutomatedReport_Id(Long automatedReportId);
}
