package tinyformfields

import (
	"errors"
	"net/url"
	"testing"
)

func TestValidFormValues(t *testing.T) {
	formFieldsJSON := `[
          {
            "label": "Question 1",
            "name": "question_1",
            "presence": "Required",
            "description": "",
            "type": {
              "type": "Dropdown",
              "choices": [
                "Red",
                "Orange",
                "Yellow",
                "Green",
                "Blue",
                "Indigo",
                "Violet"
              ]
            }
          },
          {
            "label": "Question 2",
            "name": "question_2",
            "presence": "Required",
            "description": "",
            "type": {
              "type": "ChooseOne",
              "choices": [
                "Yes",
                "No"
              ]
            }
          },
          {
            "label": "Question 3",
            "name": "question_3",
            "presence": "Optional",
            "description": "",
            "type": {
              "type": "ChooseMultiple",
              "choices": [
                "Apple",
                "Banana",
                "Cantaloupe",
                "Durian"
              ]
            }
          },
          {
            "label": "Question 4",
            "name": "question_4",
            "presence": "Required",
            "description": "",
            "type": {
              "type": "LongText",
              "maxLength": 160
            }
          },
          {
            "label": "Question 5",
            "name": "question_5",
            "presence": "Required",
            "description": "",
            "type": {
              "type": "ShortText",
              "inputType": "Single-line free text",
              "attributes": {
                "type": "text"
              }
            }
          },
          {
            "label": "Question 6",
            "name": "question_6",
            "presence": "Required",
            "description": "",
            "type": {
              "type": "ShortText",
              "inputType": "Email",
              "attributes": {
                "type": "email"
              }
            }
          },
          {
            "label": "Question 7",
            "name": "question_7",
            "presence": "Optional",
            "description": "",
            "type": {
              "type": "ShortText",
              "inputType": "Emails",
              "attributes": {
                "multiple": "true",
                "type": "email"
              }
            }
          },
          {
            "label": "Question 8",
            "name": "question_8",
            "presence": "Required",
            "description": "",
            "type": {
              "type": "ShortText",
              "inputType": "NRIC",
              "attributes": {
                "maxlength": "9",
                "minlength": "9",
                "pattern": "^[STGM][0-9]{7}[ABCDEFGHIZJ]$",
                "type": "text"
              }
            }
          },
          {
            "label": "Question 9",
            "name": "question_9",
            "presence": "Required",
            "description": "",
            "type": {
              "type": "ShortText",
              "inputType": "Telephone",
              "attributes": {
                "type": "tel"
              }
            }
          },
          {
            "label": "Question 10",
            "name": "question_10",
            "presence": "Required",
            "description": "",
            "type": {
              "type": "ShortText",
              "inputType": "URL",
              "attributes": {
                "type": "url"
              }
            }
          },
          {
            "label": "Question 11",
            "name": "question_11",
            "presence": "Required",
            "description": "",
            "type": {
              "type": "ShortText",
              "inputType": "Color",
              "attributes": {
                "type": "color"
              }
            }
          },
          {
            "label": "Question 12",
            "name": "question_12",
            "presence": "Required",
            "description": "",
            "type": {
              "type": "ShortText",
              "inputType": "Date",
              "attributes": {
                "type": "date"
              }
            }
          },
          {
            "label": "Question 13",
            "name": "question_13",
            "presence": "Required",
            "description": "",
            "type": {
              "type": "ShortText",
              "inputType": "Time",
              "attributes": {
                "type": "time"
              }
            }
          },
          {
            "label": "Question 14",
            "name": "question_14",
            "presence": "Required",
            "description": "",
            "type": {
              "type": "ShortText",
              "inputType": "Date & Time",
              "attributes": {
                "type": "datetime-local"
              }
            }
          },
          {
            "label": "Question 15",
            "name": "question_15",
            "presence": "Optional",
            "type": {
                "type": "ShortText",
                "inputType": "Telephone",
                "attributes": {
                    "type": "tel"
                }
            }
          }
        ]`

	formValues := url.Values{
		"question_1":  {"Red"},
		"question_2":  {"No"},
		"question_3":  {"Apple", "Banana", "Cantaloupe", "Durian"},
		"question_4":  {"multiple lines\r\nare accepted\r\nhere"},
		"question_5":  {"single line only"},
		"question_6":  {"alice@example.com"},
		"question_7":  {"alice@example.com,bob@example.com"},
		"question_8":  {"S1234567A"},
		"question_9":  {"123"},
		"question_10": {"ftp://example.com"},
		"question_11": {"#000000"},
		"question_12": {"2024-09-19"},
		"question_13": {"19:18"},
		"question_14": {"2024-09-19T21:01"},
		"question_15": {""},
	}

	err := ValidFormValues([]byte(formFieldsJSON), formValues)
	if err != nil {
		t.Errorf("Validation Error: %v", err)
	}
}

func TestChoiceParsingAndValidation(t *testing.T) {
	formFieldsJSON := `[
		{
			"label": "Question 1",
			"name": "question_1",
			"presence": "Required",
			"type": {
				"type": "Dropdown",
				"choices": [
					"Yes",
					"Maybe | I might want to go!",
					"No"
				]
			}
		},
		{
			"label": "Question 2",
			"name": "question_2",
			"presence": "Required",
			"type": {
				"type": "ChooseMultiple",
				"choices": [
					"Option1 | First Option",
					"Option2 | Second Option",
					"Option3"
				]
			}
		}
	]`

	formValues := url.Values{
		"question_1": {"Maybe"},
		"question_2": {"Option1", "Option3"},
	}

	err := ValidFormValues([]byte(formFieldsJSON), formValues)
	if err != nil {
		t.Errorf("Validation Error: %v", err)
	}

	// Test invalid value
	formValuesInvalid := url.Values{
		"question_1": {"I might want to go!"},
	}

	err = ValidFormValues([]byte(formFieldsJSON), formValuesInvalid)
	expectedError := "invalid choice: question_1 has invalid value 'I might want to go!'. Valid choices are: [Yes Maybe No]"
	if err == nil {
		t.Errorf("Expected error but got nil")
	} else if err.Error() != expectedError {
		t.Errorf("Expected error %q but got %q", expectedError, err.Error())
	}
}

func TestInvalidFormValues(t *testing.T) {
	scenarios := []struct {
		name        string
		formFields  string
		formValues  url.Values
		expectError error
	}{
		{
			name: "Invalid Choice with Label",
			formFields: `[
			  {
				"label": "Question 1",
				"name": "question_1",
				"presence": "Required",
				"type": {
				  "type": "Dropdown",
				  "choices": [
					  "Yes",
					  "Maybe | I might want to go!",
					  "No"
				  ]
				}
			  }
			]`,
			formValues:  url.Values{"question_1": {"I might want to go!"}},
			expectError: ErrInvalidChoice,
		},
		{
			name: "Valid Choice with Value",
			formFields: `[
			  {
				"label": "Question 1",
				"name": "question_1",
				"presence": "Required",
				"type": {
				  "type": "Dropdown",
				  "choices": [
					  "Yes",
					  "Maybe | I might want to go!",
					  "No"
				  ]
				}
			  }
			]`,
			formValues:  url.Values{"question_1": {"Maybe"}},
			expectError: nil,
		},
		{
			name: "Valid Choice with Value with Spaces",
			formFields: `[
			  {
				"label": "Question 1",
				"name": "question_1",
				"presence": "Required",
				"type": {
				  "type": "Dropdown",
				  "choices": [
					  " Yes ",
					  " No "
				  ]
				}
			  }
			]`,
			formValues:  url.Values{"question_1": {"Yes"}},
			expectError: nil,
		},
		{
			name: "Invalid Choice in Dropdown",
			formFields: `[
			  {
				"label": "Question 1",
				"name": "question_1",
				"presence": "Required",
				"type": {
				  "type": "Dropdown",
				  "choices": ["Red", "Green", "Blue"]
				}
			  }
			]`,
			formValues:  url.Values{"question_1": {"Purple"}},
			expectError: ErrInvalidChoice,
		},
		{
			name: "Missing Required Field",
			formFields: `[
			  {
				"label": "Question 1",
				"name": "question_1",
				"presence": "Required",
				"type": {
				  "type": "ShortText",
				  "attributes": {"type": "text"}
				}
			  }
			]`,
			formValues:  url.Values{},
			expectError: ErrRequiredFieldMissing,
		},
		{
			name: "Valid Optional Field Missing",
			formFields: `[
			  {
				"label": "Question 1",
				"name": "question_1",
				"presence": "Optional",
				"type": {
				  "type": "ShortText",
				  "attributes": {"type": "text"}
				}
			  }
			]`,
			formValues:  url.Values{},
			expectError: nil,
		},
		{
			name: "Invalid Email",
			formFields: `[
			  {
				"label": "Email",
				"name": "email",
				"presence": "Required",
				"type": {
				  "type": "ShortText",
				  "attributes": {"type": "email"}
				}
			  }
			]`,
			formValues:  url.Values{"email": {"invalid-email"}},
			expectError: ErrInvalidEmail,
		},
		{
			name: "Invalid Pattern",
			formFields: `[
			  {
				"label": "Pattern Field",
				"name": "pattern_field",
				"presence": "Required",
				"type": {
				  "type": "ShortText",
				  "attributes": {
					"type": "text",
					"pattern": "^[0-9]{3}$"
				  }
				}
			  }
			]`,
			formValues:  url.Values{"pattern_field": {"12a"}},
			expectError: ErrInvalidPattern,
		},
		{
			name: "Line Break Not Allowed",
			formFields: `[
			  {
				"label": "Short Text Field",
				"name": "short_text",
				"presence": "Required",
				"type": {
				  "type": "ShortText",
				  "attributes": {
					"type": "text"
				  }
				}
			  }
			]`,
			formValues:  url.Values{"short_text": {"Line1\nLine2"}},
			expectError: ErrLineBreakNotAllowed,
		},
		{
			name: "Valid Multiple Emails",
			formFields: `[
			  {
				"label": "Emails",
				"name": "emails",
				"presence": "Required",
				"type": {
				  "type": "ShortText",
				  "attributes": {
					"type": "email",
					"multiple": "true"
				  }
				}
			  }
			]`,
			formValues:  url.Values{"emails": {"test1@example.com, test2@example.com"}},
			expectError: nil,
		},
		{
			name: "Invalid Multiple Emails",
			formFields: `[
			  {
				"label": "Emails",
				"name": "emails",
				"presence": "Required",
				"type": {
				  "type": "ShortText",
				  "attributes": {
					"type": "email",
					"multiple": "true"
				  }
				}
			  }
			]`,
			formValues:  url.Values{"emails": {"test1@example.com, invalid-email"}},
			expectError: ErrInvalidEmail,
		},
		{
			name: "Empty Multiple Emails When Required",
			formFields: `[
			  {
				"label": "Emails",
				"name": "emails",
				"presence": "Required",
				"type": {
				  "type": "ShortText",
				  "attributes": {
					"type": "email",
					"multiple": "true"
				  }
				}
			  }
			]`,
			formValues:  url.Values{"emails": {""}},
			expectError: ErrRequiredFieldMissing,
		},
		{
			name: "Empty Multiple Emails When Optional",
			formFields: `[
			  {
				"label": "Emails",
				"name": "emails",
				"presence": "Optional",
				"type": {
				  "type": "ShortText",
				  "attributes": {
					"type": "email",
					"multiple": "true"
				  }
				}
			  }
			]`,
			formValues:  url.Values{"emails": {""}},
			expectError: nil,
		},
		{
			name: "Multiple Emails With Comma",
			formFields: `[
			  {
				"label": "Emails",
				"name": "emails",
				"presence": "Required",
				"type": {
				  "type": "ShortText",
				  "attributes": {
					"type": "email",
					"multiple": "true"
				  }
				}
			  }
			]`,
			formValues:  url.Values{"emails": {","}},
			expectError: ErrInvalidEmail,
		},
		{
			name: "Multiple Emails With Only Spaces",
			formFields: `[
			  {
				"label": "Emails",
				"name": "emails",
				"presence": "Required",
				"type": {
				  "type": "ShortText",
				  "attributes": {
					"type": "email",
					"multiple": "true"
				  }
				}
			  }
			]`,
			formValues:  url.Values{"emails": {"    "}},
			expectError: nil,
		},
		{
			name: "Multiple Emails With Extra Spaces",
			formFields: `[
			  {
				"label": "Emails",
				"name": "emails",
				"presence": "Required",
				"type": {
				  "type": "ShortText",
				  "attributes": {
					"type": "email",
					"multiple": "true"
				  }
				}
			  }
			]`,
			formValues:  url.Values{"emails": {"  test1@example.com  ,  test2@example.com  "}},
			expectError: nil,
		},
		{
			name: "Multiple Emails With Pattern",
			formFields: `[
			  {
				"label": "Emails",
				"name": "emails",
				"presence": "Required",
				"type": {
				  "type": "ShortText",
				  "attributes": {
					"type": "email",
					"multiple": "true",
					"pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
				  }
				}
			  }
			]`,
			formValues:  url.Values{"emails": {"test1@example.com, test2@example.com"}},
			expectError: nil,
		},
		{
			name: "Multiple Emails With Pattern - One Invalid",
			formFields: `[
			  {
				"label": "Emails",
				"name": "emails",
				"presence": "Required",
				"type": {
				  "type": "ShortText",
				  "attributes": {
					"type": "email",
					"multiple": "true",
					"pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
				  }
				}
			  }
			]`,
			formValues:  url.Values{"emails": {"test1@example.com, invalid-email"}},
			expectError: ErrInvalidPattern,
		},
	}

	for _, scenario := range scenarios {
		t.Run(scenario.name, func(t *testing.T) {
			err := ValidFormValues([]byte(scenario.formFields), scenario.formValues)
			if scenario.expectError == nil && err != nil {
				t.Errorf("Unexpected error: %v", err)
			} else if scenario.expectError != nil {
				if err == nil {
					t.Errorf("Expected error %v but got nil", scenario.expectError)
				} else if !errors.Is(err, scenario.expectError) {
					t.Errorf("Expected error %v but got %v", scenario.expectError, err)
				}
			}
		})
	}
}

func TestVisibilityRules(t *testing.T) {
	scenarios := []struct {
		name          string
		formFields    string
		values        url.Values
		expectedError error
	}{
		{
			name: "ShowWhen rule - visible and filled - should pass",
			formFields: `[
				{
					"label": "Color",
					"name": "color",
					"presence": "Required",
					"type": {
						"type": "Dropdown",
						"choices": ["Red", "Blue"]
					}
				},
				{
					"label": "Why Red?",
					"name": "why_red",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "color",
									"comparison": {
										"type": "Equals",
										"value": "Red"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"color":   []string{"Red"},
				"why_red": []string{"Because I like it"},
			},
			expectedError: nil,
		},
		{
			name: "ShowWhen rule - visible but empty - should fail",
			formFields: `[
				{
					"label": "Color",
					"name": "color",
					"presence": "Required",
					"type": {
						"type": "Dropdown",
						"choices": ["Red", "Blue"]
					}
				},
				{
					"label": "Why Red?",
					"name": "why_red",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "color",
									"comparison": {
										"type": "Equals",
										"value": "Red"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"color": []string{"Red"},
			},
			expectedError: ErrRequiredFieldMissing,
		},
		{
			name: "ShowWhen rule - hidden and empty - should pass",
			formFields: `[
				{
					"label": "Color",
					"name": "color",
					"presence": "Required",
					"type": {
						"type": "Dropdown",
						"choices": ["Red", "Blue"]
					}
				},
				{
					"label": "Why Red?",
					"name": "why_red",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "color",
									"comparison": {
										"type": "Equals",
										"value": "Red"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"color": []string{"Blue"},
			},
			expectedError: nil,
		},
		{
			name: "HideWhen rule - visible and filled - should pass",
			formFields: `[
				{
					"label": "Has Comments",
					"name": "has_comments",
					"presence": "Required",
					"type": {
						"type": "ChooseOne",
						"choices": ["Yes", "No"]
					}
				},
				{
					"label": "Comments",
					"name": "comments",
					"presence": "Required",
					"type": {
						"type": "LongText",
						"maxLength": 1000
					},
					"visibilityRule": [
						{
							"type": "HideWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "has_comments",
									"comparison": {
										"type": "Equals",
										"value": "No"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"has_comments": []string{"Yes"},
				"comments":     []string{"These are my comments"},
			},
			expectedError: nil,
		},
		{
			name: "HideWhen rule - visible but empty - should fail",
			formFields: `[
				{
					"label": "Has Comments",
					"name": "has_comments",
					"presence": "Required",
					"type": {
						"type": "ChooseOne",
						"choices": ["Yes", "No"]
					}
				},
				{
					"label": "Comments",
					"name": "comments",
					"presence": "Required",
					"type": {
						"type": "LongText",
						"maxLength": 1000
					},
					"visibilityRule": [
						{
							"type": "HideWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "has_comments",
									"comparison": {
										"type": "Equals",
										"value": "No"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"has_comments": []string{"Yes"},
			},
			expectedError: ErrRequiredFieldMissing,
		},
		{
			name: "HideWhen rule - hidden and empty - should pass",
			formFields: `[
				{
					"label": "Has Comments",
					"name": "has_comments",
					"presence": "Required",
					"type": {
						"type": "ChooseOne",
						"choices": ["Yes", "No"]
					}
				},
				{
					"label": "Comments",
					"name": "comments",
					"presence": "Required",
					"type": {
						"type": "LongText",
						"maxLength": 1000
					},
					"visibilityRule": [
						{
							"type": "HideWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "has_comments",
									"comparison": {
										"type": "Equals",
										"value": "No"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"has_comments": []string{"No"},
			},
			expectedError: nil,
		},
		{
			name: "StringContains - visible and filled - should pass",
			formFields: `[
				{
					"label": "Description",
					"name": "description",
					"type": {
						"type": "LongText"
					}
				},
				{
					"label": "Urgent Note",
					"name": "urgent_note",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "description",
									"comparison": {
										"type": "StringContains",
										"value": "urgent"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"description": []string{"This is an urgent matter"},
				"urgent_note": []string{"Handle ASAP"},
			},
			expectedError: nil,
		},
		{
			name: "StringContains - visible but empty - should fail",
			formFields: `[
				{
					"label": "Description",
					"name": "description",
					"type": {
						"type": "LongText"
					}
				},
				{
					"label": "Urgent Note",
					"name": "urgent_note",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "description",
									"comparison": {
										"type": "StringContains",
										"value": "urgent"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"description": []string{"This is an urgent matter"},
			},
			expectedError: ErrRequiredFieldMissing,
		},
		{
			name: "StringContains - hidden and empty - should pass",
			formFields: `[
				{
					"label": "Description",
					"name": "description",
					"type": {
						"type": "LongText"
					}
				},
				{
					"label": "Urgent Note",
					"name": "urgent_note",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "description",
									"comparison": {
										"type": "StringContains",
										"value": "urgent"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"description": []string{"This is a normal matter"},
			},
			expectedError: nil,
		},
		{
			name: "ShowWhen rule with GreaterThan numeric - visible and filled - should pass",
			formFields: `[
				{
					"label": "Score",
					"name": "score",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					}
				},
				{
					"label": "High Score Message",
					"name": "high_score_msg",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "score",
									"comparison": {
										"type": "GreaterThan",
										"value": "100"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"score":          []string{"150"},
				"high_score_msg": []string{"Great job!"},
			},
			expectedError: nil,
		},
		{
			name: "ShowWhen rule with GreaterThan numeric - not visible - should pass",
			formFields: `[
				{
					"label": "Score",
					"name": "score",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					}
				},
				{
					"label": "High Score Message",
					"name": "high_score_msg",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "score",
									"comparison": {
										"type": "GreaterThan",
										"value": "100"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"score": []string{"50"},
			},
			expectedError: nil,
		},
		{
			name: "ShowWhen rule with GreaterThan string - visible and filled - should pass",
			formFields: `[
				{
					"label": "Name",
					"name": "name",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					}
				},
				{
					"label": "Message",
					"name": "message",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "name",
									"comparison": {
										"type": "GreaterThan",
										"value": "abc"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"name":    []string{"xyz"},
				"message": []string{"Name is after abc"},
			},
			expectedError: nil,
		},
		{
			name: "ShowWhen rule with GreaterThan string - not visible - should pass",
			formFields: `[
				{
					"label": "Name",
					"name": "name",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					}
				},
				{
					"label": "Message",
					"name": "message",
					"presence": "Required",
					"type": {
						"type": "ShortText",
						"inputType": "text"
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "name",
									"comparison": {
										"type": "GreaterThan",
										"value": "xyz"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"name": []string{"abc"},
			},
			expectedError: nil,
		},
		{
			name: "Required field hidden by logic with blank value - should pass",
			formFields: `[
				{
					"label": "Show Details",
					"name": "show_details",
					"presence": "Required",
					"type": {
						"type": "ChooseOne",
						"choices": ["Yes", "No"]
					}
				},
				{
					"label": "Details",
					"name": "details",
					"presence": "Required",
					"type": {
						"type": "LongText",
						"maxLength": 500
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "show_details",
									"comparison": {
										"type": "Equals",
										"value": "Yes"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"show_details": []string{"No"},
				"details":      []string{""}, // Empty value for required field, but it's hidden
			},
			expectedError: nil,
		},
		{
			name: "Required dropdown hidden by logic with blank value - should pass",
			formFields: `[
				{
					"label": "Country",
					"name": "country",
					"presence": "Required",
					"type": {
						"type": "Dropdown",
						"choices": ["USA", "Canada", "Other"]
					}
				},
				{
					"label": "State",
					"name": "state",
					"presence": "Required",
					"type": {
						"type": "Dropdown",
						"choices": ["California", "New York", "Texas"]
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "country",
									"comparison": {
										"type": "Equals",
										"value": "USA"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"country": []string{"Canada"},
				"state":   []string{""}, // Empty value for required dropdown, but it's hidden
			},
			expectedError: nil,
		},
		{
			name: "Required checkbox hidden by logic with no selection - should pass",
			formFields: `[
				{
					"label": "Subscribe to newsletter",
					"name": "subscribe",
					"presence": "Required",
					"type": {
						"type": "ChooseOne",
						"choices": ["Yes", "No"]
					}
				},
				{
					"label": "Topics",
					"name": "topics",
					"presence": "Required",
					"type": {
						"type": "ChooseMultiple",
						"choices": ["Tech", "Sports", "Politics", "Entertainment"]
					},
					"visibilityRule": [
						{
							"type": "ShowWhen",
							"conditions": [
								{
									"type": "Field",
									"fieldName": "subscribe",
									"comparison": {
										"type": "Equals",
										"value": "Yes"
									}
								}
							]
						}
					]
				}
			]`,
			values: url.Values{
				"subscribe": []string{"No"},
				// No topics selected, but field is hidden
			},
			expectedError: nil,
		},
	}

	for _, tt := range scenarios {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidFormValues([]byte(tt.formFields), tt.values)
			if tt.expectedError == nil {
				if err != nil {
					t.Errorf("Expected no error, got: %v", err)
				}
			} else {
				if !errors.Is(err, tt.expectedError) {
					t.Errorf("Expected error %v, got: %v", tt.expectedError, err)
				}
			}
		})
	}
}
