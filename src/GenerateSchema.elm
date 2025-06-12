port module GenerateSchema exposing (main)

import ConfigSchema
import Json.Encode as Encode
import Platform


port outputSchema : String -> Cmd msg


main : Program () () ()
main =
    Platform.worker
        { init = init
        , update = \_ model -> ( model, Cmd.none )
        , subscriptions = \_ -> Sub.none
        }


init : () -> ( (), Cmd () )
init _ =
    let
        schemaJson =
            ConfigSchema.configSchemaJson
                |> Encode.encode 2
    in
    ( (), outputSchema schemaJson )
