package com.Project.DataAcquisition.Controller.Reports.Layouts;
import com.Project.DataAcquisition.DTO.Reports.Layout.LayoutRequest;
import com.Project.DataAcquisition.DTO.Reports.Layout.LayoutResponse;
import com.Project.DataAcquisition.Entity.Reports.Layout.Layout;
import com.Project.DataAcquisition.Repository.Reports.Widget.LayoutRepository;
import com.Project.DataAcquisition.Service.Reports.Layouts.LayoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/layouts")
@CrossOrigin(origins = "*")
@Tag(name = "Layout Controller", description = "APIs for managing and retrieving Layouts")
public class LayoutController {

    @Autowired
    private final LayoutService layoutService;

    @Autowired
    private LayoutRepository layoutRepository;

    @Autowired
    public LayoutController(LayoutService layoutService) {
        this.layoutService = layoutService;
    }


    @Operation(summary = "Create a new Layout") // Swagger annotation
    @PostMapping
    public ResponseEntity<LayoutResponse> createLayout(@RequestBody LayoutRequest layoutRequest) {
        LayoutResponse response = layoutService.createLayout(layoutRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // 2. API to get all the layouts
    @GetMapping
    public List<Map<String, Object>> viewLayouts() {
        return layoutService.viewLayouts();
    }

    @GetMapping("/filters")
    public ResponseEntity<?> filterLayouts(
            @RequestParam(required = false) String layoutType,
            @RequestParam(required = false) String layoutName,
            @Parameter(description = "Start Date (YYYY-MM-DD)", schema = @Schema(type = "string", format = "date"))
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End Date (YYYY-MM-DD)", schema = @Schema(type = "string", format = "date"))
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return layoutService.filterLayouts(layoutType, layoutName, startDate, endDate);
    }

    // 4. API to get all the layout Types
//    @GetMapping("/layout-types")
//    public ResponseEntity<?> getLayoutTypes() {
//        return layoutService.getLayoutTypes();
//    }

    // 5. API to view a particular layout
    @GetMapping("/{layoutId}")
    public ResponseEntity<?> getLayoutById(@PathVariable Long layoutId) {
        Map<String, Object> layoutData = layoutService.getLayoutById(layoutId);
        if (layoutData == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Layout not found"));
        }
        return ResponseEntity.ok(layoutData);
    }

    // 6. API to update the layout
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLayout(@PathVariable Long id, @RequestBody LayoutRequest request) {
        Optional<LayoutResponse> updatedLayout = layoutService.updateLayout(id, request);
        return updatedLayout.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 7. API to delete a layout
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLayout(@PathVariable Long id) {
        return layoutService.deleteLayout(id);
    }

    // 8. API to get all the widgets
    @GetMapping("/widget-types")
    public ResponseEntity<List<Map<String, Object>>> getAllWidgetsGroupedByType() {
        List<Map<String, Object>> widgets = layoutService.getWidgetsGroupedByType();
        return ResponseEntity.ok(widgets);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchLayoutsByName(@RequestParam String q) {
        List<Map<String, Object>> filteredLayouts = layoutService.searchLayoutsByName(q);
        return ResponseEntity.ok(filteredLayouts);
    }

}


