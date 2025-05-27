package com.Project.DataAcquisition.Repository.Rule;

import com.Project.DataAcquisition.Entity.Rules.Rule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RuleRepository extends JpaRepository<Rule, Long> {

    @Query("SELECT COUNT(r) FROM Rule r WHERE r.status = 'Active'")
    long countActiveRules();

    @Query("SELECT COUNT(r) FROM Rule r WHERE r.status = 'Paused'")
    long countPausedRules();

    @Query("SELECT COUNT(r) FROM Rule r")
    long countTotalRules();

    // Count rules based on priority (High, Moderate, Low)
    @Query("SELECT r.priority, COUNT(r) FROM Rule r GROUP BY r.priority")
    List<Object[]> countRulesByPriority();


}