package com.Project.DataAcquisition.Service.Alarm;

import com.Project.DataAcquisition.Entity.Reports.Manual.Sensor;
import com.Project.DataAcquisition.Repository.Rule.SensorRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SensorService {
    private final SensorRepository sensorRepository;

    public SensorService(SensorRepository sensorRepository) {
        this.sensorRepository = sensorRepository;
    }

    // Create Sensor
    public Sensor createSensor(Sensor sensor) {
        return sensorRepository.save(sensor);
    }

    // Get All Sensors
    public List<Sensor> getAllSensors() {
        return sensorRepository.findAll();
    }

    // Get Sensor by ID
    public Optional<Sensor> getSensorById(Long id) {
        return sensorRepository.findById(id);
    }

    // Update Sensor
    public Sensor updateSensor(Long id, Sensor updatedSensor) {
        return sensorRepository.findById(id).map(sensor -> {
            sensor.setSensorId(updatedSensor.getSensorId());
            sensor.setSensorType(updatedSensor.getSensorType());
            sensor.setValue(updatedSensor.getValue());
            sensor.setTimestamp(updatedSensor.getTimestamp());
            return sensorRepository.save(sensor);
        }).orElseThrow(() -> new RuntimeException("Sensor not found"));
    }

    // Delete Sensor
    public void deleteSensor(Long id) {
        sensorRepository.deleteById(id);
    }
}
