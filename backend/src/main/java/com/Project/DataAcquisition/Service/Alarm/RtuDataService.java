package com.Project.DataAcquisition.Service.Alarm;

import com.Project.DataAcquisition.Entity.Rules.RtuData;
import com.Project.DataAcquisition.Repository.Alarm.RtuDataRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RtuDataService {
    private final RtuDataRepository rtuDataRepository;

    public RtuDataService(RtuDataRepository rtuDataRepository) {
        this.rtuDataRepository = rtuDataRepository;
    }

    // Create RTU
    public RtuData createRtu(RtuData rtuData) {
        return rtuDataRepository.save(rtuData);
    }

    // Get All RTUs
    public List<RtuData> getAllRtus() {
        return rtuDataRepository.findAll();
    }

    // Get RTU by ID
    public Optional<RtuData> getRtuById(Long id) {
        return rtuDataRepository.findById(id);
    }

    // Update RTU
    public RtuData updateRtu(Long id, RtuData updatedRtu) {
        return rtuDataRepository.findById(id).map(rtu -> {
            rtu.setRtuName(updatedRtu.getRtuName());
            return rtuDataRepository.save(rtu);
        }).orElseThrow(() -> new RuntimeException("RTU not found"));
    }

    // Delete RTU
    public void deleteRtu(Long id) {
        rtuDataRepository.deleteById(id);
    }
}
