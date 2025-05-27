package com.Project.DataAcquisition.Repository.Reports.Widget;

import com.Project.DataAcquisition.Entity.Reports.Layout.Layout;
import com.Project.DataAcquisition.Entity.Reports.Layout.LayoutWidget;
import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LayoutWidgetRepository extends JpaRepository<LayoutWidget, Long> {

    Optional<LayoutWidget> findByWidget_WidgetIdAndLayout_Id(Long widgetId, Long layoutId);

    @Query("SELECT lw.widget FROM LayoutWidget lw WHERE lw.layout.id = :layoutId")
    List<Widget> findWidgetsByLayoutId(@Param("layoutId") Long layoutId);



    void deleteByLayout(Layout layout);

    List<Widget> findByLayoutId(Long layoutId);

    List<LayoutWidget> findByLayout(Layout layout);
}
