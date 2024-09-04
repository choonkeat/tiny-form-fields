module MainTest exposing (..)

import Array
import Dict
import Expect
import Fuzz exposing (Fuzzer, string)
import Json.Decode
import Json.Encode
import Main
    exposing
        ( Choice
        , FormField
        , InputField(..)
        , Presence(..)
        , ViewMode(..)
        , allInputField
        , decodeChoice
        , decodeFormFields
        , decodeShortTextTypeList
        , encodeChoice
        , encodeFormFields
        , stringFromViewMode
        , viewModeFromString
        )
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
                    |> encodeFormFields
                    |> Json.Encode.encode 0
                    |> Json.Decode.decodeString decodeFormFields
                    |> Expect.equal (Ok formFields)
        , Test.fuzz viewModeFuzzer "stringFromViewMode,viewModeFromString is reversible" <|
            \mode ->
                mode
                    |> stringFromViewMode
                    |> viewModeFromString
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
                    |> Json.Decode.decodeString decodeShortTextTypeList
                    |> Expect.equal
                        (Ok
                            [ ( "Text", Dict.fromList [ ( "type", "text" ) ] )
                            , ( "Email", Dict.fromList [ ( "type", "email" ) ] )
                            , ( "Digits", Dict.fromList [ ( "pattern", "^[0-9]+$" ), ( "type", "text" ) ] )
                            , ( "Nric", Dict.fromList [ ( "pattern", "^[STGM][0-9]{7}[ABCDEFGHIZJ]$" ), ( "type", "text" ) ] )
                            ]
                        )
        , Test.fuzz choiceStringFuzzer "choiceStringToChoice,choiceStringFromString is reversible" <|
            \choice ->
                choice
                    |> encodeChoice
                    |> Json.Encode.encode 0
                    |> Json.Decode.decodeString decodeChoice
                    |> Expect.equal (Ok choice)
        ]



--


viewModeFuzzer : Fuzzer ViewMode
viewModeFuzzer =
    Fuzz.oneOf
        [ -- Fuzz.constant (Editor { maybeAnimate = Nothing })
          -- we don't encode/decode `maybeHighlight` because it is transient value
          -- maybeHighlight is always Nothing
          Fuzz.constant (Editor { maybeAnimate = Nothing })
        , Fuzz.constant Preview
        , Fuzz.constant CollectData
        ]


inputFieldFuzzer : Fuzzer InputField
inputFieldFuzzer =
    allInputField
        |> List.map Fuzz.constant
        |> Fuzz.oneOf


presenceFuzzer : Fuzzer Presence
presenceFuzzer =
    Fuzz.oneOf
        [ Fuzz.constant Required
        , Fuzz.constant Optional
        , Fuzz.constant System
        ]


fuzzFormField : Fuzzer FormField
fuzzFormField =
    Fuzz.map5 FormField
        string
        (Fuzz.maybe string)
        presenceFuzzer
        string
        inputFieldFuzzer


choiceStringFuzzer : Fuzzer Choice
choiceStringFuzzer =
    Fuzz.oneOf
        [ Fuzz.map2 Choice
            Fuzz.string
            Fuzz.string
        , Fuzz.string
            |> Fuzz.map (\s -> Choice s s)
        ]
