port module Main exposing
    ( allInputField
    , decodeFormFields
    , encodeFormFields
    , main
    )

import Array exposing (Array)
import Browser
import Html exposing (Html, a, button, div, input, label, li, option, select, text, textarea, ul)
import Html.Attributes exposing (attribute, checked, class, disabled, for, id, maxlength, minlength, name, placeholder, required, tabindex, title, type_, value)
import Html.Events exposing (onCheck, onClick, onInput)
import Json.Decode
import Json.Decode.Extra exposing (andMap)
import Json.Encode
import Svg exposing (path, svg)
import Svg.Attributes as SvgAttr


port onUpdate : Json.Encode.Value -> Cmd msg


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = always Sub.none
        }


type alias Flags =
    { viewModeString : Maybe String
    , formFields : Maybe Json.Encode.Value
    }


type alias Model =
    { viewMode : ViewMode
    , formFields : Array FormField
    }


type ViewMode
    = Editor
    | Preview
    | CollectData


viewModeFromString : String -> Maybe ViewMode
viewModeFromString str =
    case str of
        "Editor" ->
            Just Editor

        "Preview" ->
            Just Preview

        "CollectData" ->
            Just CollectData

        _ ->
            Nothing


type alias FormField =
    { label : String
    , required : Bool
    , description : String
    , type_ : InputField
    }


type InputField
    = ShortText String (Maybe Int)
    | LongText (Maybe Int)
    | ChooseOne (List String)
    | ChooseMultiple (List String)


allInputField : List InputField
allInputField =
    [ ShortText "text" Nothing
    , ShortText "email" Nothing
    , LongText (Just 160)
    , ChooseOne [ "Yes", "No" ]
    , ChooseMultiple [ "Apple", "Banana", "Cantaloupe", "Durian" ]
    ]


stringFromInputField : InputField -> String
stringFromInputField inputField =
    case inputField of
        ShortText "email" _ ->
            "Email"

        ShortText _ _ ->
            "Short text"

        LongText _ ->
            "Long text"

        ChooseOne _ ->
            "Dropdown"

        ChooseMultiple _ ->
            "Checkboxes"


type Msg
    = SetViewMode ViewMode
    | AddFormField InputField
    | DeleteFormField Int
    | MoveFormFieldUp Int
    | MoveFormFieldDown Int
    | OnFormField FormFieldMsg Int String


type FormFieldMsg
    = OnLabelInput
    | OnDescriptionInput
    | OnRequiredInput Bool
    | OnChoicesInput
    | OnMaxLengthInput



-- INIT


init : Flags -> ( Model, Cmd Msg )
init flags =
    let
        ( initFormFields, initCmd ) =
            case Maybe.map (Json.Decode.decodeValue decodeFormFields) flags.formFields of
                Just (Ok formFields) ->
                    ( formFields, onUpdate (encodeFormFields formFields) )

                decodeFail ->
                    let
                        _ =
                            Debug.log "decodeFail" ( decodeFail, Maybe.map (Json.Encode.encode 0) flags.formFields )
                    in
                    ( Array.empty, Cmd.none )
    in
    ( { viewMode =
            flags.viewModeString
                |> Maybe.andThen viewModeFromString
                |> Maybe.withDefault Editor
      , formFields = initFormFields
      }
    , initCmd
    )



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case Debug.log "update" msg of
        SetViewMode viewMode ->
            ( { model
                | viewMode = viewMode
              }
            , Cmd.none
            )

        AddFormField fieldType ->
            let
                newFormField : FormField
                newFormField =
                    { label = stringFromInputField fieldType ++ " " ++ String.fromInt (Array.length model.formFields + 1)
                    , required = True
                    , description = ""
                    , type_ = fieldType
                    }

                newFormFields =
                    Array.push newFormField model.formFields
            in
            ( { model | formFields = newFormFields }
            , onUpdate (encodeFormFields newFormFields)
            )

        DeleteFormField index ->
            let
                newFormFields =
                    Array.toIndexedList model.formFields
                        |> List.filter (\( i, _ ) -> i /= index)
                        |> List.map Tuple.second
                        |> Array.fromList
            in
            ( { model | formFields = newFormFields }
            , onUpdate (encodeFormFields newFormFields)
            )

        MoveFormFieldUp index ->
            let
                newFormFields =
                    swapArrayIndex index (index - 1) model.formFields
            in
            ( { model | formFields = newFormFields }
            , onUpdate (encodeFormFields newFormFields)
            )

        MoveFormFieldDown index ->
            let
                newFormFields =
                    swapArrayIndex index (index + 1) model.formFields
            in
            ( { model | formFields = newFormFields }
            , onUpdate (encodeFormFields newFormFields)
            )

        OnFormField fmsg index string ->
            let
                newFormFields =
                    Array.indexedMap
                        (\i formField ->
                            if i == index then
                                updateFormField fmsg string formField

                            else
                                formField
                        )
                        model.formFields
            in
            ( { model | formFields = newFormFields }
            , onUpdate (encodeFormFields newFormFields)
            )


updateFormField : FormFieldMsg -> String -> FormField -> FormField
updateFormField msg string formField =
    case msg of
        OnLabelInput ->
            { formField | label = string }

        OnDescriptionInput ->
            { formField | description = string }

        OnRequiredInput bool ->
            { formField | required = bool }

        OnChoicesInput ->
            case formField.type_ of
                ShortText _ _ ->
                    formField

                LongText _ ->
                    formField

                ChooseOne _ ->
                    { formField | type_ = ChooseOne (String.lines string) }

                ChooseMultiple _ ->
                    { formField | type_ = ChooseMultiple (String.lines string) }

        OnMaxLengthInput ->
            case formField.type_ of
                ShortText inputType _ ->
                    { formField | type_ = ShortText inputType (String.toInt string) }

                LongText _ ->
                    { formField | type_ = LongText (String.toInt string) }

                ChooseOne _ ->
                    formField

                ChooseMultiple _ ->
                    formField



--


swapArrayIndex : Int -> Int -> Array a -> Array a
swapArrayIndex i j arr =
    let
        maybeI =
            Array.get i arr

        maybeJ =
            Array.get j arr
    in
    case ( maybeI, maybeJ ) of
        ( Just iVal, Just jVal ) ->
            arr
                |> Array.set j iVal
                |> Array.set i jVal

        _ ->
            arr



-- VIEW


view : Model -> Html Msg
view model =
    div [ class "md:p-4" ]
        (case model.viewMode of
            Editor ->
                [ viewTabs model.viewMode
                    [ ( Editor, text "Editor" )
                    , ( Preview, text "Preview" )
                    ]
                , input
                    [ type_ "hidden"
                    , name "tiny-form-fields"
                    , value (Json.Encode.encode 0 (encodeFormFields model.formFields))
                    ]
                    []
                , viewFormBuilder model
                ]

            Preview ->
                [ viewTabs model.viewMode
                    [ ( Editor, text "Editor" )
                    , ( Preview, text "Preview" )
                    ]
                , input
                    [ type_ "hidden"
                    , name "tiny-form-fields"
                    , value (Json.Encode.encode 0 (encodeFormFields model.formFields))
                    ]
                    []
                , viewFormPreview [ disabled True ] model
                ]

            CollectData ->
                [ viewFormPreview [] model
                ]
        )


viewTabs : ViewMode -> List ( ViewMode, Html Msg ) -> Html Msg
viewTabs active tabs =
    ul
        [ class "flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400 mb-4"
        ]
        (List.map
            (\( tab, content ) ->
                li
                    [ class "me-2"
                    ]
                    [ button
                        [ type_ "button"
                        , tabindex 0
                        , attribute "aria-current" "page"
                        , class
                            ("inline-block p-4 text-blue-600 rounded-t-lg dark:text-blue-500"
                                ++ (if tab == active then
                                        "  bg-gray-200 dark:bg-gray-800 border-b border-gray-200 -mb-1"

                                    else
                                        ""
                                   )
                            )
                        , onClick (SetViewMode tab)
                        ]
                        [ content ]
                    ]
            )
            tabs
        )


viewFormPreview : List (Html.Attribute Msg) -> { a | formFields : Array FormField } -> Html Msg
viewFormPreview customAttrs { formFields } =
    div []
        [ div []
            (Array.toList (Array.map (viewFormFieldPreview customAttrs) formFields))
        ]


viewFormFieldPreview : List (Html.Attribute Msg) -> FormField -> Html Msg
viewFormFieldPreview customAttrs formField =
    div [ class "grid grid-rows-[auto_auto_1fr_auto] gap-2 mb-4" ]
        [ div [ class "field-group mb-2" ]
            [ label [ class "text-sm text-gray-600" ]
                [ text formField.label
                , if formField.required then
                    text ""

                  else
                    text " (optional)"
                ]
            , viewFormFieldOptionsPreview customAttrs formField
            , div [ class "mt-1 text-xs text-gray-600" ]
                [ text formField.description
                , case maybeMaxLengthOf formField of
                    Just maxLength ->
                        text (" (max " ++ String.fromInt maxLength ++ " characters)")

                    Nothing ->
                        text ""
                ]
            ]
        ]


maybeMaxLengthOf : FormField -> Maybe Int
maybeMaxLengthOf formField =
    case formField.type_ of
        ShortText _ maybeMaxLength ->
            maybeMaxLength

        LongText maybeMaxLength ->
            maybeMaxLength

        _ ->
            Nothing


viewFormFieldOptionsPreview : List (Html.Attribute Msg) -> FormField -> Html Msg
viewFormFieldOptionsPreview customAttrs formField =
    case formField.type_ of
        ShortText inputType maybeMaxLength ->
            let
                extraAttrs =
                    case maybeMaxLength of
                        Just maxLength ->
                            [ maxlength maxLength ]

                        Nothing ->
                            []
            in
            input
                ([ type_ inputType
                 , class "border border-gray-300 p-2 w-full rounded"
                 , name formField.label
                 , required formField.required
                 , placeholder " "
                 ]
                    ++ extraAttrs
                    ++ customAttrs
                )
                []

        LongText maybeMaxLength ->
            let
                extraAttrs =
                    case maybeMaxLength of
                        Just maxLength ->
                            [ maxlength maxLength ]

                        Nothing ->
                            []
            in
            textarea
                ([ class "border border-gray-300 p-2 w-full rounded"
                 , name formField.label
                 , required formField.required
                 , placeholder " "
                 ]
                    ++ extraAttrs
                    ++ customAttrs
                )
                []

        ChooseOne choices ->
            div [ class "grid" ]
                [ selectArrowDown
                , select
                    [ class "appearance-none forced-colors:appearance-auto border row-start-1 col-start-1 bg-slate-50 dark:bg-slate-800 hover:border-cyan-500 dark:hover:border-cyan-700 hover:bg-white dark:hover:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 p-2 rounded"
                    , name formField.label
                    , required formField.required
                    ]
                    (List.map
                        (\choice ->
                            option
                                (value choice :: customAttrs)
                                [ text choice ]
                        )
                        choices
                    )
                ]

        ChooseMultiple choices ->
            -- checkboxes
            div [ class "grid" ]
                [ div [ class "grid grid-cols-1 gap-2" ]
                    (List.map
                        (\choice ->
                            div [ class "flex items center" ]
                                [ label [ class "text-sm text-gray-600" ]
                                    [ input
                                        ([ type_ "checkbox"
                                         , tabindex 0
                                         , class "border border-gray-300 p-2"
                                         , name formField.label
                                         , value choice
                                         ]
                                            ++ customAttrs
                                        )
                                        []
                                    , text " "
                                    , text choice
                                    ]
                                ]
                        )
                        choices
                    )
                ]



--


viewFormBuilder : { a | formFields : Array FormField } -> Html Msg
viewFormBuilder { formFields } =
    div []
        [ div []
            (Array.toList (Array.indexedMap (viewFormFieldBuilder (Array.length formFields)) formFields))
        , div [ class "mt-4" ]
            (allInputField
                |> List.map
                    (\inputField ->
                        button
                            [ type_ "button"
                            , tabindex 0
                            , class "text-sm bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2 mb-2"
                            , onClick (AddFormField inputField)
                            ]
                            [ text ("+ " ++ stringFromInputField inputField)
                            ]
                    )
            )
        ]


selectArrowDown : Html msg
selectArrowDown =
    svg
        [ SvgAttr.class "pointer-events-none z-10 right-1 relative col-start-1 row-start-1 h-4 w-4 mr-2 self-center justify-self-end forced-colors:hidden"
        , SvgAttr.viewBox "0 0 16 16"
        , SvgAttr.fill "currentColor"
        , attribute "aria-hidden" "true"
        ]
        [ path
            [ SvgAttr.fillRule "evenodd"
            , SvgAttr.d "M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
            , SvgAttr.clipRule "evenodd"
            ]
            []
        ]


viewFormFieldBuilder : Int -> Int -> FormField -> Html Msg
viewFormFieldBuilder totalLength index formField =
    let
        idSuffix =
            String.fromInt index
    in
    div [ class "grid grid-rows-[auto_auto_1fr_auto] gap-2" ]
        [ div [ class "field-group mb-2" ]
            [ label [ class "text-xs text-gray-600", for ("label-" ++ idSuffix) ] [ text (stringFromInputField formField.type_ ++ " label") ]
            , input
                [ type_ "text"
                , id ("label-" ++ idSuffix)
                , required True
                , minlength 1
                , class "border border-gray-300 p-2 w-full rounded"
                , placeholder "Label"
                , value formField.label
                , onInput (OnFormField OnLabelInput index)
                ]
                []
            ]
        , div [ class "field-group mb-2" ]
            [ label [ class "text-sm text-gray-600", for ("required-" ++ idSuffix) ]
                [ input
                    [ id ("required-" ++ idSuffix)
                    , type_ "checkbox"
                    , tabindex 0
                    , class "border border-gray-300 p-2"
                    , checked formField.required
                    , onCheck (\b -> OnFormField (OnRequiredInput b) index "")
                    ]
                    []
                , text " Required field"
                ]
            ]
        , viewFormFieldOptionsBuilder index formField.type_
        , div [ class "field-group mb-2" ]
            [ label [ class "text-xs text-gray-600", for ("description-" ++ idSuffix) ] [ text "Description (optional)" ]
            , input
                [ id ("description-" ++ idSuffix)
                , class "border border-gray-300 p-2 w-full rounded"
                , value formField.description
                , onInput (OnFormField OnDescriptionInput index)
                ]
                []
            ]
        , div [ class "flex justify-between items-end mb-16" ]
            [ div [ class "flex space-x-2" ]
                [ if index == 0 then
                    text ""

                  else
                    button
                        [ type_ "button"
                        , tabindex 0
                        , class "text-xs bg-gray-200 hover:bg-gray-400 text-gray-600 px-4 py-2 rounded"
                        , title "Move field up"
                        , onClick (MoveFormFieldUp index)
                        ]
                        [ text "↑" ]
                , if index == totalLength - 1 then
                    text ""

                  else
                    button
                        [ type_ "button"
                        , tabindex 0
                        , class "text-xs bg-gray-200 hover:bg-gray-400 text-gray-600 px-4 py-2 rounded"
                        , title "Move field down"
                        , onClick (MoveFormFieldDown index)
                        ]
                        [ text "↓" ]
                ]
            , button
                [ type_ "button"
                , tabindex 0
                , class "text-xs bg-gray-200 hover:bg-gray-400 text-red-700 px-4 py-2 rounded"
                , title "Delete field"
                , onClick (DeleteFormField index)
                ]
                [ text "⨯ Delete" ]
            ]
        ]


viewFormFieldOptionsBuilder : Int -> InputField -> Html Msg
viewFormFieldOptionsBuilder index fieldType =
    let
        idSuffix =
            String.fromInt index
    in
    case fieldType of
        ShortText _ maybeMaxLength ->
            div []
                [ div [ class "field-group mb-2" ]
                    [ label [ class "text-xs text-gray-600", for ("placeholder-" ++ idSuffix) ] [ text "Max length (optional)" ]
                    , input
                        [ id ("placeholder-" ++ idSuffix)
                        , type_ "number"
                        , class "border border-gray-300 p-2 w-full rounded"
                        , value (Maybe.map String.fromInt maybeMaxLength |> Maybe.withDefault "")
                        , onInput (OnFormField OnMaxLengthInput index)
                        ]
                        []
                    ]
                ]

        LongText maybeMaxLength ->
            div []
                [ div [ class "field-group mb-2" ]
                    [ label [ class "text-xs text-gray-600", for ("placeholder-" ++ idSuffix) ] [ text "Max length (optional)" ]
                    , input
                        [ id ("placeholder-" ++ idSuffix)
                        , type_ "number"
                        , class "border border-gray-300 p-2 w-full rounded"
                        , value (Maybe.map String.fromInt maybeMaxLength |> Maybe.withDefault "")
                        , onInput (OnFormField OnMaxLengthInput index)
                        ]
                        []
                    ]
                ]

        ChooseOne choices ->
            div []
                [ div [ class "field-group mb-2" ]
                    [ label [ class "text-xs text-gray-600", for ("choices-" ++ idSuffix) ] [ text "Choices" ]
                    , textarea
                        [ id ("choices-" ++ idSuffix)
                        , required True
                        , minlength 1
                        , class "border border-gray-300 p-2 w-full rounded"
                        , placeholder "Enter one choice per line"
                        , value (String.join "\n" choices)
                        , onInput (OnFormField OnChoicesInput index)
                        ]
                        []
                    ]
                ]

        ChooseMultiple choices ->
            div []
                [ div [ class "field-group mb-2" ]
                    [ label [ class "text-xs text-gray-600", for ("choices-" ++ idSuffix) ] [ text "Choices" ]
                    , textarea
                        [ id ("choices-" ++ idSuffix)
                        , required True
                        , minlength 1
                        , class "border border-gray-300 p-2 w-full rounded"
                        , placeholder "Enter one choice per line"
                        , value (String.join "\n" choices)
                        , onInput (OnFormField OnChoicesInput index)
                        ]
                        []
                    ]
                ]



--  ENCODERS DECODERS


encodeFormFields : Array FormField -> Json.Encode.Value
encodeFormFields formFields =
    formFields
        |> Array.toList
        |> List.map
            (\formField ->
                Json.Encode.object
                    [ ( "label", Json.Encode.string formField.label )
                    , ( "required", Json.Encode.bool formField.required )
                    , ( "description", Json.Encode.string formField.description )
                    , ( "type", encodeInputField formField.type_ )
                    ]
            )
        |> Json.Encode.list identity


decodeFormFields : Json.Decode.Decoder (Array FormField)
decodeFormFields =
    Json.Decode.list decodeFormField
        |> Json.Decode.map Array.fromList


decodeFormField : Json.Decode.Decoder FormField
decodeFormField =
    Json.Decode.succeed FormField
        |> andMap (Json.Decode.field "label" Json.Decode.string)
        |> andMap (Json.Decode.field "required" Json.Decode.bool)
        |> andMap (Json.Decode.field "description" Json.Decode.string)
        |> andMap (Json.Decode.field "type" decodeInputField)


encodeInputField : InputField -> Json.Encode.Value
encodeInputField inputField =
    case inputField of
        ShortText inputType maybeMaxLength ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "ShortText" )
                , ( "inputType", Json.Encode.string inputType )
                , ( "maxLength", maybeMaxLength |> Maybe.map Json.Encode.int |> Maybe.withDefault Json.Encode.null )
                ]

        LongText maybeMaxLength ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "LongText" )
                , ( "maxLength", maybeMaxLength |> Maybe.map Json.Encode.int |> Maybe.withDefault Json.Encode.null )
                ]

        ChooseOne choices ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "ChooseOne" )
                , ( "choices", Json.Encode.list Json.Encode.string choices )
                ]

        ChooseMultiple choices ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "ChooseMultiple" )
                , ( "choices", Json.Encode.list Json.Encode.string choices )
                ]


decodeInputField : Json.Decode.Decoder InputField
decodeInputField =
    Json.Decode.field "type" Json.Decode.string
        |> Json.Decode.andThen
            (\type_ ->
                case type_ of
                    "ShortText" ->
                        Json.Decode.succeed ShortText
                            |> andMap (Json.Decode.field "inputType" Json.Decode.string)
                            |> andMap (Json.Decode.field "maxLength" (Json.Decode.nullable Json.Decode.int))

                    "LongText" ->
                        Json.Decode.succeed LongText
                            |> andMap (Json.Decode.field "maxLength" (Json.Decode.nullable Json.Decode.int))

                    "ChooseOne" ->
                        Json.Decode.field "choices" (Json.Decode.list Json.Decode.string)
                            |> Json.Decode.map ChooseOne

                    "ChooseMultiple" ->
                        Json.Decode.field "choices" (Json.Decode.list Json.Decode.string)
                            |> Json.Decode.map ChooseMultiple

                    _ ->
                        Json.Decode.fail ("Unknown input field type: " ++ type_)
            )
