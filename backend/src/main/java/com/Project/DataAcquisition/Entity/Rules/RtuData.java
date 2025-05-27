package com.Project.DataAcquisition.Entity.Rules;

import com.Project.DataAcquisition.Entity.Reports.Manual.Sensor;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.jeasy.rules.api.Rules;

import java.util.List;
@Entity
@Table(name = "rtu_data")
public class RtuData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long rtuId;
    @Column(nullable = false, name = "rtu_name")
    private String rtuName;

    @OneToMany(mappedBy = "rtu", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Sensor> sensors;

    @Transient  // ❌ No direct mapping because rules store rtuId as JSON
    private List<Rule> rules;  // This is just for reference, not stored in DB

    public RtuData() {}

    public RtuData(String rtuName, List<Sensor> sensors, List<Rule> rules) {
        this.rtuName = rtuName;
        this.sensors = sensors;
        this.rules = rules;
    }

    public Long getRtuId() { return rtuId; }
    public void setRtuId(Long rtuId) { this.rtuId = rtuId; }

    public String getRtuName() { return rtuName; }
    public void setRtuName(String rtuName) { this.rtuName = rtuName; }

    public List<Sensor> getSensors() { return sensors; }
    public void setSensors(List<Sensor> sensors) { this.sensors = sensors; }

    public List<Rule> getRules() { return rules; }
    public void setRules(List<Rule> rules) { this.rules = rules; }
}
