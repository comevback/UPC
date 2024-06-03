package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"

	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/image"
	"github.com/docker/docker/client"
	"github.com/gorilla/websocket"
)

var dockerClient *client.Client
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func main() {
	var err error
	dockerClient, err = client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		log.Fatal(err)
	}
	defer dockerClient.Close()

	http.HandleFunc("/", indexHandler)
	http.HandleFunc("/api", apiHandler)
	http.HandleFunc("/api/upload", uploadHandler)
	// http.HandleFunc("/api/files", listFilesHandler)
	// http.HandleFunc("/api/results", listResultsHandler)
	// http.HandleFunc("/api/temps", listTempsHandler)
	http.HandleFunc("/api/images", listImagesHandler)
	http.HandleFunc("/api/containers", listContainersHandler)
	http.HandleFunc("/api/containers/{containerID}", inspectContainerHandler)
	// http.HandleFunc("/api/images/{imageName}", inspectImageHandler)
	// http.HandleFunc("/api/files/{filename}", downloadFileHandler)
	// http.HandleFunc("/api/files/download", downloadSelectedFilesHandler)
	// http.HandleFunc("/api/results/{filename}", downloadResultHandler)
	// http.HandleFunc("/api/results/download", downloadSelectedResultsHandler)
	// http.HandleFunc("/api/temps/{filename}", downloadTempHandler)
	// http.HandleFunc("/api/temps/download", downloadSelectedTempsHandler)
	// http.HandleFunc("/api/files/{filename}", deleteFileHandler)
	// http.HandleFunc("/api/results/{filename}", deleteResultHandler)
	// http.HandleFunc("/api/images/{imageName}", deleteImageHandler)
	// http.HandleFunc("/api/command", commandHandler)
	http.HandleFunc("/ws", wsHandler)

	srv := &http.Server{
		Addr: ":4000",
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	log.Println("Server started on :4000")

	waitForShutdown(srv)
}

func waitForShutdown(srv *http.Server) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	if err := srv.Shutdown(context.Background()); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}
}

func setupResponse(w *http.ResponseWriter, req *http.Request) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello, World!"))
}

func apiHandler(w http.ResponseWriter, r *http.Request) {
	setupResponse(&w, r)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Connected to API server"))
}

// Other handlers go here...

// Upload handler
func uploadHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(32 << 20) // 32MB is the default used by FormFile
	files := r.MultipartForm.File["file"]
	var uploadedFiles []string

	for _, file := range files {
		src, err := file.Open()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer src.Close()

		dst, err := os.Create(filepath.Join("uploads", file.Filename))
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		if _, err := io.Copy(dst, src); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		uploadedFiles = append(uploadedFiles, file.Filename)
	}

	json.NewEncoder(w).Encode(uploadedFiles)
}

// List images handler
func listImagesHandler(w http.ResponseWriter, r *http.Request) {
	images, err := dockerClient.ImageList(context.Background(), image.ListOptions{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(images)
}

// List Containers handler with a formatted JSON response
func listContainersHandler(w http.ResponseWriter, r *http.Request) {
	containers, err := dockerClient.ContainerList(context.Background(), container.ListOptions{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	var formattedContainers []map[string]interface{}
	for _, container := range containers {
		formattedContainers = append(formattedContainers, map[string]interface{}{
			"ID":      container.ID,
			"Names":   container.Names,
			"Image":   container.Image,
			"Command": container.Command,
			"Created": container.Created,
			"State":   container.State,
			"Status":  container.Status,
		})
	}

	json.NewEncoder(w).Encode(formattedContainers)
}

// Inspect container handler
func inspectContainerHandler(w http.ResponseWriter, r *http.Request) {
	// get id from request params
	params := strings.Split(r.URL.Path, "/")
	id := params[len(params)-1]
	fmt.Println(id)
	containerInfo, err := dockerClient.ContainerInspect(context.Background(), id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	containerName := containerInfo.Name
	fmt.Println(containerName)
	// return the container name as JSON

}

// WebSocket handler
func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("Upgrade:", err)
		return
	}
	defer conn.Close()

	for {
		mt, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Read:", err)
			break
		}
		log.Printf("recv: %s", message)
		err = conn.WriteMessage(mt, message)
		if err != nil {
			log.Println("Write:", err)
			break
		}
	}
}

// Other handlers (listFilesHandler, listResultsHandler, etc.) should be implemented here...
