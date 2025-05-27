package com.Project.DataAcquisition.Controller.Rules;

import com.Project.DataAcquisition.Entity.Rules.Rule;
import com.Project.DataAcquisition.Service.Rule.RuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rules")
@CrossOrigin(origins = "*")
public class RuleController {

    private final RuleService ruleService;

    public RuleController(RuleService ruleService) {
        this.ruleService = ruleService;
    }

    //  Create Rule
    @PostMapping
    @Operation(summary = "Create a new rule")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rule created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<?> createRule(@RequestBody Rule rule) {
        try {
            Rule savedRule = ruleService.saveRule(rule);
            return ResponseEntity.ok(savedRule);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating rule: " + e.getMessage());
        }
    }

    //  Get All Rules
    @GetMapping
    @Operation(summary = "Get all rules")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of rules"),
            @ApiResponse(responseCode = "204", description = "No rules found")
    })
    public ResponseEntity<List<Rule>> getAllRules() {
        List<Rule> rules = ruleService.getAllRules();
        return rules.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(rules);
    }

    //  Get Rule by ID
    @GetMapping("/{id}")
    @Operation(summary = "Get rule by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rule found"),
            @ApiResponse(responseCode = "404", description = "Rule not found")
    })
    public ResponseEntity<?> getRuleById(@PathVariable Long id) {
        Rule rule = ruleService.getRuleById(id);
        return (rule != null) ? ResponseEntity.ok(rule) : ResponseEntity.status(404).body("Rule not found with ID: " + id);
    }

    //  Update Rule
    @PutMapping("/{id}")
    @Operation(summary = "Update an existing rule")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rule updated successfully"),
            @ApiResponse(responseCode = "404", description = "Rule not found")
    })
    public ResponseEntity<?> updateRule(@PathVariable Long id, @RequestBody Rule updatedRule) {
        Rule rule = ruleService.updateRule(id, updatedRule);
        return (rule != null) ? ResponseEntity.ok(rule) : ResponseEntity.status(404).body("Rule not found with ID: " + id);
    }

    //  Delete Rule
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a rule by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Rule deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Rule not found")
    })
    public ResponseEntity<?> deleteRule(@PathVariable Long id) {
        return ruleService.deleteRule(id)
                ? ResponseEntity.ok("Rule deleted successfully.")
                : ResponseEntity.status(404).body("Rule not found with ID: " + id);
    }

    //  Search Rule by Rule ID or Tags (or both)
    @GetMapping("/search")
    @Operation(summary = "Search rules by ruleId or tags")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of matching rules"),
            @ApiResponse(responseCode = "204", description = "No rules found")
    })
    public ResponseEntity<List<Rule>> searchRules(
            @RequestParam(required = false) Long ruleId,
            @RequestParam(required = false) String tags) {

        List<Rule> rules = ruleService.searchRules(ruleId, tags);
        return rules.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(rules);
    }

    //  Search by Priority & Status (Toggle)
    @GetMapping("/filter")
    @Operation(summary = "Filter rules by priority and status")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of filtered rules"),
            @ApiResponse(responseCode = "204", description = "No rules found")
    })
    public ResponseEntity<List<Rule>> filterRules(
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status) {

        List<Rule> rules = ruleService.filterRules(priority, status);
        return rules.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(rules);
    }
}
