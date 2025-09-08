package tinyformfields

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/mail"
	"net/url"
	"regexp"
	"slices"
	"strconv"
	"strings"
	"time"
)

var (
	ErrRequiredFieldMissing = errors.New("required field missing")
	ErrInvalidChoice        = errors.New("invalid choice")
	ErrInvalidPattern       = errors.New("invalid pattern")
	ErrInvalidLength        = errors.New("invalid length")
	ErrInvalidEmail         = errors.New("invalid email")
	ErrInvalidURL           = errors.New("invalid URL")
	ErrInvalidTelephone     = errors.New("invalid telephone number")
	ErrInvalidColor         = errors.New("invalid color")
	ErrInvalidDate          = errors.New("invalid date")
	ErrInvalidTime          = errors.New("invalid time")
	ErrInvalidDateTime      = errors.New("invalid date and time")
	ErrLineBreakNotAllowed  = errors.New("line breaks not allowed")
	ErrInvalidFieldValue    = errors.New("invalid field value")
)

type TinyFormFieldPresence struct {
	Type string `json:"type,omitempty"`
	Name string `json:"name,omitempty"`
}

func (p *TinyFormFieldPresence) UnmarshalJSON(data []byte) error {
	var str string
	if err := json.Unmarshal(data, &str); err == nil {
		// Data is a string; set Type to the string value
		p.Type = str
		return nil
	}

	// Data is an object; unmarshal into the struct
	type Alias TinyFormFieldPresence
	aux := &struct {
		*Alias
	}{
		Alias: (*Alias)(p),
	}
	err := json.Unmarshal(data, &aux)
	if err != nil {
		return fmt.Errorf("unmarshal %#v into Presence: %w", string(data), err)
	}
	return nil
}

func (p TinyFormFieldPresence) MarshalJSON() ([]byte, error) {
	if p.Type != "" {
		return json.Marshal(p.Type)
	}

	return json.Marshal(nil)
}

type VisibilityComparison struct {
	Type  string `json:"type"`
	Value string `json:"value"`
}

type VisibilityCondition struct {
	Type       string               `json:"type,omitempty"`
	FieldName  string               `json:"fieldName,omitempty"`
	Comparison VisibilityComparison `json:"comparison"`
}

type VisibilityRule struct {
	Type       string                `json:"type"`
	Conditions []VisibilityCondition `json:"conditions"`
}

type TinyFormField struct {
	Label          string                `json:"label"`
	Name           string                `json:"name,omitempty"`
	Description    string                `json:"description,omitempty"`
	Presence       TinyFormFieldPresence `json:"presence,omitempty"`
	Type           FieldType             `json:"type"`
	VisibilityRule []VisibilityRule      `json:"visibilityRule,omitempty"`
}

func (tff TinyFormField) Validate(values url.Values) error {
	// Skip validation if field is not visible
	if !isFieldVisible(tff, values) {
		return nil
	}

	value := values[tff.FieldName()]
	if err := tff.Type.Validate(value, tff); err != nil {
		return err
	}
	return nil
}

func (tff TinyFormField) FieldName() string {
	switch {
	case tff.Presence.Name != "":
		return tff.Presence.Name
	case tff.Name != "":
		return tff.Name
	default:
		return tff.Label
	}
}

func (f *TinyFormField) UnmarshalJSON(data []byte) error {
	// Create a temporary struct to get the base fields
	var tmp struct {
		Label          string          `json:"label"`
		Name           string          `json:"name,omitempty"`
		Description    string          `json:"description,omitempty"`
		Presence       json.RawMessage `json:"presence,omitempty"`
		Type           json.RawMessage `json:"type"`
		VisibilityRule json.RawMessage `json:"visibilityRule,omitempty"`
	}
	if err := json.Unmarshal(data, &tmp); err != nil {
		return err
	}
	f.Label = tmp.Label
	f.Name = tmp.Name
	f.Description = tmp.Description

	// Unmarshal Presence
	if tmp.Presence != nil {
		if err := json.Unmarshal(tmp.Presence, &f.Presence); err != nil {
			return fmt.Errorf("error parsing presence for field %s: %v", f.Label, err)
		}
	}

	// Unmarshal VisibilityRule
	if tmp.VisibilityRule != nil {
		if err := json.Unmarshal(tmp.VisibilityRule, &f.VisibilityRule); err != nil {
			return fmt.Errorf("error parsing visibility rule for field %s: %v", f.Label, err)
		}
	}

	// Now, unmarshal the Type field
	// First, get the "type" field inside Type
	var typeField struct {
		Type string `json:"type"`
	}
	if err := json.Unmarshal(tmp.Type, &typeField); err != nil {
		return err
	}

	var fieldType FieldType
	switch typeField.Type {
	case "Dropdown":
		var dropdown DropdownField
		if err := json.Unmarshal(tmp.Type, &dropdown); err != nil {
			return err
		}
		fieldType = &dropdown
	case "ChooseOne":
		var chooseOne ChooseOneField
		if err := json.Unmarshal(tmp.Type, &chooseOne); err != nil {
			return err
		}
		fieldType = &chooseOne
	case "ChooseMultiple":
		var chooseMultiple ChooseMultipleField
		if err := json.Unmarshal(tmp.Type, &chooseMultiple); err != nil {
			return err
		}
		fieldType = &chooseMultiple
	case "LongText":
		var longText LongTextField
		if err := json.Unmarshal(tmp.Type, &longText); err != nil {
			return err
		}
		fieldType = &longText
	case "ShortText":
		var shortText ShortTextField
		if err := json.Unmarshal(tmp.Type, &shortText); err != nil {
			return err
		}
		fieldType = &shortText
	default:
		return fmt.Errorf("unknown field type: %s", typeField.Type)
	}

	f.Type = fieldType
	return nil
}

type FieldType interface {
	Validate(value []string, field TinyFormField) error
}

type ChoiceFilter struct {
	Type      string `json:"type"`
	FieldName string `json:"fieldName"`
}

// parseChoices parses the choices array, handling " | " delimiters.
func parseChoices(choiceStrings []string) []string {
	choices := make([]string, 0, len(choiceStrings))

	for _, choiceStr := range choiceStrings {
		parts := strings.SplitN(choiceStr, " | ", 2)
		if len(parts) == 2 {
			choices = append(choices, strings.TrimSpace(parts[0]))
		} else {
			choices = append(choices, strings.TrimSpace(choiceStr))
		}
	}
	return choices
}

type DropdownField struct {
	Type    string        `json:"type"` // "Dropdown"
	Choices []string      `json:"choices"`
	Filter  *ChoiceFilter `json:"filter,omitempty"`
}

func (f *DropdownField) UnmarshalJSON(data []byte) error {
	type Alias DropdownField
	aux := &struct {
		*Alias
	}{
		Alias: (*Alias)(f),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	return nil
}

func (f *DropdownField) Validate(value []string, field TinyFormField) error {
	fieldName := field.FieldName()
	if isRequired(field) && (len(value) == 0 || value[0] == "") {
		return fmt.Errorf("%w: %s", ErrRequiredFieldMissing, fieldName)
	}
	if len(value) > 1 {
		return fmt.Errorf("%w: %s should have only one value", ErrInvalidFieldValue, fieldName)
	}
	// Optional fields with empty values skip validation
	if !isRequired(field) && isEmptyValue(value) {
		return nil
	}
	val := value[0]

	// Parse choices
	parsedChoices := parseChoices(f.Choices)

	// Check that val is one of the allowed values
	if slices.Index(parsedChoices, val) == -1 {
		return fmt.Errorf("%w: %s has invalid value '%s'. Valid choices are: %v", ErrInvalidChoice, fieldName, val, parsedChoices)
	}

	return nil // valid
}

type ChooseOneField struct {
	Type    string        `json:"type"` // "ChooseOne"
	Choices []string      `json:"choices"`
	Filter  *ChoiceFilter `json:"filter,omitempty"`
}

func (f *ChooseOneField) UnmarshalJSON(data []byte) error {
	type Alias ChooseOneField
	aux := &struct {
		*Alias
	}{
		Alias: (*Alias)(f),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	return nil
}

func (f *ChooseOneField) Validate(value []string, field TinyFormField) error {
	fieldName := field.FieldName()
	if isRequired(field) && (len(value) == 0 || value[0] == "") {
		return fmt.Errorf("%w: %s", ErrRequiredFieldMissing, fieldName)
	}
	if len(value) > 1 {
		return fmt.Errorf("%w: %s should have only one value", ErrInvalidFieldValue, fieldName)
	}
	// Optional fields with empty values skip validation
	if !isRequired(field) && isEmptyValue(value) {
		return nil
	}
	val := value[0]

	// Parse choices
	parsedChoices := parseChoices(f.Choices)

	// Check that val is one of the allowed values
	if slices.Index(parsedChoices, val) == -1 {
		return fmt.Errorf("%w: %s has invalid value '%s'. Valid choices are: %v", ErrInvalidChoice, fieldName, val, parsedChoices)
	}

	return nil
}

type ChooseMultipleField struct {
	Type        string        `json:"type"` // "ChooseMultiple"
	Choices     []string      `json:"choices"`
	MinRequired *int          `json:"minRequired,omitempty"`
	MaxAllowed  *int          `json:"maxAllowed,omitempty"`
	Filter      *ChoiceFilter `json:"filter,omitempty"`
}

func (f *ChooseMultipleField) UnmarshalJSON(data []byte) error {
	type Alias ChooseMultipleField
	aux := &struct {
		*Alias
	}{
		Alias: (*Alias)(f),
	}
	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	return nil
}

func (f *ChooseMultipleField) Validate(value []string, field TinyFormField) error {
	fieldName := field.FieldName()
	if isRequired(field) && len(value) == 0 {
		return fmt.Errorf("%w: %s", ErrRequiredFieldMissing, fieldName)
	}
	// Optional fields with empty values skip validation
	if !isRequired(field) && isEmptyValue(value) {
		return nil
	}

	// Check MinRequired constraint
	if f.MinRequired != nil && len(value) < *f.MinRequired {
		return fmt.Errorf("%w: %s requires at least %d choices, got %d", ErrInvalidFieldValue, fieldName, *f.MinRequired, len(value))
	}

	// Check MaxAllowed constraint
	if f.MaxAllowed != nil && len(value) > *f.MaxAllowed {
		return fmt.Errorf("%w: %s allows at most %d choices, got %d", ErrInvalidFieldValue, fieldName, *f.MaxAllowed, len(value))
	}

	// Parse choices
	parsedChoices := parseChoices(f.Choices)

	// Check that each value is among the allowed values
	for _, val := range value {
		if slices.Index(parsedChoices, val) == -1 {
			return fmt.Errorf("%w: %s has invalid value '%s'. Valid choices are: %v", ErrInvalidChoice, fieldName, val, parsedChoices)
		}
	}
	return nil
}

type LongTextField struct {
	Type      string `json:"type"` // "LongText"
	MaxLength *int   `json:"maxLength"`
}

func (f *LongTextField) Validate(value []string, field TinyFormField) error {
	fieldName := field.FieldName()
	if isRequired(field) && (len(value) == 0 || value[0] == "") {
		return fmt.Errorf("%w: %s", ErrRequiredFieldMissing, fieldName)
	}
	if len(value) > 1 {
		return fmt.Errorf("%w: %s should have only one value", ErrInvalidFieldValue, fieldName)
	}
	// Optional fields with empty values skip validation
	if !isRequired(field) && isEmptyValue(value) {
		return nil
	}
	val := value[0]
	// LongText can contain \r\n
	if f.MaxLength != nil && len(val) > *f.MaxLength {
		return fmt.Errorf("%w: %s exceeds max length of %d", ErrInvalidLength, fieldName, *f.MaxLength)
	}
	return nil
}

type ShortTextField struct {
	Type       string            `json:"type"` // "ShortText"
	InputType  string            `json:"inputType"`
	InputTag   string            `json:"inputTag,omitempty"`
	Attributes map[string]string `json:"attributes,omitempty"`
}

func (f *ShortTextField) Validate(value []string, field TinyFormField) error {
	fieldName := field.FieldName()
	if isRequired(field) && (len(value) == 0 || value[0] == "") {
		return fmt.Errorf("%w: %s", ErrRequiredFieldMissing, fieldName)
	}
	if len(value) > 1 {
		return fmt.Errorf("%w: %s should have only one value", ErrInvalidFieldValue, fieldName)
	}
	// Optional fields with empty values skip validation
	if !isRequired(field) && isEmptyValue(value) {
		return nil
	}
	val := value[0]

	// For "multiple": "true", we need to split the value
	multiple := false
	if m, ok := f.Attributes["multiple"]; ok && m == "true" {
		multiple = true
	}

	valuesToValidate := []string{val}
	if multiple {
		// Split val by commas and trim spaces
		valuesToValidate = parseMultipleValues(strings.TrimSpace(val))
	}

	// Now, for each value, validate
	for _, val := range valuesToValidate {
		// Check that val does not contain \r or \n
		if strings.ContainsAny(val, "\r\n") {
			return fmt.Errorf("%w: %s", ErrLineBreakNotAllowed, fieldName)
		}

		// Check for "pattern"
		if pattern, ok := f.Attributes["pattern"]; ok {
			re, err := regexp.Compile(pattern)
			if err != nil {
				return fmt.Errorf("invalid pattern in %s: %v", fieldName, err)
			}
			if !re.MatchString(val) {
				return fmt.Errorf("%w: %s does not match required pattern", ErrInvalidPattern, fieldName)
			}
		}

		// Check for "maxlength", "minlength"
		if maxLenValue, ok := f.Attributes["maxlength"]; ok {
			maxLen, _ := strconv.Atoi(maxLenValue)
			if len(val) > maxLen {
				return fmt.Errorf("%w: %s exceeds maximum length of %d", ErrInvalidLength, fieldName, maxLen)
			}
		}
		if minLenValue, ok := f.Attributes["minlength"]; ok {
			minLen, _ := strconv.Atoi(minLenValue)
			if len(val) < minLen {
				return fmt.Errorf("%w: %s is shorter than minimum length of %d", ErrInvalidLength, fieldName, minLen)
			}
		}

		// Check for "type"
		if typ, ok := f.Attributes["type"]; ok {
			switch typ {
			case "email":
				if err := validateEmail(val); err != nil {
					return fmt.Errorf("%w: %s", ErrInvalidEmail, fieldName)
				}
			case "url":
				if err := validateURL(val); err != nil {
					return fmt.Errorf("%w: %s", ErrInvalidURL, fieldName)
				}
			case "tel":
				if err := validateTelephone(val); err != nil {
					return fmt.Errorf("%w: %s", ErrInvalidTelephone, fieldName)
				}
			case "color":
				if err := validateColor(val); err != nil {
					return fmt.Errorf("%w: %s", ErrInvalidColor, fieldName)
				}
			case "date":
				if err := validateDate(val); err != nil {
					return fmt.Errorf("%w: %s", ErrInvalidDate, fieldName)
				}
			case "time":
				if err := validateTime(val); err != nil {
					return fmt.Errorf("%w: %s", ErrInvalidTime, fieldName)
				}
			case "datetime-local":
				if err := validateDateTimeLocal(val); err != nil {
					return fmt.Errorf("%w: %s", ErrInvalidDateTime, fieldName)
				}
			case "text":
				// no special validation
			default:
				return fmt.Errorf("unknown type: %s", typ)
			}
		}
	}
	return nil
}

func parseMultipleValues(input string) []string {
	if input == "" {
		return []string{}
	}
	values := strings.Split(input, ",")
	for i := range values {
		values[i] = strings.TrimSpace(values[i])
	}
	return values
}

// Helper functions

func validateEmail(val string) error {
	_, err := mail.ParseAddress(val)
	return err
}

func validateURL(val string) error {
	_, err := url.ParseRequestURI(val)
	return err
}

func validateTelephone(val string) error {
	// Simple validation: digits, spaces, dashes, parentheses, plus sign
	re := regexp.MustCompile(`^[0-9\s\-\+\(\)]+$`)
	if !re.MatchString(val) {
		return ErrInvalidTelephone
	}
	return nil
}

func validateColor(val string) error {
	// Check for hex color code, e.g., #RRGGBB
	re := regexp.MustCompile(`^#([A-Fa-f0-9]{6})$`)
	if !re.MatchString(val) {
		return ErrInvalidColor
	}
	return nil
}

func validateDate(val string) error {
	_, err := time.Parse("2006-01-02", val)
	return err
}

func validateTime(val string) error {
	_, err := time.Parse("15:04", val)
	return err
}

func validateDateTimeLocal(val string) error {
	_, err := time.Parse("2006-01-02T15:04", val)
	return err
}

func isRequired(field TinyFormField) bool {
	// Determine the presence type
	presenceType := "Optional" // default

	if field.Presence.Type != "" {
		presenceType = field.Presence.Type
	}

	switch presenceType {
	case "Required", "System", "SystemRequired":
		return true
	case "Optional", "SystemOptional":
		return false
	default:
		// Unknown presence type
		return false
	}
}

func isVisibilityRuleSatisfied(rule VisibilityRule, values url.Values) bool {
	for _, condition := range rule.Conditions {
		fieldValue := values.Get(condition.FieldName)

		var conditionMet bool
		switch condition.Comparison.Type {
		case "Equals":
			conditionMet = fieldValue == condition.Comparison.Value
		case "StringContains":
			conditionMet = strings.Contains(fieldValue, condition.Comparison.Value)
		case "EndsWith":
			conditionMet = strings.HasSuffix(fieldValue, condition.Comparison.Value)
		case "GreaterThan":
			// Try to parse comparison value as float64
			comparisonValue, comparisonErr := strconv.ParseFloat(condition.Comparison.Value, 64)
			if comparisonErr == nil {
				// If comparison value is float, try to compare as float
				fieldFloat, fieldErr := strconv.ParseFloat(fieldValue, 64)
				if fieldErr == nil {
					conditionMet = fieldFloat > comparisonValue
				} else {
					// If field value is not float but comparison value is, compare as strings
					conditionMet = fieldValue > condition.Comparison.Value
				}
			} else {
				// If comparison value is not float, compare as strings
				conditionMet = fieldValue > condition.Comparison.Value
			}
		}

		if rule.Type == "HideWhen" {
			if conditionMet {
				return true // Rule is satisfied, field should be hidden
			}
		} else { // ShowWhen
			if !conditionMet {
				return false // Rule is not satisfied, field should be hidden
			}
		}
	}

	return rule.Type == "ShowWhen" // Default: show for ShowWhen, hide for HideWhen
}

func isFieldVisible(field TinyFormField, values url.Values) bool {
	if len(field.VisibilityRule) == 0 {
		return true
	}

	for _, rule := range field.VisibilityRule {
		if isVisibilityRuleSatisfied(rule, values) {
			return rule.Type == "ShowWhen" // If rule is satisfied: show for ShowWhen, hide for HideWhen
		}
	}

	return field.VisibilityRule[0].Type == "HideWhen" // Default: show for HideWhen, hide for ShowWhen
}

// ValidFormValues validates the form submission values against the form definition.
// Returns nil if validation passes, otherwise returns an error.
func ValidFormValues(formFields []byte, values url.Values) error {
	var fields TinyFormFields
	if err := json.Unmarshal(formFields, &fields); err != nil {
		return fmt.Errorf("error parsing form fields: %w", err)
	}

	return fields.Validate(values)
}

// isEmptyValue checks if a slice of strings is empty or contains only empty strings.
// This is used to determine if an optional field should skip validation.
func isEmptyValue(value []string) bool {
	if len(value) == 0 {
		return true
	}

	for _, v := range value {
		if v != "" {
			return false
		}
	}

	return true
}

type TinyFormFields []TinyFormField

func (tffs TinyFormFields) Validate(values url.Values) error {
	for _, field := range tffs {
		if err := field.Validate(values); err != nil {
			return err
		}
	}
	return nil
}
