package com.Project.DataAcquisition.Entity.Reports.Layout;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.LinkedHashMap;
import java.util.Map;

@Entity
@Table(name = "widgets")
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Widget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    private Long widgetId;

    public Long getWidgetId() {
        return widgetId;
    }

    public void setWidgetId(Long widgetId) {
        this.widgetId = widgetId;
    }

    public String getWidgetType() {
        return widgetType;
    }

    public void setWidgetType(String widgetType) {
        this.widgetType = widgetType;
    }

    public String getWidgetName() {
        return widgetName;
    }

    public void setWidgetName(String widgetName) {
        this.widgetName = widgetName;
    }


    public void setData(Map<String, Object> data) {
        this.data = data;
    }

    private String widgetType;
    private String widgetName;

    @JdbcTypeCode(SqlTypes.JSON) // Store as JSON in PostgreSQL
    @Column(columnDefinition = "JSONB") // Ensures JSONB storage in PostgreSQL
    private Map<String, Object> data = new LinkedHashMap<>();

    @JsonAnyGetter
    public Map<String, Object> getData() {
        return data;
    }

    @JsonAnySetter
    public void addData(String key, Object value) {
        this.data.put(key, value);
    }
}
