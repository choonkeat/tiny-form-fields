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
                    { "Text": { "type": "text", "maxlength": "10", "multiple": "true" } },
                    { "Text": { "type": "text", "list": "someid" } },
                    { "Text": { "type": "text", "list": "one | uno !\\ntwo | dos\\nthree | tres\\nfour" } },
                    { "Email": { "type": "email" } },
                    { "Emails": { "type": "email" , "multiple": "true" } },
                    { "Digits": { "type": "text", "pattern": "^[0-9]+$" } },
                    { "Nric2": { "inputTag": "nric-custom-ele", "attributes": { "type": "text", "pattern": "^[STGM][0-9]{7}[ABCDEFGHIZJ]$" } } },
                    { "Nric": { "type": "text", "pattern": "^[STGM][0-9]{7}[ABCDEFGHIZJ]$" } }
                ]
                """
                    |> Json.Decode.decodeString Main.decodeShortTextTypeList
                    |> Expect.equal
                        (Ok
                            [ { inputType = "Text"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "type", "text" )
                                        ]
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Text"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "type", "text" )
                                        , ( "maxlength", "10" )
                                        , ( "multiple", "true" )
                                        ]
                              , maxlength = Main.AttributeGiven 10
                              , datalist = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Text"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "type", "text" )
                                        , ( "list", "someid" )
                                        ]
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Text"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "type", "text" )
                                        ]
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist =
                                    Main.AttributeGiven
                                        [ { label = "uno !", value = "one" }
                                        , { label = "dos", value = "two" }
                                        , { label = "tres", value = "three" }
                                        , { label = "four", value = "four" }
                                        ]
                              }
                            , { inputType = "Email"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "type", "email" )
                                        ]
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Emails"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "type", "email" )
                                        , ( "multiple", "true" )
                                        ]
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Digits"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "pattern", "^[0-9]+$" )
                                        , ( "type", "text" )
                                        ]
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Nric2"
                              , inputTag = "nric-custom-ele"
                              , attributes =
                                    Dict.fromList
                                        [ ( "pattern", "^[STGM][0-9]{7}[ABCDEFGHIZJ]$" )
                                        , ( "type", "text" )
                                        ]
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Nric"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "pattern", "^[STGM][0-9]{7}[ABCDEFGHIZJ]$" )
                                        , ( "type", "text" )
                                        ]
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              }
                            ]
                        )
        , Test.fuzz choiceStringFuzzer "choiceStringToChoice,choiceStringFromString is reversible" <|
            \choice ->
                choice
                    |> Main.encodeChoice
                    |> Json.Encode.encode 0
                    |> Json.Decode.decodeString Main.decodeChoice
                    |> Expect.equal (Ok choice)
        , Test.fuzz pairOfFormFieldFuzzer "encode old FormField can be decoded with decodeFormField" <|
            \{ oldField, newField } ->
                oldField
                    |> encodeFormField
                    |> Json.Encode.encode 0
                    |> Json.Decode.decodeString Main.decodeFormField
                    |> Expect.equal (Ok newField)
        ]



--


viewModeFuzzer : Fuzzer Main.ViewMode
viewModeFuzzer =
    Fuzz.oneOf
        [ -- Fuzz.constant (Editor { maybeAnimate = Nothing })
          -- we don't encode/decode `maybeHighlight` because it is transient value
          -- maybeHighlight is always Nothing
          Fuzz.constant (Main.Editor { maybeAnimate = Nothing })
        , Fuzz.constant Main.Preview
        , Fuzz.constant Main.CollectData
        ]


inputFieldFuzzer : Fuzzer Main.InputField
inputFieldFuzzer =
    Main.allInputField
        ++ moreTestInputFields
        |> List.map Fuzz.constant
        |> Fuzz.oneOf


moreTestInputFields : List Main.InputField
moreTestInputFields =
    [ Main.ShortText
        { inputType = "Email"
        , inputTag = "input"
        , attributes =
            Dict.fromList [ ( "type", "email" ) ]
        , maxlength = Main.AttributeNotNeeded Nothing
        , datalist = Main.AttributeNotNeeded Nothing
        }
    , Main.ShortText
        { inputType = "Emails"
        , inputTag = "input"
        , attributes =
            Dict.fromList [ ( "type", "email" ), ( "multiple", "true" ) ]
        , maxlength = Main.AttributeNotNeeded Nothing
        , datalist = Main.AttributeNotNeeded Nothing
        }
    , Main.ShortText
        { inputType = "Emails with maxlength"
        , inputTag = "input"
        , attributes =
            Dict.fromList
                [ ( "type", "email" )
                , ( "multiple", "true" )
                , ( "maxlength", "20" )
                , ( "data-extra-thing", "[1,2,3]" )
                ]
        , maxlength = Main.AttributeGiven 20
        , datalist = Main.AttributeNotNeeded Nothing
        }
    ]


presenceFuzzer : Fuzzer Main.Presence
presenceFuzzer =
    Fuzz.oneOf
        [ Fuzz.constant Main.Required
        , Fuzz.constant Main.Optional
        , Fuzz.constant Main.System
        ]


fuzzFormField : Fuzzer Main.FormField
fuzzFormField =
    Fuzz.map5 Main.FormField
        string
        (Fuzz.maybe string)
        presenceFuzzer
        (attributeOptionalFuzzer string { blank = "" })
        inputFieldFuzzer


attributeOptionalFuzzer : Fuzzer a -> { blank : a } -> Fuzzer (Main.AttributeOptional a)
attributeOptionalFuzzer fuzzer { blank } =
    fuzzer
        |> Fuzz.andThen
            (\value ->
                if value == blank then
                    Fuzz.constant (Main.AttributeNotNeeded Nothing)

                else
                    Fuzz.constant (Main.AttributeGiven value)
            )


choiceStringFuzzer : Fuzzer Main.Choice
choiceStringFuzzer =
    Fuzz.oneOf
        [ Fuzz.map2 Main.Choice
            Fuzz.string
            Fuzz.string
        , Fuzz.string
            |> Fuzz.map (\s -> Main.Choice s s)
        ]



-- Backward Compatible Types


pairOfFormFieldFuzzer : Fuzzer { oldField : FormField, newField : Main.FormField }
pairOfFormFieldFuzzer =
    oldFormFieldFuzzer
        |> Fuzz.map
            (\oldField ->
                { oldField = oldField
                , newField = newFieldFromOldField oldField
                }
            )


oldPresenceFuzzer : Fuzzer Presence
oldPresenceFuzzer =
    Fuzz.oneOf
        [ Fuzz.constant Required
        , Fuzz.constant Optional
        , Fuzz.map2 (\name description -> System { name = name, description = description })
            string
            string
        , Fuzz.map2 (\name description -> SystemRequired { name = name, description = description })
            string
            string
        , Fuzz.map2 (\name description -> SystemOptional { name = name, description = description })
            string
            string
        ]


oldFormFieldFuzzer : Fuzzer FormField
oldFormFieldFuzzer =
    Fuzz.map4 FormField
        string
        oldPresenceFuzzer
        string
        inputFieldFuzzer


newFieldFromOldField : FormField -> Main.FormField
newFieldFromOldField oldField =
    let
        newPresence =
            case oldField.presence of
                Required ->
                    Main.Required

                Optional ->
                    Main.Optional

                System _ ->
                    Main.System

                SystemRequired _ ->
                    Main.System

                SystemOptional _ ->
                    Main.Optional

        maybeName =
            case oldField.presence of
                System { name } ->
                    Just name

                SystemRequired { name } ->
                    Just name

                SystemOptional { name } ->
                    Just name

                Required ->
                    Nothing

                Optional ->
                    Nothing

        maybeDescription =
            case oldField.presence of
                System { description } ->
                    Main.AttributeGiven description

                SystemRequired { description } ->
                    Main.AttributeGiven description

                SystemOptional { description } ->
                    Main.AttributeGiven description

                _ ->
                    Main.AttributeNotNeeded Nothing
    in
    { label = oldField.label
    , name = maybeName
    , presence = newPresence
    , description =
        case maybeDescription of
            Main.AttributeGiven _ ->
                maybeDescription

            Main.AttributeInvalid _ ->
                Main.AttributeGiven oldField.description

            Main.AttributeNotNeeded _ ->
                Main.AttributeGiven oldField.description
    , type_ = oldField.type_
    }


type alias NameDescription =
    { name : String, description : String }


type Presence
    = Required
    | Optional
    | System NameDescription
    | SystemRequired NameDescription
    | SystemOptional NameDescription


encodePresence : Presence -> Json.Encode.Value
encodePresence presence =
    case presence of
        Required ->
            Json.Encode.string "Required"

        Optional ->
            Json.Encode.string "Optional"

        System sys ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "System" )
                , ( "name", Json.Encode.string sys.name )
                , ( "description", Json.Encode.string sys.description )
                ]

        SystemRequired sys ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "SystemRequired" )
                , ( "name", Json.Encode.string sys.name )
                , ( "description", Json.Encode.string sys.description )
                ]

        SystemOptional sys ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "SystemOptional" )
                , ( "name", Json.Encode.string sys.name )
                , ( "description", Json.Encode.string sys.description )
                ]


type alias FormField =
    { label : String
    , presence : Presence
    , description : String
    , type_ : Main.InputField
    }


encodeFormField : FormField -> Json.Encode.Value
encodeFormField formField =
    Json.Encode.object
        ([ ( "label", Json.Encode.string formField.label )
         , ( "presence", encodePresence formField.presence )
         , ( "description", Json.Encode.string formField.description )
         , ( "type", Main.encodeInputField formField.type_ )
         ]
            -- smaller output json than if we encoded `null` all the time
            |> List.filter (\( _, v ) -> v /= Json.Encode.null)
        )
