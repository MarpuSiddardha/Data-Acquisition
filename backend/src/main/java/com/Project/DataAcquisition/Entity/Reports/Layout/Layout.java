package com.Project.DataAcquisition.Entity.Reports.Layout;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "layouts")
@Getter
@Setter
public class Layout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "layout_name", nullable = false)
    private String layoutName;

    @Column(name = "layout_type", nullable = false)
    private String layoutType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "layout", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<LayoutWidget> layoutWidgets;  // Change from List<Widget> to List<LayoutWidget>
}
