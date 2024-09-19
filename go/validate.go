package tinyformfields

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/mail"
	"net/url"
	"regexp"
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

type TinyFormField struct {
	Label    string                `json:"label"`
	Name     string                `json:"name,omitempty"`
	Presence TinyFormFieldPresence `json:"presence,omitempty"`
	Type     FieldType             `json:"type"`
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
		Label    string          `json:"label"`
		Name     string          `json:"name,omitempty"`
		Presence json.RawMessage `json:"presence,omitempty"`
		Type     json.RawMessage `json:"type"`
	}
	if err := json.Unmarshal(data, &tmp); err != nil {
		return err
	}
	f.Label = tmp.Label
	f.Name = tmp.Name

	// Unmarshal Presence
	if tmp.Presence != nil {
		if err := json.Unmarshal(tmp.Presence, &f.Presence); err != nil {
			return fmt.Errorf("error parsing presence for field %s: %v", f.Label, err)
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

type Choice struct {
	Value string
	Label string
}

// parseChoices parses the choices array, handling " | " delimiters.
func parseChoices(choiceStrings []string) []Choice {
	choices := []Choice{}
	for _, choiceStr := range choiceStrings {
		parts := strings.SplitN(choiceStr, " | ", 2)
		if len(parts) == 2 {
			choices = append(choices, Choice{
				Value: parts[0],
				Label: parts[1],
			})
		} else {
			choices = append(choices, Choice{
				Value: choiceStr,
				Label: choiceStr,
			})
		}
	}
	return choices
}

type DropdownField struct {
	Type          string   `json:"type"` // "Dropdown"
	Choices       []string `json:"choices"`
	parsedChoices []Choice
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
	// Parse choices
	f.parsedChoices = parseChoices(f.Choices)
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
	if len(value) == 0 {
		// value is empty, and presence is not "Required", so it's OK
		return nil
	}
	val := value[0]
	// Check that val is one of the allowed values
	for _, choice := range f.parsedChoices {
		if val == choice.Value {
			return nil // valid
		}
	}
	// Collect valid values
	validValues := make([]string, len(f.parsedChoices))
	for i, choice := range f.parsedChoices {
		validValues[i] = choice.Value
	}
	return fmt.Errorf("%w: %s has invalid value '%s'. Valid choices are: %v", ErrInvalidChoice, fieldName, val, validValues)
}

type ChooseOneField struct {
	Type          string   `json:"type"` // "ChooseOne"
	Choices       []string `json:"choices"`
	parsedChoices []Choice
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
	// Parse choices
	f.parsedChoices = parseChoices(f.Choices)
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
	if len(value) == 0 {
		return nil
	}
	val := value[0]
	// Check that val is one of the allowed values
	for _, choice := range f.parsedChoices {
		if val == choice.Value {
			return nil // valid
		}
	}
	// Collect valid values
	validValues := make([]string, len(f.parsedChoices))
	for i, choice := range f.parsedChoices {
		validValues[i] = choice.Value
	}
	return fmt.Errorf("%w: %s has invalid value '%s'. Valid choices are: %v", ErrInvalidChoice, fieldName, val, validValues)
}

type ChooseMultipleField struct {
	Type          string   `json:"type"` // "ChooseMultiple"
	Choices       []string `json:"choices"`
	parsedChoices []Choice
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
	// Parse choices
	f.parsedChoices = parseChoices(f.Choices)
	return nil
}

func (f *ChooseMultipleField) Validate(value []string, field TinyFormField) error {
	fieldName := field.FieldName()
	if isRequired(field) && len(value) == 0 {
		return fmt.Errorf("%w: %s", ErrRequiredFieldMissing, fieldName)
	}
	if len(value) == 0 {
		return nil
	}
	// Collect valid values
	validValues := make([]string, len(f.parsedChoices))
	for i, choice := range f.parsedChoices {
		validValues[i] = choice.Value
	}
	// Check that each value is among the allowed values
	for _, val := range value {
		valid := false
		for _, choice := range f.parsedChoices {
			if val == choice.Value {
				valid = true
				break
			}
		}
		if !valid {
			return fmt.Errorf("%w: %s has invalid value '%s'. Valid choices are: %v", ErrInvalidChoice, fieldName, val, validValues)
		}
	}
	return nil
}

type LongTextField struct {
	Type      string `json:"type"` // "LongText"
	MaxLength int    `json:"maxLength,omitempty"`
}

func (f *LongTextField) Validate(value []string, field TinyFormField) error {
	fieldName := field.FieldName()
	if isRequired(field) && (len(value) == 0 || value[0] == "") {
		return fmt.Errorf("%w: %s", ErrRequiredFieldMissing, fieldName)
	}
	if len(value) == 0 {
		return nil
	}
	val := value[0]
	// LongText can contain \r\n
	if f.MaxLength > 0 && len(val) > f.MaxLength {
		return fmt.Errorf("%w: %s exceeds max length of %d", ErrInvalidLength, fieldName, f.MaxLength)
	}
	return nil
}

type ShortTextField struct {
	Type       string                 `json:"type"` // "ShortText"
	InputType  string                 `json:"inputType"`
	Attributes map[string]interface{} `json:"attributes"`
}

func (f *ShortTextField) Validate(value []string, field TinyFormField) error {
	fieldName := field.FieldName()
	if isRequired(field) && (len(value) == 0 || value[0] == "") {
		return fmt.Errorf("%w: %s", ErrRequiredFieldMissing, fieldName)
	}
	if len(value) == 0 {
		return nil
	}
	val := value[0]

	// For "multiple": "true", we need to split the value
	multiple := false
	if m, ok := f.Attributes["multiple"].(string); ok && m == "true" {
		multiple = true
	}

	valuesToValidate := []string{val}

	if multiple {
		// Split val by commas
		valuesToValidate = strings.Split(val, ",")
	}

	// Now, for each value, validate
	for _, val := range valuesToValidate {
		// Check that val does not contain \r or \n
		if strings.ContainsAny(val, "\r\n") {
			return fmt.Errorf("%w: %s", ErrLineBreakNotAllowed, fieldName)
		}

		// Check for "pattern"
		if pattern, ok := f.Attributes["pattern"].(string); ok {
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
			var maxLen int
			switch v := maxLenValue.(type) {
			case float64:
				maxLen = int(v)
			case string:
				maxLen, _ = strconv.Atoi(v)
			}
			if len(val) > maxLen {
				return fmt.Errorf("%w: %s exceeds maximum length of %d", ErrInvalidLength, fieldName, maxLen)
			}
		}
		if minLenValue, ok := f.Attributes["minlength"]; ok {
			var minLen int
			switch v := minLenValue.(type) {
			case float64:
				minLen = int(v)
			case string:
				minLen, _ = strconv.Atoi(v)
			}
			if len(val) < minLen {
				return fmt.Errorf("%w: %s is shorter than minimum length of %d", ErrInvalidLength, fieldName, minLen)
			}
		}

		// Check for "type"
		if typ, ok := f.Attributes["type"].(string); ok {
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

// ValidFormValues validates the form submission values against the form definition.
// Returns nil if validation passes, otherwise returns an error.
func ValidFormValues(formFields []byte, values url.Values) error {
	var fields []TinyFormField
	if err := json.Unmarshal(formFields, &fields); err != nil {
		return fmt.Errorf("error parsing form fields: %v", err)
	}
	for _, field := range fields {
		fieldName := field.FieldName()
		value := values[fieldName]
		if err := field.Type.Validate(value, field); err != nil {
			return err
		}
	}
	return nil
}
