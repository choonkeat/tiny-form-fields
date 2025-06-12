module ConfigSchema exposing (configSchema, configSchemaJson)

import Json.Encode as Encode
import Json.Schema.Builder exposing (..)
import Json.Schema.Definitions exposing (Schema)


configSchema : Result String Schema
configSchema =
    toSchema configSchemaBuilder


configSchemaBuilder : SchemaBuilder
configSchemaBuilder =
    buildSchema
        |> withType "object"
        |> withTitle "tiny-form-fields Config"
        |> withDescription "Configuration object for tiny-form-fields library"
        |> withProperties
            [ ( "viewMode", viewModeSchemaBuilder )
            , ( "formFields", formFieldsSchemaBuilder )
            , ( "formValues", formValuesSchemaBuilder )
            , ( "shortTextTypeList", shortTextTypeListSchemaBuilder )
            ]
        |> withRequired [ "viewMode", "formFields", "formValues", "shortTextTypeList" ]


viewModeSchemaBuilder : SchemaBuilder
viewModeSchemaBuilder =
    buildSchema
        |> withOneOf
            [ buildSchema |> withConst (Encode.string "CollectData")
            , buildSchema
                |> withType "object"
                |> withProperties
                    [ ( "Editor"
                      , buildSchema
                            |> withType "object"
                            |> withProperties
                                [ ( "maybeAnimate"
                                  , buildSchema
                                        |> withAnyOf
                                            [ buildSchema |> withType "null"
                                            , buildSchema
                                                |> withType "array"
                                                |> withItems
                                                    [ buildSchema |> withType "integer"
                                                    , buildSchema |> withType "string"
                                                    ]
                                                |> withMinItems 2
                                                |> withMaxItems 2
                                            ]
                                  )
                                ]
                      )
                    ]
                |> withRequired [ "Editor" ]
            ]


formFieldsSchemaBuilder : SchemaBuilder
formFieldsSchemaBuilder =
    buildSchema
        |> withType "array"
        |> withItem formFieldSchemaBuilder


formFieldSchemaBuilder : SchemaBuilder
formFieldSchemaBuilder =
    buildSchema
        |> withType "object"
        |> withProperties
            [ ( "label", buildSchema |> withType "string" )
            , ( "name", buildSchema |> withAnyOf [ buildSchema |> withType "null", buildSchema |> withType "string" ] )
            , ( "presence", presenceSchemaBuilder )
            , ( "description", attributeOptionalStringSchemaBuilder )
            , ( "type", inputFieldSchemaBuilder )
            , ( "visibilityRule", visibilityRuleListSchemaBuilder )
            ]
        |> withRequired [ "label", "name", "presence", "description", "type", "visibilityRule" ]


presenceSchemaBuilder : SchemaBuilder
presenceSchemaBuilder =
    buildSchema
        |> withEnum
            [ Encode.string "Required"
            , Encode.string "Optional"
            , Encode.string "System"
            ]


attributeOptionalStringSchemaBuilder : SchemaBuilder
attributeOptionalStringSchemaBuilder =
    buildSchema
        |> withOneOf
            [ buildSchema |> withType "null"
            , buildSchema |> withType "string"
            , buildSchema
                |> withType "object"
                |> withProperties
                    [ ( "AttributeInvalid", buildSchema |> withType "string" )
                    ]
                |> withRequired [ "AttributeInvalid" ]
            ]


inputFieldSchemaBuilder : SchemaBuilder
inputFieldSchemaBuilder =
    buildSchema
        |> withOneOf
            [ shortTextSchemaBuilder
            , longTextSchemaBuilder
            , dropdownSchemaBuilder
            , chooseOneSchemaBuilder
            , chooseMultipleSchemaBuilder
            ]


shortTextSchemaBuilder : SchemaBuilder
shortTextSchemaBuilder =
    buildSchema
        |> withType "object"
        |> withProperties
            [ ( "type", buildSchema |> withConst (Encode.string "ShortText") )
            , ( "customElement", customElementSchemaBuilder )
            ]
        |> withRequired [ "type", "customElement" ]


longTextSchemaBuilder : SchemaBuilder
longTextSchemaBuilder =
    buildSchema
        |> withType "object"
        |> withProperties
            [ ( "type", buildSchema |> withConst (Encode.string "LongText") )
            , ( "maxlength", attributeOptionalIntSchemaBuilder )
            ]
        |> withRequired [ "type", "maxlength" ]


dropdownSchemaBuilder : SchemaBuilder
dropdownSchemaBuilder =
    buildSchema
        |> withType "object"
        |> withProperties
            [ ( "type", buildSchema |> withConst (Encode.string "Dropdown") )
            , ( "choices", choicesSchemaBuilder )
            , ( "filter", choiceFilterOptionalSchemaBuilder )
            ]
        |> withRequired [ "type", "choices", "filter" ]


chooseOneSchemaBuilder : SchemaBuilder
chooseOneSchemaBuilder =
    buildSchema
        |> withType "object"
        |> withProperties
            [ ( "type", buildSchema |> withConst (Encode.string "ChooseOne") )
            , ( "choices", choicesSchemaBuilder )
            , ( "filter", choiceFilterOptionalSchemaBuilder )
            ]
        |> withRequired [ "type", "choices", "filter" ]


chooseMultipleSchemaBuilder : SchemaBuilder
chooseMultipleSchemaBuilder =
    buildSchema
        |> withType "object"
        |> withProperties
            [ ( "type", buildSchema |> withConst (Encode.string "ChooseMultiple") )
            , ( "choices", choicesSchemaBuilder )
            , ( "minRequired", buildSchema |> withAnyOf [ buildSchema |> withType "null", buildSchema |> withType "integer" ] )
            , ( "maxAllowed", buildSchema |> withAnyOf [ buildSchema |> withType "null", buildSchema |> withType "integer" ] )
            , ( "filter", choiceFilterOptionalSchemaBuilder )
            ]
        |> withRequired [ "type", "choices", "minRequired", "maxAllowed", "filter" ]


choicesSchemaBuilder : SchemaBuilder
choicesSchemaBuilder =
    buildSchema
        |> withType "array"
        |> withItem choiceSchemaBuilder


choiceSchemaBuilder : SchemaBuilder
choiceSchemaBuilder =
    buildSchema
        |> withOneOf
            [ buildSchema |> withType "string"
            , buildSchema
                |> withType "object"
                |> withProperties
                    [ ( "label", buildSchema |> withType "string" )
                    , ( "value", buildSchema |> withType "string" )
                    ]
                |> withRequired [ "label", "value" ]
            ]


choiceFilterOptionalSchemaBuilder : SchemaBuilder
choiceFilterOptionalSchemaBuilder =
    buildSchema
        |> withAnyOf
            [ buildSchema |> withType "null"
            , choiceFilterSchemaBuilder
            ]


choiceFilterSchemaBuilder : SchemaBuilder
choiceFilterSchemaBuilder =
    buildSchema
        |> withOneOf
            [ buildSchema
                |> withType "object"
                |> withProperties
                    [ ( "FilterStartsWithFieldValueOf", buildSchema |> withType "string" )
                    ]
                |> withRequired [ "FilterStartsWithFieldValueOf" ]
            , buildSchema
                |> withType "object"
                |> withProperties
                    [ ( "FilterContainsFieldValueOf", buildSchema |> withType "string" )
                    ]
                |> withRequired [ "FilterContainsFieldValueOf" ]
            ]


customElementSchemaBuilder : SchemaBuilder
customElementSchemaBuilder =
    buildSchema
        |> withType "object"
        |> withProperties
            [ ( "inputType", buildSchema |> withType "string" )
            , ( "inputTag", buildSchema |> withType "string" )
            , ( "attributes", buildSchema |> withType "object" |> withAdditionalProperties (buildSchema |> withType "string") )
            , ( "multiple", attributeOptionalBoolSchemaBuilder )
            , ( "maxlength", attributeOptionalIntSchemaBuilder )
            , ( "datalist", attributeOptionalChoicesSchemaBuilder )
            ]
        |> withRequired [ "inputType", "inputTag", "attributes", "multiple", "maxlength", "datalist" ]


attributeOptionalIntSchemaBuilder : SchemaBuilder
attributeOptionalIntSchemaBuilder =
    buildSchema
        |> withOneOf
            [ buildSchema |> withType "null"
            , buildSchema |> withType "integer"
            , buildSchema
                |> withType "object"
                |> withProperties
                    [ ( "AttributeInvalid", buildSchema |> withType "string" )
                    ]
                |> withRequired [ "AttributeInvalid" ]
            ]


attributeOptionalBoolSchemaBuilder : SchemaBuilder
attributeOptionalBoolSchemaBuilder =
    buildSchema
        |> withOneOf
            [ buildSchema |> withType "null"
            , buildSchema |> withType "boolean"
            , buildSchema
                |> withType "object"
                |> withProperties
                    [ ( "AttributeInvalid", buildSchema |> withType "string" )
                    ]
                |> withRequired [ "AttributeInvalid" ]
            ]


attributeOptionalChoicesSchemaBuilder : SchemaBuilder
attributeOptionalChoicesSchemaBuilder =
    buildSchema
        |> withOneOf
            [ buildSchema |> withType "null"
            , choicesSchemaBuilder
            , buildSchema
                |> withType "object"
                |> withProperties
                    [ ( "AttributeInvalid", buildSchema |> withType "string" )
                    ]
                |> withRequired [ "AttributeInvalid" ]
            ]


visibilityRuleListSchemaBuilder : SchemaBuilder
visibilityRuleListSchemaBuilder =
    buildSchema
        |> withType "array"
        |> withItem visibilityRuleSchemaBuilder


visibilityRuleSchemaBuilder : SchemaBuilder
visibilityRuleSchemaBuilder =
    buildSchema
        |> withOneOf
            [ buildSchema
                |> withType "object"
                |> withProperties
                    [ ( "ShowWhen", conditionListSchemaBuilder )
                    ]
                |> withRequired [ "ShowWhen" ]
            , buildSchema
                |> withType "object"
                |> withProperties
                    [ ( "HideWhen", conditionListSchemaBuilder )
                    ]
                |> withRequired [ "HideWhen" ]
            ]


conditionListSchemaBuilder : SchemaBuilder
conditionListSchemaBuilder =
    buildSchema
        |> withType "array"
        |> withItem conditionSchemaBuilder


conditionSchemaBuilder : SchemaBuilder
conditionSchemaBuilder =
    buildSchema
        |> withType "object"
        |> withDescription "Condition for visibility rules - specific structure depends on implementation"


formValuesSchemaBuilder : SchemaBuilder
formValuesSchemaBuilder =
    buildSchema
        |> withType "object"
        |> withDescription "Form values object - can contain any key-value pairs"


shortTextTypeListSchemaBuilder : SchemaBuilder
shortTextTypeListSchemaBuilder =
    buildSchema
        |> withType "array"
        |> withItem customElementSchemaBuilder


configSchemaJson : Encode.Value
configSchemaJson =
    case configSchema of
        Ok schema ->
            Json.Schema.Definitions.encode schema

        Err error ->
            Encode.object
                [ ( "error", Encode.string ("Schema generation failed: " ++ error) )
                ]
