port module Main exposing
    ( AttributeOptional(..)
    , Choice
    , Comparison(..)
    , Condition(..)
    , Dragged(..)
    , FormField
    , InputField(..)
    , Msg(..)
    , Presence(..)
    , RawCustomElement
    , ViewMode(..)
    , VisibilityRule(..)
    , allInputField
    , decodeChoice
    , decodeCustomElement
    , decodeFormField
    , decodeFormFields
    , decodeShortTextTypeList
    , dragOverDecoder
    , encodeChoice
    , encodeFormFields
    , encodeInputField
    , encodePairsFromCustomElement
    , encodeVisibilityRule
    , fieldsWithPlaceholder
    , fromRawCustomElement
    , main
    , onDropped
    , stringFromViewMode
    , viewModeFromString
    )

import Array exposing (Array)
import Browser
import Dict exposing (Dict)
import Html exposing (Html, button, div, h2, h3, input, label, option, pre, select, text, textarea)
import Html.Attributes exposing (attribute, checked, class, classList, disabled, for, id, maxlength, minlength, name, placeholder, readonly, required, selected, tabindex, title, type_, value)
import Html.Events exposing (on, onCheck, onClick, onInput, preventDefaultOn, stopPropagationOn)
import Json.Decode
import Json.Decode.Extra exposing (andMap)
import Json.Encode
import List.Extra
import Platform.Cmd as Cmd
import Process
import Svg exposing (path, rect, svg)
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
    , needsFormLogic : Bool
    , trackedFormValues : Dict String (List String)

    -- List because order matters
    , shortTextTypeList : List CustomElement

    -- Dict to lookup by `inputType`
    , shortTextTypeDict : Dict String CustomElement
    , dropdownState : DropdownState
    , selectedFieldIndex : Maybe Int
    , dragged : Maybe Dragged
    }


type Animate
    = AnimateYellowFade
    | AnimateFadeOut


type ViewMode
    = Editor { maybeAnimate : Maybe ( Int, Animate ) }
    | CollectData


viewModeFromString : String -> Maybe ViewMode
viewModeFromString str =
    case str of
        "Editor" ->
            Just (Editor { maybeAnimate = Nothing })

        "CollectData" ->
            Just CollectData

        _ ->
            Nothing


stringFromViewMode : ViewMode -> String
stringFromViewMode viewMode =
    case viewMode of
        Editor _ ->
            "Editor"

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


type Comparison
    = Equals String
    | StringContains String
    | ChoiceIncludes String
    | EndsWith String


type Condition
    = Field String Comparison
    | And (List Condition)
    | Or (List Condition)
    | Not Condition
    | Always


type VisibilityRule
    = ShowWhen Condition
    | HideWhen Condition


isShowWhen : VisibilityRule -> Bool
isShowWhen rule =
    case rule of
        ShowWhen _ ->
            True

        HideWhen _ ->
            False


isHideWhen : VisibilityRule -> Bool
isHideWhen rule =
    case rule of
        ShowWhen _ ->
            False

        HideWhen _ ->
            True


visibilityRuleCondition : VisibilityRule -> Condition
visibilityRuleCondition rule =
    case rule of
        ShowWhen condition ->
            condition

        HideWhen condition ->
            condition


type alias FormField =
    { label : String
    , name : Maybe String
    , presence : Presence
    , description : AttributeOptional String
    , type_ : InputField
    , visibilityRule : AttributeOptional VisibilityRule
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
    , label : String
    , htmlNode : Result String a -> Html msg
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
                , options.htmlNode (Err str)
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
                , options.htmlNode (Ok a)
                ]


type alias Choice =
    { label : String, value : String }


type InputField
    = ShortText CustomElement
    | LongText (AttributeOptional Int)
    | Dropdown (List Choice)
    | ChooseOne (List Choice)
    | ChooseMultiple (List Choice)


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


allowsTogglingMultiple : InputField -> Bool
allowsTogglingMultiple inputField =
    case inputField of
        ShortText { attributes } ->
            List.member (Dict.get "multiple" attributes) [ Just "true", Just "false" ]

        LongText _ ->
            False

        Dropdown _ ->
            False

        ChooseOne _ ->
            False

        ChooseMultiple _ ->
            False


mustBeOptional : InputField -> Bool
mustBeOptional inputField =
    case inputField of
        ShortText _ ->
            False

        LongText _ ->
            False

        Dropdown _ ->
            False

        ChooseOne _ ->
            False

        ChooseMultiple _ ->
            True


type Msg
    = NoOp
    | OnPortIncoming Json.Encode.Value
    | AddFormField InputField
    | DeleteFormField Int
    | MoveFormFieldUp Int
    | MoveFormFieldDown Int
    | OnFormField FormFieldMsg Int String
    | SetEditorAnimate (Maybe ( Int, Animate ))
    | SelectField (Maybe Int)
    | DragStart Int
    | DragStartNew FormField
    | DragEnd
    | DragOver (Maybe Droppable)
    | Drop (Maybe Int)
    | DoSleepDo Float (List Msg)
    | OnFormValuesUpdated String String


type alias Droppable =
    ( Int, Maybe FormField )


type FormFieldMsg
    = OnLabelInput
    | OnDescriptionInput
    | OnDescriptionToggle Bool
    | OnRequiredInput Bool
    | OnChoicesInput
    | OnMultipleToggle Bool
    | OnMaxLengthToggle Bool
    | OnMaxLengthInput
    | OnDatalistToggle Bool
    | OnDatalistInput
    | OnVisibilityToggle Bool
    | OnVisibilityRuleTypeInput Bool
    | OnVisibilityConditionTypeInput String
    | OnVisibilityConditionFieldInput String
    | OnVisibilityConditionValueInput String


otherQuestionTitles : Array FormField -> Int -> List String
otherQuestionTitles formFields currentIndex =
    Array.toList formFields
        |> List.indexedMap (\i f -> ( i, f ))
        |> List.filter (\( i, _ ) -> i /= currentIndex)
        |> List.map (\( _, f ) -> f.label)


getPreviousFieldLabel : Int -> Array FormField -> String
getPreviousFieldLabel index formFields =
    if index > 0 then
        Array.get (index - 1) formFields
            |> Maybe.map .label
            |> Maybe.withDefault ""

    else
        ""



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

                initialTrackedFormValues =
                    Array.toList config.formFields
                        |> List.map
                            (\field ->
                                let
                                    fieldName =
                                        fieldNameOf field
                                in
                                case field.type_ of
                                    ChooseMultiple _ ->
                                        ( fieldName
                                        , maybeDecode fieldName (decodeListOrSingleton Json.Decode.string) config.formValues
                                            |> Maybe.withDefault []
                                        )

                                    _ ->
                                        ( fieldName
                                        , maybeDecode fieldName Json.Decode.string config.formValues
                                            |> Maybe.map List.singleton
                                            |> Maybe.withDefault []
                                        )
                            )
                        |> Dict.fromList
            in
            ( { viewMode = config.viewMode
              , initError = Nothing
              , formFields = config.formFields
              , needsFormLogic =
                    config.formFields
                        |> Array.filter (\f -> visibilityRuleOf f /= ShowWhen Always)
                        |> Array.isEmpty
                        |> not
              , trackedFormValues = initialTrackedFormValues
              , shortTextTypeList = effectiveShortTextTypeList
              , shortTextTypeDict =
                    effectiveShortTextTypeList
                        |> List.map (\customElement -> ( customElement.inputType, customElement ))
                        |> Dict.fromList
              , dropdownState = DropdownClosed
              , selectedFieldIndex = Nothing
              , dragged = Nothing
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
              , needsFormLogic = False
              , trackedFormValues = Dict.empty
              , shortTextTypeList = []
              , shortTextTypeDict = Dict.empty
              , dropdownState = DropdownClosed
              , selectedFieldIndex = Nothing
              , dragged = Nothing
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
        NoOp ->
            ( model, Cmd.none )

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

        AddFormField fieldType ->
            let
                newFormField : FormField
                newFormField =
                    { label = stringFromInputField fieldType ++ " question"
                    , name = Nothing
                    , presence = when (mustBeOptional fieldType) { true = Optional, false = Required }
                    , description = AttributeNotNeeded Nothing
                    , type_ = fieldType
                    , visibilityRule = AttributeNotNeeded Nothing
                    }

                newFormFields =
                    Array.push newFormField model.formFields

                newIndex =
                    Array.length newFormFields - 1
            in
            ( { model
                | formFields = newFormFields
              }
            , Cmd.batch
                [ outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
                , DoSleepDo animateFadeDuration
                    [ SetEditorAnimate (Just ( newIndex, AnimateYellowFade ))
                    , SetEditorAnimate Nothing
                    ]
                    |> Task.succeed
                    |> Task.perform identity
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
            ( { model | formFields = newFormFields, selectedFieldIndex = Nothing }
            , outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
            )

        MoveFormFieldUp index ->
            let
                newFormFields =
                    swapArrayIndex index (index - 1) model.formFields
            in
            ( { model
                | formFields = newFormFields
                , selectedFieldIndex = Just (index - 1)
              }
            , outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
            )

        MoveFormFieldDown index ->
            let
                newFormFields =
                    swapArrayIndex index (index + 1) model.formFields
            in
            ( { model
                | formFields = newFormFields
                , selectedFieldIndex = Just (index + 1)
              }
            , outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
            )

        OnFormField fmsg index string ->
            let
                newFormFields =
                    Array.indexedMap
                        (\i formField ->
                            if i == index then
                                updateFormField fmsg string i model.formFields formField

                            else
                                formField
                        )
                        model.formFields
            in
            ( { model | formFields = newFormFields }
            , outgoing (encodePortOutgoingValue (PortOutgoingFormFields newFormFields))
            )

        SetEditorAnimate maybeAnimate ->
            ( { model | viewMode = Editor { maybeAnimate = maybeAnimate } }
            , Cmd.none
            )

        SelectField index ->
            case ( model.selectedFieldIndex, index ) of
                ( Just prevIndex, Nothing ) ->
                    ( { model
                        | selectedFieldIndex = Nothing
                        , viewMode = Editor { maybeAnimate = Just ( prevIndex, AnimateYellowFade ) }
                      }
                    , Cmd.none
                    )

                _ ->
                    ( { model | selectedFieldIndex = index }
                    , Cmd.none
                    )

        DragStart index ->
            ( { model
                | dragged = Just (DragExisting { dragIndex = index, dropIndex = Nothing }) -- use index as initial dropTargetIndex
                , selectedFieldIndex = Nothing
              }
            , Cmd.none
            )

        DragStartNew field ->
            ( { model
                | dragged = Just (DragNew { field = field, dropIndex = Just ( 0, Nothing ) }) -- new field starts at index 0
              }
            , Cmd.none
            )

        DragEnd ->
            case model.dragged of
                Just (DragExisting { dropIndex }) ->
                    update (Drop (Maybe.map Tuple.first dropIndex)) model

                Just (DragNew { dropIndex }) ->
                    update (Drop (Maybe.map Tuple.first dropIndex)) model

                Nothing ->
                    ( { model | dragged = Nothing }
                    , Cmd.none
                    )

        DragOver maybeDroppable ->
            ( { model | dragged = Maybe.map (updateDragged maybeDroppable) model.dragged }
            , Cmd.none
            )

        Drop targetIndex ->
            let
                newModel =
                    onDropped targetIndex model
            in
            ( newModel
            , if newModel.formFields /= model.formFields then
                outgoing (encodePortOutgoingValue (PortOutgoingFormFields newModel.formFields))

              else
                Cmd.none
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

        OnFormValuesUpdated fieldName value ->
            let
                formField =
                    Array.toList model.formFields
                        |> List.filter (\f -> fieldNameOf f == fieldName)
                        |> List.head

                currentValues =
                    Dict.get fieldName model.trackedFormValues
                        |> Maybe.withDefault []

                newValues =
                    case formField of
                        Just field ->
                            case field.type_ of
                                ChooseMultiple _ ->
                                    if List.member value currentValues then
                                        List.filter ((/=) value) currentValues

                                    else
                                        value :: currentValues

                                _ ->
                                    [ value ]

                        Nothing ->
                            [ value ]

                newTrackedFormValues =
                    Dict.insert fieldName newValues model.trackedFormValues

                formValues =
                    Dict.toList newTrackedFormValues
                        |> List.map (\( key, values ) -> ( key, Json.Encode.list Json.Encode.string values ))
                        |> Dict.fromList
                        |> Json.Encode.dict identity identity
            in
            ( { model | trackedFormValues = newTrackedFormValues }
            , outgoing (encodePortOutgoingValue (PortOutgoingFormValues formValues))
            )


updateFormField : FormFieldMsg -> String -> Int -> Array FormField -> FormField -> FormField
updateFormField msg string index formFields formField =
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

        OnMultipleToggle bool ->
            case formField.type_ of
                ShortText customElement ->
                    let
                        newCustomElement =
                            { customElement | multiple = AttributeGiven bool }
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

        OnVisibilityRuleTypeInput isShow ->
            { formField
                | visibilityRule =
                    case formField.visibilityRule of
                        AttributeNotNeeded _ ->
                            if isShow then
                                AttributeNotNeeded Nothing

                            else
                                AttributeNotNeeded (Just (HideWhen Always))

                        AttributeInvalid _ ->
                            if isShow then
                                AttributeNotNeeded Nothing

                            else
                                AttributeNotNeeded (Just (HideWhen Always))

                        AttributeGiven rule ->
                            if isShow then
                                AttributeGiven (ShowWhen (visibilityRuleCondition rule))

                            else
                                AttributeGiven (HideWhen (visibilityRuleCondition rule))
            }

        OnVisibilityConditionTypeInput str ->
            { formField
                | visibilityRule =
                    setAttributeOptionalVisibilityRule str formField.visibilityRule
            }

        OnVisibilityConditionFieldInput newFieldName ->
            case formField.visibilityRule of
                AttributeNotNeeded _ ->
                    formField

                AttributeInvalid _ ->
                    formField

                AttributeGiven rule ->
                    { formField
                        | visibilityRule =
                            case rule of
                                ShowWhen (Field _ comparison) ->
                                    AttributeGiven (ShowWhen (Field newFieldName comparison))

                                HideWhen (Field _ comparison) ->
                                    AttributeGiven (HideWhen (Field newFieldName comparison))

                                _ ->
                                    formField.visibilityRule
                    }

        OnVisibilityConditionValueInput newValue ->
            case formField.visibilityRule of
                AttributeNotNeeded _ ->
                    formField

                AttributeInvalid _ ->
                    formField

                AttributeGiven rule ->
                    { formField
                        | visibilityRule =
                            case rule of
                                ShowWhen (Field fieldName (Equals _)) ->
                                    AttributeGiven (ShowWhen (Field fieldName (Equals newValue)))

                                HideWhen (Field fieldName (Equals _)) ->
                                    AttributeGiven (HideWhen (Field fieldName (Equals newValue)))

                                ShowWhen (Field fieldName (StringContains _)) ->
                                    AttributeGiven (ShowWhen (Field fieldName (StringContains newValue)))

                                HideWhen (Field fieldName (StringContains _)) ->
                                    AttributeGiven (HideWhen (Field fieldName (StringContains newValue)))

                                ShowWhen (Field fieldName (ChoiceIncludes _)) ->
                                    AttributeGiven (ShowWhen (Field fieldName (ChoiceIncludes newValue)))

                                HideWhen (Field fieldName (ChoiceIncludes _)) ->
                                    AttributeGiven (HideWhen (Field fieldName (ChoiceIncludes newValue)))

                                ShowWhen (Field fieldName (EndsWith _)) ->
                                    AttributeGiven (ShowWhen (Field fieldName (EndsWith newValue)))

                                HideWhen (Field fieldName (EndsWith _)) ->
                                    AttributeGiven (HideWhen (Field fieldName (EndsWith newValue)))

                                _ ->
                                    formField.visibilityRule
                    }

        OnVisibilityToggle bool ->
            { formField
                | visibilityRule =
                    if bool then
                        case formField.visibilityRule of
                            AttributeNotNeeded Nothing ->
                                let
                                    previousLabel =
                                        getPreviousFieldLabel index formFields
                                in
                                AttributeGiven (ShowWhen (Field previousLabel (Equals "")))

                            AttributeNotNeeded (Just rule) ->
                                AttributeGiven rule

                            _ ->
                                toggleAttributeOptional bool formField.visibilityRule

                    else
                        toggleAttributeOptional bool formField.visibilityRule
            }


onDropped : Maybe Int -> { a | dragged : Maybe Dragged, formFields : Array FormField } -> { a | dragged : Maybe Dragged, formFields : Array FormField }
onDropped targetIndex model =
    case model.dragged of
        Just (DragExisting { dragIndex, dropIndex }) ->
            case targetIndex of
                Nothing ->
                    -- dropping outside valid area, just reset state
                    { model | dragged = Nothing }

                Just index ->
                    case dropIndex of
                        Just ( dropTargetIndex, _ ) ->
                            if dragIndex == index || index /= dropTargetIndex then
                                -- dropping on original position or different from last DragOver
                                { model | dragged = Nothing }

                            else
                                -- Dropping an existing field in a new position
                                let
                                    newFormFields =
                                        model.formFields
                                            |> Array.toList
                                            |> List.indexedMap Tuple.pair
                                            |> List.filter (\( i, _ ) -> i /= dragIndex)
                                            |> List.map Tuple.second
                                            |> (\list ->
                                                    let
                                                        ( before, after ) =
                                                            List.Extra.splitAt index list

                                                        draggedField =
                                                            Array.get dragIndex model.formFields
                                                    in
                                                    case draggedField of
                                                        Just field ->
                                                            List.concat
                                                                [ before
                                                                , [ field ]
                                                                , after
                                                                ]

                                                        Nothing ->
                                                            list
                                               )
                                            |> Array.fromList
                                in
                                { model
                                    | formFields = newFormFields
                                    , dragged = Nothing
                                }

                        Nothing ->
                            -- dropping on original position
                            { model | dragged = Nothing }

        Just (DragNew { field, dropIndex }) ->
            case targetIndex of
                Nothing ->
                    -- dropping outside valid area, just reset state
                    { model | dragged = Nothing }

                Just index ->
                    case dropIndex of
                        Just ( dropTargetIndex, _ ) ->
                            if index /= dropTargetIndex then
                                -- dropping on different from last DragOver
                                { model | dragged = Nothing }

                            else
                                -- Dropping a new field
                                let
                                    newFormFields =
                                        Array.toList model.formFields
                                            |> (\list ->
                                                    let
                                                        ( before, after ) =
                                                            List.Extra.splitAt index list
                                                    in
                                                    before ++ [ field ] ++ after
                                               )
                                            |> Array.fromList
                                in
                                { model
                                    | formFields = newFormFields
                                    , dragged = Nothing
                                }

                        Nothing ->
                            -- dropping on original position
                            { model | dragged = Nothing }

        Nothing ->
            { model | dragged = Nothing }


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
    div
        [ class ("tff tff-container tff-mode-" ++ stringFromViewMode model.viewMode)
        ]
        (case model.viewMode of
            Editor editorAttr ->
                input
                    [ type_ "hidden"
                    , name "tiny-form-fields"
                    , value (Json.Encode.encode 0 (encodeFormFields model.formFields))
                    ]
                    []
                    :: viewFormBuilder editorAttr.maybeAnimate model

            CollectData ->
                viewFormPreview [] model
        )


viewFormPreview : List (Html.Attribute Msg) -> { a | formFields : Array FormField, needsFormLogic : Bool, trackedFormValues : Dict String (List String), shortTextTypeDict : Dict String CustomElement } -> List (Html Msg)
viewFormPreview customAttrs { formFields, needsFormLogic, trackedFormValues, shortTextTypeDict } =
    let
        onChooseMany fieldName choice =
            [ onCheck (\_ -> OnFormValuesUpdated fieldName choice.value) ]

        onInput fieldName =
            [ on "input"
                (Json.Decode.at [ "target", "value" ] Json.Decode.string
                    |> Json.Decode.map (\value -> OnFormValuesUpdated fieldName value)
                )
            ]

        config =
            { customAttrs = customAttrs
            , shortTextTypeDict = shortTextTypeDict
            , formFields = formFields
            , trackedFormValues = trackedFormValues
            , onChooseMany =
                if needsFormLogic then
                    onChooseMany

                else
                    \_ _ -> []
            , onInput =
                if needsFormLogic then
                    onInput

                else
                    \_ -> []
            }
    in
    formFields
        |> Array.filter
            (\formField ->
                case formField.visibilityRule of
                    AttributeNotNeeded _ ->
                        True

                    AttributeInvalid _ ->
                        False

                    AttributeGiven rule ->
                        isVisibilityRuleSatisfied rule trackedFormValues
            )
        |> Array.indexedMap (viewFormFieldPreview config)
        |> Array.toList


when : Bool -> { true : a, false : a } -> a
when bool condition =
    if bool then
        condition.true

    else
        condition.false


viewFormFieldPreview :
    { trackedFormValues : Dict String (List String)
    , customAttrs : List (Html.Attribute Msg)
    , onChooseMany : String -> Choice -> List (Html.Attribute Msg)
    , onInput : String -> List (Html.Attribute Msg)
    , shortTextTypeDict : Dict String CustomElement
    , formFields : Array FormField
    }
    -> Int
    -> FormField
    -> Html Msg
viewFormFieldPreview config index formField =
    let
        fieldID =
            -- so clicking on label will focus on field
            "tff-field-input-" ++ String.fromInt index
    in
    div []
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

                        AttributeGiven str ->
                            str

                        AttributeInvalid str ->
                            str
                    )
                , case maybeMaxLengthOf formField of
                    Just maxLength ->
                        text (" (max " ++ String.fromInt maxLength ++ " characters)")

                    Nothing ->
                        text ""
                ]
            ]
        ]


maybeMultipleOf : FormField -> Maybe Bool
maybeMultipleOf formField =
    case formField.type_ of
        ShortText { multiple } ->
            case multiple of
                AttributeGiven i ->
                    Just i

                AttributeInvalid _ ->
                    Nothing

                AttributeNotNeeded _ ->
                    Nothing

        LongText _ ->
            Nothing

        Dropdown _ ->
            Nothing

        ChooseOne _ ->
            Nothing

        ChooseMultiple _ ->
            Nothing


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

        Dropdown _ ->
            Nothing

        ChooseOne _ ->
            Nothing

        ChooseMultiple _ ->
            Nothing


fieldNameOf : FormField -> String
fieldNameOf formField =
    Maybe.withDefault formField.label formField.name


attributesFromTuple : ( String, String ) -> Maybe (Html.Attribute msg)
attributesFromTuple ( k, v ) =
    case ( k, v ) of
        ( "multiple", "true" ) ->
            Just (Html.Attributes.multiple True)

        ( "multiple", "false" ) ->
            Nothing

        _ ->
            Just (attribute k v)


{-| This is a property <https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement>

Not an html attribute <https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input>

-}
defaultValue : String -> Html.Attribute msg
defaultValue str =
    -- property "defaultValue" (Json.Encode.string str)
    value str


defaultSelected : Bool -> Html.Attribute msg
defaultSelected bool =
    -- property "defaultSelected" (Json.Encode.bool bool)
    selected bool


viewFormFieldOptionsPreview :
    { trackedFormValues : Dict String (List String)
    , customAttrs : List (Html.Attribute Msg)
    , onChooseMany : String -> Choice -> List (Html.Attribute Msg)
    , onInput : String -> List (Html.Attribute Msg)
    , shortTextTypeDict : Dict String CustomElement
    , formFields : Array FormField
    }
    -> String
    -> FormField
    -> Html Msg
viewFormFieldOptionsPreview config fieldID formField =
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

                        AttributeNotNeeded _ ->
                            ( [], text "" )

                        AttributeInvalid _ ->
                            ( [], text "" )

                extraAttrKeys =
                    Dict.keys customElement.attributes

                shortTextAttrs =
                    Dict.get customElement.inputType config.shortTextTypeDict
                        |> Maybe.map .attributes
                        |> Maybe.withDefault Dict.empty
                        |> Dict.toList
                        |> List.filter (\( k, _ ) -> not (List.member k extraAttrKeys))
                        |> List.filterMap attributesFromTuple

                extraAttrs =
                    Maybe.map (\s -> defaultValue s) (Dict.get fieldName config.trackedFormValues |> Maybe.andThen List.head)
                        :: List.map attributesFromTuple (Dict.toList customElement.attributes)
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
                        ++ config.customAttrs
                        ++ config.onInput fieldName
                    )
                    []
                , dataListElement
                ]

        LongText _ ->
            let
                extraAttrs =
                    [ Maybe.map (\maxLength -> maxlength maxLength) (maybeMaxLengthOf formField)
                    , Maybe.map (\s -> value s) (Dict.get fieldName config.trackedFormValues |> Maybe.andThen List.head)
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
                    ++ config.customAttrs
                    ++ config.onInput fieldName
                )
                []

        Dropdown choices ->
            let
                valueString =
                    Dict.get fieldName config.trackedFormValues
                        |> Maybe.andThen List.head
                        |> Maybe.withDefault ""
            in
            div [ class "tff-dropdown-group" ]
                [ selectArrowDown
                , select
                    ([ name fieldName
                     , id fieldID

                     -- when we're disabling `<select>` we actually only
                     -- want to disable the `<option>`s so user can see the options but cannot choose
                     -- but if the `<select>` is required, then now we are in a bind
                     -- so we cannot have `required` on the `<select>` if we're disabling it
                     , if List.member (attribute "disabled" "disabled") config.customAttrs then
                        class "tff-select-disabled"

                       else
                        required (requiredData formField.presence)
                     ]
                        ++ config.onInput fieldName
                    )
                    (option
                        ([ disabled True
                         , defaultSelected (valueString == "" && not (chosenForYou choices))
                         , attribute "value" ""
                         ]
                            ++ config.customAttrs
                        )
                        [ text "-- Select an option --" ]
                        :: List.map
                            (\choice ->
                                option
                                    (value choice.value
                                        :: defaultSelected (valueString == choice.value || chosenForYou choices)
                                        :: config.customAttrs
                                    )
                                    [ text choice.label ]
                            )
                            choices
                    )
                ]

        ChooseOne choices ->
            let
                valueString =
                    Dict.get fieldName config.trackedFormValues
                        |> Maybe.andThen List.head
                        |> Maybe.withDefault ""
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
                                         , checked (valueString == choice.value || chosenForYou choices)
                                         , required (requiredData formField.presence)
                                         ]
                                            ++ config.customAttrs
                                            ++ config.onInput fieldName
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
                values =
                    Dict.get fieldName config.trackedFormValues
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
                                            ++ config.customAttrs
                                            ++ config.onChooseMany fieldName choice
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


renderFormField : Maybe ( Int, Animate ) -> Model -> Int -> Maybe FormField -> Html Msg
renderFormField maybeAnimate model index maybeFormField =
    case maybeFormField of
        Nothing ->
            div
                [ class "tff-field-container"
                , preventDefaultOn "dragover" (dragOverDecoder index Nothing)
                ]
                [ div [ class "tff-field-placeholder" ] [] ]

        Just formField ->
            div
                [ class "tff-field-container"
                , attribute "data-input-field" (stringFromInputField formField.type_)
                , preventDefaultOn "dragover" (dragOverDecoder index (Just formField))
                ]
                [ div
                    [ class "tff-field-wrapper"
                    ]
                    [ div
                        [ class "tff-field-preview"
                        , classList
                            [ ( "tff-animate-fadeOut"
                              , case maybeAnimate of
                                    Just ( i, AnimateFadeOut ) ->
                                        i == index

                                    _ ->
                                        False
                              )
                            , ( "tff-animate-yellowFade"
                              , case maybeAnimate of
                                    Just ( i, AnimateYellowFade ) ->
                                        i == index

                                    _ ->
                                        False
                              )
                            ]
                        , stopPropagationOn "click" (Json.Decode.succeed ( SelectField (Just index), True ))
                        , attribute "data-selected"
                            (if model.selectedFieldIndex == Just index then
                                "true"

                             else
                                "false"
                            )
                        , attribute "draggable" "true"
                        , on "dragstart" (Json.Decode.succeed (DragStart index))
                        , on "dragend" (Json.Decode.succeed DragEnd)
                        ]
                        [ div [ class "tff-drag-handle" ] [ dragHandleIcon ]
                        , viewFormFieldPreview
                            { customAttrs = [ attribute "disabled" "disabled" ]
                            , formFields = model.formFields
                            , onChooseMany = \_ _ -> []
                            , onInput = \_ -> []
                            , shortTextTypeDict = model.shortTextTypeDict
                            , trackedFormValues = model.trackedFormValues
                            }
                            index
                            formField
                        ]
                    ]
                ]


{-| Given a list of form fields and drag state, returns a list of Maybe FormField
where:

  - Dragged existing field is replaced with Nothing
  - For new field drag, Nothing is inserted at dropTargetIndex
  - For new field drag without dropTargetIndex, Nothing is prepended

-}
fieldsWithPlaceholder : List FormField -> Maybe Dragged -> List (Maybe FormField)
fieldsWithPlaceholder fields dragged =
    case dragged of
        Nothing ->
            List.map Just fields

        Just (DragExisting { dragIndex, dropIndex }) ->
            case dropIndex of
                Nothing ->
                    -- When dragging outside valid drop area, keep all fields as is
                    List.map Just fields

                Just ( index, _ ) ->
                    let
                        withoutDragged =
                            List.indexedMap
                                (\i formField ->
                                    if i == dragIndex then
                                        Nothing

                                    else
                                        Just formField
                                )
                                fields
                                |> List.filterMap identity
                    in
                    List.concat
                        [ List.take index (List.map Just withoutDragged)
                        , [ Nothing ]
                        , List.drop index (List.map Just withoutDragged)
                        ]

        Just (DragNew { dropIndex }) ->
            case dropIndex of
                Nothing ->
                    -- When dragging outside valid drop area, keep all fields as is
                    List.map Just fields

                Just ( index, _ ) ->
                    let
                        fieldsWithJust =
                            List.map Just fields
                    in
                    List.concat
                        [ List.take index fieldsWithJust
                        , [ Nothing ]
                        , List.drop index fieldsWithJust
                        ]


viewFormBuilder : Maybe ( Int, Animate ) -> Model -> List (Html Msg)
viewFormBuilder maybeAnimate model =
    let
        extraOptions =
            List.map
                (\customElement -> ShortText customElement)
                model.shortTextTypeList

        maybeFieldsList =
            fieldsWithPlaceholder
                (Array.toList model.formFields)
                model.dragged
    in
    [ div
        [ class "tff-editor-layout"
        , preventDefaultOn "dragover" (Json.Decode.succeed ( NoOp, True )) -- so dragged image don't snap back
        ]
        [ div
            [ class "tff-left-panel"
            , classList [ ( "tff-panel-hidden", model.selectedFieldIndex /= Nothing ) ]
            ]
            [ h2 [ class "tff-panel-header" ] [ text "Add Form Field" ]
            , viewAddQuestionsList (allInputField ++ extraOptions)
            ]
        , div
            [ class "tff-center-panel"
            , classList [ ( "tff-panel-hidden", model.selectedFieldIndex /= Nothing ) ]
            , onClick (SelectField Nothing)
            ]
            [ div
                [ class "tff-fields-container"

                -- , preventDefaultOn "drop" (Json.Decode.succeed ( Drop Nothing, True ))
                ]
                (List.indexedMap (renderFormField maybeAnimate model) maybeFieldsList)
            ]
        , viewRightPanel model
        ]
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


visibilityRulesSection : Int -> Array FormField -> FormField -> Html Msg
visibilityRulesSection index formFields formField =
    inputAttributeOptional
        { onCheck = \bool -> OnFormField (OnVisibilityToggle bool) index ""
        , label = "Field logic"
        , htmlNode =
            \result ->
                case result of
                    Ok _ ->
                        div []
                            [ div [ class "tff-dropdown-group" ]
                                [ selectArrowDown
                                , select
                                    [ class "tff-text-field tff-show-or-hide"
                                    , onInput (\str -> OnFormField (OnVisibilityRuleTypeInput (str == "Show")) index "")
                                    ]
                                    [ option
                                        [ selected (isShowWhen (visibilityRuleOf formField))
                                        , value "Show"
                                        ]
                                        [ text "Shown when" ]
                                    , option
                                        [ selected (isHideWhen (visibilityRuleOf formField))
                                        , value "Hide"
                                        ]
                                        [ text "Hidden when" ]
                                    ]
                                ]
                            , case visibilityRuleCondition (visibilityRuleOf formField) of
                                Field fieldName comparison ->
                                    div [ class "tff-field-group" ]
                                        [ div [ class "tff-dropdown-group" ]
                                            [ selectArrowDown
                                            , select
                                                [ class "tff-text-field tff-question-title"
                                                , onInput (\str -> OnFormField (OnVisibilityConditionFieldInput str) index "")
                                                , value fieldName
                                                ]
                                                (List.map
                                                    (\title ->
                                                        option
                                                            [ value title
                                                            , selected (title == fieldName)
                                                            ]
                                                            [ text title ]
                                                    )
                                                    (otherQuestionTitles formFields index)
                                                )
                                            ]
                                        , div [ class "tff-dropdown-group" ]
                                            [ selectArrowDown
                                            , select
                                                [ class "tff-text-field tff-comparison-type"
                                                , onInput (\str -> OnFormField (OnVisibilityConditionTypeInput str) index "")
                                                ]
                                                [ option
                                                    [ selected
                                                        (isComparingWith (Equals "something") (comparisonOf (visibilityRuleCondition (visibilityRuleOf formField))))
                                                    , value "Equals"
                                                    ]
                                                    [ text "equals" ]
                                                , option
                                                    [ selected
                                                        (isComparingWith (StringContains "something") (comparisonOf (visibilityRuleCondition (visibilityRuleOf formField))))
                                                    , value "StringContains"
                                                    ]
                                                    [ text "contains" ]
                                                , option
                                                    [ selected
                                                        (isComparingWith (ChoiceIncludes "something") (comparisonOf (visibilityRuleCondition (visibilityRuleOf formField))))
                                                    , value "ChoiceIncludes"
                                                    ]
                                                    [ text "choice includes" ]
                                                , option
                                                    [ selected
                                                        (isComparingWith (EndsWith "something") (comparisonOf (visibilityRuleCondition (visibilityRuleOf formField))))
                                                    , value "EndsWith"
                                                    ]
                                                    [ text "ends with" ]
                                                ]
                                            ]
                                        , input
                                            [ type_ "text"
                                            , class "tff-comparison-value"
                                            , value
                                                (case comparison of
                                                    Equals v ->
                                                        v

                                                    StringContains v ->
                                                        v

                                                    ChoiceIncludes v ->
                                                        v

                                                    EndsWith v ->
                                                        v
                                                )
                                            , onInput (\str -> OnFormField (OnVisibilityConditionValueInput str) index "")
                                            , class "tff-text-field"
                                            ]
                                            []
                                        ]

                                _ ->
                                    text ""
                            ]

                    Err err ->
                        text err
        }
        formField.visibilityRule


viewFormFieldBuilder : List CustomElement -> Int -> Int -> Array FormField -> FormField -> Html Msg
viewFormFieldBuilder shortTextTypeList index totalLength formFields formField =
    let
        buildFieldClass =
            "tff-build-field"

        idSuffix =
            String.fromInt index

        configureMultipleCheckbox =
            div [ class "tff-field-group" ]
                [ label [ class "tff-field-label", for ("multiple-" ++ idSuffix) ]
                    [ input
                        [ id ("multiple-" ++ idSuffix)
                        , type_ "checkbox"
                        , tabindex 0
                        , checked (maybeMultipleOf formField == Just True)
                        , onCheck (\b -> OnFormField (OnMultipleToggle b) index "")
                        ]
                        []
                    , text " "
                    , text ("Accept multiple " ++ String.toLower (stringFromInputField formField.type_))
                    ]
                ]

        configureRequiredCheckbox =
            div [ class "tff-field-group" ]
                [ label [ class "tff-field-label", for ("required-" ++ idSuffix) ]
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
                ]

        deleteFieldButton =
            button
                [ class "tff-delete"
                , type_ "button"
                , tabindex 0
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
         , if allowsTogglingMultiple formField.type_ then
            configureMultipleCheckbox

           else
            text ""
         , inputAttributeOptional
            { onCheck = \b -> OnFormField (OnDescriptionToggle b) index ""
            , label = "Question description"
            , htmlNode =
                \result ->
                    let
                        valueString =
                            case result of
                                Ok a ->
                                    a

                                Err err ->
                                    err
                    in
                    Html.input
                        [ required True
                        , class "tff-text-field"
                        , value valueString
                        , onInput (OnFormField OnDescriptionInput index)
                        ]
                        []
            }
            formField.description
         ]
            ++ viewFormFieldOptionsBuilder shortTextTypeList index formField
            ++ [ visibilityRulesSection index formFields formField
               , div [ class "tff-build-field-buttons" ]
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


visibilityRuleOf : FormField -> VisibilityRule
visibilityRuleOf formField =
    case formField.visibilityRule of
        AttributeNotNeeded maybeRule ->
            Maybe.withDefault (ShowWhen Always) maybeRule

        AttributeInvalid _ ->
            ShowWhen Always

        AttributeGiven rule ->
            rule


viewRightPanel : Model -> Html Msg
viewRightPanel modelData =
    let
        rightPanelClasses =
            String.join " " <|
                "tff-right-panel"
                    :: (if modelData.selectedFieldIndex /= Nothing then
                            [ "tff-panel-visible" ]

                        else
                            []
                       )
    in
    div
        [ class rightPanelClasses ]
        [ div [ class "tff-panel-header" ]
            [ h3 [] [ text "Field Settings" ]
            , button
                [ class "tff-close-button"
                , type_ "button"
                , onClick (SelectField Nothing)
                ]
                [ text "×" ]
            ]
        , div [ class "tff-settings-content" ]
            [ case modelData.selectedFieldIndex of
                Just index ->
                    case Array.get index modelData.formFields of
                        Just formField ->
                            viewFormFieldBuilder modelData.shortTextTypeList index (Array.length modelData.formFields) modelData.formFields formField

                        Nothing ->
                            text "Select a field to edit its settings"

                Nothing ->
                    text "Select a field to edit its settings"
            ]
        ]


type DropdownState
    = DropdownClosed


dragHandleIcon : Html msg
dragHandleIcon =
    svg
        [ SvgAttr.viewBox "0 0 16 16"
        , SvgAttr.fill "currentColor"
        , attribute "aria-hidden" "true"
        , SvgAttr.class "tff-drag-handle-icon"
        ]
        [ rect
            [ SvgAttr.x "4"
            , SvgAttr.y "4"
            , SvgAttr.width "8"
            , SvgAttr.height "1.5"
            ]
            []
        , rect
            [ SvgAttr.x "4"
            , SvgAttr.y "7.25"
            , SvgAttr.width "8"
            , SvgAttr.height "1.5"
            ]
            []
        , rect
            [ SvgAttr.x "4"
            , SvgAttr.y "10.5"
            , SvgAttr.width "8"
            , SvgAttr.height "1.5"
            ]
            []
        ]


viewAddQuestionsList : List InputField -> Html Msg
viewAddQuestionsList inputFields =
    div [ class "tff-field-list" ]
        (List.map
            (\inputField ->
                div
                    [ class "tff-field-list-item"
                    , attribute "role" "button"
                    , onClick (AddFormField inputField)
                    , attribute "draggable" "true"
                    , on "dragstart"
                        (Json.Decode.succeed
                            (DragStartNew
                                { label = stringFromInputField inputField ++ " question"
                                , name = Nothing
                                , presence = when (mustBeOptional inputField) { true = Optional, false = Required }
                                , description = AttributeNotNeeded Nothing
                                , type_ = inputField
                                , visibilityRule = AttributeNotNeeded Nothing
                                }
                            )
                        )
                    , on "dragend" (Json.Decode.succeed DragEnd)
                    ]
                    [ text (stringFromInputField inputField) ]
            )
            inputFields
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
                        , label = "Limit number of characters"
                        , htmlNode =
                            \result ->
                                let
                                    valueString =
                                        case result of
                                            Ok i ->
                                                String.fromInt i

                                            Err err ->
                                                err
                                in
                                Html.input
                                    [ class "tff-text-field"
                                    , type_ "number"
                                    , Html.Attributes.min "1"
                                    , value valueString
                                    , onInput (OnFormField OnMaxLengthInput index)
                                    ]
                                    []
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
                , label = "Suggested values"
                , htmlNode =
                    \result ->
                        case result of
                            Ok a ->
                                Html.textarea
                                    [ required True
                                    , class "tff-text-field"
                                    , placeholder "Enter one suggestion per line"
                                    , value (List.map choiceToString a |> String.join "\n")
                                    , onInput (OnFormField OnDatalistInput index)
                                    ]
                                    []

                            Err err ->
                                Html.textarea
                                    [ required True
                                    , class "tff-text-field"
                                    , placeholder "Enter one suggestion per line"
                                    , value err
                                    , onInput (OnFormField OnDatalistInput index)
                                    ]
                                    []
                }
                customElement.datalist
            ]

        LongText optionalMaxLength ->
            [ inputAttributeOptional
                { onCheck = \b -> OnFormField (OnMaxLengthToggle b) index ""
                , label = "Limit number of characters"
                , htmlNode =
                    \result ->
                        case result of
                            Ok i ->
                                Html.input
                                    [ class "tff-text-field"
                                    , type_ "number"
                                    , Html.Attributes.min "1"
                                    , value (String.fromInt i)
                                    , onInput (OnFormField OnMaxLengthInput index)
                                    ]
                                    []

                            Err err ->
                                Html.input
                                    [ class "tff-text-field"
                                    , type_ "number"
                                    , Html.Attributes.min "1"
                                    , value err
                                    , onInput (OnFormField OnMaxLengthInput index)
                                    ]
                                    []
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
    | PortOutgoingSetupCloseDropdown PortIncomingValue
    | PortOutgoingFormValues Json.Encode.Value


encodePortOutgoingValue : PortOutgoingValue -> Json.Encode.Value
encodePortOutgoingValue value =
    case value of
        PortOutgoingFormFields formFields ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "formFields" )
                , ( "formFields", encodeFormFields formFields )
                ]

        PortOutgoingSetupCloseDropdown incomingValue ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "setupCloseDropdown" )
                , ( "value", encodePortIncomingValue incomingValue )
                ]

        PortOutgoingFormValues formValues ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "formValues" )
                , ( "value", formValues )
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


decodeListOrSingleton : Json.Decode.Decoder a -> Json.Decode.Decoder (List a)
decodeListOrSingleton decoder =
    Json.Decode.oneOf
        [ Json.Decode.list decoder
        , Json.Decode.map List.singleton decoder
        ]


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
                            { inputType = "Single-line free text"
                            , inputTag = defaultInputTag
                            , attributes = Dict.fromList [ ( "type", "text" ) ]
                            }
                        ]
                    )
            )


maybeDecode : String -> Json.Decode.Decoder b -> Json.Encode.Value -> Maybe b
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


decodeAttributeOptional : Maybe a -> Json.Decode.Decoder a -> Json.Decode.Decoder (AttributeOptional a)
decodeAttributeOptional maybeNotNeeded decodeValue =
    Json.Decode.oneOf
        [ Json.Decode.null (AttributeNotNeeded Nothing)
        , decodeValue
            |> Json.Decode.map
                (\a ->
                    if Just a == maybeNotNeeded then
                        AttributeNotNeeded Nothing

                    else
                        AttributeGiven a
                )
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
                     , ( "visibilityRule", encodeAttributeOptional encodeVisibilityRule formField.visibilityRule )
                     ]
                        -- smaller output json than if we encoded `null` all the time
                        |> List.filter (\( _, v ) -> v /= Json.Encode.null)
                    )
            )
        |> Json.Encode.list identity


encodeVisibilityRule : VisibilityRule -> Json.Encode.Value
encodeVisibilityRule visibilityRule =
    case visibilityRule of
        ShowWhen condition ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "ShowWhen" )
                , ( "condition", encodeCondition condition )
                ]

        HideWhen condition ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "HideWhen" )
                , ( "condition", encodeCondition condition )
                ]


encodeCondition : Condition -> Json.Encode.Value
encodeCondition condition =
    case condition of
        Field fieldName comparison ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "Field" )
                , ( "fieldName", Json.Encode.string fieldName )
                , ( "comparison", encodeComparison comparison )
                ]

        And conditions ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "And" )
                , ( "conditions", Json.Encode.list encodeCondition conditions )
                ]

        Or conditions ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "Or" )
                , ( "conditions", Json.Encode.list encodeCondition conditions )
                ]

        Not cond ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "Not" )
                , ( "condition", encodeCondition cond )
                ]

        Always ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "Always" )
                ]


encodeComparison : Comparison -> Json.Encode.Value
encodeComparison comparison =
    case comparison of
        Equals value ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "Equals" )
                , ( "value", Json.Encode.string value )
                ]

        StringContains value ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "StringContains" )
                , ( "value", Json.Encode.string value )
                ]

        ChoiceIncludes value ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "ChoiceIncludes" )
                , ( "value", Json.Encode.string value )
                ]

        EndsWith value ->
            Json.Encode.object
                [ ( "type", Json.Encode.string "EndsWith" )
                , ( "value", Json.Encode.string value )
                ]


decodeFormFields : Json.Decode.Decoder (Array FormField)
decodeFormFields =
    Json.Decode.list decodeFormField
        |> Json.Decode.map Array.fromList


decodeFormField : Json.Decode.Decoder FormField
decodeFormField =
    Json.Decode.succeed FormField
        |> andMap (Json.Decode.field "label" Json.Decode.string)
        |> andMap decodeFormFieldMaybeName
        |> andMap (Json.Decode.oneOf [ Json.Decode.field "presence" decodePresence, decodeRequired ])
        |> andMap decodeFormFieldDescription
        |> andMap (Json.Decode.field "type" decodeInputField)
        |> andMap decodeFormFieldVisibilityRule


decodeFormFieldVisibilityRule : Json.Decode.Decoder (AttributeOptional VisibilityRule)
decodeFormFieldVisibilityRule =
    Json.Decode.oneOf
        [ Json.Decode.field "visibilityRule" (decodeAttributeOptional (Just (ShowWhen Always)) decodeVisibilityRule)
        , Json.Decode.succeed (AttributeNotNeeded Nothing)
        ]


decodeRequired : Json.Decode.Decoder Presence
decodeRequired =
    Json.Decode.field "required" Json.Decode.bool
        |> Json.Decode.map
            (\b ->
                if b then
                    Required

                else
                    Optional
            )


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
          Json.Decode.at [ "presence", "description" ] (decodeAttributeOptional (Just "") Json.Decode.string)
        , Json.Decode.field "description" (decodeAttributeOptional (Just "") Json.Decode.string)
        , Json.Decode.succeed (AttributeNotNeeded Nothing)
        ]


decodeVisibilityRule : Json.Decode.Decoder VisibilityRule
decodeVisibilityRule =
    Json.Decode.field "type" Json.Decode.string
        |> Json.Decode.andThen
            (\str ->
                case str of
                    "ShowWhen" ->
                        Json.Decode.succeed ShowWhen
                            |> andMap (Json.Decode.field "condition" decodeCondition)

                    "HideWhen" ->
                        Json.Decode.succeed HideWhen
                            |> andMap (Json.Decode.field "condition" decodeCondition)

                    _ ->
                        Json.Decode.fail ("Unknown visibility rule: " ++ str)
            )


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


encodePairsFromRawCustomElements : RawCustomElement -> List ( String, Json.Encode.Value )
encodePairsFromRawCustomElements customElement =
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


encodePairsFromCustomElement : CustomElement -> List ( String, Json.Encode.Value )
encodePairsFromCustomElement customElement =
    encodePairsFromRawCustomElements (toRawCustomElement customElement)


encodeInputField : InputField -> Json.Encode.Value
encodeInputField inputField =
    case inputField of
        ShortText customElement ->
            Json.Encode.object
                (( "type", Json.Encode.string "ShortText" )
                    :: encodePairsFromCustomElement customElement
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
                            |> andMap (Json.Decode.field "maxLength" (decodeAttributeOptional Nothing Json.Decode.int))

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
        |> Json.Decode.map (List.concatMap customElementsFrom)


type alias RawCustomElement =
    { inputType : String
    , inputTag : String
    , attributes : Dict String String
    }


type alias CustomElement =
    { inputType : String
    , inputTag : String
    , attributes : Dict String String
    , multiple : AttributeOptional Bool
    , maxlength : AttributeOptional Int
    , datalist : AttributeOptional (List Choice)
    }


fromRawCustomElement : RawCustomElement -> CustomElement
fromRawCustomElement ele =
    { inputTag = ele.inputTag
    , inputType = ele.inputType
    , attributes =
        ele.attributes
            -- list="some-id" is not a `datalist : AttributeOptional (List Choice)`, we keep it in `.attributes`
            |> Dict.filter (\k v -> not (k == "list" && String.contains "\n" v))
    , multiple =
        case Dict.get "multiple" ele.attributes of
            Just "" ->
                AttributeNotNeeded Nothing

            Just "true" ->
                AttributeGiven True

            Just "false" ->
                AttributeGiven False

            Just value ->
                AttributeInvalid value

            Nothing ->
                AttributeNotNeeded Nothing
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

            Nothing ->
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
        addMultipleIfGiven dict =
            case ele.multiple of
                AttributeGiven True ->
                    Dict.insert "multiple" "true" dict

                AttributeGiven False ->
                    Dict.insert "multiple" "false" dict

                _ ->
                    Dict.filter (\k _ -> k /= "multiple") dict

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

                AttributeInvalid _ ->
                    -- see `fromRawCustomElement`, keep the "list":"someid" we keep in `.attributes`
                    dict

                AttributeNotNeeded _ ->
                    -- see `fromRawCustomElement`, keep the "list":"someid" we keep in `.attributes`
                    dict
    in
    { inputTag = ele.inputTag
    , inputType = ele.inputType
    , attributes =
        ele.attributes
            |> addMaxLengthIfGiven
            |> addMultipleIfGiven
            |> addDatalistIfGiven
    }


type Dragged
    = DragExisting { dragIndex : Int, dropIndex : Maybe Droppable } -- Maybe (Int, FormField) from DragOver msg
    | DragNew { field : FormField, dropIndex : Maybe Droppable } -- Maybe (Int, FormField) from DragOver msg


updateDragged : Maybe Droppable -> Dragged -> Dragged
updateDragged maybeDroppable dragged =
    case maybeDroppable of
        Nothing ->
            dragged

        Just ( _, targetField ) ->
            case dragged of
                DragExisting details ->
                    case details.dropIndex of
                        Just ( _, existingField ) ->
                            if existingField == targetField then
                                dragged

                            else
                                DragExisting { details | dropIndex = maybeDroppable }

                        Nothing ->
                            DragExisting { details | dropIndex = maybeDroppable }

                DragNew details ->
                    case details.dropIndex of
                        Just ( _, existingField ) ->
                            if existingField == targetField then
                                dragged

                            else
                                DragNew { details | dropIndex = maybeDroppable }

                        Nothing ->
                            DragNew { details | dropIndex = maybeDroppable }


dragOverDecoder : Int -> Maybe FormField -> Json.Decode.Decoder ( Msg, Bool )
dragOverDecoder index maybeFormField =
    Json.Decode.succeed
        ( DragOver (Just ( index, maybeFormField ))
        , True
        )


decodeCondition : Json.Decode.Decoder Condition
decodeCondition =
    Json.Decode.field "type" Json.Decode.string
        |> Json.Decode.andThen
            (\type_ ->
                case type_ of
                    "Field" ->
                        Json.Decode.succeed Field
                            |> andMap (Json.Decode.field "fieldName" Json.Decode.string)
                            |> andMap (Json.Decode.field "comparison" decodeComparison)

                    "And" ->
                        Json.Decode.succeed And
                            |> andMap (Json.Decode.field "conditions" (Json.Decode.list decodeCondition))

                    "Or" ->
                        Json.Decode.succeed Or
                            |> andMap (Json.Decode.field "conditions" (Json.Decode.list decodeCondition))

                    "Not" ->
                        Json.Decode.succeed Not
                            |> andMap (Json.Decode.field "condition" decodeCondition)

                    "Always" ->
                        Json.Decode.succeed Always

                    _ ->
                        Json.Decode.fail ("Unknown condition type: " ++ type_)
            )


decodeComparison : Json.Decode.Decoder Comparison
decodeComparison =
    Json.Decode.field "type" Json.Decode.string
        |> Json.Decode.andThen
            (\type_ ->
                case type_ of
                    "Equals" ->
                        Json.Decode.succeed Equals
                            |> andMap (Json.Decode.field "value" Json.Decode.string)

                    "StringContains" ->
                        Json.Decode.succeed StringContains
                            |> andMap (Json.Decode.field "value" Json.Decode.string)

                    "ChoiceIncludes" ->
                        Json.Decode.succeed ChoiceIncludes
                            |> andMap (Json.Decode.field "value" Json.Decode.string)

                    "EndsWith" ->
                        Json.Decode.succeed EndsWith
                            |> andMap (Json.Decode.field "value" Json.Decode.string)

                    _ ->
                        Json.Decode.fail ("Unknown comparison type: " ++ type_)
            )


evaluateCondition : Dict String (List String) -> Condition -> Bool
evaluateCondition trackedFormValues condition =
    case condition of
        Always ->
            True

        Field fieldName comparison ->
            case comparison of
                Equals value ->
                    Dict.get fieldName trackedFormValues == Just [ value ]

                StringContains value ->
                    Dict.get fieldName trackedFormValues
                        |> Maybe.withDefault []
                        |> List.any
                            (\fieldValue ->
                                String.contains value fieldValue
                            )

                ChoiceIncludes value ->
                    Dict.get fieldName trackedFormValues
                        |> Maybe.withDefault []
                        |> List.member value

                EndsWith value ->
                    Dict.get fieldName trackedFormValues
                        |> Maybe.withDefault []
                        |> List.any
                            (\fieldValue ->
                                String.endsWith value fieldValue
                            )

        And conditions ->
            List.all (evaluateCondition trackedFormValues) conditions

        Or conditions ->
            List.any (evaluateCondition trackedFormValues) conditions

        Not cond ->
            not (evaluateCondition trackedFormValues cond)


isVisibilityRuleSatisfied : VisibilityRule -> Dict String (List String) -> Bool
isVisibilityRuleSatisfied rule trackedFormValues =
    case rule of
        ShowWhen condition ->
            evaluateCondition trackedFormValues condition

        HideWhen condition ->
            not (evaluateCondition trackedFormValues condition)


comparisonOf : Condition -> Maybe Comparison
comparisonOf condition =
    case condition of
        Field _ comparison ->
            Just comparison

        And _ ->
            Nothing

        Or _ ->
            Nothing

        Not _ ->
            Nothing

        Always ->
            Nothing


isComparingWith : Comparison -> Maybe Comparison -> Bool
isComparingWith expected maybeComparison =
    case expected of
        Equals _ ->
            case maybeComparison of
                Just (Equals _) ->
                    True

                _ ->
                    False

        StringContains _ ->
            case maybeComparison of
                Just (StringContains _) ->
                    True

                _ ->
                    False

        ChoiceIncludes _ ->
            case maybeComparison of
                Just (ChoiceIncludes _) ->
                    True

                _ ->
                    False

        EndsWith _ ->
            case maybeComparison of
                Just (EndsWith _) ->
                    True

                _ ->
                    False


updateVisibilityRule : String -> VisibilityRule -> VisibilityRule
updateVisibilityRule comparisonType rule =
    case rule of
        ShowWhen condition ->
            case condition of
                Field fieldName comparison ->
                    ShowWhen (Field fieldName (updateComparison comparisonType comparison))

                _ ->
                    rule

        HideWhen condition ->
            case condition of
                Field fieldName comparison ->
                    HideWhen (Field fieldName (updateComparison comparisonType comparison))

                _ ->
                    rule


updateComparison : String -> Comparison -> Comparison
updateComparison comparisonType comparison =
    case comparisonType of
        "Equals" ->
            case comparison of
                Equals str ->
                    Equals str

                StringContains str ->
                    Equals str

                ChoiceIncludes str ->
                    Equals str

                EndsWith str ->
                    Equals str

        "StringContains" ->
            case comparison of
                Equals str ->
                    StringContains str

                StringContains str ->
                    StringContains str

                ChoiceIncludes str ->
                    StringContains str

                EndsWith str ->
                    StringContains str

        "ChoiceIncludes" ->
            case comparison of
                Equals str ->
                    ChoiceIncludes str

                StringContains str ->
                    ChoiceIncludes str

                ChoiceIncludes str ->
                    ChoiceIncludes str

                EndsWith str ->
                    ChoiceIncludes str

        "EndsWith" ->
            case comparison of
                Equals str ->
                    EndsWith str

                StringContains str ->
                    EndsWith str

                ChoiceIncludes str ->
                    EndsWith str

                EndsWith str ->
                    EndsWith str

        _ ->
            comparison


setAttributeOptionalVisibilityRule : String -> AttributeOptional VisibilityRule -> AttributeOptional VisibilityRule
setAttributeOptionalVisibilityRule comparisonType attributeOptional =
    case attributeOptional of
        AttributeNotNeeded maybeRule ->
            case maybeRule of
                Just rule ->
                    AttributeGiven (updateVisibilityRule comparisonType rule)

                Nothing ->
                    attributeOptional

        AttributeInvalid _ ->
            attributeOptional

        AttributeGiven rule ->
            AttributeGiven (updateVisibilityRule comparisonType rule)
