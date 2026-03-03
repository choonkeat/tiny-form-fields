module InputFieldGroupJsonTest exposing (..)

import Dict
import Expect
import Json.Decode
import Json.Encode
import Main
import Test exposing (..)


suite : Test
suite =
    describe "InputFieldGroup JSON"
        [ describe "backward compatibility"
            [ test "legacy config with shortTextTypeList decodes to single group with allInputField + short text types" <|
                \_ ->
                    let
                        legacyJson =
                            """
                            {
                              "viewMode": "Editor",
                              "formFields": [],
                              "formValues": {},
                              "shortTextTypeList": [
                                { "Email": { "type": "email" } }
                              ]
                            }
                            """

                        result =
                            Json.Decode.decodeString Main.decodeConfigInputFieldGroups legacyJson
                    in
                    result
                        |> Result.map
                            (\groups ->
                                { groupCount = List.length groups
                                , firstHeading = List.head groups |> Maybe.map .heading
                                , fieldCount = List.head groups |> Maybe.map (.fields >> List.length)
                                }
                            )
                        |> Expect.equal
                            (Ok
                                { groupCount = 1
                                , firstHeading = Just ""
                                , fieldCount = Just (List.length Main.allInputField + 2)
                                }
                            )
            , test "legacy config with no shortTextTypeList gets default single-line free text" <|
                \_ ->
                    let
                        legacyJson =
                            """
                            {
                              "viewMode": "Editor",
                              "formFields": [],
                              "formValues": {}
                            }
                            """

                        result =
                            Json.Decode.decodeString Main.decodeConfigInputFieldGroups legacyJson
                    in
                    result
                        |> Result.map
                            (\groups ->
                                { groupCount = List.length groups
                                , firstHeading = List.head groups |> Maybe.map .heading
                                , fieldCount = List.head groups |> Maybe.map (.fields >> List.length)
                                }
                            )
                        |> Expect.equal
                            (Ok
                                { groupCount = 1
                                , firstHeading = Just ""
                                , fieldCount = Just (List.length Main.allInputField + 1)
                                }
                            )
            ]
        , describe "new format"
            [ test "inputFieldGroups with multiple groups decodes correctly" <|
                \_ ->
                    let
                        newFormatJson =
                            """
                            {
                              "viewMode": "Editor",
                              "formFields": [],
                              "formValues": {},
                              "inputFieldGroups": [
                                {
                                  "heading": "Basic",
                                  "fields": [
                                    { "type": "Dropdown", "choices": ["A", "B"] },
                                    { "type": "LongText", "maxLength": null }
                                  ]
                                },
                                {
                                  "heading": "Advanced",
                                  "fields": [
                                    { "type": "ShortText", "inputType": "Email", "attributes": { "type": "email" } }
                                  ]
                                }
                              ]
                            }
                            """

                        result =
                            Json.Decode.decodeString Main.decodeConfigInputFieldGroups newFormatJson
                    in
                    result
                        |> Result.map
                            (\groups ->
                                { groupCount = List.length groups
                                , headings = List.map .heading groups
                                , fieldCounts = List.map (.fields >> List.length) groups
                                }
                            )
                        |> Expect.equal
                            (Ok
                                { groupCount = 2
                                , headings = [ "Basic", "Advanced" ]
                                , fieldCounts = [ 2, 1 ]
                                }
                            )
            , test "inputFieldGroups takes precedence over shortTextTypeList" <|
                \_ ->
                    let
                        bothJson =
                            """
                            {
                              "viewMode": "Editor",
                              "formFields": [],
                              "formValues": {},
                              "shortTextTypeList": [
                                { "Email": { "type": "email" } }
                              ],
                              "inputFieldGroups": [
                                {
                                  "heading": "Custom",
                                  "fields": [
                                    { "type": "Dropdown", "choices": ["X"] }
                                  ]
                                }
                              ]
                            }
                            """

                        result =
                            Json.Decode.decodeString Main.decodeConfigInputFieldGroups bothJson
                    in
                    result
                        |> Result.map
                            (\groups ->
                                { groupCount = List.length groups
                                , firstHeading = List.head groups |> Maybe.map .heading
                                , fieldCount = List.head groups |> Maybe.map (.fields >> List.length)
                                }
                            )
                        |> Expect.equal
                            (Ok
                                { groupCount = 1
                                , firstHeading = Just "Custom"
                                , fieldCount = Just 1
                                }
                            )
            ]
        , describe "round-trip"
            [ test "encode then decode InputFieldGroup" <|
                \_ ->
                    let
                        group =
                            { heading = "Test Group"
                            , fields =
                                [ Main.Dropdown
                                    { choices = [ { label = "A", value = "A" } ]
                                    , filter = Nothing
                                    }
                                , Main.LongText (Main.AttributeGiven 100)
                                ]
                            }

                        encoded =
                            Main.encodeInputFieldGroup group

                        decoded =
                            Json.Decode.decodeValue Main.decodeInputFieldGroup encoded
                    in
                    decoded
                        |> Result.map
                            (\g ->
                                { heading = g.heading
                                , fieldCount = List.length g.fields
                                }
                            )
                        |> Expect.equal
                            (Ok
                                { heading = "Test Group"
                                , fieldCount = 2
                                }
                            )
            ]
        , describe "allCustomElementsFromGroups"
            [ test "extracts custom elements from all groups" <|
                \_ ->
                    let
                        groups =
                            [ { heading = "Basic"
                              , fields =
                                    [ Main.Dropdown { choices = [], filter = Nothing }
                                    , Main.ShortText
                                        (Main.fromRawCustomElement
                                            { inputType = "Email"
                                            , inputTag = "input"
                                            , attributes = Dict.fromList [ ( "type", "email" ) ]
                                            }
                                        )
                                    ]
                              }
                            , { heading = "Advanced"
                              , fields =
                                    [ Main.ShortText
                                        (Main.fromRawCustomElement
                                            { inputType = "URL"
                                            , inputTag = "input"
                                            , attributes = Dict.fromList [ ( "type", "url" ) ]
                                            }
                                        )
                                    ]
                              }
                            ]

                        result =
                            Main.allCustomElementsFromGroups groups
                    in
                    List.map .inputType result
                        |> Expect.equal [ "Email", "URL" ]
            ]
        ]
