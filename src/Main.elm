port module Main exposing
    ( FormField
    , InputField(..)
    , ViewMode(..)
    , allInputField
    , decodeFormFields
    , decodeShortTextTypeList
    , encodeFormFields
    , main
    , stringFromViewMode
    , viewModeFromString
    )

import Array exposing (Array)
import Browser
import Dict exposing (Dict)
import Html exposing (Html, a, button, div, input, label, li, option, select, text, textarea, ul)
import Html.Attributes exposing (attribute, checked, class, disabled, for, id, maxlength, minlength, name, placeholder, required, selected, tabindex, title, type_, value)
import Html.Events exposing (onCheck, onClick, onInput)
import Json.Decode
import Json.Decode.Extra exposing (andMap)
import Json.Encode
import Svg exposing (path, svg)
import Svg.Attributes as SvgAttr


port outgoing : Json.Encode.Value -> Cmd msg


port incoming : (Json.Encode.Value -> msg) -> Sub msg


main : Program Flags Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Flags =
    { viewModeString : Maybe String
    , formFields : Maybe Json.Encode.Value
    , formValues : Json.Encode.Value
    , shortTextTypeList : Json.Encode.Value
    }


type alias Model =
    { viewMode : ViewMode
    , formFields : Array FormField
    , formValues : Json.Encode.Value
    , shortTextTypeList : List ( String, Dict String String )
    , shortTextTypeDict : Dict String (Dict String String)
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


stringFromViewMode : ViewMode -> String
stringFromViewMode viewMode =
    case viewMode of
        Editor ->
            "Editor"

        Preview ->
            "Preview"

        CollectData ->
            "CollectData"


type alias FormField =
    { label : String
    , name : Maybe String
    , required : Bool
    , description : String
    , type_ : InputField

    -- not an attribute on the input field itself, but for the Editor ui
    -- `Maybe Bool` because it's easier to encodeFormFields
    , fixed : Maybe Bool
    }


type InputField
    = ShortText String (Maybe Int)
    | LongText (Maybe Int)
    | Dropdown (List String)
    | ChooseOne (List String)
    | ChooseMultiple (List String)


allInputField : List InputField
allInputField =
    [ ShortText "Text" Nothing
    , LongText (Just 160)
    , Dropdown [ "Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet" ]
    , ChooseOne [ "Yes", "No" ]
    , ChooseMultiple [ "Apple", "Banana", "Cantaloupe", "Durian" ]
    ]


stringFromInputField : InputField -> String
stringFromInputField inputField =
    case inputField of
        ShortText inputType _ ->
            inputType

        LongText _ ->
            "Long text"

        Dropdown _ ->
            "Dropdown"

        ChooseOne _ ->
            "Radio buttons"

        ChooseMultiple _ ->
            "Checkboxes"


type Msg
    = OnPortIncoming Json.Encode.Value
    | SetViewMode ViewMode
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
    | OnShortTextType



-- INIT


init : Flags -> ( Model, Cmd Msg )
init flags =
    let
        ( initFormFields, initCmd ) =
            case Maybe.map (Json.Decode.decodeValue decodeFormFields) flags.formFields of
                Nothing ->
                    ( Array.empty, Cmd.none )

                Just (Ok formFields) ->
                    ( formFields, outgoing (encodePortOutgoingValue (PortOutgoingFormFields formFields)) )

                Just (Err err) ->
                    let
                        _ =
                            Debug.log "decode formFields" err
                    in
                    ( Array.empty, Cmd.none )

        shortTextTypeList =
            case Json.Decode.decodeValue decodeShortTextTypeList flags.shortTextTypeList of
                Ok dict ->
                    dict

                Err err ->
                    let
                        _ =
                            Debug.log "decodeShortTypeText" (Json.Decode.errorToString err)
                    in
                    [ ( "Text", Dict.fromList [ ( "type", "text" ) ] ) ]
    in
    ( { viewMode =
            flags.viewModeString
                |> Maybe.andThen viewModeFromString
                |> mapNothing (\() -> Debug.log "invalid viewModeString" flags.viewModeString)
                |> Maybe.withDefault Editor
      , formFields = initFormFields
      , formValues = flags.formValues
      , shortTextTypeList = shortTextTypeList
      , shortTextTypeDict = Dict.fromList shortTextTypeList
      }
    , initCmd
    )



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        OnPortIncoming value ->
            case Json.Decode.decodeValue decodePortIncomingValue value of
                Ok (PortIncomingViewMode viewMode) ->
                    ( { model | viewMode = viewMode }
                    , Cmd.none
                    )

                Err _ ->
                    ( model, Cmd.none )

        SetViewMode viewMode ->
            ( { model
                | viewMode = viewMode
              }
            , outgoing (encodePortOutgoingValue (PortOutgoingViewMode viewMode))
            )

        AddFormField fieldType ->
            let
                newFormField : FormField
                newFormField =
                    { label = stringFromInputField fieldType ++ " " ++ String.fromInt (Array.length model.formFields + 1)
                    , name = Nothing
                    , required = True
                    , description = ""
                    , type_ = fieldType
                    , fixed = Nothing
                    }

                newFormFields =
                    Array.push newFormField model.formFields
            in
            ( { model | formFields = newFormFields }
            , outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
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
            , outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
            )

        MoveFormFieldUp index ->
            let
                newFormFields =
                    swapArrayIndex index (index - 1) model.formFields
            in
            ( { model | formFields = newFormFields }
            , outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
            )

        MoveFormFieldDown index ->
            let
                newFormFields =
                    swapArrayIndex index (index + 1) model.formFields
            in
            ( { model | formFields = newFormFields }
            , outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
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
            , outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
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

                Dropdown _ ->
                    { formField | type_ = Dropdown (String.lines string) }

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

                Dropdown _ ->
                    formField

                ChooseOne _ ->
                    formField

                ChooseMultiple _ ->
                    formField

        OnShortTextType ->
            case formField.type_ of
                ShortText _ maybeMaxLength ->
                    { formField | type_ = ShortText string maybeMaxLength }

                _ ->
                    formField


subscriptions : Model -> Sub Msg
subscriptions _ =
    incoming OnPortIncoming



--


mapNothing : (() -> b) -> Maybe a -> Maybe a
mapNothing f maybeValue =
    case maybeValue of
        Just value ->
            Just value

        Nothing ->
            let
                _ =
                    f ()
            in
            Nothing


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
    -- no padding; easier for embedders to style
    div [ class ("tff tff-mode-" ++ stringFromViewMode model.viewMode) ]
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
                ]
                    ++ viewFormBuilder model

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
                ]
                    ++ viewFormPreview [ disabled True ] model

            CollectData ->
                viewFormPreview [] model
        )


viewTabs : ViewMode -> List ( ViewMode, Html Msg ) -> Html Msg
viewTabs active tabs =
    ul
        [ class "tff-tabs"
        ]
        (List.map
            (\( tab, content ) ->
                li []
                    [ button
                        [ type_ "button"
                        , tabindex 0
                        , attribute "aria-current" "page"
                        , class
                            (if tab == active then
                                "tff-tabs-active"

                             else
                                "tff-tabs-inactive"
                            )
                        , onClick (SetViewMode tab)
                        ]
                        [ content ]
                    ]
            )
            tabs
        )


viewFormPreview : List (Html.Attribute Msg) -> { a | formFields : Array FormField, formValues : Json.Encode.Value, shortTextTypeDict : Dict String (Dict String String) } -> List (Html Msg)
viewFormPreview customAttrs { formFields, formValues, shortTextTypeDict } =
    Array.toList (Array.map (viewFormFieldPreview { customAttrs = customAttrs, formValues = formValues, shortTextTypeDict = shortTextTypeDict }) formFields)


when : Bool -> { true : a, false : a } -> a
when bool condition =
    if bool then
        condition.true

    else
        condition.false


viewFormFieldPreview : { formValues : Json.Encode.Value, customAttrs : List (Html.Attribute Msg), shortTextTypeDict : Dict String (Dict String String) } -> FormField -> Html Msg
viewFormFieldPreview config formField =
    div [ class "tff-tabs-preview" ]
        [ div
            [ class ("tff-field-group" ++ when formField.required { true = " tff-required", false = "" }) ]
            [ label [ class "tff-field-label" ]
                [ text formField.label
                , if formField.required then
                    text ""

                  else
                    text " (optional)"
                ]
            , viewFormFieldOptionsPreview config formField
            , div [ class "tff-field-description" ]
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


viewFormFieldOptionsPreview : { formValues : Json.Encode.Value, customAttrs : List (Html.Attribute Msg), shortTextTypeDict : Dict String (Dict String String) } -> FormField -> Html Msg
viewFormFieldOptionsPreview { formValues, customAttrs, shortTextTypeDict } formField =
    let
        fieldName =
            Maybe.withDefault formField.label formField.name
    in
    case formField.type_ of
        ShortText inputType maybeMaxLength ->
            let
                shortTextAttrs =
                    Dict.get inputType shortTextTypeDict
                        |> Maybe.withDefault Dict.empty
                        |> Dict.toList
                        |> List.map (\( k, v ) -> attribute k v)

                extraAttrs =
                    [ Maybe.map (\maxLength -> maxlength maxLength) maybeMaxLength
                    , Maybe.map (\s -> value s) (maybeDecode fieldName Json.Decode.string formValues)
                    ]
                        |> List.filterMap identity
            in
            input
                ([ class "tff-text-field"
                 , name fieldName
                 , required formField.required
                 , placeholder " "
                 ]
                    ++ shortTextAttrs
                    ++ extraAttrs
                    ++ customAttrs
                )
                []

        LongText maybeMaxLength ->
            let
                extraAttrs =
                    [ Maybe.map (\maxLength -> maxlength maxLength) maybeMaxLength
                    , Maybe.map (\s -> value s) (maybeDecode fieldName Json.Decode.string formValues)
                    ]
                        |> List.filterMap identity
            in
            textarea
                ([ class "tff-text-field"
                 , name fieldName
                 , required formField.required
                 , placeholder " "
                 ]
                    ++ extraAttrs
                    ++ customAttrs
                )
                []

        Dropdown choices ->
            let
                valueString =
                    maybeDecode fieldName Json.Decode.string formValues
            in
            div [ class "tff-dropdown-group" ]
                [ selectArrowDown
                , select
                    [ name fieldName

                    -- when we're disabling `<select>` we actually only
                    -- want to disable the `<option>`s so user can see the options but cannot choose
                    -- but if the `<select>` is required, then now we are in a bind
                    -- so we cannot have `required` on the `<select>` if we're disabling it
                    , if List.member (disabled True) customAttrs then
                        class "tff-select-disabled"

                      else
                        required formField.required
                    ]
                    (option
                        ([ disabled True
                         , selected (valueString == Nothing)
                         , attribute "value" ""
                         ]
                            ++ customAttrs
                        )
                        [ text "-- Select an option --" ]
                        :: List.map
                            (\choice ->
                                option
                                    (value choice
                                        :: selected (valueString == Just choice)
                                        :: customAttrs
                                    )
                                    [ text choice ]
                            )
                            choices
                    )
                ]

        ChooseOne choices ->
            let
                valueString =
                    maybeDecode fieldName Json.Decode.string formValues
            in
            -- radio buttons
            div [ class "tff-chooseone-group" ]
                [ div [ class "tff-chooseone-radiobuttons" ]
                    (List.map
                        (\choice ->
                            div [ class "tff-radiobuttons-group" ]
                                [ label [ class "tff-field-label" ]
                                    [ input
                                        ([ type_ "radio"
                                         , tabindex 0
                                         , name fieldName
                                         , value choice
                                         , checked (valueString == Just choice)
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

        ChooseMultiple choices ->
            let
                values =
                    maybeDecode fieldName (Json.Decode.list Json.Decode.string) formValues
                        |> Maybe.withDefault []
            in
            -- checkboxes
            div [ class "tff-choosemany-group" ]
                [ div [ class "tff-choosemany-checkboxes" ]
                    (List.map
                        (\choice ->
                            div [ class "tff-checkbox-group" ]
                                [ label [ class "tff-field-label" ]
                                    [ input
                                        ([ type_ "checkbox"
                                         , tabindex 0
                                         , name fieldName
                                         , value choice
                                         , checked (List.member choice values)
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


viewFormBuilder : { a | formFields : Array FormField, shortTextTypeList : List ( String, Dict String String ) } -> List (Html Msg)
viewFormBuilder { formFields, shortTextTypeList } =
    [ div [ class "tff-build-fields" ]
        (Array.toList (Array.indexedMap (viewFormFieldBuilder shortTextTypeList (Array.length formFields)) formFields))
    , div [ class "tff-add-fields" ]
        (allInputField
            |> List.map
                (\inputField ->
                    button
                        [ type_ "button"
                        , tabindex 0
                        , class "tff-add-field-button"
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
        [ SvgAttr.viewBox "0 0 16 16"
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


viewFormFieldBuilder : List ( String, Dict String String ) -> Int -> Int -> FormField -> Html Msg
viewFormFieldBuilder shortTextTypeList totalLength index formField =
    let
        idSuffix =
            String.fromInt index
    in
    div [ class "tff-build-field" ]
        ([ div [ class "tff-field-group" ]
            [ label [ class "tff-field-label", for ("label-" ++ idSuffix) ] [ text (stringFromInputField formField.type_ ++ " label") ]
            , input
                [ type_ "text"
                , id ("label-" ++ idSuffix)
                , required True
                , minlength 1
                , class "tff-text-field"
                , placeholder "Label"
                , value formField.label
                , onInput (OnFormField OnLabelInput index)
                ]
                []
            , label [ class "tff-field-label", for ("required-" ++ idSuffix) ]
                [ input
                    [ id ("required-" ++ idSuffix)
                    , type_ "checkbox"
                    , tabindex 0
                    , checked formField.required
                    , onCheck (\b -> OnFormField (OnRequiredInput b) index "")
                    ]
                    []
                , text " Required field"
                ]
            ]
         , div [ class "tff-field-group" ]
            [ label [ class "tff-field-label", for ("description-" ++ idSuffix) ] [ text "Description (optional)" ]
            , input
                [ id ("description-" ++ idSuffix)
                , class "tff-text-field"
                , value formField.description
                , onInput (OnFormField OnDescriptionInput index)
                ]
                []
            ]
         ]
            ++ viewFormFieldOptionsBuilder shortTextTypeList index formField.type_
            ++ [ div [ class "tff-build-field-buttons" ]
                    [ div [ class "tff-move" ]
                        [ if index == 0 then
                            text ""

                          else
                            button
                                [ type_ "button"
                                , tabindex 0
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
                                , title "Move field down"
                                , onClick (MoveFormFieldDown index)
                                ]
                                [ text "↓" ]
                        ]
                    , case formField.fixed of
                        Just True ->
                            text ""

                        _ ->
                            button
                                [ type_ "button"
                                , tabindex 0
                                , class "tff-delete"
                                , title "Delete field"
                                , onClick (DeleteFormField index)
                                ]
                                [ text "⨯ Delete" ]
                    ]
               ]
        )


viewFormFieldOptionsBuilder : List ( String, Dict String String ) -> Int -> InputField -> List (Html Msg)
viewFormFieldOptionsBuilder shortTextTypeList index fieldType =
    let
        idSuffix =
            String.fromInt index
    in
    case fieldType of
        ShortText inputType maybeMaxLength ->
            let
                maybeShortTextTypeMaxLength =
                    shortTextTypeList
                        |> List.filter (\( k, _ ) -> k == inputType)
                        |> List.head
                        |> Maybe.map Tuple.second
                        |> Maybe.andThen (Dict.get "minlength")
                        |> Maybe.andThen String.toInt
            in
            [ div [ class "tff-field-group" ]
                [ label [ class "tff-field-label", for ("inputType-" ++ idSuffix) ] [ text "Type" ]
                , div [ class "tff-dropdown-group" ]
                    [ selectArrowDown
                    , select
                        [ required True
                        , name ("inputType-" ++ idSuffix)
                        , onInput (OnFormField OnShortTextType index)
                        ]
                        (List.map
                            (\choice ->
                                option
                                    [ value choice
                                    , selected (inputType == choice)
                                    ]
                                    [ text choice ]
                            )
                            (List.map Tuple.first shortTextTypeList)
                        )
                    ]
                ]
            , case maybeShortTextTypeMaxLength of
                Nothing ->
                    div [ class "tff-field-group" ]
                        [ label [ class "tff-field-label", for ("maxlength-" ++ idSuffix) ] [ text "Max length (optional)" ]
                        , input
                            [ id ("maxlength-" ++ idSuffix)
                            , type_ "number"
                            , class "tff-text-field"
                            , value (Maybe.map String.fromInt maybeMaxLength |> Maybe.withDefault "")
                            , onInput (OnFormField OnMaxLengthInput index)
                            ]
                            []
                        ]

                Just i ->
                    input [ type_ "hidden", name ("maxlength-" ++ idSuffix), value (String.fromInt i) ] []
            ]

        LongText maybeMaxLength ->
            [ div [ class "tff-field-group" ]
                [ label [ class "tff-field-label", for ("maxlength-" ++ idSuffix) ] [ text "Max length (optional)" ]
                , input
                    [ id ("maxlength-" ++ idSuffix)
                    , type_ "number"
                    , class "tff-text-field"
                    , value (Maybe.map String.fromInt maybeMaxLength |> Maybe.withDefault "")
                    , onInput (OnFormField OnMaxLengthInput index)
                    ]
                    []
                ]
            ]

        Dropdown choices ->
            [ div [ class "tff-field-group" ]
                [ label [ class "tff-field-label", for ("choices-" ++ idSuffix) ] [ text "Choices" ]
                , textarea
                    [ id ("choices-" ++ idSuffix)
                    , required True
                    , minlength 1
                    , class "tff-text-field"
                    , placeholder "Enter one choice per line"
                    , value (String.join "\n" choices)
                    , onInput (OnFormField OnChoicesInput index)
                    ]
                    []
                ]
            ]

        ChooseOne choices ->
            [ div [ class "tff-field-group" ]
                [ label [ class "tff-field-label", for ("choices-" ++ idSuffix) ] [ text "Choices" ]
                , textarea
                    [ id ("choices-" ++ idSuffix)
                    , required True
                    , minlength 1
                    , class "tff-text-field"
                    , placeholder "Enter one choice per line"
                    , value (String.join "\n" choices)
                    , onInput (OnFormField OnChoicesInput index)
                    ]
                    []
                ]
            ]

        ChooseMultiple choices ->
            [ div [ class "tff-field-group" ]
                [ label [ class "tff-field-label", for ("choices-" ++ idSuffix) ] [ text "Choices" ]
                , textarea
                    [ id ("choices-" ++ idSuffix)
                    , required True
                    , minlength 1
                    , class "tff-text-field"
                    , placeholder "Enter one choice per line"
                    , value (String.join "\n" choices)
                    , onInput (OnFormField OnChoicesInput index)
                    ]
                    []
                ]
            ]



-- PORT


type PortOutgoingValue
    = PortOutgoingFormFields (Array FormField)
    | PortOutgoingViewMode ViewMode


encodePortOutgoingValue : PortOutgoingValue -> Json.Encode.Value
encodePortOutgoingValue value =
    case value of
        PortOutgoingFormFields formFields ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "formFields" )
                , ( "formFields", encodeFormFields formFields )
                ]

        PortOutgoingViewMode viewMode ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "viewMode" )
                , ( "viewMode", Json.Encode.string (stringFromViewMode viewMode) )
                ]


type PortIncomingValue
    = PortIncomingViewMode ViewMode


decodePortIncomingValue : Json.Decode.Decoder PortIncomingValue
decodePortIncomingValue =
    Json.Decode.field "type" Json.Decode.string
        |> Json.Decode.andThen
            (\type_ ->
                case type_ of
                    "viewMode" ->
                        -- app.ports.incoming.send({ type: "viewMode", viewMode: "Preview" })
                        Json.Decode.field "viewMode" Json.Decode.string
                            |> Json.Decode.andThen
                                (\viewModeString ->
                                    case viewModeFromString viewModeString of
                                        Just viewMode ->
                                            Json.Decode.succeed (PortIncomingViewMode viewMode)

                                        Nothing ->
                                            Json.Decode.fail ("Unknown view mode: " ++ viewModeString)
                                )

                    _ ->
                        Json.Decode.fail ("Unknown port event type: " ++ type_)
            )



--  ENCODERS DECODERS


maybeDecode : String -> Json.Decode.Decoder b -> Json.Decode.Value -> Maybe b
maybeDecode key decoder jsonValue =
    Json.Decode.decodeValue (Json.Decode.Extra.optionalField key decoder) jsonValue
        |> Result.toMaybe
        |> Maybe.andThen identity


encodeMaybe : (a -> Json.Encode.Value) -> Maybe a -> Json.Encode.Value
encodeMaybe encode maybeValue =
    case maybeValue of
        Just value ->
            encode value

        Nothing ->
            Json.Encode.null


encodeFormFields : Array FormField -> Json.Encode.Value
encodeFormFields formFields =
    formFields
        |> Array.toList
        |> List.map
            (\formField ->
                Json.Encode.object
                    ([ ( "label", Json.Encode.string formField.label )
                     , ( "name", encodeMaybe Json.Encode.string formField.name )
                     , ( "required", Json.Encode.bool formField.required )
                     , ( "description", Json.Encode.string formField.description )
                     , ( "type", encodeInputField formField.type_ )
                     , ( "fixed", encodeMaybe Json.Encode.bool formField.fixed )
                     ]
                        -- smaller output json than if we encoded `null` all the time
                        |> List.filter (\( _, v ) -> v /= Json.Encode.null)
                    )
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
        |> andMap (Json.Decode.Extra.optionalNullableField "name" Json.Decode.string)
        |> andMap (Json.Decode.field "required" Json.Decode.bool)
        |> andMap (Json.Decode.field "description" Json.Decode.string)
        |> andMap (Json.Decode.field "type" decodeInputField)
        |> andMap (Json.Decode.Extra.optionalNullableField "fixed" Json.Decode.bool)


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

        Dropdown choices ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "Dropdown" )
                , ( "choices", Json.Encode.list Json.Encode.string choices )
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

                    "Dropdown" ->
                        Json.Decode.field "choices" (Json.Decode.list Json.Decode.string)
                            |> Json.Decode.map Dropdown

                    "ChooseOne" ->
                        Json.Decode.field "choices" (Json.Decode.list Json.Decode.string)
                            |> Json.Decode.map ChooseOne

                    "ChooseMultiple" ->
                        Json.Decode.field "choices" (Json.Decode.list Json.Decode.string)
                            |> Json.Decode.map ChooseMultiple

                    _ ->
                        Json.Decode.fail ("Unknown input field type: " ++ type_)
            )


decodeShortTextTypeList : Json.Decode.Decoder (List ( String, Dict String String ))
decodeShortTextTypeList =
    Json.Decode.list (Json.Decode.dict (Json.Decode.dict Json.Decode.string))
        |> Json.Decode.map (List.map Dict.toList >> List.concat)
