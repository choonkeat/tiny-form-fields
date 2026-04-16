module XssDefenseTest exposing (..)

import Dict
import Expect
import Json.Decode
import Main
import Test exposing (Test, describe, test)


decodeTag : String -> Result String String
decodeTag raw =
    raw
        |> Json.Decode.decodeString Main.decodeCustomElement
        |> Result.mapError Json.Decode.errorToString
        |> Result.map .inputTag


decodeAttrs : String -> Result String (Dict.Dict String String)
decodeAttrs raw =
    raw
        |> Json.Decode.decodeString Main.decodeCustomElement
        |> Result.mapError Json.Decode.errorToString
        |> Result.map .attributes


suite : Test
suite =
    describe "XSS defenses on decoded form definitions"
        [ describe "sanitizeInputTag via decodeCustomElement"
            [ test "default 'input' tag survives" <|
                \_ ->
                    decodeTag """{"inputType":"Text","attributes":{"type":"text"}}"""
                        |> Expect.equal (Ok "input")
            , test "explicit 'input' tag survives" <|
                \_ ->
                    decodeTag """{"inputType":"Text","inputTag":"input","attributes":{}}"""
                        |> Expect.equal (Ok "input")
            , test "hyphenated custom element is allowed" <|
                \_ ->
                    decodeTag """{"inputType":"Nric","inputTag":"validated-input","attributes":{}}"""
                        |> Expect.equal (Ok "validated-input")
            , test "iframe is rejected and falls back to input" <|
                \_ ->
                    decodeTag """{"inputType":"x","inputTag":"iframe","attributes":{}}"""
                        |> Expect.equal (Ok "input")
            , test "IFRAME with mixed case is also rejected" <|
                \_ ->
                    decodeTag """{"inputType":"x","inputTag":"IFrame","attributes":{}}"""
                        |> Expect.equal (Ok "input")
            , test "object tag is rejected" <|
                \_ ->
                    decodeTag """{"inputType":"x","inputTag":"object","attributes":{}}"""
                        |> Expect.equal (Ok "input")
            , test "embed tag is rejected" <|
                \_ ->
                    decodeTag """{"inputType":"x","inputTag":"embed","attributes":{}}"""
                        |> Expect.equal (Ok "input")
            , test "meta tag is rejected" <|
                \_ ->
                    decodeTag """{"inputType":"x","inputTag":"meta","attributes":{}}"""
                        |> Expect.equal (Ok "input")
            , test "script tag is rejected (defense in depth even though Elm rewrites)" <|
                \_ ->
                    decodeTag """{"inputType":"x","inputTag":"script","attributes":{}}"""
                        |> Expect.equal (Ok "input")
            , test "tag starting with dash is rejected (invalid custom element)" <|
                \_ ->
                    decodeTag """{"inputType":"x","inputTag":"-foo","attributes":{}}"""
                        |> Expect.equal (Ok "input")
            , test "tag with non-alphanumeric chars is rejected" <|
                \_ ->
                    decodeTag """{"inputType":"x","inputTag":"my!tag","attributes":{}}"""
                        |> Expect.equal (Ok "input")
            ]
        , describe "sanitizeAttributes via decodeCustomElement"
            [ test "srcdoc is dropped (primary XSS vector)" <|
                \_ ->
                    decodeAttrs """{"inputType":"x","inputTag":"iframe","attributes":{"srcdoc":"<script>alert(1)</script>","type":"text"}}"""
                        |> Expect.equal (Ok (Dict.fromList [ ( "type", "text" ) ]))
            , test "sandbox is dropped" <|
                \_ ->
                    decodeAttrs """{"inputType":"x","attributes":{"sandbox":"allow-scripts","type":"text"}}"""
                        |> Expect.equal (Ok (Dict.fromList [ ( "type", "text" ) ]))
            , test "allow is dropped" <|
                \_ ->
                    decodeAttrs """{"inputType":"x","attributes":{"allow":"camera","type":"text"}}"""
                        |> Expect.equal (Ok (Dict.fromList [ ( "type", "text" ) ]))
            , test "http-equiv is dropped" <|
                \_ ->
                    decodeAttrs """{"inputType":"x","attributes":{"http-equiv":"refresh","content":"0;url=http://x"}}"""
                        |> Expect.equal (Ok (Dict.fromList [ ( "content", "0;url=http://x" ) ]))
            , test "srcdoc dropped case-insensitively" <|
                \_ ->
                    decodeAttrs """{"inputType":"x","attributes":{"SrcDoc":"<script>bad</script>"}}"""
                        |> Expect.equal (Ok Dict.empty)
            , test "benign attributes pass through unchanged" <|
                \_ ->
                    decodeAttrs """{"inputType":"x","attributes":{"type":"email","pattern":"^.+@.+$","maxlength":"100","placeholder":"you@example.com"}}"""
                        |> Expect.equal
                            (Ok
                                (Dict.fromList
                                    [ ( "type", "email" )
                                    , ( "pattern", "^.+@.+$" )
                                    , ( "maxlength", "100" )
                                    , ( "placeholder", "you@example.com" )
                                    ]
                                )
                            )
            , test "style passes through (not in denylist, legitimate customization)" <|
                \_ ->
                    decodeAttrs """{"inputType":"x","attributes":{"style":"color:red","type":"text"}}"""
                        |> Expect.equal
                            (Ok
                                (Dict.fromList
                                    [ ( "style", "color:red" )
                                    , ( "type", "text" )
                                    ]
                                )
                            )
            ]
        , describe "end-to-end: the iframe+srcdoc PoC from the vuln report"
            [ test "iframe tag and srcdoc attribute are both neutralized" <|
                \_ ->
                    let
                        poc =
                            """{"inputType":"x","inputTag":"iframe","attributes":{"srcdoc":"<script>alert(document.domain)</script>","src":"x"}}"""
                    in
                    poc
                        |> Json.Decode.decodeString Main.decodeCustomElement
                        |> Result.mapError Json.Decode.errorToString
                        |> Result.map (\ce -> ( ce.inputTag, Dict.get "srcdoc" ce.attributes ))
                        |> Expect.equal (Ok ( "input", Nothing ))
            ]
        ]
