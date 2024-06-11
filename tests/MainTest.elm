module MainTest exposing (..)

import Array
import Expect exposing (Expectation)
import Fuzz exposing (Fuzzer, int, list, string)
import Json.Decode
import Json.Encode
import Main
import Test exposing (..)


suite : Test
suite =
    describe "Main"
        [ test "{encode,decode}InputField is reversible" <|
            \() ->
                let
                    formFields =
                        Main.allInputField
                            |> List.indexedMap
                                (\index type_ ->
                                    { label = "label " ++ String.fromInt index
                                    , name = Just ("name " ++ String.fromInt index)
                                    , required = modBy (index + 1) 2 == 0
                                    , description = "description " ++ String.fromInt index
                                    , type_ = type_
                                    }
                                )
                            |> Array.fromList
                in
                formFields
                    |> Main.encodeFormFields
                    |> Json.Encode.encode 0
                    |> Json.Decode.decodeString Main.decodeFormFields
                    |> Expect.equal (Ok formFields)
        ]
