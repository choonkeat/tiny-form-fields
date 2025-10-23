module GoElmCrossValidationTest exposing (..)

import Array
import Dict
import Expect
import GoElmCrossValidationTestData
import Json.Decode
import Json.Encode
import Main
import Test exposing (..)


suite : Test
suite =
    describe "Go-Elm Cross Validation"
        [ describe "Go-generated JSON fixtures can be decoded by Elm"
            (List.map createDecodingTest GoElmCrossValidationTestData.testCases)
        , describe "Elm-generated JSON can encode and decode consistently"
            [ test "round-trip encoding/decoding preserves field structure" <|
                \_ ->
                    let
                        originalFields =
                            Array.fromList
                                [ { label = "Test Field"
                                  , name = Just "test_field"
                                  , presence = Main.Required
                                  , description = Main.AttributeGiven "Test description"
                                  , type_ =
                                        Main.ShortText
                                            (Main.fromRawCustomElement
                                                { inputType = "Text"
                                                , inputTag = "input"
                                                , attributes = Dict.fromList [ ( "type", "text" ) ]
                                                }
                                            )
                                  , visibilityRule =
                                        [ Main.ShowWhen
                                            [ Main.Field "other_field" (Main.Equals "value") ]
                                        ]
                                  }
                                ]
                    in
                    originalFields
                        |> Main.encodeFormFields
                        |> Json.Encode.encode 0
                        |> Json.Decode.decodeString Main.decodeFormFields
                        |> Expect.equal (Ok originalFields)
            ]
        ]


{-| Create a test case for decoding a specific Go-generated JSON fixture
-}
createDecodingTest : { name : String, fileName : String, jsonContent : String } -> Test
createDecodingTest testCase =
    describe ("Testing " ++ testCase.fileName)
        [ test ("can decode " ++ testCase.fileName) <|
            \_ ->
                testCase.jsonContent
                    |> Json.Decode.decodeString Main.decodeFormFields
                    |> Result.map Array.length
                    |> Result.mapError (\err -> "Failed to decode " ++ testCase.fileName ++ ": " ++ Json.Decode.errorToString err)
                    |> (\result ->
                            case result of
                                Ok length ->
                                    if length > 0 then
                                        Expect.pass

                                    else
                                        Expect.fail ("Decoded array is empty for " ++ testCase.fileName)

                                Err errorMsg ->
                                    Expect.fail errorMsg
                       )
        , test ("all fields have valid structure for " ++ testCase.fileName) <|
            \_ ->
                validateGenericStructure testCase
        ]


{-| Generic validation that works for any Go test case
Validates that all fields have the essential properties without hardcoding expectations
-}
validateGenericStructure : { name : String, fileName : String, jsonContent : String } -> Expect.Expectation
validateGenericStructure testCase =
    case Json.Decode.decodeString Main.decodeFormFields testCase.jsonContent of
        Ok fields ->
            let
                fieldValidations =
                    fields
                        |> Array.toList
                        |> List.indexedMap validateSingleField
                        |> List.filterMap identity
            in
            if List.isEmpty fieldValidations then
                Expect.pass

            else
                Expect.fail ("Field validation errors in " ++ testCase.fileName ++ ": " ++ String.join ", " fieldValidations)

        Err decodeError ->
            Expect.fail ("Could not decode " ++ testCase.fileName ++ ": " ++ Json.Decode.errorToString decodeError)


{-| Validate a single field has all required properties
This is completely generic and doesn't depend on specific test case content
-}
validateSingleField : Int -> Main.FormField -> Maybe String
validateSingleField index field =
    let
        errors =
            []
                |> addErrorIf (String.isEmpty field.label) ("Field " ++ String.fromInt index ++ " has empty label")
                |> addErrorIf (not (isValidPresence field.presence)) ("Field " ++ String.fromInt index ++ " has invalid presence")
                |> addErrorIf (not (isValidFieldType field.type_)) ("Field " ++ String.fromInt index ++ " has invalid field type")
                |> addErrorIf (not (isValidVisibilityRules field.visibilityRule)) ("Field " ++ String.fromInt index ++ " has invalid visibility rules")
    in
    if List.isEmpty errors then
        Nothing

    else
        Just (String.join "; " errors)


addErrorIf : Bool -> String -> List String -> List String
addErrorIf condition errorMsg errors =
    if condition then
        errorMsg :: errors

    else
        errors


isValidPresence : Main.Presence -> Bool
isValidPresence presence =
    case presence of
        Main.Required ->
            True

        Main.Optional ->
            True

        Main.System ->
            True


isValidFieldType : Main.InputField -> Bool
isValidFieldType fieldType =
    case fieldType of
        Main.ShortText _ ->
            True

        Main.LongText _ ->
            True

        Main.Dropdown _ ->
            True

        Main.ChooseOne _ ->
            True

        Main.ChooseMultiple _ ->
            True


{-| Validate visibility rules are well-formed (generic validation)
-}
isValidVisibilityRules : List Main.VisibilityRule -> Bool
isValidVisibilityRules rules =
    List.all isValidVisibilityRule rules


isValidVisibilityRule : Main.VisibilityRule -> Bool
isValidVisibilityRule rule =
    case rule of
        Main.ShowWhen conditions ->
            List.all isValidCondition conditions && not (List.isEmpty conditions)

        Main.HideWhen conditions ->
            List.all isValidCondition conditions && not (List.isEmpty conditions)


isValidCondition : Main.Condition -> Bool
isValidCondition condition =
    case condition of
        Main.Field fieldName comparison ->
            not (String.isEmpty fieldName) && isValidComparison comparison


isValidComparison : Main.Comparison -> Bool
isValidComparison comparison =
    case comparison of
        Main.Equals _ ->
            True

        Main.StringContains _ ->
            True

        Main.EndsWith _ ->
            True

        Main.GreaterThan _ ->
            True

        -- Added to account for the EqualsField variant introduced in src/Main.elm
        Main.EqualsField _ ->
            True
