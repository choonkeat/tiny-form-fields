module MainTest exposing (..)

import Array
import Dict
import Expect
import Fuzz exposing (Fuzzer, string)
import Json.Decode
import Json.Encode
import Main
import Test exposing (..)


rawCustomElement : Main.RawCustomElement
rawCustomElement =
    { inputType = "Text"
    , inputTag = "input"
    , attributes = Dict.empty
    }


field1 : Main.FormField
field1 =
    { label = "Field 1"
    , type_ = Main.ShortText (Main.fromRawCustomElement rawCustomElement)
    , presence = Main.Required
    , description = Main.AttributeNotNeeded Nothing
    , name = Nothing
    , visibilityRule = []
    }


field2 : Main.FormField
field2 =
    { label = "Field 2"
    , type_ = Main.ShortText (Main.fromRawCustomElement rawCustomElement)
    , presence = Main.Required
    , description = Main.AttributeNotNeeded Nothing
    , name = Nothing
    , visibilityRule = []
    }


field3 : Main.FormField
field3 =
    { label = "Field 3"
    , type_ = Main.ShortText (Main.fromRawCustomElement rawCustomElement)
    , presence = Main.Required
    , description = Main.AttributeNotNeeded Nothing
    , name = Nothing
    , visibilityRule = []
    }


suite : Test
suite =
    describe "Main"
        [ describe "fieldsWithPlaceholder"
            [ test "replaces dragged existing field with Nothing" <|
                \_ ->
                    let
                        dragged =
                            Main.DragExisting
                                { dragIndex = 1
                                , dropIndex = Nothing
                                }
                    in
                    Main.fieldsWithPlaceholder [ field1, field2, field3 ] (Just dragged)
                        |> Expect.equal
                            [ Just field1
                            , Just field2
                            , Just field3
                            ]
            , test "replaces dragged existing field with Nothing, with dropIndex" <|
                \_ ->
                    let
                        dragged =
                            Main.DragExisting
                                { dragIndex = 1
                                , dropIndex = Just ( 0, Just field1 )
                                }
                    in
                    Main.fieldsWithPlaceholder [ field1, field2, field3 ] (Just dragged)
                        |> Expect.equal
                            [ Nothing
                            , Just field1
                            , Just field3
                            ]
            , test "replaces dragged existing field with Nothing, with dropIndex 2" <|
                \_ ->
                    let
                        dragged =
                            Main.DragExisting
                                { dragIndex = 1
                                , dropIndex = Just ( 2, Just field3 )
                                }
                    in
                    Main.fieldsWithPlaceholder [ field1, field2, field3 ] (Just dragged)
                        |> Expect.equal
                            [ Just field1
                            , Just field3
                            , Nothing
                            ]
            , test "replaces dragged new field with Nothing" <|
                \_ ->
                    let
                        newField =
                            { field1 | label = "New Field" }

                        dragged =
                            Main.DragNew
                                { field = newField
                                , dropIndex = Just ( 2, Just field3 )
                                }
                    in
                    Main.fieldsWithPlaceholder [ field1, field2, field3 ] (Just dragged)
                        |> Expect.equal
                            [ Just field1
                            , Just field2
                            , Nothing
                            , Just field3
                            ]
            , test "replaces dragged new field with Nothing, with dropIndex -1" <|
                \_ ->
                    let
                        newField =
                            { field1 | label = "New Field" }

                        dragged =
                            Main.DragNew
                                { field = newField
                                , dropIndex = Nothing
                                }
                    in
                    Main.fieldsWithPlaceholder [ field1, field2, field3 ] (Just dragged)
                        |> Expect.equal
                            [ Just field1
                            , Just field2
                            , Just field3
                            ]
            ]
        , describe "onDropped"
            [ test "dropping an existing field at index 0" <|
                \_ ->
                    let
                        model =
                            { dragged =
                                Just
                                    (Main.DragExisting
                                        { dragIndex = 1
                                        , dropIndex = Just ( 0, Just field1 )
                                        }
                                    )
                            , formFields =
                                Array.fromList
                                    [ field1
                                    , field2
                                    , field3
                                    ]
                            , nextQuestionNumber = 4
                            }
                    in
                    Main.onDropped (Just 0) model
                        |> Expect.equal
                            { model
                                | dragged = Nothing
                                , formFields =
                                    Array.fromList
                                        [ field2
                                        , field1
                                        , field3
                                        ]
                            }
            , test "dropping an existing field at index 2" <|
                \_ ->
                    let
                        model =
                            { dragged =
                                Just
                                    (Main.DragExisting
                                        { dragIndex = 1
                                        , dropIndex = Just ( 2, Just field3 )
                                        }
                                    )
                            , formFields =
                                Array.fromList
                                    [ field1
                                    , field2
                                    , field3
                                    ]
                            , nextQuestionNumber = 4
                            }
                    in
                    Main.onDropped (Just 2) model
                        |> Expect.equal
                            { model
                                | dragged = Nothing
                                , formFields =
                                    Array.fromList
                                        [ field1
                                        , field3
                                        , field2
                                        ]
                            }
            , test "dropping a new field at index 2" <|
                \_ ->
                    let
                        newField =
                            { field1 | label = "New Field" }

                        model =
                            { dragged =
                                Just
                                    (Main.DragNew
                                        { field = newField
                                        , dropIndex = Just ( 2, Just field3 )
                                        }
                                    )
                            , formFields =
                                Array.fromList
                                    [ field1
                                    , field2
                                    , field3
                                    ]
                            , nextQuestionNumber = 4
                            }
                    in
                    Main.onDropped (Just 2) model
                        |> Expect.equal
                            { model
                                | dragged = Nothing
                                , formFields =
                                    Array.fromList
                                        [ field1
                                        , field2
                                        , newField
                                        , field3
                                        ]
                                , nextQuestionNumber = 5
                            }
            , test "dropping outside valid area resets dragged state" <|
                \_ ->
                    let
                        model =
                            { dragged = Just (Main.DragExisting { dragIndex = 1, dropIndex = Nothing })
                            , formFields =
                                Array.fromList
                                    [ field1
                                    , field2
                                    , field3
                                    ]
                            , nextQuestionNumber = 4
                            }
                    in
                    Main.onDropped Nothing model
                        |> Expect.equal
                            { model
                                | dragged = Nothing
                            }
            , test "dropping on original position does not change fields" <|
                \_ ->
                    let
                        model =
                            { dragged = Just (Main.DragExisting { dragIndex = 1, dropIndex = Just ( 1, Just field2 ) })
                            , formFields =
                                Array.fromList
                                    [ field1
                                    , field2
                                    , field3
                                    ]
                            , nextQuestionNumber = 4
                            }
                    in
                    Main.onDropped (Just 1) model
                        |> Expect.equal
                            { model
                                | dragged = Nothing
                            }
            , test "dropping with no drag state does nothing" <|
                \_ ->
                    let
                        model =
                            { dragged = Nothing
                            , formFields =
                                Array.fromList
                                    [ field1
                                    , field2
                                    , field3
                                    ]
                            , nextQuestionNumber = 4
                            }
                    in
                    Main.onDropped (Just 1) model
                        |> Expect.equal model
            ]
        , describe "isVisibilityRuleSatisfied"
            [ test "empty rules list returns True" <|
                \_ ->
                    Main.isVisibilityRuleSatisfied [] Dict.empty
                        |> Expect.equal True
            , test "ShowWhen with single matching condition returns True" <|
                \_ ->
                    let
                        rules =
                            [ Main.ShowWhen [ Main.Field "field1" (Main.Equals "value1") ] ]

                        values =
                            Dict.fromList [ ( "field1", [ "value1" ] ) ]
                    in
                    Main.isVisibilityRuleSatisfied rules values
                        |> Expect.equal True
            , test "ShowWhen with non-matching condition returns False" <|
                \_ ->
                    let
                        rules =
                            [ Main.ShowWhen [ Main.Field "field1" (Main.Equals "value1") ] ]

                        values =
                            Dict.fromList [ ( "field1", [ "wrong" ] ) ]
                    in
                    Main.isVisibilityRuleSatisfied rules values
                        |> Expect.equal False
            , test "HideWhen with matching condition returns False" <|
                \_ ->
                    let
                        rules =
                            [ Main.HideWhen [ Main.Field "field1" (Main.Equals "value1") ] ]

                        values =
                            Dict.fromList [ ( "field1", [ "value1" ] ) ]
                    in
                    Main.isVisibilityRuleSatisfied rules values
                        |> Expect.equal False
            , test "HideWhen with non-matching condition returns True" <|
                \_ ->
                    let
                        rules =
                            [ Main.HideWhen [ Main.Field "field1" (Main.Equals "value1") ] ]

                        values =
                            Dict.fromList [ ( "field1", [ "wrong" ] ) ]
                    in
                    Main.isVisibilityRuleSatisfied rules values
                        |> Expect.equal True
            , test "Multiple rules with OR logic - any rule can satisfy" <|
                \_ ->
                    let
                        rules =
                            [ Main.ShowWhen [ Main.Field "field1" (Main.Equals "wrong") ]
                            , Main.ShowWhen [ Main.Field "field2" (Main.Equals "value2") ]
                            ]

                        values =
                            Dict.fromList
                                [ ( "field1", [ "value1" ] )
                                , ( "field2", [ "value2" ] )
                                ]
                    in
                    Main.isVisibilityRuleSatisfied rules values
                        |> Expect.equal True
            , test "Multiple conditions in ShowWhen require all to match" <|
                \_ ->
                    let
                        rules =
                            [ Main.ShowWhen
                                [ Main.Field "field1" (Main.Equals "value1")
                                , Main.Field "field2" (Main.Equals "value2")
                                ]
                            ]

                        values =
                            Dict.fromList
                                [ ( "field1", [ "value1" ] )
                                , ( "field2", [ "wrong" ] )
                                ]
                    in
                    Main.isVisibilityRuleSatisfied rules values
                        |> Expect.equal False
            ]
        , describe "evaluateCondition"
            [ describe "Comparison behavior with 'hello123'"
                [ test "Equals matches exact string only" <|
                    \_ ->
                        let
                            values =
                                Dict.fromList [ ( "field1", [ "hello123" ] ) ]
                        in
                        Expect.all
                            [ \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.Equals "hello123"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.Equals "hello"))
                                    |> Expect.equal False
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.Equals "123"))
                                    |> Expect.equal False
                            ]
                            ()
                , test "StringContains matches substrings" <|
                    \_ ->
                        let
                            values =
                                Dict.fromList [ ( "field1", [ "hello123" ] ) ]
                        in
                        Expect.all
                            [ \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.StringContains "hello123"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.StringContains "hello"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.StringContains "123"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.StringContains "llo12"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.StringContains "hello124"))
                                    |> Expect.equal False
                            ]
                            ()
                , test "EndsWith matches suffix only" <|
                    \_ ->
                        let
                            values =
                                Dict.fromList [ ( "field1", [ "hello123" ] ) ]
                        in
                        Expect.all
                            [ \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.EndsWith "hello123"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.EndsWith "123"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.EndsWith "hello"))
                                    |> Expect.equal False
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.EndsWith "23"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.EndsWith "124"))
                                    |> Expect.equal False
                            ]
                            ()
                , test "GreaterThan handles both numeric and string comparisons" <|
                    \_ ->
                        Expect.all
                            [ -- Numeric comparisons (when value is float)
                              \_ ->
                                Main.evaluateCondition
                                    (Dict.fromList [ ( "field1", [ "123" ] ) ])
                                    (Main.Field "field1" (Main.GreaterThan "45"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition
                                    (Dict.fromList [ ( "field1", [ "45" ] ) ])
                                    (Main.Field "field1" (Main.GreaterThan "123"))
                                    |> Expect.equal False
                            , -- String comparisons (when value is not float)
                              \_ ->
                                Main.evaluateCondition
                                    (Dict.fromList [ ( "field1", [ "xyz" ] ) ])
                                    (Main.Field "field1" (Main.GreaterThan "abc"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition
                                    (Dict.fromList [ ( "field1", [ "abc" ] ) ])
                                    (Main.Field "field1" (Main.GreaterThan "xyz"))
                                    |> Expect.equal False
                            , -- Mixed comparisons (when value is float but field value is not)
                              \_ ->
                                Main.evaluateCondition
                                    (Dict.fromList [ ( "field1", [ "abc" ] ) ])
                                    (Main.Field "field1" (Main.GreaterThan "123"))
                                    |> Expect.equal False
                            ]
                            ()
                ]
            , describe "Multiple values with '123' pattern"
                [ test "Values ['hello123', 'world123', 'test'] behave differently across comparisons" <|
                    \_ ->
                        let
                            values =
                                Dict.fromList [ ( "field1", [ "hello123", "world123", "test" ] ) ]
                        in
                        Expect.all
                            [ -- Equals: must match complete value
                              \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.Equals "123"))
                                    |> Expect.equal False
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.Equals "hello123"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.Equals "test"))
                                    |> Expect.equal True

                            -- StringContains: matches anywhere in string
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.StringContains "123"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.StringContains "hello"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.StringContains "world"))
                                    |> Expect.equal True

                            -- EndsWith: must match at end
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.EndsWith "123"))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.EndsWith "hello"))
                                    |> Expect.equal False
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.EndsWith "test"))
                                    |> Expect.equal True
                            ]
                            ()
                ]
            , describe "Edge cases"
                [ test "Empty string behaviors" <|
                    \_ ->
                        let
                            values =
                                Dict.fromList [ ( "field1", [ "" ] ) ]
                        in
                        Expect.all
                            [ \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.Equals ""))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.StringContains ""))
                                    |> Expect.equal True
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.EndsWith ""))
                                    |> Expect.equal True
                            ]
                            ()
                , test "Missing field behaviors" <|
                    \_ ->
                        let
                            values =
                                Dict.empty
                        in
                        Expect.all
                            [ \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.Equals "anything"))
                                    |> Expect.equal False
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.StringContains "anything"))
                                    |> Expect.equal False
                            , \_ ->
                                Main.evaluateCondition values (Main.Field "field1" (Main.EndsWith "anything"))
                                    |> Expect.equal False
                            ]
                            ()
                ]
            ]
        , describe "EqualsField behavior"
            [ test "EqualsField matches when any value overlaps" <|
                \_ ->
                    let
                        values =
                            Dict.fromList [ ( "a", [ "x", "y" ] ), ( "b", [ "y", "z" ] ) ]
                    in
                    Expect.all
                        [ \_ ->
                            Main.evaluateCondition values (Main.Field "a" (Main.EqualsField "b"))
                                |> Expect.equal True
                        , \_ ->
                            Main.evaluateCondition values (Main.Field "b" (Main.EqualsField "a"))
                                |> Expect.equal True
                        ]
                        ()
            , test "EqualsField does not match when no overlap" <|
                \_ ->
                    let
                        values =
                            Dict.fromList [ ( "a", [ "x" ] ), ( "b", [ "y" ] ) ]
                    in
                    Main.evaluateCondition values (Main.Field "a" (Main.EqualsField "b"))
                        |> Expect.equal False
            , test "isVisibilityRuleSatisfied with EqualsField in ShowWhen" <|
                \_ ->
                    let
                        rules =
                            [ Main.ShowWhen [ Main.Field "a" (Main.EqualsField "b") ] ]

                        values =
                            Dict.fromList [ ( "a", [ "x" ] ), ( "b", [ "x" ] ) ]
                    in
                    Main.isVisibilityRuleSatisfied rules values
                        |> Expect.equal True
            , test "EqualsField handles empty lists gracefully" <|
                \_ ->
                    let
                        values =
                            Dict.fromList [ ( "a", [] ), ( "b", [] ) ]
                    in
                    Main.evaluateCondition values (Main.Field "a" (Main.EqualsField "b"))
                        |> Expect.equal False
            , test "EqualsField matches with duplicates and whitespace preserved" <|
                \_ ->
                    let
                        values =
                            Dict.fromList [ ( "a", [ "x", "x" ] ), ( "b", [ " x", "x" ] ) ]
                    in
                    -- Comparison is as-is: whitespace and duplicates are not normalized
                    Main.evaluateCondition values (Main.Field "a" (Main.EqualsField "b"))
                        |> Expect.equal True
            , test "EqualsField with multi-value fields - any value matches (integration test)" <|
                \_ ->
                    let
                        -- Mirror the Go test: ChooseMultiple fields with EqualsField visibility rule
                        formFields =
                            Array.fromList
                                [ { label = "Your Skills"
                                  , name = Just "skills"
                                  , presence = Main.Required
                                  , description = Main.AttributeNotNeeded
                                  , type_ =
                                        Main.ChooseMultiple
                                            { choices =
                                                [ { label = "Go", value = "Go" }
                                                , { label = "Elm", value = "Elm" }
                                                , { label = "JavaScript", value = "JavaScript" }
                                                , { label = "Python", value = "Python" }
                                                ]
                                            , filter = Nothing
                                            , maxAllowed = Nothing
                                            , minRequired = Nothing
                                            }
                                  , visibilityRule = []
                                  }
                                , { label = "Preferred Skills"
                                  , name = Just "preferred_skills"
                                  , presence = Main.Required
                                  , description = Main.AttributeNotNeeded
                                  , type_ =
                                        Main.ChooseMultiple
                                            { choices =
                                                [ { label = "Go", value = "Go" }
                                                , { label = "Elm", value = "Elm" }
                                                , { label = "JavaScript", value = "JavaScript" }
                                                , { label = "Python", value = "Python" }
                                                ]
                                            , filter = Nothing
                                            , maxAllowed = Nothing
                                            , minRequired = Nothing
                                            }
                                  , visibilityRule = []
                                  }
                                , { label = "Skills Match Indicator"
                                  , name = Nothing
                                  , presence = Main.Required
                                  , description = Main.AttributeNotNeeded
                                  , type_ =
                                        Main.ShortText
                                            (Main.fromRawCustomElement
                                                { inputType = "text"
                                                , inputTag = "input"
                                                , attributes =
                                                    Dict.fromList
                                                        [ ( "type", "text" )
                                                        , ( "class", "size-0-invisible" )
                                                        , ( "value", "form-invalid" )
                                                        , ( "pattern", "form-ok" )
                                                        ]
                                                }
                                            )
                                  , visibilityRule =
                                        [ Main.HideWhen
                                            [ Main.Field "skills" (Main.EqualsField "preferred_skills") ]
                                        ]
                                  }
                                ]

                        -- Values with overlap: "Elm" is in both lists
                        values =
                            Dict.fromList
                                [ ( "skills", [ "Go", "Elm" ] )
                                , ( "preferred_skills", [ "Python", "Elm", "JavaScript" ] )
                                ]
                    in
                    Expect.all
                        [ \_ ->
                            -- The EqualsField condition should be met (overlap exists)
                            Main.evaluateCondition values (Main.Field "skills" (Main.EqualsField "preferred_skills"))
                                |> Expect.equal True
                        , \_ ->
                            -- The third field should be hidden (HideWhen condition met)
                            case Array.get 2 formFields of
                                Just field ->
                                    Main.isVisibilityRuleSatisfied field.visibilityRule values
                                        |> Expect.equal False

                                Nothing ->
                                    Expect.fail "Field 2 not found"
                        ]
                        ()
            , test "EqualsField with multi-value fields - no overlap (integration test)" <|
                \_ ->
                    let
                        -- Same form structure as above
                        formFields =
                            Array.fromList
                                [ { label = "Your Skills"
                                  , name = Just "skills"
                                  , presence = Main.Required
                                  , description = Main.AttributeNotNeeded
                                  , type_ =
                                        Main.ChooseMultiple
                                            { choices =
                                                [ { label = "Go", value = "Go" }
                                                , { label = "Elm", value = "Elm" }
                                                , { label = "JavaScript", value = "JavaScript" }
                                                , { label = "Python", value = "Python" }
                                                ]
                                            , filter = Nothing
                                            , maxAllowed = Nothing
                                            , minRequired = Nothing
                                            }
                                  , visibilityRule = []
                                  }
                                , { label = "Preferred Skills"
                                  , name = Just "preferred_skills"
                                  , presence = Main.Required
                                  , description = Main.AttributeNotNeeded
                                  , type_ =
                                        Main.ChooseMultiple
                                            { choices =
                                                [ { label = "Go", value = "Go" }
                                                , { label = "Elm", value = "Elm" }
                                                , { label = "JavaScript", value = "JavaScript" }
                                                , { label = "Python", value = "Python" }
                                                ]
                                            , filter = Nothing
                                            , maxAllowed = Nothing
                                            , minRequired = Nothing
                                            }
                                  , visibilityRule = []
                                  }
                                , { label = "Skills Match Indicator"
                                  , name = Nothing
                                  , presence = Main.Required
                                  , description = Main.AttributeNotNeeded
                                  , type_ =
                                        Main.ShortText
                                            (Main.fromRawCustomElement
                                                { inputType = "text"
                                                , inputTag = "input"
                                                , attributes =
                                                    Dict.fromList
                                                        [ ( "type", "text" )
                                                        , ( "class", "size-0-invisible" )
                                                        , ( "value", "form-invalid" )
                                                        , ( "pattern", "form-ok" )
                                                        ]
                                                }
                                            )
                                  , visibilityRule =
                                        [ Main.HideWhen
                                            [ Main.Field "skills" (Main.EqualsField "preferred_skills") ]
                                        ]
                                  }
                                ]

                        -- Values with NO overlap
                        values =
                            Dict.fromList
                                [ ( "skills", [ "Go", "Elm" ] )
                                , ( "preferred_skills", [ "Python", "JavaScript" ] )
                                ]
                    in
                    Expect.all
                        [ \_ ->
                            -- The EqualsField condition should NOT be met (no overlap)
                            Main.evaluateCondition values (Main.Field "skills" (Main.EqualsField "preferred_skills"))
                                |> Expect.equal False
                        , \_ ->
                            -- The third field should be visible (HideWhen condition not met)
                            case Array.get 2 formFields of
                                Just field ->
                                    Main.isVisibilityRuleSatisfied field.visibilityRule values
                                        |> Expect.equal True

                                Nothing ->
                                    Expect.fail "Field 2 not found"
                        ]
                        ()
            ]
        , describe "list attribute handling"
            [ test "fromRawCustomElement removes list attribute" <|
                \_ ->
                    let
                        ele =
                            { rawCustomElement
                                | attributes = Dict.fromList [ ( "list", "some-id" ) ]
                            }
                    in
                    Main.fromRawCustomElement ele
                        |> .attributes
                        |> Dict.get "list"
                        |> Expect.equal Nothing
            , test "datalist is preserved when given" <|
                \_ ->
                    let
                        ele =
                            { rawCustomElement
                                | attributes = Dict.fromList [ ( "list", "1\n2" ) ]
                            }

                        customElement =
                            Main.fromRawCustomElement ele
                    in
                    case customElement.datalist of
                        Main.AttributeGiven list ->
                            list
                                |> List.map .value
                                |> Expect.equal [ "1", "2" ]

                        _ ->
                            Expect.fail "Expected AttributeGiven but got something else"
            , test "datalist is not needed by default" <|
                \_ ->
                    let
                        customElement =
                            Main.fromRawCustomElement rawCustomElement
                    in
                    case customElement.datalist of
                        Main.AttributeNotNeeded _ ->
                            Expect.pass

                        _ ->
                            Expect.fail "Expected AttributeNotNeeded but got something else"
            ]
        , describe "dragOverDecoder"
            [ test "decodes dragover event with formfield" <|
                \_ ->
                    let
                        event =
                            Json.Encode.object
                                [ ( "pageY", Json.Encode.int 100 )
                                , ( "clientY", Json.Encode.int 200 )
                                , ( "offsetY", Json.Encode.int 50 )
                                ]
                    in
                    Json.Decode.decodeValue (Main.dragOverDecoder 1 (Just field1)) event
                        |> Result.map Tuple.first
                        |> Expect.equal
                            (Ok
                                (Main.DragOver
                                    (Just ( 1, Just field1 ))
                                )
                            )
            ]
        , Test.fuzz (Fuzz.intRange 0 100) "{encode,decode}InputField is reversible" <|
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
                    { "Text": { "type": "text", "maxlength": "10", "multiple": "false" } },
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
                    |> Result.map (Json.Encode.list (Main.encodePairsFromCustomElement >> Json.Encode.object))
                    |> Result.andThen (Json.Decode.decodeValue (Json.Decode.list Main.decodeCustomElement))
                    |> Expect.equal
                        (Ok
                            [ { inputType = "Text"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "type", "text" )
                                        ]
                              , multiple = Main.AttributeNotNeeded Nothing
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              , min = Main.AttributeNotNeeded Nothing
                              , max = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Text"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "type", "text" )
                                        , ( "maxlength", "10" )
                                        , ( "multiple", "false" )
                                        ]
                              , multiple = Main.AttributeGiven False
                              , maxlength = Main.AttributeGiven 10
                              , datalist = Main.AttributeNotNeeded Nothing
                              , min = Main.AttributeNotNeeded Nothing
                              , max = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Text"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "type", "text" )
                                        ]
                              , multiple = Main.AttributeNotNeeded Nothing
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist =
                                    Main.AttributeGiven
                                        [ { label = "someid", value = "someid" }
                                        ]
                              , min = Main.AttributeNotNeeded Nothing
                              , max = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Text"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "type", "text" )
                                        ]
                              , multiple = Main.AttributeNotNeeded Nothing
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist =
                                    Main.AttributeGiven
                                        [ { label = "uno !", value = "one" }
                                        , { label = "dos", value = "two" }
                                        , { label = "tres", value = "three" }
                                        , { label = "four", value = "four" }
                                        ]
                              , min = Main.AttributeNotNeeded Nothing
                              , max = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Email"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "type", "email" )
                                        ]
                              , multiple = Main.AttributeNotNeeded Nothing
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              , min = Main.AttributeNotNeeded Nothing
                              , max = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Emails"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "type", "email" )
                                        , ( "multiple", "true" )
                                        ]
                              , multiple = Main.AttributeGiven True
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              , min = Main.AttributeNotNeeded Nothing
                              , max = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Digits"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "pattern", "^[0-9]+$" )
                                        , ( "type", "text" )
                                        ]
                              , multiple = Main.AttributeNotNeeded Nothing
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              , min = Main.AttributeNotNeeded Nothing
                              , max = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Nric2"
                              , inputTag = "nric-custom-ele"
                              , attributes =
                                    Dict.fromList
                                        [ ( "pattern", "^[STGM][0-9]{7}[ABCDEFGHIZJ]$" )
                                        , ( "type", "text" )
                                        ]
                              , multiple = Main.AttributeNotNeeded Nothing
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              , min = Main.AttributeNotNeeded Nothing
                              , max = Main.AttributeNotNeeded Nothing
                              }
                            , { inputType = "Nric"
                              , inputTag = "input"
                              , attributes =
                                    Dict.fromList
                                        [ ( "pattern", "^[STGM][0-9]{7}[ABCDEFGHIZJ]$" )
                                        , ( "type", "text" )
                                        ]
                              , multiple = Main.AttributeNotNeeded Nothing
                              , maxlength = Main.AttributeNotNeeded Nothing
                              , datalist = Main.AttributeNotNeeded Nothing
                              , min = Main.AttributeNotNeeded Nothing
                              , max = Main.AttributeNotNeeded Nothing
                              }
                            ]
                        )
        , Test.fuzz choiceStringFuzzer "choiceStringToChoice,choiceStringFromString is reversible (but value is always trimmed)" <|
            \choice ->
                choice
                    |> Main.encodeChoice
                    |> Json.Encode.encode 0
                    |> Json.Decode.decodeString Main.decodeChoice
                    |> Expect.equal (Ok { choice | value = String.trim choice.value })
        , Test.fuzz pairOfFormFieldFuzzer "encode old FormField can be decoded with decodeFormField" <|
            \{ oldField, newField } ->
                oldField
                    |> encodeFormField
                    |> Json.Encode.encode 0
                    |> Json.Decode.decodeString Main.decodeFormField
                    |> Expect.equal (Ok newField)
        , test "removes visibility rule when newline value is received" <|
            \_ ->
                let
                    formField =
                        { field1
                            | visibilityRule =
                                [ Main.ShowWhen [ Main.Field "field2" (Main.Equals "value") ]
                                ]
                        }
                in
                Main.updateFormField (Main.OnVisibilityRuleTypeInput 0 "\n") 0 "" Array.empty formField
                    |> .visibilityRule
                    |> Expect.equal []
        , test "removes visibility condition when newline value is received" <|
            \_ ->
                let
                    formField =
                        { field1
                            | visibilityRule =
                                [ Main.ShowWhen [ Main.Field "field2" (Main.Equals "value") ]
                                , Main.ShowWhen [ Main.Field "field3" (Main.Equals "value") ]
                                ]
                        }
                in
                Main.updateFormField (Main.OnVisibilityConditionFieldInput 0 0 "\n") 0 "" Array.empty formField
                    |> .visibilityRule
                    |> List.map visibilityRuleCondition
                    |> List.head
                    |> Maybe.withDefault []
                    |> List.length
                    |> Expect.equal 0
        , describe "updateComparisonInCondition"
            [ test "updates comparison in Field condition" <|
                \_ ->
                    let
                        condition =
                            Main.Field "fieldName" (Main.Equals "oldValue")
                    in
                    Main.updateComparisonInCondition (\_ -> Main.Equals "newValue") condition
                        |> Expect.equal (Main.Field "fieldName" (Main.Equals "newValue"))
            ]
        , describe "updateConditions"
            [ test "updates condition at specified index" <|
                \_ ->
                    let
                        conditions =
                            [ Main.Field "field1" (Main.Equals "value1")
                            , Main.Field "field2" (Main.Equals "value2")
                            , Main.Field "field3" (Main.Equals "value3")
                            ]
                    in
                    Main.updateConditions 1 (\_ -> Main.Field "updatedField" (Main.Equals "updatedValue")) conditions
                        |> Expect.equal
                            [ Main.Field "field1" (Main.Equals "value1")
                            , Main.Field "updatedField" (Main.Equals "updatedValue")
                            , Main.Field "field3" (Main.Equals "value3")
                            ]
            , test "does nothing if index is out of bounds" <|
                \_ ->
                    let
                        conditions =
                            [ Main.Field "field1" (Main.Equals "value1") ]
                    in
                    Main.updateConditions 1 (\_ -> Main.Field "updatedField" (Main.Equals "updatedValue")) conditions
                        |> Expect.equal [ Main.Field "field1" (Main.Equals "value1") ]
            ]
        , describe "updateConditionsInRule"
            [ test "updates conditions in ShowWhen rule" <|
                \_ ->
                    let
                        rule =
                            Main.ShowWhen [ Main.Field "field1" (Main.Equals "value1") ]
                    in
                    Main.updateConditionsInRule
                        (\_ -> [ Main.Field "updatedField" (Main.Equals "updatedValue") ])
                        rule
                        |> Expect.equal (Main.ShowWhen [ Main.Field "updatedField" (Main.Equals "updatedValue") ])
            , test "updates conditions in HideWhen rule" <|
                \_ ->
                    let
                        rule =
                            Main.HideWhen [ Main.Field "field1" (Main.Equals "value1") ]
                    in
                    Main.updateConditionsInRule
                        (\_ -> [ Main.Field "updatedField" (Main.Equals "updatedValue") ])
                        rule
                        |> Expect.equal (Main.HideWhen [ Main.Field "updatedField" (Main.Equals "updatedValue") ])
            ]
        , describe "updateFieldnameInCondition"
            [ test "updates fieldname in Field condition" <|
                \_ ->
                    let
                        condition =
                            Main.Field "oldFieldName" (Main.Equals "value")
                    in
                    Main.updateFieldnameInCondition (\_ -> "newFieldName") condition
                        |> Expect.equal (Main.Field "newFieldName" (Main.Equals "value"))
            ]
        , describe "updateFormField"
            [ test "updates label" <|
                \_ ->
                    Main.updateFormField Main.OnLabelInput 0 "New Label" Array.empty field1
                        |> .label
                        |> Expect.equal "New Label"
            , test "updates description" <|
                \_ ->
                    Main.updateFormField Main.OnDescriptionInput 0 "New Description" Array.empty field1
                        |> .description
                        |> Expect.equal (Main.AttributeGiven "New Description")
            , test "updates presence" <|
                \_ ->
                    Main.updateFormField (Main.OnRequiredInput False) 0 "" Array.empty field1
                        |> .presence
                        |> Expect.equal Main.Optional
            , test "accepts single line datalist input" <|
                \_ ->
                    let
                        formField =
                            { field1
                                | type_ =
                                    Main.ShortText
                                        { inputType = "Text"
                                        , inputTag = "input"
                                        , attributes = Dict.empty
                                        , datalist = Main.AttributeNotNeeded Nothing
                                        , maxlength = Main.AttributeNotNeeded Nothing
                                        , multiple = Main.AttributeNotNeeded Nothing
                                        , min = Main.AttributeNotNeeded Nothing
                                        , max = Main.AttributeNotNeeded Nothing
                                        }
                            }
                    in
                    Main.updateFormField Main.OnDatalistInput 0 "option1" Array.empty formField
                        |> .type_
                        |> (\t ->
                                case t of
                                    Main.ShortText customElement ->
                                        Expect.equal
                                            (Main.AttributeGiven [ { label = "option1", value = "option1" } ])
                                            customElement.datalist

                                    _ ->
                                        Expect.fail ("Expected ShortText but got " ++ Debug.toString t)
                           )
            , test "accepts 2 lines datalist input" <|
                \_ ->
                    let
                        formField =
                            { field1
                                | type_ =
                                    Main.ShortText
                                        { inputType = "Text"
                                        , inputTag = "input"
                                        , attributes = Dict.empty
                                        , datalist = Main.AttributeNotNeeded Nothing
                                        , maxlength = Main.AttributeNotNeeded Nothing
                                        , multiple = Main.AttributeNotNeeded Nothing
                                        , min = Main.AttributeNotNeeded Nothing
                                        , max = Main.AttributeNotNeeded Nothing
                                        }
                            }
                    in
                    Main.updateFormField Main.OnDatalistInput 0 "option1\noption2\n" Array.empty formField
                        |> .type_
                        |> (\t ->
                                case t of
                                    Main.ShortText customElement ->
                                        Expect.equal
                                            (Main.AttributeGiven [ { label = "option1", value = "option1" }, { label = "option2", value = "option2" }, { label = "", value = "" } ])
                                            customElement.datalist

                                    _ ->
                                        Expect.fail ("Expected ShortText but got " ++ Debug.toString t)
                           )
            , test "accepts complex lines datalist input" <|
                \_ ->
                    let
                        formField =
                            { field1
                                | type_ =
                                    Main.ShortText
                                        { inputType = "Text"
                                        , inputTag = "input"
                                        , attributes = Dict.empty
                                        , datalist = Main.AttributeNotNeeded Nothing
                                        , maxlength = Main.AttributeNotNeeded Nothing
                                        , multiple = Main.AttributeNotNeeded Nothing
                                        , min = Main.AttributeNotNeeded Nothing
                                        , max = Main.AttributeNotNeeded Nothing
                                        }
                            }
                    in
                    Main.updateFormField Main.OnDatalistInput 0 "option1 | huh\noption2\n" Array.empty formField
                        |> .type_
                        |> (\t ->
                                case t of
                                    Main.ShortText customElement ->
                                        Expect.equal
                                            (Main.AttributeGiven [ { label = "huh", value = "option1" }, { label = "option2", value = "option2" }, { label = "", value = "" } ])
                                            customElement.datalist

                                    _ ->
                                        Expect.fail ("Expected ShortText but got " ++ Debug.toString t)
                           )
            ]
        , describe "filterChoices"
            [ test "returns all choices when filter is Nothing" <|
                \_ ->
                    let
                        choices =
                            [ Main.Choice "apple" "apple"
                            , Main.Choice "banana" "banana"
                            , Main.Choice "cherry" "cherry"
                            ]

                        formValues =
                            Dict.fromList [ ( "source", [ "test" ] ) ]
                    in
                    Main.filterChoices Nothing formValues choices
                        |> Expect.equal choices
            , test "filters choices that start with field value" <|
                \_ ->
                    let
                        choices =
                            [ Main.Choice "apple" "apple"
                            , Main.Choice "banana" "banana"
                            , Main.Choice "avocado" "avocado"
                            ]

                        formValues =
                            Dict.fromList [ ( "source", [ "a" ] ) ]
                    in
                    Main.filterChoices (Just (Main.FilterStartsWithFieldValueOf "source")) formValues choices
                        |> Expect.equal
                            [ Main.Choice "apple" "apple"
                            , Main.Choice "avocado" "avocado"
                            ]
            , test "filters choices that contain field value" <|
                \_ ->
                    let
                        choices =
                            [ Main.Choice "apple" "apple"
                            , Main.Choice "banana" "banana"
                            , Main.Choice "avocado" "avocado"
                            ]

                        formValues =
                            Dict.fromList [ ( "source", [ "a" ] ) ]
                    in
                    Main.filterChoices (Just (Main.FilterContainsFieldValueOf "source")) formValues choices
                        |> Expect.equal
                            [ Main.Choice "apple" "apple"
                            , Main.Choice "banana" "banana"
                            , Main.Choice "avocado" "avocado"
                            ]
            , test "filters choices that contain field value case-insensitively" <|
                \_ ->
                    let
                        choices =
                            [ Main.Choice "Apple" "apple"
                            , Main.Choice "BANANA" "banana"
                            , Main.Choice "Avocado" "avocado"
                            ]

                        formValues =
                            Dict.fromList [ ( "source", [ "a" ] ) ]
                    in
                    Main.filterChoices (Just (Main.FilterContainsFieldValueOf "source")) formValues choices
                        |> Expect.equal
                            [ Main.Choice "Apple" "apple"
                            , Main.Choice "BANANA" "banana"
                            , Main.Choice "Avocado" "avocado"
                            ]
            , test "returns no choices when source field is empty" <|
                \_ ->
                    let
                        choices =
                            [ Main.Choice "apple" "apple"
                            , Main.Choice "banana" "banana"
                            , Main.Choice "cherry" "cherry"
                            ]

                        formValues =
                            Dict.fromList [ ( "source", [ "" ] ) ]
                    in
                    Main.filterChoices (Just (Main.FilterStartsWithFieldValueOf "source")) formValues choices
                        |> Expect.equal []
            , test "returns no choices when source field doesn't exist" <|
                \_ ->
                    let
                        choices =
                            [ Main.Choice "apple" "apple"
                            , Main.Choice "banana" "banana"
                            , Main.Choice "cherry" "cherry"
                            ]

                        formValues =
                            Dict.empty
                    in
                    Main.filterChoices (Just (Main.FilterStartsWithFieldValueOf "source")) formValues choices
                        |> Expect.equal []
            ]
        , describe "filterValuesByFieldChoices"
            [ test "filters ChooseMultiple field values to only valid choices" <|
                \_ ->
                    let
                        field =
                            { label = "Test Field"
                            , type_ =
                                Main.ChooseMultiple
                                    { choices = [ Main.Choice "apple" "apple", Main.Choice "banana" "banana" ]
                                    , minRequired = Nothing
                                    , maxAllowed = Nothing
                                    , filter = Nothing
                                    }
                            , presence = Main.Required
                            , description = Main.AttributeNotNeeded Nothing
                            , name = Nothing
                            , visibilityRule = []
                            }

                        inputValues =
                            [ "apple", "cherry", "banana", "invalid" ]
                    in
                    Main.filterValuesByFieldChoices field inputValues
                        |> Expect.equal [ "apple", "banana" ]
            , test "filters ChooseOne field values to only valid choices" <|
                \_ ->
                    let
                        field =
                            { label = "Test Field"
                            , type_ =
                                Main.ChooseOne
                                    { choices = [ Main.Choice "yes" "yes", Main.Choice "no" "no" ]
                                    , filter = Nothing
                                    }
                            , presence = Main.Required
                            , description = Main.AttributeNotNeeded Nothing
                            , name = Nothing
                            , visibilityRule = []
                            }

                        inputValues =
                            [ "yes", "maybe", "no" ]
                    in
                    Main.filterValuesByFieldChoices field inputValues
                        |> Expect.equal [ "yes", "no" ]
            , test "filters Dropdown field values to only valid choices" <|
                \_ ->
                    let
                        field =
                            { label = "Test Field"
                            , type_ =
                                Main.Dropdown
                                    { choices = [ Main.Choice "red" "red", Main.Choice "blue" "blue" ]
                                    , filter = Nothing
                                    }
                            , presence = Main.Required
                            , description = Main.AttributeNotNeeded Nothing
                            , name = Nothing
                            , visibilityRule = []
                            }

                        inputValues =
                            [ "red", "green", "blue", "yellow" ]
                    in
                    Main.filterValuesByFieldChoices field inputValues
                        |> Expect.equal [ "red", "blue" ]
            , test "allows all values for non-choice fields" <|
                \_ ->
                    let
                        field =
                            { label = "Test Field"
                            , type_ = Main.ShortText (Main.fromRawCustomElement rawCustomElement)
                            , presence = Main.Required
                            , description = Main.AttributeNotNeeded Nothing
                            , name = Nothing
                            , visibilityRule = []
                            }

                        inputValues =
                            [ "any", "text", "values" ]
                    in
                    Main.filterValuesByFieldChoices field inputValues
                        |> Expect.equal [ "any", "text", "values" ]
            , test "returns empty list when no values match choices" <|
                \_ ->
                    let
                        field =
                            { label = "Test Field"
                            , type_ =
                                Main.ChooseMultiple
                                    { choices = [ Main.Choice "apple" "apple", Main.Choice "banana" "banana" ]
                                    , minRequired = Nothing
                                    , maxAllowed = Nothing
                                    , filter = Nothing
                                    }
                            , presence = Main.Required
                            , description = Main.AttributeNotNeeded Nothing
                            , name = Nothing
                            , visibilityRule = []
                            }

                        inputValues =
                            [ "cherry", "grape", "orange" ]
                    in
                    Main.filterValuesByFieldChoices field inputValues
                        |> Expect.equal []
            ]
        ]


visibilityRuleCondition : Main.VisibilityRule -> List Main.Condition
visibilityRuleCondition rule =
    case rule of
        Main.ShowWhen conditions ->
            conditions

        Main.HideWhen conditions ->
            conditions


viewModeFuzzer : Fuzzer Main.ViewMode
viewModeFuzzer =
    Fuzz.oneOf
        [ -- Fuzz.constant (Editor { maybeAnimate = Nothing })
          -- we don't encode/decode `maybeHighlight` because it is transient value
          -- maybeHighlight is always Nothing
          Fuzz.constant (Main.Editor { maybeAnimate = Nothing })
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
            Dict.fromList
                [ ( "type", "email" )
                ]
        , multiple = Main.AttributeNotNeeded Nothing
        , maxlength = Main.AttributeNotNeeded Nothing
        , datalist = Main.AttributeNotNeeded Nothing
        , min = Main.AttributeNotNeeded Nothing
        , max = Main.AttributeNotNeeded Nothing
        }
    , Main.ShortText
        { inputType = "Emails"
        , inputTag = "input"
        , attributes =
            Dict.fromList
                [ ( "type", "email" )
                , ( "multiple", "true" )
                ]
        , multiple = Main.AttributeGiven True
        , maxlength = Main.AttributeNotNeeded Nothing
        , datalist = Main.AttributeNotNeeded Nothing
        , min = Main.AttributeNotNeeded Nothing
        , max = Main.AttributeNotNeeded Nothing
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
        , multiple = Main.AttributeGiven True
        , maxlength = Main.AttributeGiven 20
        , datalist = Main.AttributeNotNeeded Nothing
        , min = Main.AttributeNotNeeded Nothing
        , max = Main.AttributeNotNeeded Nothing
        }
    , Main.Dropdown
        { choices = [ Main.Choice "option1" "option1", Main.Choice "option2" "option2" ]
        , filter = Nothing
        }
    , Main.Dropdown
        { choices = [ Main.Choice "option1" "option1", Main.Choice "option2" "option2" ]
        , filter = Just (Main.FilterStartsWithFieldValueOf "sourceField")
        }
    , Main.ChooseOne
        { choices = [ Main.Choice "option1" "option1", Main.Choice "option2" "option2" ]
        , filter = Just (Main.FilterContainsFieldValueOf "sourceField")
        }
    , Main.ChooseMultiple
        { choices = [ Main.Choice "option1" "option1", Main.Choice "option2" "option2" ]
        , minRequired = Just 1
        , maxAllowed = Just 2
        , filter = Nothing
        }
    , Main.ChooseMultiple
        { choices = [ Main.Choice "option1" "option1", Main.Choice "option2" "option2" ]
        , minRequired = Nothing
        , maxAllowed = Nothing
        , filter = Just (Main.FilterStartsWithFieldValueOf "sourceField")
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
    Fuzz.map6 Main.FormField
        string
        (Fuzz.maybe string)
        presenceFuzzer
        (attributeOptionalFuzzer string { blank = "" })
        inputFieldFuzzer
        (Fuzz.constant [])


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

        maybePresenceName =
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

        maybePresenceDescription =
            case oldField.presence of
                System { description } ->
                    Main.AttributeGiven description

                SystemRequired { description } ->
                    Main.AttributeGiven description

                SystemOptional { description } ->
                    Main.AttributeGiven description

                _ ->
                    Main.AttributeNotNeeded Nothing

        preferNotNeeded attr =
            case attr of
                Main.AttributeNotNeeded _ ->
                    attr

                Main.AttributeInvalid _ ->
                    Main.AttributeNotNeeded Nothing

                Main.AttributeGiven "" ->
                    Main.AttributeNotNeeded Nothing

                Main.AttributeGiven s ->
                    Main.AttributeGiven s
    in
    { label = oldField.label
    , name = maybePresenceName
    , presence = newPresence
    , description =
        preferNotNeeded <|
            case maybePresenceDescription of
                Main.AttributeGiven _ ->
                    maybePresenceDescription

                Main.AttributeInvalid _ ->
                    Main.AttributeGiven oldField.description

                Main.AttributeNotNeeded _ ->
                    Main.AttributeGiven oldField.description
    , type_ = oldField.type_
    , visibilityRule = []
    }


type Presence
    = Required
    | Optional
    | System { name : String, description : String }
    | SystemRequired { name : String, description : String }
    | SystemOptional { name : String, description : String }


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
