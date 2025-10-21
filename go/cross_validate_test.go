package tinyformfields

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// TestGenerateGoFixtures creates JSON fixtures that Elm tests can consume
// This ensures Go-generated JSON can be parsed by Elm
func TestGenerateGoFixtures(t *testing.T) {
	// Create various form field structures using Go
	testCases := []struct {
		desc  string
		given []TinyFormField
	}{
		{
			desc: "optional_field_empty",
			given: []TinyFormField{
				{
					Label: "comments",
					Name:  "", // Intentionally left blank to test empty string handling
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "", // Empty name
					},
					Type: &LongTextField{
						Type:      "LongText",
						MaxLength: nil,
					},
					Description:    "",  // Empty description
					VisibilityRule: nil, // Nil visibility rules
				},
			},
		},
		{
			desc: "optional_field_filled",
			given: []TinyFormField{
				{
					Label: "comments",
					Name:  "comments",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "legacy",
					},
					Type: &LongTextField{
						Type:      "LongText",
						MaxLength: nil,
					},
					Description:    "enter comments",
					VisibilityRule: []VisibilityRule{},
				},
			},
		},
		{
			desc: "presence",
			given: []TinyFormField{
				{
					Label: "optional field",
					Name:  "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &LongTextField{
						Type:      "LongText",
						MaxLength: nil,
					},
					Description:    "",
					VisibilityRule: nil,
				},
				{
					Label: "required field",
					Name:  "",
					Presence: TinyFormFieldPresence{
						Type: "Required",
						Name: "",
					},
					Type: &LongTextField{
						Type:      "LongText",
						MaxLength: nil,
					},
					Description:    "",
					VisibilityRule: nil,
				},
				{
					Label: "system field",
					Name:  "",
					Presence: TinyFormFieldPresence{
						Type: "System",
						Name: "",
					},
					Type: &LongTextField{
						Type:      "LongText",
						MaxLength: nil,
					},
					Description:    "",
					VisibilityRule: nil,
				},
			},
		},
		{
			desc: "visibility_rules_showwhen",
			given: []TinyFormField{
				{
					Label: "comments",
					Name:  "comments",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "legacy",
					},
					Type: &LongTextField{
						Type:      "LongText",
						MaxLength: nil,
					},
					Description: "enter comments",
					VisibilityRule: []VisibilityRule{
						{
							Type: "ShowWhen",
							Conditions: []VisibilityCondition{
								{
									Type:      "Field",
									FieldName: "another_field",
									Comparison: VisibilityComparison{
										Type:  "Equals",
										Value: "123",
									},
								},
								{
									Type:      "Field",
									FieldName: "another_field",
									Comparison: VisibilityComparison{
										Type:  "StringContains",
										Value: "123",
									},
								},
								{
									Type:      "Field",
									FieldName: "another_field",
									Comparison: VisibilityComparison{
										Type:  "EndsWith",
										Value: "123",
									},
								},
								{
									Type:      "Field",
									FieldName: "another_field",
									Comparison: VisibilityComparison{
										Type:  "GreaterThan",
										Value: "123",
									},
								},
							},
						},
					},
				},
			},
		},
		{
			desc: "visibility_rules_hidewhen",
			given: []TinyFormField{
				{
					Label: "comments",
					Name:  "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &LongTextField{
						Type:      "LongText",
						MaxLength: nil,
					},
					Description: "",
					VisibilityRule: []VisibilityRule{
						{
							Type: "HideWhen",
							Conditions: []VisibilityCondition{
								{
									Type:      "Field",
									FieldName: "another_field",
									Comparison: VisibilityComparison{
										Type:  "Equals",
										Value: "123",
									},
								},
								{
									Type:      "Field",
									FieldName: "another_field",
									Comparison: VisibilityComparison{
										Type:  "StringContains",
										Value: "123",
									},
								},
								{
									Type:      "Field",
									FieldName: "another_field",
									Comparison: VisibilityComparison{
										Type:  "EndsWith",
										Value: "123",
									},
								},
								{
									Type:      "Field",
									FieldName: "another_field",
									Comparison: VisibilityComparison{
										Type:  "GreaterThan",
										Value: "123",
									},
								},
							},
						},
					},
				},
			},
		},
		{
			desc: "visibility_rules_hidewhen",
			given: []TinyFormField{
				{
					Label: "comments",
					Name:  "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &LongTextField{
						Type:      "LongText",
						MaxLength: nil,
					},
					Description: "",
					VisibilityRule: []VisibilityRule{
						{
							Type: "HideWhen",
							Conditions: []VisibilityCondition{
								{
									Type:      "Field",
									FieldName: "another_field",
									Comparison: VisibilityComparison{
										Type:  "Equals",
										Value: "123",
									},
								},
								{
									Type:      "Field",
									FieldName: "another_field",
									Comparison: VisibilityComparison{
										Type:  "StringContains",
										Value: "123",
									},
								},
								{
									Type:      "Field",
									FieldName: "another_field",
									Comparison: VisibilityComparison{
										Type:  "EndsWith",
										Value: "123",
									},
								},
								{
									Type:      "Field",
									FieldName: "another_field",
									Comparison: VisibilityComparison{
										Type:  "GreaterThan",
										Value: "123",
									},
								},
							},
						},
					},
				},
			},
		},
		{
			desc: "long_text",
			given: []TinyFormField{
				{
					Label: "basic",
					Name:  "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &LongTextField{
						Type:      "LongText",
						MaxLength: nil, // Nil max length
					},
					Description:    "",
					VisibilityRule: nil,
				},
				{
					Label: "complex",
					Name:  "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &LongTextField{
						Type:      "LongText",
						MaxLength: ptr(10), // Set max length
					},
					Description:    "",
					VisibilityRule: nil,
				},
			},
		},
		{
			desc: "dropdown_field",
			given: []TinyFormField{
				{
					Label:       "basic",
					Name:        "",
					Description: "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &DropdownField{
						Type:    "Dropdown",
						Choices: []string{"Yes", "No"},
						Filter:  nil, // Nil filter
					},
					VisibilityRule: nil,
				},
				{
					Label:       "complex",
					Name:        "",
					Description: "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &DropdownField{
						Type:    "Dropdown",
						Choices: []string{"y | Yes", "n | No"}, // With labeling
						Filter: &ChoiceFilter{ // With filter
							Type:      "Field",
							FieldName: "another_field",
						},
					},
					VisibilityRule: nil,
				},
			},
		},
		{
			desc: "choose_one_field",
			given: []TinyFormField{
				{
					Label:       "basic",
					Name:        "",
					Description: "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &ChooseOneField{
						Type:    "ChooseOne",
						Choices: []string{"Yes", "No"},
						Filter:  nil, // Nil filter
					},
					VisibilityRule: nil,
				},
				{
					Label:       "complex",
					Name:        "",
					Description: "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &ChooseOneField{
						Type:    "ChooseOne",
						Choices: []string{"y | Yes", "n | No"}, // With labeling
						Filter: &ChoiceFilter{ // With filter
							Type:      "Field",
							FieldName: "another_field",
						},
					},
					VisibilityRule: nil,
				},
			},
		},
		{
			desc: "choose_multiple_field",
			given: []TinyFormField{
				{
					Label:       "basic",
					Name:        "",
					Description: "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &ChooseMultipleField{
						Type:        "ChooseMultiple",
						Choices:     []string{"option 1", "option 2"},
						MinRequired: nil,
						MaxAllowed:  nil,
						Filter:      nil,
					},
					VisibilityRule: nil,
				},
				{
					Label:       "complex",
					Name:        "",
					Description: "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &ChooseMultipleField{
						Type:        "ChooseMultiple",
						Choices:     []string{"1 | option 1", "2 | option 2"}, // With labeling
						MinRequired: ptr(1),                                   // With min required
						MaxAllowed:  ptr(2),                                   // With max allowed
						Filter: &ChoiceFilter{ // With filter
							Type:      "Field",
							FieldName: "another_field",
						},
					},
					VisibilityRule: nil,
				},
			},
		},
		// todo: ShortTextField
		{
			desc: "short_text_field",
			given: []TinyFormField{
				{
					Label:       "basic",
					Name:        "",
					Description: "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &ShortTextField{
						Type:       "ShortText",
						InputType:  "Single-line free text",
						InputTag:   "",
						Attributes: nil,
					},
					VisibilityRule: nil,
				},
				{
					Label:       "complex",
					Name:        "",
					Description: "",
					Presence: TinyFormFieldPresence{
						Type: "Optional",
						Name: "",
					},
					Type: &ShortTextField{
						Type:      "ShortText",
						InputType: "Single-line free text",
						InputTag:  "custom-component",
						Attributes: map[string]string{
							"multiple":  "true",
							"minlength": "3",
							"maxlength": "10",
							"pattern":   "[A-Za-z]+",
							"datalist":  strings.Join([]string{"a", "b", "c"}, `\n`),
							"custom":    "attribute",
						},
					},
					VisibilityRule: nil,
				},
			},
		},
	}

	// Marshal each test case to JSON
	for _, tc := range testCases {
		jsonData, err := json.Marshal(tc.given)
		if err != nil {
			t.Fatalf("Failed to marshal %s: %v", tc.desc, err)
		}

		// Write to testdata directory
		outputPath := filepath.Join("testdata", "go_"+tc.desc+"_fixture.json")
		if err := os.WriteFile(outputPath, jsonData, 0o644); err != nil {
			t.Fatalf("Failed to write %s: %v", outputPath, err)
		}

		t.Logf("Generated %s at %s", tc.desc, outputPath)
	}
}

// Helper function
func ptr[T any](v T) *T {
	return &v
}
