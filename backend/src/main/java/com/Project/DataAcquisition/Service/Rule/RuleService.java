package com.Project.DataAcquisition.Service.Rule;

import com.Project.DataAcquisition.Entity.Rules.RtuData;
import com.Project.DataAcquisition.Entity.Rules.Rule;
import com.Project.DataAcquisition.Repository.Alarm.RtuDataRepository;
import com.Project.DataAcquisition.Repository.Rule.RuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RuleService {

    @Autowired
    private RuleRepository ruleRepository;

    @Autowired
    private RtuDataRepository rtuDataRepository;

    //  Save Rule
    public Rule saveRule(Rule rule) {
        setRtuDetails(rule); // Ensure RTU details are set
        rule.setLastUpdated(LocalDateTime.now());
        return ruleRepository.save(rule);
    }

    //  Get all Rules (Ensure RTU details are included)
    public List<Rule> getAllRules() {
        List<Rule> rules = ruleRepository.findAll();
        rules.forEach(this::setRtuDetails);
        return rules;
    }

    //  Get Rule by ID (Ensure RTU details are included)
    public Rule getRuleById(Long id) {
        Optional<Rule> ruleOptional = ruleRepository.findById(id);
        return ruleOptional.map(rule -> {
            setRtuDetails(rule);
            return rule;
        }).orElse(null);
    }

    // Update Rule (Ensure RTU details are updated)
    public Rule updateRule(Long id, Rule updatedRule) {
        Optional<Rule> ruleOptional = ruleRepository.findById(id);
        if (ruleOptional.isPresent()) {
            Rule existingRule = ruleOptional.get();

            existingRule.setRuleName(updatedRule.getRuleName());
            existingRule.setDescription(updatedRule.getDescription());
            existingRule.setStatus(updatedRule.getStatus());
            existingRule.setPriority(updatedRule.getPriority());
            existingRule.setActivationDelay(updatedRule.getActivationDelay());
            existingRule.setTags(updatedRule.getTags());
            existingRule.setConditions(updatedRule.getConditions());
            existingRule.setLastUpdated(LocalDateTime.now());

            //  Ensure RTU details are updated correctly
            setRtuDetails(existingRule, updatedRule.getRtuId());

            return ruleRepository.save(existingRule);
        }
        return null;
    }

    //  Delete Rule
    public boolean deleteRule(Long id) {
        if (ruleRepository.existsById(id)) {
            ruleRepository.deleteById(id);
            return true;
        }
        return false;
    }

    //  Helper method to set RTU details (for GET APIs)
    private void setRtuDetails(Rule rule) {
        if (rule.getRtuId() != null && !rule.getRtuId().isEmpty()) {
            List<String> rtuNames = rtuDataRepository.findAllById(rule.getRtuId())
                    .stream()
                    .map(RtuData::getRtuName)
                    .collect(Collectors.toList());
            rule.setRtuNames(rtuNames);
        }
    }

    //  Helper method to update RTU details in PUT API
    private void setRtuDetails(Rule rule, List<Long> newRtuId) {
        if (newRtuId != null && !newRtuId.isEmpty()) {
            rule.setRtuId(newRtuId);

            List<String> rtuNames = rtuDataRepository.findAllById(newRtuId)
                    .stream()
                    .map(RtuData::getRtuName)
                    .collect(Collectors.toList());
            rule.setRtuNames(rtuNames);
        }
    }

//    public List<Rule> searchRules(Long ruleId, String tags) {
//        List<Rule> allRules = ruleRepository.findAll();
//
//        return allRules.stream()
//                .filter(rule -> (ruleId == null || rule.getRuleId().equals(ruleId)) &&
//                        (tags == null || rule.getTags().stream().anyMatch(tag -> tag.toLowerCase().contains(tags.toLowerCase()))))
//                .peek(rule -> rule.setRtuNames(getRtuNames(rule.getRtuId()))) // Fetch RTU names
//                .collect(Collectors.toList());
//    }


    public List<Rule> searchRules(Long ruleId, String tags) {
        List<Rule> allRules = ruleRepository.findAll();
        List<String> tagList = tags != null ? Arrays.asList(tags.split("[,\\s]+")) : Collections.emptyList();
        return allRules.stream()
                .filter(rule -> (ruleId == null || rule.getRuleId().equals(ruleId)) &&
                        (tags == null || rule.getTags().stream().anyMatch(
                                tag -> tagList.stream().anyMatch(
                                        searchTag -> tag.toLowerCase().contains(searchTag.toLowerCase())
                                )
                        )))
                .peek(rule -> rule.setRtuNames(getRtuNames(rule.getRtuId()))) // Fetch RTU names
                .collect(Collectors.toList());
    }

    public List<Rule> filterRules(String priority, String status) {
        List<Rule> allRules = ruleRepository.findAll();

        return allRules.stream()
                .filter(rule -> (priority == null || rule.getPriority().equalsIgnoreCase(priority)) &&
                        (status == null || rule.getStatus().equalsIgnoreCase(status)))
                .peek(rule -> rule.setRtuNames(getRtuNames(rule.getRtuId()))) // Fetch RTU names
                .collect(Collectors.toList());
    }

    // Method to get RTU names from IDs
    private List<String> getRtuNames(List<Long> rtuId) {
        return rtuDataRepository.findAllById(rtuId).stream()
                .map(RtuData::getRtuName) // Assuming RtuData has getRtuName()
                .collect(Collectors.toList());
    }

    public Map<String, Object> getRulesSummary() {
        long activeCount = ruleRepository.countActiveRules();
        long pausedCount = ruleRepository.countPausedRules();
        long totalCount = ruleRepository.countTotalRules();

        // Creating the ChartInfo section
        Map<String, Object> chartInfo = new HashMap<>();
        chartInfo.put("active", activeCount);
        chartInfo.put("paused", pausedCount);
        chartInfo.put("total", totalCount);

        // Creating the Status section
        Map<String, Object> status = new HashMap<>();
        status.put("high", 0L);
        status.put("moderate", 0L);
        status.put("low", 0L);

        List<Object[]> statusCounts = ruleRepository.countRulesByPriority();
        for (Object[] statusCount : statusCounts) {
            String statusName = ((String) statusCount[0]).toLowerCase();
            Long count = (Long) statusCount[1];
            status.put(statusName, count);
        }

        // Final response structure
        Map<String, Object> response = new HashMap<>();
        response.put("chartInfo", chartInfo);
        response.put("status", status);

        return response;
    }

}


