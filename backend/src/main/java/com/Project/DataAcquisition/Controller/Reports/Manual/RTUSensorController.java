package com.Project.DataAcquisition.Controller.Reports.Manual;


import com.Project.DataAcquisition.Entity.Rules.RtuData;
import com.Project.DataAcquisition.Repository.Reports.Manual.RtuRepository;
import com.Project.DataAcquisition.Repository.Rule.SensorRepository;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.Explode;
import io.swagger.v3.oas.annotations.enums.ParameterStyle;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/RTU-Sensors")
public class RTUSensorController {

    private final RtuRepository rtuRepository;
    private final SensorRepository sensorRepository;

    public RTUSensorController(RtuRepository rtuRepository, SensorRepository sensorRepository) {
        this.rtuRepository = rtuRepository;
        this.sensorRepository = sensorRepository;
    }

    @GetMapping("/rtus")
    public List<RtuData> getAllRtus() {
        return rtuRepository.findAll();
    }

    @GetMapping("/unique-rtus")
    public ResponseEntity<List<String>> getAllUniqueRtus() {
        List<String> uniqueRtus = rtuRepository.findDistinctRtuNames();
        return ResponseEntity.ok(uniqueRtus);
    }


    @GetMapping("/sensor-types")
    public ResponseEntity<List<String>> getSensorTypesByRtuIds(
            @RequestParam List<Long> rtuIds,
            @Parameter(
                    description = "List of RTU IDs (comma-separated)",
                    example = "1,2",
                    style = ParameterStyle.FORM,
                    explode = Explode.FALSE
            )
            @RequestParam("rtuIds") List<Long> rtuIdsParam
    ) {
        List<String> sensorTypes = sensorRepository.findDistinctSensorTypesByRtuIds(rtuIdsParam);
        return ResponseEntity.ok(sensorTypes);
    }

    @GetMapping("/sensors/ids")
    public ResponseEntity<List<String>> getSensorIds(
            @RequestParam
            @Parameter(description = "Comma-separated list of RTU IDs", example = "1,2,3")
            List<Long> rtuIds,

            @RequestParam
            @Parameter(description = "Sensor type to filter", example = "temperature")
            String sensorType) {

        List<String> sensorIds = sensorRepository.findSensorIdsByRtu_RtuIdsAndSensorType(rtuIds, sensorType);
        return ResponseEntity.ok(sensorIds);
    }


}
