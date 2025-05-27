package com.Project.DataAcquisition.Repository.Reports.Widget;

import com.Project.DataAcquisition.Entity.Reports.Layout.ReportWidget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportWidgetRepository extends JpaRepository<ReportWidget, Long> {
    Optional<ReportWidget> findByReport_IdAndWidget_WidgetId(Long reportId, Long widgetId);

    List<ReportWidget> findByReport_Id(Long reportId);
}