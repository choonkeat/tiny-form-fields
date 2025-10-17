package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
)

type HttpbinResponse struct {
	Args    map[string]interface{} `json:"args"`
	Data    string                 `json:"data"`
	Files   map[string]interface{} `json:"files"`
	Form    map[string]interface{} `json:"form"`
	Headers map[string]string      `json:"headers"`
	JSON    interface{}            `json:"json"`
	Origin  string                 `json:"origin"`
	URL     string                 `json:"url"`
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func postHandler(w http.ResponseWriter, r *http.Request) {
	log.Printf("Received %s request to %s from %s", r.Method, r.URL.Path, r.RemoteAddr)

	if r.Method != "POST" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
		return
	}

	response := HttpbinResponse{
		Args:    make(map[string]interface{}),
		Files:   make(map[string]interface{}),
		Form:    make(map[string]interface{}),
		Headers: make(map[string]string),
		Origin:  r.RemoteAddr,
		URL:     fmt.Sprintf("http://%s%s", r.Host, r.URL.String()),
	}

	// Parse query parameters
	for key, values := range r.URL.Query() {
		if len(values) == 1 {
			response.Args[key] = values[0]
		} else {
			response.Args[key] = values
		}
	}

	// Copy headers
	for key, values := range r.Header {
		response.Headers[key] = strings.Join(values, ", ")
	}

	// Parse body based on Content-Type
	contentType := r.Header.Get("Content-Type")

	if strings.HasPrefix(contentType, "application/x-www-form-urlencoded") {
		// Parse form data
		err := r.ParseForm()
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to parse form"})
			return
		}

		for key, values := range r.PostForm {
			if len(values) == 1 {
				response.Form[key] = values[0]
			} else {
				response.Form[key] = values
			}
		}

		// Also populate Data field with raw body
		body, _ := io.ReadAll(r.Body)
		response.Data = string(body)

	} else if strings.HasPrefix(contentType, "multipart/form-data") {
		// Parse multipart form
		err := r.ParseMultipartForm(32 << 20) // 32 MB max memory
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to parse multipart form"})
			return
		}

		// Handle form fields
		if r.MultipartForm != nil {
			for key, values := range r.MultipartForm.Value {
				if len(values) == 1 {
					response.Form[key] = values[0]
				} else {
					response.Form[key] = values
				}
			}

			// Handle files (simplified - just store file names)
			for key, files := range r.MultipartForm.File {
				fileNames := make([]string, len(files))
				for i, file := range files {
					fileNames[i] = file.Filename
				}
				if len(fileNames) == 1 {
					response.Files[key] = fileNames[0]
				} else {
					response.Files[key] = fileNames
				}
			}
		}

	} else if strings.HasPrefix(contentType, "application/json") {
		// Parse JSON body
		body, err := io.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to read body"})
			return
		}

		response.Data = string(body)

		// Try to parse JSON
		var jsonData interface{}
		if err := json.Unmarshal(body, &jsonData); err == nil {
			response.JSON = jsonData
		}

	} else {
		// Raw body
		body, err := io.ReadAll(r.Body)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to read body"})
			return
		}
		response.Data = string(body)
	}

	// Send response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/post", corsMiddleware(postHandler))

	// Also handle root for health check
	http.HandleFunc("/", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{
				"status":  "ok",
				"message": "httpbin mock server",
			})
		} else {
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(map[string]string{"error": "Not found"})
		}
	}))

	port := ":9000"
	log.Printf("Starting httpbin mock server on %s", port)
	log.Fatal(http.ListenAndServe(port, nil))
}
