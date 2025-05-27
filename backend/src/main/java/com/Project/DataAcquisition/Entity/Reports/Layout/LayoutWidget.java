package com.Project.DataAcquisition.Entity.Reports.Layout;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "layout_widgets")  // This acts as the join table
@Getter
@Setter
public class LayoutWidget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // Primary Key for the join table

    @ManyToOne
    @JoinColumn(name = "layout_id", nullable = false)
    private Layout layout;  // Reference to Layout

    @ManyToOne
    @JoinColumn(name = "widget_id", nullable = false)
    private Widget widget;  // Reference to Widget
}
