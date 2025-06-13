package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"golang.org/x/net/html"
)

func main() {
	url := flag.String("url", "", "URL to fetch HTML from")
	elementID := flag.String("id", "", "DOM element ID to find")
	attrName := flag.String("attr", "", "Attribute name to extract")
	flag.Parse()

	if *url == "" || *elementID == "" || *attrName == "" {
		fmt.Fprintf(os.Stderr, "Usage: %s -url <URL> -id <element-id> -attr <attribute-name>\n", os.Args[0])
		os.Exit(1)
	}

	// Fetch HTML from URL
	resp, err := http.Get(*url)
	if err != nil {
		log.Fatalf("Error fetching URL: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		log.Fatalf("HTTP error: %s", resp.Status)
	}

	// Parse HTML
	doc, err := html.Parse(resp.Body)
	if err != nil {
		log.Fatalf("Error parsing HTML: %v", err)
	}

	// Find element by ID and extract attribute
	attrValue := findElementAndExtractAttr(doc, *elementID, *attrName)
	if attrValue == "" {
		log.Fatalf("Element with ID '%s' or attribute '%s' not found", *elementID, *attrName)
	}

	// Parse and pretty print JSON
	var jsonData interface{}
	if err := json.Unmarshal([]byte(attrValue), &jsonData); err != nil {
		log.Fatalf("Error parsing JSON: %v", err)
	}

	prettyJSON, err := json.MarshalIndent(jsonData, "", "  ")
	if err != nil {
		log.Fatalf("Error formatting JSON: %v", err)
	}

	fmt.Println(string(prettyJSON))
}

func findElementAndExtractAttr(n *html.Node, targetID, attrName string) string {
	if n.Type == html.ElementNode {
		// Check if this element has the target ID
		for _, attr := range n.Attr {
			if attr.Key == "id" && attr.Val == targetID {
				// Found the element, now look for the target attribute
				for _, attr := range n.Attr {
					if attr.Key == attrName {
						return attr.Val
					}
				}
				return ""
			}
		}
	}

	// Recursively search child nodes
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		if result := findElementAndExtractAttr(c, targetID, attrName); result != "" {
			return result
		}
	}

	return ""
}
