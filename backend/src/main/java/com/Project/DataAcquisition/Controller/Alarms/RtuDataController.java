package com.Project.DataAcquisition.Controller.Alarms;

import com.Project.DataAcquisition.Entity.Rules.RtuData;
import com.Project.DataAcquisition.Service.Alarm.RtuDataService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("api/rtu")
@CrossOrigin(origins = "*")
public class RtuDataController {
    private final RtuDataService rtuDataService;

    public RtuDataController(RtuDataService rtuDataService) {
        this.rtuDataService = rtuDataService;
    }

    @PostMapping
    public ResponseEntity<RtuData> createRtu(@RequestBody RtuData rtuData) {
        return ResponseEntity.ok(rtuDataService.createRtu(rtuData));
    }

    @GetMapping
    public ResponseEntity<List<RtuData>> getAllRtus() {
        return ResponseEntity.ok(rtuDataService.getAllRtus());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RtuData> getRtuById(@PathVariable Long id) {
        Optional<RtuData> rtu = rtuDataService.getRtuById(id);
        return rtu.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }


    @PutMapping("/{id}")
    public ResponseEntity<RtuData> updateRtu(@PathVariable Long id, @RequestBody RtuData updatedRtu) {
        return ResponseEntity.ok(rtuDataService.updateRtu(id, updatedRtu));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRtu(@PathVariable Long id) {
        rtuDataService.deleteRtu(id);
        return ResponseEntity.noContent().build();
    }
}
