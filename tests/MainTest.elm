module MainTest exposing (..)

import Array
import Dict
import Expect
import Fuzz exposing (Fuzzer, string)
import Json.Decode
import Json.Encode
import Main
import Test exposing (..)


suite : Test
suite =
    describe "Main"
        [ Test.fuzz (Fuzz.intRange 0 100) "{encode,decode}InputField is reversible" <|
            \size ->
                let
                    formFields =
                        Fuzz.examples size fuzzFormField
                            |> Array.fromList
                in
                formFields
                    |> Main.encodeFormFields
                    |> Json.Encode.encode 0
                    |> Json.Decode.decodeString Main.decodeFormFields
                    |> Expect.equal (Ok formFields)
        , Test.fuzz viewModeFuzzer "stringFromViewMode,viewModeFromString is reversible" <|
            \mode ->
                mode
                    |> Main.stringFromViewMode
                    |> Main.viewModeFromString
                    |> Expect.equal (Just mode)
        , test "decodeShortTextTypeList" <|
            \_ ->
                """
                [
                    { "Text": { "type": "text" } },
                    { "Email": { "type": "email" } },
                    { "Digits": { "type": "text", "pattern": "^[0-9]+$" } },
                    { "Nric": { "type": "text", "pattern": "^[STGM][0-9]{7}[ABCDEFGHIZJ]$" } }
                ]
                """
                    |> Json.Decode.decodeString Main.decodeShortTextTypeList
                    |> Expect.equal
                        (Ok
                            [ ( "Text", Dict.fromList [ ( "type", "text" ) ] )
                            , ( "Email", Dict.fromList [ ( "type", "email" ) ] )
                            , ( "Digits", Dict.fromList [ ( "pattern", "^[0-9]+$" ), ( "type", "text" ) ] )
                            , ( "Nric", Dict.fromList [ ( "pattern", "^[STGM][0-9]{7}[ABCDEFGHIZJ]$" ), ( "type", "text" ) ] )
                            ]
                        )
        ]



--


viewModeFuzzer : Fuzzer Main.ViewMode
viewModeFuzzer =
    Fuzz.oneOf
        [ Fuzz.constant Main.Editor
        , Fuzz.constant Main.Preview
        , Fuzz.constant Main.CollectData
        ]


inputFieldFuzzer : Fuzzer Main.InputField
inputFieldFuzzer =
    Main.allInputField
        |> List.map Fuzz.constant
        |> Fuzz.oneOf


fuzzFormField : Fuzzer Main.FormField
fuzzFormField =
    Fuzz.map6 Main.FormField
        string
        (Fuzz.maybe string)
        Fuzz.bool
        string
        inputFieldFuzzer
        (Fuzz.maybe Fuzz.bool)
