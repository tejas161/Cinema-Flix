package routes

import (
    "github.com/gorilla/mux"          // third-party router
    "github.com/tejas161/Cinema-Flix/internal/handlers" // local handlers
)

// RegisterRoutes sets up all API endpoints
func RegisterRoutes(r *mux.Router) {
    r.HandleFunc("/health", handlers.HealthCheck).Methods("GET")
}
