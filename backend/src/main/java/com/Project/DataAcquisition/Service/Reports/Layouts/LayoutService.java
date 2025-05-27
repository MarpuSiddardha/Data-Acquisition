package com.Project.DataAcquisition.Service.Reports.Layouts;

import com.Project.DataAcquisition.DTO.Reports.Layout.LayoutRequest;
import com.Project.DataAcquisition.DTO.Reports.Layout.LayoutResponse;
import com.Project.DataAcquisition.Entity.Reports.Layout.Layout;
import com.Project.DataAcquisition.Entity.Reports.Layout.LayoutWidget;
import com.Project.DataAcquisition.Entity.Reports.Layout.Widget;
import com.Project.DataAcquisition.Repository.Reports.Widget.LayoutRepository;
import com.Project.DataAcquisition.Repository.Reports.Widget.LayoutWidgetRepository;
import com.Project.DataAcquisition.Repository.Reports.Widget.WidgetRepository;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LayoutService {

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private LayoutRepository layoutRepository;

    @Autowired
    private WidgetRepository widgetRepository;

    @Autowired
    private LayoutWidgetRepository layoutWidgetRepository;

    public static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");


    @Transactional
    public LayoutResponse createLayout(LayoutRequest layoutRequest) {
        Layout layout = new Layout();
        layout.setLayoutName(layoutRequest.getLayoutName());
        layout.setLayoutType(layoutRequest.getLayoutType());
        layout.setCreatedAt(LocalDateTime.now());

        layout = layoutRepository.save(layout);

        List<LayoutResponse.WidgetResponse> widgetResponses = new ArrayList<>();

        // Add widgets to layout
        for (LayoutRequest.WidgetRequest widgetReq : layoutRequest.getWidgets()) {
            Widget widget = new Widget();
            widget.setWidgetType(widgetReq.getWidgetType());
            widget.setWidgetName(widgetReq.getWidgetName());

            // 🔹 Exclude `data` while saving (don't set it)
            widget = widgetRepository.save(widget);

            LayoutWidget layoutWidget = new LayoutWidget();
            layoutWidget.setLayout(layout);
            layoutWidget.setWidget(widget);
            layoutWidgetRepository.save(layoutWidget);

            // ✅ Convert widget to response format
            LayoutResponse.WidgetResponse widgetResponse = new LayoutResponse.WidgetResponse();
            widgetResponse.setWidgetId(widget.getWidgetId());
            widgetResponse.setWidgetType(widget.getWidgetType());
            widgetResponse.setWidgetName(widget.getWidgetName());

            // 🔹 Set `data` as null in response
            widgetResponse.setData(null);

            widgetResponses.add(widgetResponse);
        }

        // ✅ Create LayoutResponse object and set all fields
        LayoutResponse layoutResponse = new LayoutResponse();
        layoutResponse.setLayoutId(layout.getId());
        layoutResponse.setLayoutName(layout.getLayoutName());
        layoutResponse.setLayoutType(layout.getLayoutType());
        layoutResponse.setCreatedAt(layout.getCreatedAt());
        layoutResponse.setWidgets(widgetResponses);

        return layoutResponse;
    }

    public ResponseEntity<?> filterLayouts(String layoutType, String layoutName, LocalDate startDate, LocalDate endDate) {
        try {
            final LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
            final LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(23, 59, 59) : null;

            Specification<Layout> spec = Specification.where(null);

            if (layoutType != null && !layoutType.isEmpty()) {
                spec = spec.and((root, query, criteriaBuilder) ->
                        criteriaBuilder.equal(root.get("layoutType"), layoutType));
            }

            if (layoutName != null && !layoutName.isEmpty()) {
                spec = spec.and((root, query, criteriaBuilder) ->
                        criteriaBuilder.like(root.get("layoutName"), "%" + layoutName + "%"));
            }

            if (startDateTime != null) {
                spec = spec.and((root, query, criteriaBuilder) ->
                        criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startDateTime));
            }

            if (endDateTime != null) {
                spec = spec.and((root, query, criteriaBuilder) ->
                        criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), endDateTime));
            }

            List<Layout> filteredLayouts = layoutRepository.findAll(spec);
            List<Map<String, Object>> response = filteredLayouts.stream()
                    .map(layout -> {
                        Map<String, Object> layoutMap = new HashMap<>();
                        layoutMap.put("id", layout.getId());
                        layoutMap.put("layoutName", layout.getLayoutName());
                        layoutMap.put("layoutType", layout.getLayoutType());
                        layoutMap.put("createdAt", layout.getCreatedAt().format(DATE_TIME_FORMATTER));
                        return layoutMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error filtering layouts: " + e.getMessage());
        }
    }



//    public ResponseEntity<?> filterLayouts(String layoutType, String layoutName, LocalDate startDate, LocalDate endDate) {
//        try {
//            final LocalDateTime startDateTime = (startDate != null) ? startDate.atStartOfDay() : null;
//            final LocalDateTime endDateTime = (endDate != null) ? endDate.atTime(23, 59, 59) : null;
//
//            Specification<Layout> spec = Specification.where(null);
//
//            if (layoutType != null && !layoutType.isEmpty()) {
//                spec = spec.and((root, query, criteriaBuilder) ->
//                        criteriaBuilder.equal(root.get("layoutType"), layoutType));
//            }
//
//            if (layoutName != null && !layoutName.isEmpty()) {
//                spec = spec.and((root, query, criteriaBuilder) ->
//                        criteriaBuilder.like(root.get("layoutName"), "%" + layoutName + "%"));
//            }
//
//            if (startDateTime != null) {
//                spec = spec.and((root, query, criteriaBuilder) ->
//                        criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), startDateTime));
//            }
//
//            if (endDateTime != null) {
//                spec = spec.and((root, query, criteriaBuilder) ->
//                        criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), endDateTime));
//            }
//
//            List<Layout> filteredLayouts = layoutRepository.findAll(spec);
//            return ResponseEntity.ok(filteredLayouts);
//
//        } catch (Exception e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                    .body("Error filtering layouts: " + e.getMessage());
//        }
//    }

    public List<Map<String, Object>> viewLayouts() {
        return layoutRepository.findAll().stream()
            .map(layout -> {
                Map<String, Object> layoutMap = new HashMap<>();
                layoutMap.put("id", layout.getId());
                layoutMap.put("layoutName", layout.getLayoutName());
                layoutMap.put("layoutType", layout.getLayoutType());
                layoutMap.put("createdAt", layout.getCreatedAt().format(DATE_TIME_FORMATTER));
                return layoutMap;
            })
            .collect(Collectors.toList());
    }


    public ResponseEntity<?> getLayoutTypes() {
        try {
            List<String> layoutTypes = layoutRepository.findDistinctLayoutTypes();

            if (layoutTypes.isEmpty()) {
                return ResponseEntity.ok("No layout types found.");
            }

            return ResponseEntity.ok(layoutTypes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error retrieving layout types: " + e.getMessage());
        }
    }

    public Map<String, Object> getLayoutById(Long layoutId) {
        Optional<Layout> layoutOpt = layoutRepository.findById(layoutId);
        if (layoutOpt.isEmpty()) {
            return null;  // Returning null will be handled by the controller
        }

        Layout layout = layoutOpt.get();

        // Fetch widgets associated with the layoutId
        List<Widget> widgets = layoutWidgetRepository.findWidgetsByLayoutId(layoutId);

        // Convert widget list to response format
        List<Map<String, Object>> widgetList = widgets.stream().map(widget -> {
            Map<String, Object> widgetMap = new LinkedHashMap<>();
            widgetMap.put("widgetId", widget.getWidgetId());
            widgetMap.put("widgetName", widget.getWidgetName());
            widgetMap.put("widgetType", widget.getWidgetType());
            return widgetMap;
        }).collect(Collectors.toList());

        // Construct response map
        Map<String, Object> layoutData = new LinkedHashMap<>();
        layoutData.put("layoutId", layout.getId());
        layoutData.put("layoutName", layout.getLayoutName());
        layoutData.put("layoutType", layout.getLayoutType());
        layoutData.put("widgets", widgetList); // Empty list if no widgets exist

        return layoutData;
    }

    @Transactional
    public Optional<LayoutResponse> updateLayout(Long id, LayoutRequest request) {
        Optional<Layout> optionalLayout = layoutRepository.findById(id);
        if (optionalLayout.isEmpty()) {
            return Optional.empty();
        }

        Layout layout = optionalLayout.get();
        layout.setLayoutName(request.getLayoutName());
        layout.setLayoutType(request.getLayoutType());

        // ✅ Get all existing layout widgets
        List<LayoutWidget> existingLayoutWidgets = layoutWidgetRepository.findByLayout(layout);
        Map<Long, LayoutWidget> existingWidgetMap = existingLayoutWidgets.stream()
                .collect(Collectors.toMap(lw -> lw.getWidget().getWidgetId(), lw -> lw));

        // ✅ Identify widgets to remove (widgets missing in the request)
        Set<Long> requestedWidgetIds = request.getWidgets().stream()
                .map(LayoutRequest.WidgetRequest::getWidgetId)
                .filter(Objects::nonNull)  // Only consider existing widgets
                .collect(Collectors.toSet());

        List<LayoutWidget> widgetsToRemove = existingLayoutWidgets.stream()
                .filter(lw -> !requestedWidgetIds.contains(lw.getWidget().getWidgetId()))
                .collect(Collectors.toList());

        if (!widgetsToRemove.isEmpty()) {
            layoutWidgetRepository.deleteAll(widgetsToRemove);
        }

        // ✅ Add new widgets (only if they are not already associated)
        for (LayoutRequest.WidgetRequest widgetRequest : request.getWidgets()) {
            Long widgetId = widgetRequest.getWidgetId();

            if (widgetId != null && existingWidgetMap.containsKey(widgetId)) {
                // 🛑 Widget already exists in layout, skip it
                continue;
            }

            Widget widget;
            if (widgetId != null) {
                widget = widgetRepository.findById(widgetId)
                        .orElseThrow(() -> new RuntimeException("Widget not found"));
            } else {
                // 🆕 Create a new widget if no widgetId was provided
                widget = new Widget();
                widget.setWidgetName(widgetRequest.getWidgetName());
                widget.setWidgetType(widgetRequest.getWidgetType());
                widget = widgetRepository.save(widget);
            }

            LayoutWidget layoutWidget = new LayoutWidget();
            layoutWidget.setLayout(layout);
            layoutWidget.setWidget(widget);
            layoutWidgetRepository.save(layoutWidget);
        }

        // ✅ Refresh layout & return updated response
        entityManager.flush();
        entityManager.clear();
        return Optional.of(convertToLayoutResponse(layoutRepository.findById(layout.getId()).get()));
    }

    private LayoutResponse convertToLayoutResponse(Layout layout) {
        LayoutResponse response = new LayoutResponse();
        response.setLayoutId(layout.getId());
        response.setLayoutName(layout.getLayoutName());
        response.setLayoutType(layout.getLayoutType());
        response.setCreatedAt(layout.getCreatedAt());
        if (layout.getLayoutWidgets() != null) {
            response.setWidgets(layout.getLayoutWidgets().stream()
                    .map(this::convertToWidgetResponse)
                    .collect(Collectors.toList()));
        }
        return response;
    }

    private LayoutResponse.WidgetResponse convertToWidgetResponse(LayoutWidget layoutWidget) {
        LayoutResponse.WidgetResponse widgetResponse = new LayoutResponse.WidgetResponse();
        widgetResponse.setWidgetId(layoutWidget.getWidget().getWidgetId());
        widgetResponse.setWidgetType(layoutWidget.getWidget().getWidgetType());
        widgetResponse.setWidgetName(layoutWidget.getWidget().getWidgetName());

        // Assuming `data` is dynamically structured, fetching it as a Map
        widgetResponse.setData(layoutWidget.getWidget().getData());

        return widgetResponse;
    }

    public ResponseEntity<?> deleteLayout(Long id) {
        Optional<Layout> layoutOptional = layoutRepository.findById(id);
        if (layoutOptional.isPresent()) {
            layoutRepository.deleteById(id);
            return ResponseEntity.ok("Layout deleted successfully.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Layout not found with id: " + id);
        }
    }

    public List<Map<String, Object>> searchLayoutsByName(String layoutName) {
        List<Layout> layouts = layoutRepository.findByLayoutNameContainingIgnoreCase(layoutName);
        return layouts.stream()
                .map(layout -> {
                    Map<String, Object> layoutMap = new HashMap<>();
                    layoutMap.put("id", layout.getId());
                    layoutMap.put("layoutName", layout.getLayoutName());
                    layoutMap.put("layoutType", layout.getLayoutType());
                    layoutMap.put("createdAt", layout.getCreatedAt().format(DATE_TIME_FORMATTER));
                    return layoutMap;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getWidgetsGroupedByType() {
        List<Widget> widgets = widgetRepository.findAll();

        return widgets.stream()
                .collect(Collectors.groupingBy(Widget::getWidgetType, LinkedHashMap::new,
                        Collectors.mapping(Widget::getWidgetName, Collectors.toSet()))) // Using Set to remove duplicates
                .entrySet().stream()
                .map(entry -> {
                    Map<String, Object> widgetGroup = new LinkedHashMap<>();
                    widgetGroup.put("widgetType", entry.getKey());
                    widgetGroup.put("widgetName", new ArrayList<>(entry.getValue())); // Convert Set to List
                    return widgetGroup;
                })
                .collect(Collectors.toList());
    }

}
