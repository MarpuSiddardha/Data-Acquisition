package rules;
import com.Project.DataAcquisition.Entity.Alarms.AlarmEntity;
import com.Project.DataAcquisition.Entity.Reports.Manual.Sensor;
import com.Project.DataAcquisition.Entity.Rules.Rule;
import com.Project.DataAcquisition.Repository.Rule.RuleRepository;
import com.Project.DataAcquisition.Service.Alarm.AlarmService;
import org.jeasy.rules.api.Rules;
import org.jeasy.rules.core.RuleBuilder;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Component
public class DynamicRule {

    private final RuleRepository ruleRepository;
    private final AlarmService alarmService;
    private final Map<Long, Instant> ruleActivationTimestamps = new ConcurrentHashMap<>();

    public DynamicRule(RuleRepository ruleRepository, AlarmService alarmService) {
        this.ruleRepository = ruleRepository;
        this.alarmService = alarmService;
    }

    public Rules loadDynamicRules() {
        Rules rules = new Rules();
        List<Rule> ruleDefinitions = ruleRepository.findAll();

        Map<String, Integer> severityPriority = Map.of(
                "High", 1,
                "Moderate", 2,
                "Low", 3
        );

        ExpressionParser parser = new SpelExpressionParser();

        for (Rule rule : ruleDefinitions) {
            if (!"Active".equalsIgnoreCase(rule.getStatus())) {
                continue; // Skip inactive rules
            }

            String ruleName = rule.getRuleName();
            int priority = severityPriority.getOrDefault(rule.getPriority().toUpperCase(), 3);
            List<Map<String, Object>> conditions = rule.getConditions();
            int activationDelayMinutes = rule.getActivationDelay();

            rules.register(new RuleBuilder()
                    .name(ruleName)
                    .priority(priority)
                    .when(facts -> {
                        Object sensorDataObject = facts.get("sensorData");
                        if (sensorDataObject == null) return false;

                        Map<String, Object> sensorData = extractSensorData(sensorDataObject);
                        if (sensorData.isEmpty()) return false;

                        StandardEvaluationContext context = new StandardEvaluationContext();
                        context.setVariable("sensorData", sensorData);

                        System.out.println("Evaluating Rule: " + ruleName);

                        boolean ruleEvaluatesTrue = evaluateConditions(conditions, parser, context);

                        if (ruleEvaluatesTrue) {
                            System.out.println("Rule Passed: " + ruleName);
                            return checkActivationDelay(rule.getRuleId(), activationDelayMinutes);
                        } else {
                            System.out.println("Rule Failed: " + ruleName);
                            ruleActivationTimestamps.remove(rule.getRuleId());
                            return false;
                        }
                    })
                    .then(facts -> triggerAlarm(rule))
                    .build());
        }

        return rules;
    }

    private Map<String, Object> extractSensorData(Object sensorDataObject) {
        Map<String, Object> sensorData = new HashMap<>();

        if (sensorDataObject instanceof Sensor sensor) {
            sensorData.put(sensor.getSensorId(), sensor.getValue());
        } else if (sensorDataObject instanceof Map) {
            sensorData = (Map<String, Object>) sensorDataObject;
        }

        return sensorData;
    }

    private boolean checkActivationDelay(Long ruleId, int activationDelayMinutes) {
        Instant now = Instant.now();
        Instant firstTriggeredAt = ruleActivationTimestamps.get(ruleId);

        if (firstTriggeredAt == null) {
            ruleActivationTimestamps.put(ruleId, now);
            System.out.println("Rule " + ruleId + " met condition, waiting " + activationDelayMinutes + " min...");
            return false;
        }

        long elapsedMinutes = java.time.Duration.between(firstTriggeredAt, now).toMinutes();

        if (elapsedMinutes >= activationDelayMinutes) {
            System.out.println("Rule " + ruleId + " met condition for " + activationDelayMinutes + " min. Alarm will be triggered!");
            return true;
        }

        System.out.println("Rule " + ruleId + " still in delay period (" + elapsedMinutes + "/" + activationDelayMinutes + " min).");
        return false;
    }

    private void triggerAlarm(Rule rule) {
        AlarmEntity alarm = new AlarmEntity();
        alarm.setAlarmName(rule.getRuleName());
        alarm.setRuleId(rule.getRuleId());
        alarm.setSeverity(rule.getPriority());
        alarm.setDescription(rule.getDescription());
        alarm.setTags(rule.getTags() != null ? rule.getTags() : new ArrayList<>());

        List<String> sensorIds = rule.getConditions().stream()
                .map(condition -> (String) condition.get("sensorId"))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        List<String> sensorTypes = rule.getConditions().stream()
                .map(condition -> (String) condition.get("sensorType"))
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        alarm.setSensorId(sensorIds.isEmpty() ? List.of("UNKNOWN") : sensorIds);
        alarm.setType(sensorTypes.isEmpty() ? List.of("UNKNOWN") : sensorTypes);

        alarmService.saveAlarm(alarm);
        System.out.println("Alarm Triggered: " + alarm.getAlarmName());

        ruleActivationTimestamps.remove(rule.getRuleId());
    }

    private boolean evaluateConditions(List<Map<String, Object>> conditions, ExpressionParser parser, StandardEvaluationContext context) {
        boolean finalResult = true;
        boolean isFirstCondition = true;
        String lastLogicalOperator = null;

        for (Map<String, Object> condition : conditions) {
            String sensorId = (String) condition.get("sensorId");
            String operator = (String) condition.get("operator");
            Object value = condition.get("value");
            String logicalOperator = (String) condition.get("logicalOperator");

            if (sensorId == null || operator == null || value == null) {
                continue;
            }

            String expression = "#sensorData['" + sensorId + "'] " + operator + " " + value;
            boolean conditionResult = Boolean.TRUE.equals(parser.parseExpression(expression).getValue(context, Boolean.class));

            System.out.println("Condition Evaluated: " + expression + " => " + conditionResult);

            if (isFirstCondition) {
                finalResult = conditionResult;
                isFirstCondition = false;
            } else {
                if ("AND".equalsIgnoreCase(lastLogicalOperator)) {
                    finalResult = finalResult && conditionResult;
                } else if ("OR".equalsIgnoreCase(lastLogicalOperator)) {
                    finalResult = finalResult || conditionResult;
                }
            }

            lastLogicalOperator = logicalOperator;
        }

        System.out.println("Final Evaluation Result: " + finalResult);
        return finalResult;
    }
}
