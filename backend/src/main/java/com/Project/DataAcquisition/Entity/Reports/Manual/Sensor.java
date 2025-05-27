package com.Project.DataAcquisition.Entity.Reports.Manual;

import com.Project.DataAcquisition.Entity.Rules.RtuData;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_data")
public class Sensor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, name = "sensor_id")
    private String sensorId;

    @ManyToOne
    @JoinColumn(name = "rtu_id", nullable = false)
    @JsonBackReference
    private RtuData rtu;

    @Column(nullable = false, name = "sensor_type")
    private String sensorType;

    @Column(nullable = false, name = "value")
    private Double value;

    @Column(nullable = false, name = "timestamp")
    private LocalDateTime timestamp;


    public Sensor() {}

    public Sensor(String sensorId, RtuData rtu, String sensorType, Double value, LocalDateTime timestamp) {
        this.sensorId = sensorId;
        this.rtu = rtu;
        this.sensorType = sensorType;
        this.value = value;
        this.timestamp = timestamp;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSensorId() { return sensorId; }
    public void setSensorId(String sensorId) { this.sensorId = sensorId; }

    public RtuData getRtu() { return rtu; }
    public void setRtu(RtuData rtu) { this.rtu = rtu; }

    public String getSensorType() { return sensorType; }
    public void setSensorType(String sensorType) { this.sensorType = sensorType; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
