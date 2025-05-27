package com.Project.DataAcquisition.Repository.Reports.Widget;

import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WidgetRepository extends JpaRepository<Widget, Long> {

}
