package com.Project.DataAcquisition.Entity.Rules;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "rules")
public class Rule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ruleId;

    private String ruleName;
    private String description;
    private String status;
    private String priority;
    private int activationDelay;

    @Column(columnDefinition = "TIMESTAMP")
    private LocalDateTime lastUpdated;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Long> rtuId; // ✅ Stores multiple RTU IDs as JSON (jsonb)

    @Transient
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private List<String> rtuNames; // ✅ Transient field for RTU names (not stored in DB)

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> tags; // ✅ Stores tags as JSON

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Map<String, Object>> conditions; // ✅ Stores conditions as JSON

    // Auto-update `lastUpdated`
    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        this.lastUpdated = LocalDateTime.now();
    }

    // Constructors
    public Rule() {}

    public Rule(String ruleName, List<Long> rtuId, String description, String status, String priority,
                int activationDelay, LocalDateTime lastUpdated, List<String> tags, List<Map<String, Object>> conditions) {
        this.ruleName = ruleName;
        this.rtuId = rtuId;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.activationDelay = activationDelay;
        this.lastUpdated = lastUpdated;
        this.tags = tags;
        this.conditions = conditions;
    }

    // Getters and Setters
    public Long getRuleId() { return ruleId; }
    public void setRuleId(Long ruleId) { this.ruleId = ruleId; }

    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }

    public List<Long> getRtuId() { return rtuId; }
    public void setRtuId(List<Long> rtuId) { this.rtuId = rtuId; }

    public List<String> getRtuNames() { return rtuNames; }
    public void setRtuNames(List<String> rtuNames) { this.rtuNames = rtuNames; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public int getActivationDelay() { return activationDelay; }
    public void setActivationDelay(int activationDelay) { this.activationDelay = activationDelay; }

    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public List<Map<String, Object>> getConditions() { return conditions; }
    public void setConditions(List<Map<String, Object>> conditions) { this.conditions = conditions; }
}
