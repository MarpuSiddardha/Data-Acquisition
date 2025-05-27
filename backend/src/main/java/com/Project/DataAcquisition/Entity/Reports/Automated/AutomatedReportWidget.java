package com.Project.DataAcquisition.Entity.Reports.Automated;

import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "automated_report_widgets")
@Getter
@Setter
public class AutomatedReportWidget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "automated_report_id", nullable = false)
    private AutomatedReport automatedReport;

    @ManyToOne
    @JoinColumn(name = "widget_id", nullable = false)
    private Widget widget;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String data;  // Updated JSON data based on frequency
}

