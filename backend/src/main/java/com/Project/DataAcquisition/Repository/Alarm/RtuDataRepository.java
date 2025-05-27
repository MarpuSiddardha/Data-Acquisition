package com.Project.DataAcquisition.Repository.Alarm;

import com.Project.DataAcquisition.Entity.Rules.RtuData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RtuDataRepository extends JpaRepository<RtuData, Long> {
}