module ChooseMultipleJsonTest exposing (..)

import Expect
import Json.Decode
import Json.Encode
import Main
import Test exposing (..)


emptyFormField : Main.FormField
emptyFormField =
    { label = "Test Field"
    , name = Just "test"
    , presence = Main.Required
    , description = Main.AttributeNotNeeded Nothing
    , type_ =
        Main.ChooseMultiple
            { choices = []
            , minRequired = Nothing
            , maxAllowed = Nothing
            }
    , visibilityRule = []
    }


suite : Test
suite =
    describe "ChooseMultiple JSON backward compatibility"
        [ test "decodes FormField with old ChooseMultiple format (without min/max)" <|
            \_ ->
                -- Create a test FormField with ChooseMultiple
                let
                    oldFormatJson =
                        """
                        {
                          "label": "Test Field",
                          "name": "test",
                          "presence": "Required",
                          "type": {
                            "type": "ChooseMultiple",
                            "choices": [
                              "Option 1",
                              "Option 2"
                            ]
                          }
                        }
                        """
                in
                oldFormatJson
                    |> Json.Decode.decodeString Main.decodeFormField
                    |> Result.map
                        (\field ->
                            case field.type_ of
                                Main.ChooseMultiple { choices, minRequired, maxAllowed } ->
                                    { choicesCount = List.length choices
                                    , hasMinRequired = minRequired == Nothing
                                    , hasMaxAllowed = maxAllowed == Nothing
                                    }

                                _ ->
                                    { choicesCount = -1, hasMinRequired = False, hasMaxAllowed = False }
                        )
                    |> Expect.equal
                        (Ok
                            { choicesCount = 2
                            , hasMinRequired = True
                            , hasMaxAllowed = True
                            }
                        )
        , test "decodes FormField with new ChooseMultiple format (with min/max)" <|
            \_ ->
                -- Create a test FormField with ChooseMultiple including min/max
                let
                    newFormatJson =
                        """
                        {
                          "label": "Test Field",
                          "name": "test",
                          "presence": "Required",
                          "type": {
                            "type": "ChooseMultiple",
                            "choices": [
                              "Option 1",
                              "Option 2"
                            ],
                            "minRequired": 1,
                            "maxAllowed": 2
                          }
                        }
                        """
                in
                newFormatJson
                    |> Json.Decode.decodeString Main.decodeFormField
                    |> Result.map
                        (\field ->
                            case field.type_ of
                                Main.ChooseMultiple { choices, minRequired, maxAllowed } ->
                                    { choicesCount = List.length choices
                                    , minRequired = minRequired
                                    , maxAllowed = maxAllowed
                                    }

                                _ ->
                                    { choicesCount = -1, minRequired = Nothing, maxAllowed = Nothing }
                        )
                    |> Expect.equal
                        (Ok
                            { choicesCount = 2
                            , minRequired = Just 1
                            , maxAllowed = Just 2
                            }
                        )
        ]
