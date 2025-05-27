package com.Project.DataAcquisition.Scheduler;

import com.Project.DataAcquisition.Entity.Reports.Manual.Sensor;
import com.Project.DataAcquisition.Repository.Rule.SensorRepository;
import org.jeasy.rules.api.Facts;
import org.jeasy.rules.api.Rule;
import org.jeasy.rules.api.Rules;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import rules.DynamicRule;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class RuleScheduler {

    @Autowired
    private SensorRepository sensorRepository;

    @Autowired
    private DynamicRule dynamicRule;

    @Scheduled(fixedRate = 60000) // Runs every minute
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void executeRulesPeriodically() {
        try {
            System.out.println("\nRunning scheduled rule execution...");

            List<Sensor> sensorDataList = sensorRepository.findAll();
            if (sensorDataList.isEmpty()) {
                System.err.println("No sensor data found in the database!");
                return;
            }

            Map<String, Double> sensorDataMap = sensorDataList.stream()
                .collect(Collectors.toMap(
                    Sensor::getSensorId,
                    Sensor::getValue,
                    (existingValue, newValue) -> newValue // Keeps the latest value
                ));

            System.out.println("Sensor Data: " + sensorDataMap);

            Facts facts = new Facts();
            facts.put("sensorData", sensorDataMap);

            Rules rules = dynamicRule.loadDynamicRules();
            if (rules.isEmpty()) {
                System.out.println("No active rules found.");
                return;
            }

            for (Rule rule : rules) {
                try {
                    if (rule.evaluate(facts)) {
                        System.out.println(" Rule Triggered: " + rule.getName());
                        rule.execute(facts);
                    } else {
                        System.out.println(" Rule NOT triggered: " + rule.getName());
                    }
                } catch (Exception e) {
                    System.err.println(" Error executing rule: " + rule.getName());
                    e.printStackTrace();
                }
            }

            System.out.println("\n Rule Execution Complete.");
        } catch (Exception e) {
            System.err.println("\n Error occurred: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
