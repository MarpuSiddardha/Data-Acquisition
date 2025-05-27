package com.Project.DataAcquisition.Repository.Reports.Manual;

import com.Project.DataAcquisition.Entity.Rules.RtuData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RtuRepository extends JpaRepository<RtuData, Long> {

    // Find all RTUs by list of RTU IDs
    List<RtuData> findAllByRtuIdIn(List<Long> rtuIds);

    @Query("SELECT DISTINCT r.rtuName FROM RtuData r")
    List<String> findDistinctRtuNames();

    boolean existsByRtuName(String rtuName);  // ✅ Match String with String

    Optional<RtuData> findByRtuName(String rtuName);  // If you need the ID from name

    List<RtuData> findAllByRtuNameIn(List<String> rtuNames);
}
