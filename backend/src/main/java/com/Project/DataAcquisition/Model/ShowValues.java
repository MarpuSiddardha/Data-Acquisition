package com.Project.DataAcquisition.Model;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Configuration for showing values in widgets.")
public class ShowValues {

    @Schema(description = "Indicates whether to show minimum values.")
    private boolean showMin;

    @Schema(description = "Indicates whether to show maximum values.")
    private boolean showMax;

    public ShowValues(boolean showMin, boolean showMax) {
        this.showMin = showMin;
        this.showMax = showMax;
    }

    // Getters and Setters

    public boolean isShowMin() {
        return showMin;
    }

    public void setShowMin(boolean showMin) {
        this.showMin = showMin;
    }

    public boolean isShowMax() {
        return showMax;
    }

    public void setShowMax(boolean showMax) {
        this.showMax = showMax;
    }
    // ...
}