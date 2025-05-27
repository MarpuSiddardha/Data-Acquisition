package com.Project.DataAcquisition.Entity.Reports.Manual;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "report_types")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReportType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "report_type", nullable = false, unique = true)
    private String reportType;
}

