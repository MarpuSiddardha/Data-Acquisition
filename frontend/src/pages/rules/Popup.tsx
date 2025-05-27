import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import {
  createRuleAsync,
  setPopupOpen,
  updateRuleAsync,
} from "@/store/rulesSlice";
import {
  RTUData,
  Rule,
  Condition,
  Sensor,
  PopupProps,
  SensorApiResponse,
  RtuApiResponse,
} from "@/utils/types";
import { getRTUs } from "@/services/api/apis";
import RTUMultiSelect from "@/pages/rules/RTUMultiSelect";
import { Save as SaveIcon, Cancel as CancelIcon } from "@mui/icons-material";
import {
  RulesStyle,
  StyledLabel,
  CustomInput,
  CustomSwitch,
  CustomSelect,
  ChipInput,
  ChipContainer,
  TagInput,
  LoadingWrapper,
  MenuProps,
  priorityOptions,
  operatorOptions,
  functionOptions,
  viewModeStyle,
} from "@/styles/rulesStyles";

const MAX_Tags = 3;
const MAX_Conditions = 3;

const Popup: React.FC<PopupProps> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const selectedRule = useSelector(
    (state: RootState) => state.rules.selectedRule
  ) as Rule | null;
  const isEditMode = useSelector((state: RootState) => state.rules.isEditMode);
  const isViewMode = useSelector((state: RootState) => state.rules.isViewMode);
  const [rtuOptions, setRtuOptions] = useState<RTUData[]>([]);
  const [selectedRtu, setSelectedRtu] = useState<string[]>([]);
  const [ruleName, setRuleName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [conditions, setConditions] = useState<Condition[]>([
    {
      sensorType: "",
      sensorId: "",
      operator: "",
      value: "",
      function: "",
    },
  ]);
  const [activationDelay, setActivationDelay] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const [priority, setPriority] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [tagError, setTagError] = useState<string>("");
  /////////// const [successMessage, setSuccessMessage] = useState<string>("");
  // const [conditionError, setConditionError] = useState<string>("");

  const handleConditionClick = () => {
    if (selectedRtu.length === 0) {
      setError("Please select an RTU before adding or editing conditions.");
    } else {
      setError(""); // Clear the error if RTUs are selected
    }
  };

  useEffect(() => {
    if (open && !isEditMode && !isViewMode) {
      setRuleName("");
      setDescription("");
      setSelectedRtu([]);
      setConditions([
        {
          sensorType: "",
          sensorId: "",
          operator: "",
          value: "",
          function: "",
          logicalOperator: "AND",
        },
      ]);
      setActivationDelay("");
      setIsActive(true);
      setPriority("");
      setTags([]);
      setCurrentTag("");
      setTagError("");
      setError("");
    }
  }, [open, isEditMode, isViewMode]);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
        setTagError("");
      }
      setCurrentTag("");
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    setTags(tags.filter((tag) => tag !== tagToDelete));
  };

  useEffect(() => {
    if (open) {
      fetchRtuData().then(() => {
        if (selectedRule) {
          populateFormData();
        }
      });
    }
  }, [open, selectedRule, isEditMode]);

  const populateFormData = () => {
    if (!selectedRule) return;
    // console.log("Populating form with rule data:", selectedRule);
    setRuleName(selectedRule.Rule_Name || "");
    setTags(Array.isArray(selectedRule.Tags) ? selectedRule.Tags : []);
    setPriority(selectedRule.Priority || "");
    setIsActive(selectedRule.Status === "Active");
    setActivationDelay(selectedRule.activationDelay?.toString() || "");
    setDescription(selectedRule.description || "");

    // Handle RTU_ID as an array
    if (selectedRule.RTU_ID) {
      const rtuIds = Array.isArray(selectedRule.RTU_ID)
        ? selectedRule.RTU_ID.map((id) => String(id))
        : [String(selectedRule.RTU_ID)];
      setSelectedRtu(rtuIds);
    }

    // Handle conditions with explicit typing
    if (
      Array.isArray(selectedRule.Condition) &&
      selectedRule.Condition.length > 0
    ) {
      const normalizedConditions: Condition[] = selectedRule.Condition.map(
        (c) => ({
          sensorType: c.sensorType || "",
          sensorId: c.sensorId || "",
          operator: c.operator || "",
          value: c.value?.toString() || "",
          function: c.function || "",
          logicalOperator: c.logicalOperator,
        })
      );
      setConditions(normalizedConditions);
    } else {
      setConditions([
        {
          sensorType: "",
          sensorId: "",
          operator: "",
          value: "",
          function: "",
        },
      ]);
    }
  };

  const handleConfirm = async () => {
    //Mandatory Fields
    if (!ruleName.trim()) {
      setError("Rule Name is required.");
      return;
    }

    if (selectedRtu.length === 0) {
      setError("RTU Selection is required.");
      return;
    }

    const invalidCondition = conditions.some(
      //filter also works
      (condition) =>
        !condition.sensorType ||
        !condition.sensorId ||
        !condition.operator ||
        !condition.value
    );

    if (invalidCondition) {
      setError(
        "Fields in Conditions (Sensor Type, Sensor ID, Operator, Value) are required."
      );
      return;
    }

    if (!priority) {
      setError("Priority is required.");
      return;
    }

    const primaryRtuId = selectedRtu[0] || "";
    const rtuName = getRtuNameById(primaryRtuId);

    const ruleData: Omit<Rule, "Rule_ID"> = {
      Rule_Name: ruleName,
      RTU_ID: primaryRtuId,
      RTU_Name: rtuName,
      description: description,
      Status: isActive ? "Active" : "Paused",
      Priority: priority,
      Tags: tags,
      activationDelay: Number(activationDelay || 0),
      Last_Updated: "",
      Condition: Array.isArray(conditions)
        ? conditions.map((condition, index) => ({
            sensorType: condition.sensorType,
            sensorId: condition.sensorId,
            operator: condition.operator,
            value: condition.value,
            function: condition.function,
            condition_order: index + 1,
            logicalOperator:
              index < conditions.length - 1
                ? condition.logicalOperator || "AND"
                : null,
          }))
        : [],
      selectedRTUs: selectedRtu,
    };

    try {
      if (selectedRule && selectedRule.Rule_ID) {
        // console.log("Updating existing rule with ID:", selectedRule.Rule_ID);
        const updateData = {
          ...ruleData,
          Rule_ID: selectedRule.Rule_ID,
        };
        await dispatch(updateRuleAsync(updateData));
      } else {
        const response = await dispatch(createRuleAsync(ruleData));
        console.log("rule", response);
      }
      dispatch(setPopupOpen(false));
    } catch (error) {
      console.error("Error saving rule:", error);
      setError("Failed to save rule. Please try again.");
    }
  };

  const fetchRtuData = async () => {
    if (!open) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await getRTUs();
      if (!data || data.length === 0) {
        setRtuOptions([]);
        return;
      }
      // const transformedData = data.map((item: { rtuId: any; rtuName: any; sensors: any[]; }) => ({
      const transformedData = data.map((item: RtuApiResponse) => ({
        //changed
        RTU_ID: item.rtuId,
        RTU_Name: item.rtuName,
        Sensors: transformSensors(item.sensors),
      }));
      setRtuOptions(transformedData || []);
    } catch {
      setError("Failed to load RTU data.");
      setRtuOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchRtuData();
    }
  }, [open]);

  // const transformSensors = (sensors: any[]): { [key: string]: Sensor[] } => {
  const transformSensors = (
    sensors: SensorApiResponse[]
  ): { [key: string]: Sensor[] } => {
    if (!sensors || !Array.isArray(sensors)) {
      return {};
    }
    const sensorsByType: { [key: string]: Sensor[] } = {};
    sensors.forEach((sensor) => {
      const type =
        sensor.type || sensor.sensorType || sensor.sensor_type || "Unknown";
      const id =
        sensor.sensorId || sensor.id || sensor.sensor_id || String(sensor.ID);
      const name = id;

      if (!sensorsByType[type]) {
        sensorsByType[type] = [];
      }
      sensorsByType[type].push({ id, name });
    });
    return sensorsByType;
  };

  const getRtuNameById = (rtuId: string) => {
    const rtu = rtuOptions.find((rtu) => String(rtu.RTU_ID) === String(rtuId));
    return rtu ? rtu.RTU_Name : "Unknown RTU";
  };

  const getSensorTypes = () => {
    const sensorTypes = new Set<string>();

    selectedRtu.forEach((rtuId) => {
      const selectedRTUData = rtuOptions.find(
        (rtu) => String(rtu.RTU_ID) === String(rtuId)
      );

      if (selectedRTUData && selectedRTUData.Sensors) {
        Object.keys(selectedRTUData.Sensors).forEach((type) => {
          sensorTypes.add(type);
        });
      }
    });

    return Array.from(sensorTypes);
  };

  const getSensorIds = (sensorType: string): Sensor[] => {
    const allSensors: Sensor[] = [];

    selectedRtu.forEach((rtuId) => {
      const selectedRTUData = rtuOptions.find(
        (rtu) => String(rtu.RTU_ID) === String(rtuId)
      );

      if (selectedRTUData && selectedRTUData.Sensors && sensorType) {
        const sensors = selectedRTUData.Sensors[sensorType] || [];

        if (Array.isArray(sensors)) {
          sensors.forEach((sensor) => {
            if (typeof sensor === "string") {
              allSensors.push({ id: sensor, name: sensor });
            } else {
              allSensors.push(sensor);
            }
          });
        }
      }
    });

    const uniqueSensors = allSensors.filter(
      (sensor, index, self) =>
        index === self.findIndex((s) => s.id === sensor.id)
    );
    return uniqueSensors;
  };

  const handleConditionChange = (
    index: number,
    field: keyof Condition,
    value: string
  ) => {
    if (selectedRtu.length === 0) {
      setError("Please select an RTU before adding or editing conditions.");
      return;
    }

    const newConditions = [...conditions];
    newConditions[index] = {
      ...newConditions[index],
      [field]: value,
    };
    if (field === "sensorType") {
      newConditions[index].sensorId = "";
    }
    setConditions(newConditions);
    if (error) setError(""); // Clear error when user types in conditions
  };

  
  const addCondition = () => {
    if (conditions.length >= MAX_Conditions) {
      setError("Maximum of 3 conditions allowed.");
    } else {
      setConditions([
        ...conditions,
        {
          sensorType: "",
          sensorId: "",
          operator: "",
          value: "",
          function: "",
          logicalOperator: "AND",
        },
      ]);
      setError(""); // Clear error when adding a new condition
    }
  };
 

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      const newConditions = conditions.filter((_, i) => i !== index);
      setConditions(newConditions);
    }
  };

  const renderCondition = (condition: Condition, index: number) => {
    // if (selectedRtu.length === 0) {
    //   return (
    //     <Alert severity="warning" sx={{ mb: 2 }}>
    //       Please select an RTU before adding or editing conditions.
    //     </Alert>
    //   );
    // }

    // Determine the min and max range based on the sensorType
    let min = 0;
    let max = 100; 

    if (condition.sensorType === "Temperature") {
      min = -50;
      max = 150;
    } else if (condition.sensorType === "Pressure") {
      min = 0.0;
      max = 2.0;
    } else if (condition.sensorType === "Humidity") {
      min = 0;
      max = 100;
    }

    return (
      <Box
        key={index}
        sx={{ mb: 1, p: 1, border: "1px solid #E0E3E7", borderRadius: 1 }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="subtitle1" color="#1E3A8A" fontWeight="500">
            Condition {index + 1}
          </Typography>
          {conditions.length > 1 && !isViewMode && (
            <IconButton onClick={() => removeCondition(index)} size="small">
              <DeleteIcon sx={{ color: "#1E3A8A" }} />
            </IconButton>
          )}
        </Box>
        <Box display="flex" flexDirection="column" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <StyledLabel>Sensor Type*</StyledLabel>
            <CustomSelect
              size="small"
              MenuProps={MenuProps}
              value={condition.sensorType}
              onChange={(e) =>
                handleConditionChange(
                  index,
                  "sensorType",
                  e.target.value as string
                )
              }
              displayEmpty
              disabled={isViewMode}
              sx={isViewMode ? viewModeStyle : {}}
              renderValue={(value: unknown): React.ReactNode => {
                return (value as string) || "Select Sensor Type";
              }}
            >
              {getSensorTypes().map((type) => (
                <MenuItem key={type} value={type}>
                  {type === "Temperature"
                    ? "Temperature (°C)"
                    : type === "Pressure"
                      ? "Pressure (atm)"
                      : type === "Humidity"
                        ? "Humidity (%)"
                        : type}
                </MenuItem>
              ))}
            </CustomSelect>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <StyledLabel>Sensor ID*</StyledLabel>
            <CustomSelect
              size="small"
              MenuProps={MenuProps}
              value={condition.sensorId}
              onChange={(e) =>
                handleConditionChange(
                  index,
                  "sensorId",
                  e.target.value as string
                )
              }
              displayEmpty
              disabled={!condition.sensorType || isViewMode}
              sx={isViewMode ? viewModeStyle : {}}
              renderValue={(value: unknown): React.ReactNode => {
                return (value as string) || "Select Sensor ID";
              }}
            >
              {getSensorIds(condition.sensorType).map((sensor) => (
                <MenuItem key={sensor.id} value={sensor.id}>
                  {sensor.name}
                </MenuItem>
              ))}
            </CustomSelect>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <StyledLabel>Operator*</StyledLabel>
            <CustomSelect
              size="small"
              value={condition.operator}
              MenuProps={MenuProps}
              onChange={(e) =>
                handleConditionChange(
                  index,
                  "operator",
                  e.target.value as string
                )
              }
              displayEmpty
              disabled={isViewMode}
              sx={isViewMode ? viewModeStyle : {}}
              renderValue={(selected: unknown): React.ReactNode => {
                if (!selected) return "Select Operator";
                const selectedOption = operatorOptions.find(
                  (op) => op.value === selected
                );
                return selectedOption
                  ? selectedOption.displayValue
                  : String(selected);
              }}
            >
              {operatorOptions.map((op) => (
                <MenuItem key={op.value} value={op.value}>
                  {op.label}
                </MenuItem>
              ))}
            </CustomSelect>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <StyledLabel>Value*</StyledLabel>
            <CustomInput
              type="number"
              placeholder={`Enter Value (${min} to ${max})`}
              value={condition.value}
              onChange={(e) => {
                let value = Number(e.target.value);
                if (value >= min && value <= max) {
                  value = parseFloat(value.toFixed(3));
                  handleConditionChange(index, "value", value.toString());
                }
              }}
              inputProps={{ min, max }}
              disabled={isViewMode}
              sx={isViewMode ? viewModeStyle : {}}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <StyledLabel>Function</StyledLabel>
            <CustomSelect
              size="small"
              MenuProps={MenuProps}
              value={condition.function}
              onChange={(e) =>
                handleConditionChange(
                  index,
                  "function",
                  e.target.value as string
                )
              }
              displayEmpty
              disabled={isViewMode}
              sx={isViewMode ? viewModeStyle : {}}
              renderValue={(value: unknown): React.ReactNode => {
                return (value as string) || "Select Function";
              }}
            >
              {functionOptions.map((func) => (
                <MenuItem key={func} value={func}>
                  {func}
                </MenuItem>
              ))}
            </CustomSelect>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={RulesStyle.popup_heading}>
        <Typography variant="h5" color="#1E3A8A" fontWeight="bold">
          {isViewMode ? "View Rule" : isEditMode ? "Edit Rule" : "Create Rule"}
        </Typography>
        <Box sx={RulesStyle.popup_mode}>
          <Typography variant="body2" sx={RulesStyle.popup_toggle}>
            {isActive ? "Active" : "Paused"}
          </Typography>
          <CustomSwitch
            size="small"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isViewMode}
          />
        </Box>
      </Box>
      <DialogContent sx={{ py: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <LoadingWrapper>
            <CircularProgress />
          </LoadingWrapper>
        ) : (
          <Box px={3} py={2}>
            <Box display="flex" gap={2} mb={2}>
              <Box flex={1}>
                <Box display="flex" flexDirection="column" gap={3}>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <StyledLabel>Rule Name*</StyledLabel>
                    <CustomInput
                      placeholder="Enter Rule Name"
                      value={ruleName}
                      onChange={(e) => {
                        setRuleName(e.target.value);
                        setError(""); // Clear error when user types
                      }}
                      disabled={isViewMode}
                      sx={isViewMode ? viewModeStyle : {}}
                    />
                  </Box>
                  <Box display="flex" alignItems="flex-start" gap={2}>
                    <StyledLabel>RTU Selection*</StyledLabel>
                    <RTUMultiSelect
                      rtuOptions={rtuOptions}
                      selectedRtus={selectedRtu}
                      onChange={(selected) => {
                        setSelectedRtu(selected);
                        if (error) {
                          setError(""); // Clear error when RTUs are selected
                        }
                      }}
                      disabled={isViewMode}
                      maxSelections={3}
                    />
                  </Box>
                </Box>
              </Box>
              <Box flex={1}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                  <StyledLabel>Description</StyledLabel>
                  <CustomInput
                    placeholder="Enter Description"
                    multiline
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    sx={
                      isViewMode
                        ? { ...RulesStyle.popup_description, ...viewModeStyle }
                        : RulesStyle.popup_description
                    }
                    disabled={isViewMode}
                  />
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
              <Typography color="#1E3A8A" sx={{ fontWeight: "450" }}>
                Conditions
              </Typography>
              <Box sx={RulesStyle.popup_condition}>
                <Box
                  sx={RulesStyle.popup_conditionbox}
                  onClick={handleConditionClick}
                >
                  {conditions.map((condition, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      {renderCondition(condition, index)}
                      {index < conditions.length - 1 && (
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <StyledLabel>Logical Operator</StyledLabel>
                          <CustomSelect
                            size="small"
                            MenuProps={MenuProps}
                            value={condition.logicalOperator || "AND"}
                            onChange={(e) =>
                              handleConditionChange(
                                index,
                                "logicalOperator",
                                e.target.value as string
                              )
                            }
                            disabled={isViewMode}
                            sx={isViewMode ? viewModeStyle : {}}
                          >
                            <MenuItem value="AND">And (&&)</MenuItem>
                            <MenuItem value="OR">Or (||)</MenuItem>
                          </CustomSelect>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
                <Box display="flex" justifyContent="flex-end" mt={2}>
                  {!isViewMode && (
                    <Button
                      onClick={addCondition}
                      variant="outlined"
                      size="small"
                      startIcon={<AddCircleOutlineIcon />}
                      sx={RulesStyle.popup_addcondition}
                      disabled={
                        isViewMode ||
                        // conditions.length >= MAX_Conditions ||
                        selectedRtu.length === 0
                      }
                    >
                      Add Condition
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
            <Box display="flex" gap={2} mt={3}>
              <Box flex={1}>
                <Box display="flex" flexDirection="column" gap={2}>
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <StyledLabel>Priority*</StyledLabel>
                    <CustomSelect
                      size="small"
                      value={priority}
                      onChange={(e) => {
                        setPriority(e.target.value as string);
                        if (error) {
                          setError(""); // Clear error when user selects priority
                        }
                      }}
                      disabled={isViewMode}
                      MenuProps={MenuProps}
                      displayEmpty
                      sx={isViewMode ? viewModeStyle : {}}
                      renderValue={(value: unknown): React.ReactNode => {
                        return (value as string) || "Select Priority";
                      }}
                    >
                      {priorityOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.value}
                        </MenuItem>
                      ))}
                    </CustomSelect>
                  </Box>
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    <StyledLabel>Activation Delay </StyledLabel>
                    <CustomInput
                      type="number"
                      placeholder="Duration (0 to 15)min"
                      value={activationDelay}
                      onChange={(e) => {
                        //   let value = Math.max(
                        //     0,
                        //     Math.min(15, Number(e.target.value)) //max limit is 15
                        //   );
                        //   setActivationDelay(value.toString());
                        // }}
                        let value = Number(e.target.value);

                        // Ensure the value is within the range of 0 to 15
                        if (value >= 0 && value <= 15) {
                          // Limit the value to 3 decimal places
                          value = parseFloat(value.toFixed(2));
                          setActivationDelay(value.toString());
                        }
                      }}
                      inputProps={{ min: 0, max: 15, step: 0.001 }}
                      disabled={isViewMode}
                      sx={isViewMode ? viewModeStyle : {}}
                    />
                  </Box>
                </Box>
              </Box>
              <Box flex={1}>
                <Box
                  display="flex"
                  alignItems="flex-start"
                  gap={2}
                  height="100%"
                >
                  <StyledLabel>Tags/Keywords</StyledLabel>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                  >
                    <ChipInput
                      sx={
                        isViewMode
                          ? { ...RulesStyle.popup_chip, ...viewModeStyle }
                          : RulesStyle.popup_chip
                      }
                      onClick={(e) => {
                        if (isViewMode) return;
                        const inputElement =
                          e.currentTarget.querySelector("input");
                        if (inputElement) {
                          inputElement.focus();
                        }
                      }}
                    >
                      {!isViewMode && (
                        <TagInput
                          placeholder={tags.length === 0 ? "Enter Tags " : " "}
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyDown={handleTagKeyDown}
                          disabled={tags.length >= MAX_Tags || isViewMode}
                          sx={{ order: tags.length === 0 ? 0 : 1 }}
                        />
                      )}
                      <ChipContainer>
                        {tags.map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            onDelete={
                              isViewMode
                                ? undefined
                                : () => handleDeleteTag(tag)
                            }
                            deleteIcon={<CloseIcon style={{ fontSize: 14 }} />}
                            sx={
                              isViewMode
                                ? {
                                    ...RulesStyle.popup_tags,
                                    color: "#1E3A81",
                                    "& .MuiChip-label": { color: "#1E3A81" },
                                  }
                                : RulesStyle.popup_tags
                            }
                          />
                        ))}
                      </ChipContainer>
                    </ChipInput>
                    {tagError && !isViewMode && (
                      <Typography
                        variant="caption"
                        sx={{ color: "error.main", mt: 0.5 }}
                      >
                        {tagError}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
        <Button
          onClick={onClose}
          color="secondary"
          variant="outlined"
          startIcon={<CancelIcon />}
          sx={{ borderRadius: 2, fontWeight: "bold" }}
        >
          {isViewMode ? "Close" : "Cancel"}
        </Button>
        {!isViewMode && (
          <Button
            onClick={handleConfirm}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={RulesStyle.popup_conforrmbutton}
          >
            {isEditMode ? "Save" : "Create"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default Popup;
