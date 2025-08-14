port module GenerateGoTestJSON exposing (main)

import Array
import Dict
import Json.Encode
import Main exposing (..)
import Platform


port output : String -> Cmd msg


main : Program () () ()
main =
    Platform.worker
        { init = \_ -> ( (), generateTestCases )
        , update = \_ _ -> ( (), Cmd.none )
        , subscriptions = \_ -> Sub.none
        }


generateTestCases : Cmd ()
generateTestCases =
    let
        testCases =
            [ ( "showWhenVisibilityRule", showWhenTestCase )
            , ( "hideWhenVisibilityRule", hideWhenTestCase )
            , ( "stringContainsRule", stringContainsTestCase )
            , ( "greaterThanNumericRule", greaterThanNumericTestCase )
            , ( "greaterThanStringRule", greaterThanStringRule )
            , ( "requiredHiddenField", requiredHiddenFieldTestCase )
            ]

        jsonOutput =
            testCases
                |> List.map (\( name, fields ) -> ( name, encodeFormFields (Array.fromList fields) ))
                |> Json.Encode.object
                |> Json.Encode.encode 2
    in
    output jsonOutput


-- Helper functions
makeChoice : String -> Choice
makeChoice str = { label = str, value = str }

defaultCustomElement = fromRawCustomElement
    { inputType = "Single-line free text"
    , inputTag = "input"
    , attributes = Dict.fromList [ ( "type", "text" ) ]
    }

-- Test case definitions
showWhenTestCase : List FormField
showWhenTestCase =
    [ { label = "Color"
      , name = Just "color"
      , presence = Required
      , description = AttributeNotNeeded Nothing
      , type_ = Dropdown { choices = [ makeChoice "Red", makeChoice "Blue" ], filter = Nothing }
      , visibilityRule = []
      }
    , { label = "Why Red?"
      , name = Just "why_red"
      , presence = Required
      , description = AttributeNotNeeded Nothing
      , type_ = ShortText defaultCustomElement
      , visibilityRule = 
          [ ShowWhen 
              [ Field "color" (Equals "Red") ]
          ]
      }
    ]


hideWhenTestCase : List FormField
hideWhenTestCase =
    [ { label = "Has Comments"
      , name = Just "has_comments"
      , presence = Required
      , description = AttributeNotNeeded Nothing
      , type_ = ChooseOne { choices = [ makeChoice "Yes", makeChoice "No" ], filter = Nothing }
      , visibilityRule = []
      }
    , { label = "Comments"
      , name = Just "comments"
      , presence = Required
      , description = AttributeNotNeeded Nothing
      , type_ = LongText (AttributeGiven 1000)
      , visibilityRule = 
          [ HideWhen 
              [ Field "has_comments" (Equals "No") ]
          ]
      }
    ]


stringContainsTestCase : List FormField
stringContainsTestCase =
    [ { label = "Description"
      , name = Just "description"
      , presence = Optional
      , description = AttributeNotNeeded Nothing
      , type_ = LongText (AttributeNotNeeded Nothing)
      , visibilityRule = []
      }
    , { label = "Urgent Note"
      , name = Just "urgent_note"
      , presence = Required
      , description = AttributeNotNeeded Nothing
      , type_ = ShortText defaultCustomElement
      , visibilityRule = 
          [ ShowWhen 
              [ Field "description" (StringContains "urgent") ]
          ]
      }
    ]


greaterThanNumericTestCase : List FormField
greaterThanNumericTestCase =
    [ { label = "Score"
      , name = Just "score"
      , presence = Required
      , description = AttributeNotNeeded Nothing
      , type_ = ShortText defaultCustomElement
      , visibilityRule = []
      }
    , { label = "High Score Message"
      , name = Just "high_score_msg"
      , presence = Required
      , description = AttributeNotNeeded Nothing
      , type_ = ShortText defaultCustomElement
      , visibilityRule = 
          [ ShowWhen 
              [ Field "score" (GreaterThan "100") ]
          ]
      }
    ]


greaterThanStringRule : List FormField
greaterThanStringRule =
    [ { label = "Name"
      , name = Just "name"
      , presence = Required
      , description = AttributeNotNeeded Nothing
      , type_ = ShortText defaultCustomElement
      , visibilityRule = []
      }
    , { label = "Message"
      , name = Just "message"
      , presence = Required
      , description = AttributeNotNeeded Nothing
      , type_ = ShortText defaultCustomElement
      , visibilityRule = 
          [ ShowWhen 
              [ Field "name" (GreaterThan "abc") ]
          ]
      }
    ]


requiredHiddenFieldTestCase : List FormField
requiredHiddenFieldTestCase =
    [ { label = "Show Details"
      , name = Just "show_details"
      , presence = Required
      , description = AttributeNotNeeded Nothing
      , type_ = ChooseOne { choices = [ makeChoice "Yes", makeChoice "No" ], filter = Nothing }
      , visibilityRule = []
      }
    , { label = "Details"
      , name = Just "details"
      , presence = Required
      , description = AttributeNotNeeded Nothing
      , type_ = LongText (AttributeGiven 500)
      , visibilityRule = 
          [ ShowWhen 
              [ Field "show_details" (Equals "Yes") ]
          ]
      }
    ]