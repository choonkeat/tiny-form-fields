port module Main exposing
    ( AttributeOptional(..)
    , Choice
    , FormField
    , InputField(..)
    , Presence(..)
    , ViewMode(..)
    , allInputField
    , choiceDelimiter
    , choiceFromString
    , choiceToString
    , decodeChoice
    , decodeFormField
    , decodeFormFields
    , decodeShortTextTypeList
    , encodeChoice
    , encodeFormFields
    , encodeInputField
    , main
    , stringFromViewMode
    , viewModeFromString
    )

import Array exposing (Array)
import Browser
import Browser.Dom
import Dict exposing (Dict)
import Html exposing (Html, a, button, div, h3, input, label, li, option, pre, select, text, textarea, ul)
import Html.Attributes exposing (attribute, checked, class, disabled, for, href, id, maxlength, minlength, name, placeholder, readonly, required, selected, tabindex, title, type_, value)
import Html.Events exposing (onCheck, onClick, onInput, preventDefaultOn, stopPropagationOn)
import Json.Decode
import Json.Decode.Extra exposing (andMap)
import Json.Encode
import Platform.Cmd as Cmd
import Process
import Svg exposing (path, svg)
import Svg.Attributes as SvgAttr
import Task


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
    Json.Encode.Value


type alias Config =
    { viewMode : ViewMode
    , formFields : Array FormField
    , formValues : Json.Encode.Value

    -- List because order matters
    , shortTextTypeList : List CustomElement
    }


type alias Model =
    { viewMode : ViewMode
    , initError : Maybe String
    , formFields : Array FormField
    , formValues : Json.Encode.Value

    -- List because order matters
    , shortTextTypeList : List CustomElement

    -- Dict to lookup by `inputType`
    , shortTextTypeDict : Dict String CustomElement
    , dropdownState : DropdownState
    }


type Animate
    = AnimateYellowFade
    | AnimateFadeOut


type ViewMode
    = Editor { maybeAnimate : Maybe ( Int, Animate ) }
    | Preview
    | CollectData


viewModeFromString : String -> Maybe ViewMode
viewModeFromString str =
    case str of
        "Editor" ->
            Just (Editor { maybeAnimate = Nothing })

        "Preview" ->
            Just Preview

        "CollectData" ->
            Just CollectData

        _ ->
            Nothing


stringFromViewMode : ViewMode -> String
stringFromViewMode viewMode =
    case viewMode of
        Editor _ ->
            "Editor"

        Preview ->
            "Preview"

        CollectData ->
            "CollectData"


type Presence
    = Required
    | Optional
    | System


requiredData : Presence -> Bool
requiredData presence =
    case presence of
        Required ->
            True

        Optional ->
            False

        System ->
            True


type alias FormField =
    { label : String
    , name : Maybe String
    , presence : Presence
    , description : AttributeOptional String
    , type_ : InputField
    }


type AttributeOptional a
    = AttributeNotNeeded (Maybe a)
    | AttributeInvalid String
    | AttributeGiven a


toggleAttributeOptional : Bool -> AttributeOptional a -> AttributeOptional a
toggleAttributeOptional toggle attributeOptional =
    case attributeOptional of
        AttributeNotNeeded Nothing ->
            if toggle then
                AttributeInvalid ""

            else
                attributeOptional

        AttributeNotNeeded (Just a) ->
            if toggle then
                AttributeGiven a

            else
                attributeOptional

        AttributeInvalid _ ->
            if toggle then
                attributeOptional

            else
                AttributeNotNeeded Nothing

        AttributeGiven a ->
            if toggle then
                AttributeGiven a

            else
                AttributeNotNeeded (Just a)


inputAttributeOptional :
    { onCheck : Bool -> msg
    , onInput : String -> msg
    , toString : a -> String
    , label : String
    , htmlNode : List (Html.Attribute msg) -> List (Html msg) -> Html msg
    , attrs : List (Html.Attribute msg)
    }
    -> AttributeOptional a
    -> Html msg
inputAttributeOptional options attributeOptional =
    case attributeOptional of
        AttributeNotNeeded _ ->
            div
                [ class "tff-toggle-group" ]
                [ label [ class "tff-field-label" ]
                    [ input
                        [ type_ "checkbox"
                        , tabindex 0
                        , checked False
                        , onCheck options.onCheck
                        ]
                        []
                    , text " "
                    , text options.label
                    ]
                ]

        AttributeInvalid str ->
            div
                [ class "tff-toggle-group" ]
                [ label [ class "tff-field-label" ]
                    [ input
                        [ type_ "checkbox"
                        , tabindex 0
                        , checked True
                        , onCheck options.onCheck
                        ]
                        []
                    , text " "
                    , text options.label
                    ]
                , options.htmlNode ([ required True, onInput options.onInput, value str ] ++ options.attrs) []
                ]

        AttributeGiven a ->
            div
                [ class "tff-toggle-group" ]
                [ label [ class "tff-field-label" ]
                    [ input
                        [ type_ "checkbox"
                        , tabindex 0
                        , checked True
                        , onCheck options.onCheck
                        ]
                        []
                    , text " "
                    , text options.label
                    ]
                , options.htmlNode ([ required True, onInput options.onInput, value (options.toString a) ] ++ options.attrs) []
                ]


type alias RawCustomElement =
    { inputType : String
    , inputTag : String
    , attributes : Dict String String
    }


type alias CustomElement =
    { inputType : String
    , inputTag : String
    , attributes : Dict String String
    , maxlength : AttributeOptional Int
    , datalist : AttributeOptional (List Choice)
    }


fromRawCustomElement : RawCustomElement -> CustomElement
fromRawCustomElement ele =
    { inputTag = ele.inputTag
    , inputType = ele.inputType
    , attributes =
        ele.attributes
            |> Dict.filter (\k v -> k /= "list" && not (String.contains "\n" v))
    , maxlength =
        case Dict.get "maxlength" ele.attributes of
            Just "" ->
                AttributeNotNeeded Nothing

            Just value ->
                case String.toInt value of
                    Just int ->
                        AttributeGiven int

                    Nothing ->
                        AttributeInvalid value

            _ ->
                AttributeNotNeeded Nothing
    , datalist =
        case Dict.get "list" ele.attributes of
            Just s ->
                case String.split "\n" (String.trim s) of
                    [] ->
                        AttributeNotNeeded Nothing

                    [ _ ] ->
                        AttributeNotNeeded Nothing

                    list ->
                        AttributeGiven (List.map choiceFromString list)

            Nothing ->
                AttributeNotNeeded Nothing
    }


toRawCustomElement : CustomElement -> RawCustomElement
toRawCustomElement ele =
    let
        addMaxLengthIfGiven dict =
            case ele.maxlength of
                AttributeGiven int ->
                    Dict.insert "maxlength" (String.fromInt int) dict

                _ ->
                    Dict.filter (\k _ -> k /= "maxlength") dict

        addDatalistIfGiven dict =
            case ele.datalist of
                AttributeGiven list ->
                    Dict.insert "list" (String.join "\n" (List.map choiceToString list)) dict

                _ ->
                    Dict.filter (\k _ -> k /= "list") dict
    in
    { inputTag = ele.inputTag
    , inputType = ele.inputType
    , attributes =
        ele.attributes
            |> addMaxLengthIfGiven
            |> addDatalistIfGiven
    }


type InputField
    = ShortText CustomElement
    | LongText (AttributeOptional Int)
    | Dropdown (List Choice)
    | ChooseOne (List Choice)
    | ChooseMultiple (List Choice)


type alias Choice =
    { label : String, value : String }


allInputField : List InputField
allInputField =
    [ Dropdown (List.map choiceFromString [ "Red", "Orange", "Yellow", "Green", "Blue", "Indigo", "Violet" ])
    , ChooseOne (List.map choiceFromString [ "Yes", "No" ])
    , ChooseMultiple (List.map choiceFromString [ "Apple", "Banana", "Cantaloupe", "Durian" ])
    , LongText (AttributeGiven 160)
    ]


stringFromInputField : InputField -> String
stringFromInputField inputField =
    case inputField of
        ShortText { inputType } ->
            inputType

        LongText _ ->
            "Multi-line description"

        Dropdown _ ->
            "Dropdown"

        ChooseOne _ ->
            "Radio buttons"

        ChooseMultiple _ ->
            "Checkboxes"


mustBeOptional : InputField -> Bool
mustBeOptional inputField =
    case inputField of
        ShortText { attributes } ->
            Dict.get "multiple" attributes == Just "true"

        LongText _ ->
            False

        Dropdown _ ->
            False

        ChooseOne _ ->
            False

        ChooseMultiple _ ->
            True


type Msg
    = OnPortIncoming Json.Encode.Value
    | SetViewMode ViewMode
    | AddFormField InputField
    | DeleteFormField Int
    | MoveFormFieldUp Int
    | MoveFormFieldDown Int
    | OnFormField FormFieldMsg Int String
    | ToggleDropdownState
    | SetEditorAnimate (Maybe ( Int, Animate ))
    | DoSleepDo Float (List Msg)


type FormFieldMsg
    = OnLabelInput
    | OnDescriptionInput
    | OnDescriptionToggle Bool
    | OnRequiredInput Bool
    | OnChoicesInput
    | OnMaxLengthToggle Bool
    | OnMaxLengthInput
    | OnDatalistToggle Bool
    | OnDatalistInput



-- INIT


init : Flags -> ( Model, Cmd Msg )
init flags =
    let
        defaultShortTextTypeList : List CustomElement
        defaultShortTextTypeList =
            [ fromRawCustomElement
                { inputType = "Single-line free text"
                , inputTag = defaultInputTag
                , attributes = Dict.fromList [ ( "type", "text" ) ]
                }
            ]

        defaultShortTextTypeListWithout : List CustomElement -> List CustomElement
        defaultShortTextTypeListWithout shortTextTypeList =
            List.filter (\a -> not (List.member a shortTextTypeList))
                defaultShortTextTypeList
    in
    case Json.Decode.decodeValue decodeConfig flags of
        Ok config ->
            let
                effectiveShortTextTypeList =
                    defaultShortTextTypeListWithout config.shortTextTypeList
                        ++ config.shortTextTypeList
            in
            ( { viewMode = config.viewMode
              , initError = Nothing
              , formFields = config.formFields
              , formValues = config.formValues
              , shortTextTypeList = effectiveShortTextTypeList
              , shortTextTypeDict =
                    effectiveShortTextTypeList
                        |> List.map (\customElement -> ( customElement.inputType, customElement ))
                        |> Dict.fromList
              , dropdownState = DropdownClosed
              }
            , Cmd.batch
                [ outgoing (encodePortOutgoingValue (PortOutgoingFormFields config.formFields))

                -- js could've just done `document.body.addEventListener` and `app.ports.incoming.send` anyways
                -- but we're sending out PortOutgoingSetupCloseDropdown to be surer that js would do it
                -- also, we now dictate what `app.ports.incoming.send` sends back: PortIncomingCloseDropdown
                , outgoing (encodePortOutgoingValue (PortOutgoingSetupCloseDropdown PortIncomingCloseDropdown))
                ]
            )

        Err err ->
            ( { viewMode = Editor { maybeAnimate = Nothing }
              , initError = Just (Json.Decode.errorToString err)
              , formFields = Array.empty
              , formValues = Json.Encode.null
              , shortTextTypeList = []
              , shortTextTypeDict = Dict.empty
              , dropdownState = DropdownClosed
              }
            , Cmd.none
            )



-- UPDATE


animateFadeDuration : Float
animateFadeDuration =
    500


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        OnPortIncoming value ->
            case Json.Decode.decodeValue decodePortIncomingValue value of
                Ok (PortIncomingViewMode viewMode) ->
                    ( { model | viewMode = viewMode }
                    , Cmd.none
                    )

                Ok PortIncomingCloseDropdown ->
                    ( { model | dropdownState = DropdownClosed }
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
                currLength =
                    Array.length model.formFields

                newFormField : FormField
                newFormField =
                    { label = "Question " ++ String.fromInt (currLength + 1)
                    , name = Nothing
                    , presence = when (mustBeOptional fieldType) { true = Optional, false = Required }
                    , description = AttributeNotNeeded Nothing
                    , type_ = fieldType
                    }

                newFormFields =
                    Array.push newFormField model.formFields
            in
            ( { model | formFields = newFormFields }
            , Cmd.batch
                [ outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
                , Browser.Dom.focus ("label-" ++ String.fromInt currLength)
                    |> Task.attempt
                        -- ignoring result of focus
                        -- and always returning `DoSleepDo...`
                        (always
                            (DoSleepDo animateFadeDuration
                                [ SetEditorAnimate (Just ( currLength, AnimateYellowFade ))
                                , SetEditorAnimate Nothing
                                ]
                            )
                        )
                ]
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
            , Cmd.batch
                [ outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
                , SetEditorAnimate Nothing
                    |> Task.succeed
                    |> Task.perform identity
                ]
            )

        MoveFormFieldUp index ->
            let
                newFormFields =
                    swapArrayIndex index (index - 1) model.formFields
            in
            ( { model | formFields = newFormFields }
            , Cmd.batch
                [ outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
                , DoSleepDo animateFadeDuration
                    [ SetEditorAnimate (Just ( index - 1, AnimateYellowFade ))
                    , SetEditorAnimate Nothing
                    ]
                    |> Task.succeed
                    |> Task.perform identity
                ]
            )

        MoveFormFieldDown index ->
            let
                newFormFields =
                    swapArrayIndex index (index + 1) model.formFields
            in
            ( { model | formFields = newFormFields }
            , Cmd.batch
                [ outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
                , DoSleepDo animateFadeDuration
                    [ SetEditorAnimate (Just ( index + 1, AnimateYellowFade ))
                    , SetEditorAnimate Nothing
                    ]
                    |> Task.succeed
                    |> Task.perform identity
                ]
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

        ToggleDropdownState ->
            ( { model
                | dropdownState =
                    case model.dropdownState of
                        DropdownOpen ->
                            DropdownClosed

                        DropdownClosed ->
                            DropdownOpen
              }
            , Cmd.none
            )

        SetEditorAnimate maybeAnimate ->
            ( { model | viewMode = Editor { maybeAnimate = maybeAnimate } }
            , Cmd.none
            )

        DoSleepDo _ [] ->
            ( model
            , Cmd.none
            )

        DoSleepDo duration (thisMsg :: nextMsgs) ->
            let
                ( newModel, newCmd ) =
                    update thisMsg model
            in
            ( newModel
            , Cmd.batch
                [ newCmd
                , Process.sleep duration
                    |> Task.perform (always (DoSleepDo duration nextMsgs))
                ]
            )


updateFormField : FormFieldMsg -> String -> FormField -> FormField
updateFormField msg string formField =
    case msg of
        OnLabelInput ->
            { formField | label = string }

        OnDescriptionInput ->
            if string == "" then
                { formField | description = AttributeInvalid "" }

            else
                { formField | description = AttributeGiven string }

        OnDescriptionToggle bool ->
            { formField | description = toggleAttributeOptional bool formField.description }

        OnRequiredInput bool ->
            if bool then
                { formField | presence = Required }

            else
                { formField | presence = Optional }

        OnChoicesInput ->
            case formField.type_ of
                ShortText _ ->
                    formField

                LongText _ ->
                    formField

                Dropdown _ ->
                    { formField | type_ = Dropdown (List.map choiceFromString (String.lines string)) }

                ChooseOne _ ->
                    { formField | type_ = ChooseOne (List.map choiceFromString (String.lines string)) }

                ChooseMultiple _ ->
                    { formField | type_ = ChooseMultiple (List.map choiceFromString (String.lines string)) }

        OnMaxLengthToggle bool ->
            case formField.type_ of
                ShortText customElement ->
                    let
                        newCustomElement =
                            { customElement | maxlength = toggleAttributeOptional bool customElement.maxlength }
                    in
                    { formField | type_ = ShortText newCustomElement }

                LongText maxlength ->
                    { formField | type_ = LongText (toggleAttributeOptional bool maxlength) }

                Dropdown _ ->
                    formField

                ChooseOne _ ->
                    formField

                ChooseMultiple _ ->
                    formField

        OnMaxLengthInput ->
            case formField.type_ of
                ShortText customElement ->
                    let
                        newCustomElement =
                            { customElement
                                | maxlength =
                                    case String.toInt string of
                                        Just i ->
                                            AttributeGiven i

                                        Nothing ->
                                            AttributeInvalid string
                            }
                    in
                    { formField | type_ = ShortText newCustomElement }

                LongText _ ->
                    let
                        newMaxlength =
                            case String.toInt string of
                                Just i ->
                                    AttributeGiven i

                                Nothing ->
                                    AttributeInvalid string
                    in
                    { formField | type_ = LongText newMaxlength }

                Dropdown _ ->
                    formField

                ChooseOne _ ->
                    formField

                ChooseMultiple _ ->
                    formField

        OnDatalistToggle bool ->
            case formField.type_ of
                ShortText customElement ->
                    let
                        newCustomElement =
                            { customElement | datalist = toggleAttributeOptional bool customElement.datalist }
                    in
                    { formField | type_ = ShortText newCustomElement }

                LongText _ ->
                    formField

                Dropdown _ ->
                    formField

                ChooseOne _ ->
                    formField

                ChooseMultiple _ ->
                    formField

        OnDatalistInput ->
            case formField.type_ of
                ShortText customElement ->
                    let
                        newCustomElement =
                            { customElement
                                | datalist =
                                    case String.split "\n" string of
                                        [] ->
                                            AttributeInvalid string

                                        [ _ ] ->
                                            AttributeInvalid string

                                        list ->
                                            AttributeGiven (List.map choiceFromString list)
                            }
                    in
                    { formField | type_ = ShortText newCustomElement }

                LongText _ ->
                    formField

                Dropdown _ ->
                    formField

                ChooseOne _ ->
                    formField

                ChooseMultiple _ ->
                    formField


subscriptions : Model -> Sub Msg
subscriptions _ =
    incoming OnPortIncoming



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
    case model.initError of
        Just errString ->
            div [ class "tff-error" ]
                [ h3 [] [ text "This form could not be initialized: " ]
                , pre [] [ text errString ]
                ]

        Nothing ->
            viewMain model


viewMain : Model -> Html Msg
viewMain model =
    -- no padding; easier for embedders to style
    div [ class ("tff tff-mode-" ++ stringFromViewMode model.viewMode) ]
        (case model.viewMode of
            Editor editorAttr ->
                [ viewTabs model.viewMode
                    [ ( Editor editorAttr, text "Editor" )
                    , ( Preview, text "Preview" )
                    ]
                , input
                    [ type_ "hidden"
                    , name "tiny-form-fields"
                    , value (Json.Encode.encode 0 (encodeFormFields model.formFields))
                    ]
                    []
                ]
                    ++ viewFormBuilder editorAttr.maybeAnimate model

            Preview ->
                [ viewTabs model.viewMode
                    [ ( Editor { maybeAnimate = Nothing }, text "Editor" )
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


viewFormPreview : List (Html.Attribute Msg) -> { a | formFields : Array FormField, formValues : Json.Encode.Value, shortTextTypeDict : Dict String CustomElement } -> List (Html Msg)
viewFormPreview customAttrs { formFields, formValues, shortTextTypeDict } =
    let
        config =
            { customAttrs = customAttrs
            , formValues = formValues
            , shortTextTypeDict = shortTextTypeDict
            }
    in
    formFields
        |> Array.indexedMap (viewFormFieldPreview config)
        |> Array.toList


when : Bool -> { true : a, false : a } -> a
when bool condition =
    if bool then
        condition.true

    else
        condition.false


viewFormFieldPreview : { formValues : Json.Encode.Value, customAttrs : List (Html.Attribute Msg), shortTextTypeDict : Dict String CustomElement } -> Int -> FormField -> Html Msg
viewFormFieldPreview config index formField =
    let
        fieldID =
            -- so clicking on label will focus on field
            "tff-field-input-" ++ String.fromInt index
    in
    div [ class "tff-tabs-preview" ]
        [ div
            [ class ("tff-field-group" ++ when (requiredData formField.presence) { true = " tff-required", false = "" }) ]
            [ label [ class "tff-field-label", for fieldID ]
                [ text formField.label
                , case formField.presence of
                    Required ->
                        text ""

                    Optional ->
                        text " (optional)"

                    System ->
                        text ""
                ]
            , viewFormFieldOptionsPreview config fieldID formField
            , div [ class "tff-field-description" ]
                [ text
                    (case formField.description of
                        AttributeNotNeeded _ ->
                            ""

                        AttributeInvalid s ->
                            s

                        AttributeGiven s ->
                            s
                    )
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
        ShortText { maxlength } ->
            case maxlength of
                AttributeGiven i ->
                    Just i

                AttributeInvalid _ ->
                    Nothing

                AttributeNotNeeded _ ->
                    Nothing

        LongText maxlength ->
            case maxlength of
                AttributeGiven i ->
                    Just i

                AttributeInvalid _ ->
                    Nothing

                AttributeNotNeeded _ ->
                    Nothing

        _ ->
            Nothing


fieldNameOf : FormField -> String
fieldNameOf formField =
    Maybe.withDefault formField.label formField.name


viewFormFieldOptionsPreview : { formValues : Json.Encode.Value, customAttrs : List (Html.Attribute Msg), shortTextTypeDict : Dict String CustomElement } -> String -> FormField -> Html Msg
viewFormFieldOptionsPreview { formValues, customAttrs, shortTextTypeDict } fieldID formField =
    let
        fieldName =
            fieldNameOf formField

        chosenForYou choices =
            case formField.presence of
                Optional ->
                    False

                Required ->
                    List.length choices == 1

                System ->
                    List.length choices == 1
    in
    case formField.type_ of
        ShortText customElement ->
            let
                ( dataListAttrs, dataListElement ) =
                    case customElement.datalist of
                        AttributeGiven list ->
                            ( [ attribute "list" (fieldID ++ "-datalist") ]
                            , Html.datalist
                                [ id (fieldID ++ "-datalist") ]
                                (List.map
                                    (\choice ->
                                        Html.option
                                            [ value choice.value ]
                                            [ text choice.label ]
                                    )
                                    list
                                )
                            )

                        _ ->
                            ( [], text "" )

                shortTextAttrs =
                    Dict.get customElement.inputType shortTextTypeDict
                        |> Maybe.map .attributes
                        |> Maybe.withDefault Dict.empty
                        |> Dict.toList
                        |> List.map (\( k, v ) -> attribute k v)

                extraAttrs =
                    Maybe.map (\s -> value s) (maybeDecode fieldName Json.Decode.string formValues)
                        :: List.map (\( k, v ) -> Just (attribute k v)) (Dict.toList customElement.attributes)
                        |> List.filterMap identity
            in
            div []
                [ Html.node customElement.inputTag
                    ([ attribute "class" "tff-text-field"
                     , name fieldName
                     , id fieldID
                     , required (requiredData formField.presence)
                     ]
                        ++ dataListAttrs
                        ++ shortTextAttrs
                        ++ extraAttrs
                        ++ customAttrs
                    )
                    []
                , dataListElement
                ]

        LongText _ ->
            let
                extraAttrs =
                    [ Maybe.map (\maxLength -> maxlength maxLength) (maybeMaxLengthOf formField)
                    , Maybe.map (\s -> value s) (maybeDecode fieldName Json.Decode.string formValues)
                    ]
                        |> List.filterMap identity
            in
            textarea
                ([ class "tff-text-field"
                 , name fieldName
                 , id fieldID
                 , required (requiredData formField.presence)
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
                    , id fieldID

                    -- when we're disabling `<select>` we actually only
                    -- want to disable the `<option>`s so user can see the options but cannot choose
                    -- but if the `<select>` is required, then now we are in a bind
                    -- so we cannot have `required` on the `<select>` if we're disabling it
                    , if List.member (disabled True) customAttrs then
                        class "tff-select-disabled"

                      else
                        required (requiredData formField.presence)
                    ]
                    (option
                        ([ disabled True
                         , selected (valueString == Nothing && not (chosenForYou choices))
                         , attribute "value" ""
                         ]
                            ++ customAttrs
                        )
                        [ text "-- Select an option --" ]
                        :: List.map
                            (\choice ->
                                option
                                    (value choice.value
                                        :: selected (valueString == Just choice.value || chosenForYou choices)
                                        :: customAttrs
                                    )
                                    [ text choice.label ]
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
                                         , value choice.value
                                         , checked (valueString == Just choice.value || chosenForYou choices)
                                         , required (requiredData formField.presence)
                                         ]
                                            ++ customAttrs
                                        )
                                        []
                                    , text " "
                                    , text choice.label
                                    ]
                                ]
                        )
                        choices
                    )
                ]

        ChooseMultiple choices ->
            let
                decodeListOrSingleton decoder =
                    Json.Decode.oneOf
                        [ Json.Decode.list decoder
                        , decoder |> Json.Decode.map List.singleton
                        ]

                values =
                    maybeDecode fieldName (decodeListOrSingleton Json.Decode.string) formValues
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
                                         , value choice.value
                                         , checked (List.member choice.value values || chosenForYou choices)
                                         ]
                                            ++ customAttrs
                                        )
                                        []
                                    , text " "
                                    , text choice.label
                                    ]
                                ]
                        )
                        choices
                    )
                ]



--


type DropdownState
    = DropdownOpen
    | DropdownClosed


dropDownButton : DropdownState -> List ( Msg, String ) -> List (Html Msg)
dropDownButton dropdownState options =
    let
        dropDownButtonClass =
            case dropdownState of
                DropdownOpen ->
                    "tff-dropdown-open"

                DropdownClosed ->
                    "tff-dropdown-closed"
    in
    [ button
        [ id "dropdownDefaultButton"
        , attribute "data-dropdown-toggle" "dropdown"
        , class "tff-dropdown-button"
        , type_ "button"
        , stopPropagationOn "click" (Json.Decode.succeed ( ToggleDropdownState, True ))
        ]
        [ text " Add question "
        , svg
            [ SvgAttr.class "tff-dropdown-svg"
            , attribute "aria-hidden" "true"
            , SvgAttr.fill "none"
            , SvgAttr.viewBox "0 0 10 6"
            ]
            [ path
                [ SvgAttr.stroke "currentColor"
                , SvgAttr.strokeLinecap "round"
                , SvgAttr.strokeLinejoin "round"
                , SvgAttr.strokeWidth "2"
                , SvgAttr.d "m1 1 4 4 4-4"
                ]
                []
            ]
        ]
    , div
        [ id "dropdown"
        , class ("tff-dropdown-options-wrapper " ++ dropDownButtonClass)
        ]
        [ ul
            [ class "tff-dropdown-list"
            , attribute "aria-labelledby" "dropdownDefaultButton"
            ]
            [ li []
                (List.map
                    (\( msg, labelText ) ->
                        a
                            [ href "#"
                            , class "tff-dropdown-option"
                            , preventDefaultOn "click" (Json.Decode.succeed ( msg, True ))
                            ]
                            [ text labelText ]
                    )
                    options
                )
            ]
        ]
    ]


viewFormBuilder : Maybe ( Int, Animate ) -> { a | dropdownState : DropdownState, formFields : Array FormField, shortTextTypeList : List CustomElement } -> List (Html Msg)
viewFormBuilder maybeAnimate { dropdownState, formFields, shortTextTypeList } =
    let
        stdOptions =
            List.map
                (\inputField ->
                    ( AddFormField inputField
                    , stringFromInputField inputField
                    )
                )
                allInputField

        extraOptions =
            List.map
                (\customElement -> ( AddFormField (ShortText customElement), customElement.inputType ))
                shortTextTypeList
    in
    div [ class "tff-build-fields" ]
        (formFields
            |> Array.indexedMap (viewFormFieldBuilder maybeAnimate shortTextTypeList (Array.length formFields))
            |> Array.toList
        )
        :: dropDownButton dropdownState (stdOptions ++ extraOptions)


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


viewFormFieldBuilder : Maybe ( Int, Animate ) -> List CustomElement -> Int -> Int -> FormField -> Html Msg
viewFormFieldBuilder maybeAnimate shortTextTypeList totalLength index formField =
    let
        buildFieldClass =
            case maybeAnimate of
                Nothing ->
                    "tff-build-field"

                Just ( i, animate ) ->
                    if i == index then
                        case animate of
                            AnimateYellowFade ->
                                "tff-build-field tff-animate-yellowFade"

                            AnimateFadeOut ->
                                "tff-build-field tff-animate-fadeOut"

                    else
                        "tff-build-field"

        idSuffix =
            String.fromInt index

        configureRequiredCheckbox =
            label [ class "tff-field-label", for ("required-" ++ idSuffix) ]
                [ input
                    [ id ("required-" ++ idSuffix)
                    , type_ "checkbox"
                    , tabindex 0
                    , checked (requiredData formField.presence)
                    , onCheck (\b -> OnFormField (OnRequiredInput b) index "")
                    ]
                    []
                , text " "
                , text "Required field"
                ]

        deleteFieldButton =
            button
                [ type_ "button"
                , tabindex 0
                , class "tff-delete"
                , title "Delete field"
                , onClick
                    (DoSleepDo animateFadeDuration
                        [ SetEditorAnimate (Just ( index, AnimateFadeOut ))
                        , DeleteFormField index
                        ]
                    )
                ]
                [ text "⨯ Delete" ]
    in
    div [ class buildFieldClass ]
        ([ div [ class "tff-field-group" ]
            [ label [ class "tff-field-label", for ("label-" ++ idSuffix) ] [ text (stringFromInputField formField.type_ ++ " question title") ]
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
            ]
         , if mustBeOptional formField.type_ then
            text ""

           else
            case formField.presence of
                Required ->
                    configureRequiredCheckbox

                Optional ->
                    configureRequiredCheckbox

                System ->
                    text ""
         , inputAttributeOptional
            { onCheck = \b -> OnFormField (OnDescriptionToggle b) index ""
            , onInput = OnFormField OnDescriptionInput index
            , label = "Question description"
            , toString = identity
            , htmlNode = Html.input
            , attrs = [ class "tff-text-field" ]
            }
            formField.description
         ]
            ++ viewFormFieldOptionsBuilder shortTextTypeList index formField
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
                    , case formField.presence of
                        Required ->
                            deleteFieldButton

                        Optional ->
                            deleteFieldButton

                        System ->
                            text ""
                    ]
               ]
        )


viewFormFieldOptionsBuilder : List CustomElement -> Int -> FormField -> List (Html Msg)
viewFormFieldOptionsBuilder shortTextTypeList index formField =
    let
        idSuffix =
            String.fromInt index

        choicesTextarea choices =
            div [ class "tff-field-group" ]
                [ label [ class "tff-field-label", for ("choices-" ++ idSuffix) ] [ text "Choices" ]
                , textarea
                    [ id ("choices-" ++ idSuffix)
                    , value (String.join "\n" (List.map choiceToString choices))
                    , required True
                    , readonly
                        (case formField.presence of
                            Required ->
                                False

                            Optional ->
                                False

                            System ->
                                True
                        )
                    , onInput (OnFormField OnChoicesInput index)
                    , minlength 1
                    , class "tff-text-field"
                    , placeholder "Enter one choice per line"
                    ]
                    []
                ]
    in
    case formField.type_ of
        ShortText customElement ->
            let
                maybeShortTextTypeMaxLength =
                    shortTextTypeList
                        |> List.filter (\{ inputType } -> inputType == customElement.inputType)
                        |> List.head
                        |> Maybe.map .attributes
                        |> Maybe.andThen (Dict.get "maxlength")
                        |> Maybe.andThen String.toInt
            in
            [ case maybeShortTextTypeMaxLength of
                Nothing ->
                    inputAttributeOptional
                        { onCheck = \b -> OnFormField (OnMaxLengthToggle b) index ""
                        , onInput = OnFormField OnMaxLengthInput index
                        , label = "Limit number of characters"
                        , toString = String.fromInt
                        , htmlNode = Html.input
                        , attrs = [ class "tff-text-field", type_ "number", Html.Attributes.min "1" ]
                        }
                        customElement.maxlength

                Just i ->
                    input
                        [ type_ "hidden"
                        , name ("maxlength-" ++ idSuffix)
                        , value (String.fromInt i)
                        ]
                        []
            , inputAttributeOptional
                { onCheck = \b -> OnFormField (OnDatalistToggle b) index ""
                , onInput = OnFormField OnDatalistInput index
                , label = "Suggested values"
                , toString = List.map choiceToString >> String.join "\n"
                , htmlNode = Html.textarea
                , attrs = [ class "tff-text-field", placeholder "Enter one suggestion per line" ]
                }
                customElement.datalist
            ]

        LongText optionalMaxLength ->
            [ inputAttributeOptional
                { onCheck = \b -> OnFormField (OnMaxLengthToggle b) index ""
                , onInput = OnFormField OnMaxLengthInput index
                , label = "Limit number of characters"
                , toString = String.fromInt
                , htmlNode = Html.input
                , attrs = [ class "tff-text-field", type_ "number", Html.Attributes.min "1" ]
                }
                optionalMaxLength
            ]

        Dropdown choices ->
            [ choicesTextarea choices
            ]

        ChooseOne choices ->
            [ choicesTextarea choices
            ]

        ChooseMultiple choices ->
            [ choicesTextarea choices
            ]



-- PORT


type PortOutgoingValue
    = PortOutgoingFormFields (Array FormField)
    | PortOutgoingViewMode ViewMode
    | PortOutgoingSetupCloseDropdown PortIncomingValue


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

        PortOutgoingSetupCloseDropdown incomingValue ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "setupCloseDropdown" )
                , ( "value", encodePortIncomingValue incomingValue )
                ]


type PortIncomingValue
    = PortIncomingViewMode ViewMode
    | PortIncomingCloseDropdown


encodePortIncomingValue : PortIncomingValue -> Json.Encode.Value
encodePortIncomingValue value =
    case value of
        PortIncomingViewMode viewMode ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "viewMode" )
                , ( "viewMode", Json.Encode.string (stringFromViewMode viewMode) )
                ]

        PortIncomingCloseDropdown ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "closeDropdown" )
                ]


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

                    "closeDropdown" ->
                        Json.Decode.succeed PortIncomingCloseDropdown

                    _ ->
                        Json.Decode.fail ("Unknown port event type: " ++ type_)
            )



--  ENCODERS DECODERS


defaultInputTag : String
defaultInputTag =
    "input"


choiceDelimiter : String
choiceDelimiter =
    " | "


choiceToString : Choice -> String
choiceToString choice =
    if choice.label == choice.value then
        choice.label

    else
        choice.value ++ choiceDelimiter ++ choice.label


choiceFromString : String -> Choice
choiceFromString s =
    case String.split choiceDelimiter s of
        [ value ] ->
            { value = value, label = value }

        [ value, label ] ->
            { value = value, label = label }

        value :: labels ->
            { value = value, label = String.join choiceDelimiter labels }

        _ ->
            { value = s, label = s }


decodeChoice : Json.Decode.Decoder Choice
decodeChoice =
    Json.Decode.string
        |> Json.Decode.map choiceFromString


encodeChoice : Choice -> Json.Encode.Value
encodeChoice choice =
    Json.Encode.string (choiceToString choice)


decodeViewMode : Json.Decode.Decoder ViewMode
decodeViewMode =
    Json.Decode.string
        |> Json.Decode.map viewModeFromString
        |> Json.Decode.andThen (Json.Decode.Extra.fromMaybe "Invalid viewMode: Editor | Preview | CollectData")


decodeConfig : Json.Decode.Decoder Config
decodeConfig =
    Json.Decode.succeed Config
        |> andMap (Json.Decode.Extra.optionalNullableField "viewMode" decodeViewMode |> Json.Decode.map (Maybe.withDefault (Editor { maybeAnimate = Nothing })))
        |> andMap (Json.Decode.Extra.optionalNullableField "formFields" decodeFormFields |> Json.Decode.map (Maybe.withDefault Array.empty))
        |> andMap (Json.Decode.Extra.optionalNullableField "formValues" Json.Decode.value |> Json.Decode.map (Maybe.withDefault Json.Encode.null))
        |> andMap
            (Json.Decode.Extra.optionalNullableField "shortTextTypeList" decodeShortTextTypeList
                |> Json.Decode.map
                    (Maybe.withDefault
                        [ fromRawCustomElement
                            { inputType = "Text"
                            , inputTag = defaultInputTag
                            , attributes = Dict.fromList [ ( "type", "text" ) ]
                            }
                        ]
                    )
            )


maybeDecode : String -> Json.Decode.Decoder b -> Json.Decode.Value -> Maybe b
maybeDecode key decoder jsonValue =
    Json.Decode.decodeValue (Json.Decode.Extra.optionalField key decoder) jsonValue
        |> Result.toMaybe
        |> Maybe.andThen identity


encodePresence : Presence -> Json.Encode.Value
encodePresence presence =
    case presence of
        Required ->
            Json.Encode.string "Required"

        Optional ->
            Json.Encode.string "Optional"

        System ->
            Json.Encode.string "System"


decodePresenceString : Json.Decode.Decoder Presence
decodePresenceString =
    Json.Decode.string
        |> Json.Decode.andThen
            (\str ->
                case str of
                    "Required" ->
                        Json.Decode.succeed Required

                    "Optional" ->
                        Json.Decode.succeed Optional

                    "System" ->
                        Json.Decode.succeed System

                    _ ->
                        Json.Decode.fail ("Unknown presence: " ++ str)
            )


decodePresence : Json.Decode.Decoder Presence
decodePresence =
    Json.Decode.oneOf
        [ decodePresenceString

        -- for backwards compatibility
        , Json.Decode.field "type" Json.Decode.string
            |> Json.Decode.andThen
                (\type_ ->
                    case type_ of
                        "System" ->
                            Json.Decode.succeed System

                        "SystemRequired" ->
                            Json.Decode.succeed System

                        "SystemOptional" ->
                            -- if we have a system field that is optional, it is just optional
                            -- doesn't affect end user filling up forms, but form builder can delete it
                            Json.Decode.succeed Optional

                        _ ->
                            Json.Decode.fail ("Unknown presence type: " ++ type_)
                )
        ]


encodeAttributeOptional : (a -> Json.Encode.Value) -> AttributeOptional a -> Json.Encode.Value
encodeAttributeOptional encodeValue attributeOptional =
    case attributeOptional of
        AttributeNotNeeded _ ->
            Json.Encode.null

        AttributeInvalid _ ->
            -- we only decode into AttributeNotNeeded or AttributeGiven
            Json.Encode.null

        AttributeGiven value ->
            encodeValue value


decodeAttributeOptional : Json.Decode.Decoder a -> Json.Decode.Decoder (AttributeOptional a)
decodeAttributeOptional decodeValue =
    Json.Decode.oneOf
        [ Json.Decode.null (AttributeNotNeeded Nothing)
        , decodeValue
            |> Json.Decode.map (\a -> AttributeGiven a)
        ]


encodeFormFields : Array FormField -> Json.Encode.Value
encodeFormFields formFields =
    formFields
        |> Array.toList
        |> List.map
            (\formField ->
                Json.Encode.object
                    ([ ( "label", Json.Encode.string formField.label )
                     , ( "name"
                       , case formField.name of
                            Just name ->
                                Json.Encode.string name

                            Nothing ->
                                Json.Encode.null
                       )
                     , ( "presence", encodePresence formField.presence )
                     , ( "description", encodeAttributeOptional Json.Encode.string formField.description )
                     , ( "type", encodeInputField formField.type_ )
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
        |> andMap decodeFormFieldMaybeName
        |> andMap (Json.Decode.field "presence" decodePresence)
        |> andMap decodeFormFieldDescription
        |> andMap (Json.Decode.field "type" decodeInputField)


decodeFormFieldMaybeName : Json.Decode.Decoder (Maybe String)
decodeFormFieldMaybeName =
    Json.Decode.oneOf
        [ -- backward compat: presence.name takes precedence
          Json.Decode.at [ "presence", "name" ] Json.Decode.string
            |> Json.Decode.map Just
        , Json.Decode.field "name" Json.Decode.string
            |> Json.Decode.map Just
        , Json.Decode.succeed Nothing
        ]


decodeFormFieldDescription : Json.Decode.Decoder (AttributeOptional String)
decodeFormFieldDescription =
    Json.Decode.oneOf
        [ -- backward compat: presence.description takes precedence
          Json.Decode.at [ "presence", "description" ] (decodeAttributeOptional Json.Decode.string)
        , Json.Decode.field "description" (decodeAttributeOptional Json.Decode.string)
        , Json.Decode.succeed (AttributeNotNeeded Nothing)
        ]


decodeCustomElement : Json.Decode.Decoder CustomElement
decodeCustomElement =
    Json.Decode.succeed RawCustomElement
        |> andMap (Json.Decode.field "inputType" Json.Decode.string)
        |> andMap
            (Json.Decode.Extra.optionalField "inputTag" Json.Decode.string
                |> Json.Decode.map (Maybe.withDefault defaultInputTag)
            )
        |> andMap
            (Json.Decode.Extra.optionalField "attributes" (Json.Decode.keyValuePairs Json.Decode.string)
                |> Json.Decode.map (Maybe.withDefault [])
                |> Json.Decode.map Dict.fromList
            )
        |> Json.Decode.map fromRawCustomElement


encodePairsFromCustomElements : RawCustomElement -> List ( String, Json.Encode.Value )
encodePairsFromCustomElements customElement =
    let
        inputTagAttrs =
            if customElement.inputTag == defaultInputTag then
                []

            else
                [ ( "inputTag", Json.Encode.string customElement.inputTag ) ]

        encodedAttrs =
            case List.map (Tuple.mapSecond Json.Encode.string) (Dict.toList customElement.attributes) of
                [] ->
                    -- don't need to encode `"attributes": []` all the time
                    []

                pairs ->
                    [ ( "attributes", Json.Encode.object pairs ) ]
    in
    ( "inputType", Json.Encode.string customElement.inputType )
        :: inputTagAttrs
        ++ encodedAttrs


encodeInputField : InputField -> Json.Encode.Value
encodeInputField inputField =
    case inputField of
        ShortText customElement ->
            Json.Encode.object
                (( "type", Json.Encode.string "ShortText" )
                    :: encodePairsFromCustomElements (toRawCustomElement customElement)
                )

        LongText optionalMaxLength ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "LongText" )
                , ( "maxLength", encodeAttributeOptional Json.Encode.int optionalMaxLength )
                ]

        Dropdown choices ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "Dropdown" )
                , ( "choices", Json.Encode.list encodeChoice (List.filter (\{ value } -> String.trim value /= "") choices) )
                ]

        ChooseOne choices ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "ChooseOne" )
                , ( "choices", Json.Encode.list encodeChoice (List.filter (\{ value } -> String.trim value /= "") choices) )
                ]

        ChooseMultiple choices ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "ChooseMultiple" )
                , ( "choices", Json.Encode.list encodeChoice (List.filter (\{ value } -> String.trim value /= "") choices) )
                ]


decodeInputField : Json.Decode.Decoder InputField
decodeInputField =
    Json.Decode.field "type" Json.Decode.string
        |> Json.Decode.andThen
            (\type_ ->
                case type_ of
                    "ShortText" ->
                        Json.Decode.map ShortText decodeCustomElement

                    "LongText" ->
                        Json.Decode.succeed LongText
                            |> andMap (Json.Decode.field "maxLength" (decodeAttributeOptional Json.Decode.int))

                    "Dropdown" ->
                        Json.Decode.field "choices" (Json.Decode.list decodeChoice)
                            |> Json.Decode.map Dropdown

                    "ChooseOne" ->
                        Json.Decode.field "choices" (Json.Decode.list decodeChoice)
                            |> Json.Decode.map ChooseOne

                    "ChooseMultiple" ->
                        Json.Decode.field "choices" (Json.Decode.list decodeChoice)
                            |> Json.Decode.map ChooseMultiple

                    _ ->
                        Json.Decode.fail ("Unknown input field type: " ++ type_)
            )


decodeShortTextTypeList : Json.Decode.Decoder (List CustomElement)
decodeShortTextTypeList =
    let
        customElementsFrom : Dict String ( String, Dict String String ) -> List CustomElement
        customElementsFrom dict =
            dict
                |> Dict.toList
                |> List.map
                    (\( inputType, ( inputTag, attributes ) ) ->
                        fromRawCustomElement
                            { inputType = inputType
                            , inputTag = inputTag
                            , attributes = attributes
                            }
                    )

        decodeAttributes : Json.Decode.Decoder ( String, Dict String String )
        decodeAttributes =
            -- backward compatible decoder for old json
            Json.Decode.dict Json.Decode.string
                |> Json.Decode.map (\attributes -> ( defaultInputTag, attributes ))

        decodeInputTagAttributes : Json.Decode.Decoder ( String, Dict String String )
        decodeInputTagAttributes =
            Json.Decode.succeed Tuple.pair
                |> andMap
                    (Json.Decode.Extra.optionalField "inputTag" Json.Decode.string
                        |> Json.Decode.map (Maybe.withDefault defaultInputTag)
                    )
                |> andMap
                    (Json.Decode.field "attributes" (Json.Decode.keyValuePairs Json.Decode.string)
                        |> Json.Decode.map Dict.fromList
                    )
    in
    Json.Decode.list (Json.Decode.dict (Json.Decode.oneOf [ decodeInputTagAttributes, decodeAttributes ]))
        |> Json.Decode.map (List.map customElementsFrom >> List.concat)
