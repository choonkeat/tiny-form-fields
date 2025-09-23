module GoElmCrossValidationTestData exposing (..)

{-| This module is auto-generated from Go test fixtures.
Do not edit manually - run 'node scripts/generate-cross-validation-tests.js' to regenerate.
-}

-- Test case data from Go fixtures


{-| JSON content from go_choose_multiple_field_fixture.json -}
choose_multiple_field_fixtureJson : String
choose_multiple_field_fixtureJson =
    """[{\"label\":\"basic\",\"presence\":\"Optional\",\"type\":{\"type\":\"ChooseMultiple\",\"choices\":[\"option 1\",\"option 2\"]}},{\"label\":\"complex\",\"presence\":\"Optional\",\"type\":{\"type\":\"ChooseMultiple\",\"choices\":[\"1 | option 1\",\"2 | option 2\"],\"minRequired\":1,\"maxAllowed\":2,\"filter\":{\"type\":\"Field\",\"fieldName\":\"another_field\"}}}]"""

{-| JSON content from go_choose_one_field_fixture.json -}
choose_one_field_fixtureJson : String
choose_one_field_fixtureJson =
    """[{\"label\":\"basic\",\"presence\":\"Optional\",\"type\":{\"type\":\"ChooseOne\",\"choices\":[\"Yes\",\"No\"]}},{\"label\":\"complex\",\"presence\":\"Optional\",\"type\":{\"type\":\"ChooseOne\",\"choices\":[\"y | Yes\",\"n | No\"],\"filter\":{\"type\":\"Field\",\"fieldName\":\"another_field\"}}}]"""

{-| JSON content from go_dropdown_field_fixture.json -}
dropdown_field_fixtureJson : String
dropdown_field_fixtureJson =
    """[{\"label\":\"basic\",\"presence\":\"Optional\",\"type\":{\"type\":\"Dropdown\",\"choices\":[\"Yes\",\"No\"]}},{\"label\":\"complex\",\"presence\":\"Optional\",\"type\":{\"type\":\"Dropdown\",\"choices\":[\"y | Yes\",\"n | No\"],\"filter\":{\"type\":\"Field\",\"fieldName\":\"another_field\"}}}]"""

{-| JSON content from go_long_text_fixture.json -}
long_text_fixtureJson : String
long_text_fixtureJson =
    """[{\"label\":\"basic\",\"presence\":\"Optional\",\"type\":{\"type\":\"LongText\",\"maxLength\":null}},{\"label\":\"complex\",\"presence\":\"Optional\",\"type\":{\"type\":\"LongText\",\"maxLength\":10}}]"""

{-| JSON content from go_optional_field_empty_fixture.json -}
optional_field_empty_fixtureJson : String
optional_field_empty_fixtureJson =
    """[{\"label\":\"comments\",\"presence\":\"Optional\",\"type\":{\"type\":\"LongText\",\"maxLength\":null}}]"""

{-| JSON content from go_optional_field_filled_fixture.json -}
optional_field_filled_fixtureJson : String
optional_field_filled_fixtureJson =
    """[{\"label\":\"comments\",\"name\":\"comments\",\"description\":\"enter comments\",\"presence\":\"Optional\",\"type\":{\"type\":\"LongText\",\"maxLength\":null}}]"""

{-| JSON content from go_presence_fixture.json -}
presence_fixtureJson : String
presence_fixtureJson =
    """[{\"label\":\"optional field\",\"presence\":\"Optional\",\"type\":{\"type\":\"LongText\",\"maxLength\":null}},{\"label\":\"required field\",\"presence\":\"Required\",\"type\":{\"type\":\"LongText\",\"maxLength\":null}},{\"label\":\"system field\",\"presence\":\"System\",\"type\":{\"type\":\"LongText\",\"maxLength\":null}}]"""

{-| JSON content from go_short_text_field_fixture.json -}
short_text_field_fixtureJson : String
short_text_field_fixtureJson =
    """[{\"label\":\"basic\",\"presence\":\"Optional\",\"type\":{\"type\":\"ShortText\",\"inputType\":\"Single-line free text\"}},{\"label\":\"complex\",\"presence\":\"Optional\",\"type\":{\"type\":\"ShortText\",\"inputType\":\"Single-line free text\",\"inputTag\":\"custom-component\",\"attributes\":{\"custom\":\"attribute\",\"datalist\":\"a\\\\nb\\\\nc\",\"maxlength\":\"10\",\"minlength\":\"3\",\"multiple\":\"true\",\"pattern\":\"[A-Za-z]+\"}}}]"""

{-| JSON content from go_visibility_rules_hidewhen_fixture.json -}
visibility_rules_hidewhen_fixtureJson : String
visibility_rules_hidewhen_fixtureJson =
    """[{\"label\":\"comments\",\"presence\":\"Optional\",\"type\":{\"type\":\"LongText\",\"maxLength\":null},\"visibilityRule\":[{\"type\":\"HideWhen\",\"conditions\":[{\"type\":\"Field\",\"fieldName\":\"another_field\",\"comparison\":{\"type\":\"Equals\",\"value\":\"123\"}},{\"type\":\"Field\",\"fieldName\":\"another_field\",\"comparison\":{\"type\":\"StringContains\",\"value\":\"123\"}},{\"type\":\"Field\",\"fieldName\":\"another_field\",\"comparison\":{\"type\":\"EndsWith\",\"value\":\"123\"}},{\"type\":\"Field\",\"fieldName\":\"another_field\",\"comparison\":{\"type\":\"GreaterThan\",\"value\":\"123\"}}]}]}]"""

{-| JSON content from go_visibility_rules_showwhen_fixture.json -}
visibility_rules_showwhen_fixtureJson : String
visibility_rules_showwhen_fixtureJson =
    """[{\"label\":\"comments\",\"name\":\"comments\",\"description\":\"enter comments\",\"presence\":\"Optional\",\"type\":{\"type\":\"LongText\",\"maxLength\":null},\"visibilityRule\":[{\"type\":\"ShowWhen\",\"conditions\":[{\"type\":\"Field\",\"fieldName\":\"another_field\",\"comparison\":{\"type\":\"Equals\",\"value\":\"123\"}},{\"type\":\"Field\",\"fieldName\":\"another_field\",\"comparison\":{\"type\":\"StringContains\",\"value\":\"123\"}},{\"type\":\"Field\",\"fieldName\":\"another_field\",\"comparison\":{\"type\":\"EndsWith\",\"value\":\"123\"}},{\"type\":\"Field\",\"fieldName\":\"another_field\",\"comparison\":{\"type\":\"GreaterThan\",\"value\":\"123\"}}]}]}]"""


{-| All available test cases -}
testCases : List { name : String, fileName : String, jsonContent : String }
testCases =
    [ 
        { name = "choose_multiple_field_fixture"
        , fileName = "go_choose_multiple_field_fixture.json"
        , jsonContent = choose_multiple_field_fixtureJson
        }
    , 
        { name = "choose_one_field_fixture"
        , fileName = "go_choose_one_field_fixture.json"
        , jsonContent = choose_one_field_fixtureJson
        }
    , 
        { name = "dropdown_field_fixture"
        , fileName = "go_dropdown_field_fixture.json"
        , jsonContent = dropdown_field_fixtureJson
        }
    , 
        { name = "long_text_fixture"
        , fileName = "go_long_text_fixture.json"
        , jsonContent = long_text_fixtureJson
        }
    , 
        { name = "optional_field_empty_fixture"
        , fileName = "go_optional_field_empty_fixture.json"
        , jsonContent = optional_field_empty_fixtureJson
        }
    , 
        { name = "optional_field_filled_fixture"
        , fileName = "go_optional_field_filled_fixture.json"
        , jsonContent = optional_field_filled_fixtureJson
        }
    , 
        { name = "presence_fixture"
        , fileName = "go_presence_fixture.json"
        , jsonContent = presence_fixtureJson
        }
    , 
        { name = "short_text_field_fixture"
        , fileName = "go_short_text_field_fixture.json"
        , jsonContent = short_text_field_fixtureJson
        }
    , 
        { name = "visibility_rules_hidewhen_fixture"
        , fileName = "go_visibility_rules_hidewhen_fixture.json"
        , jsonContent = visibility_rules_hidewhen_fixtureJson
        }
    , 
        { name = "visibility_rules_showwhen_fixture"
        , fileName = "go_visibility_rules_showwhen_fixture.json"
        , jsonContent = visibility_rules_showwhen_fixtureJson
        }
    ]

{-| Get test case by name -}
getTestCase : String -> Maybe String
getTestCase name =
    case name of
        "choose_multiple_field_fixture" -> Just choose_multiple_field_fixtureJson
        "choose_one_field_fixture" -> Just choose_one_field_fixtureJson
        "dropdown_field_fixture" -> Just dropdown_field_fixtureJson
        "long_text_fixture" -> Just long_text_fixtureJson
        "optional_field_empty_fixture" -> Just optional_field_empty_fixtureJson
        "optional_field_filled_fixture" -> Just optional_field_filled_fixtureJson
        "presence_fixture" -> Just presence_fixtureJson
        "short_text_field_fixture" -> Just short_text_field_fixtureJson
        "visibility_rules_hidewhen_fixture" -> Just visibility_rules_hidewhen_fixtureJson
        "visibility_rules_showwhen_fixture" -> Just visibility_rules_showwhen_fixtureJson
        _ -> Nothing
