package main

import (
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var randomizer = rand.New(rand.NewSource(time.Now().UnixNano()))
var stockManager *StockManager

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := os.Getenv("CORS_ORIGIN")
		if origin == "" {
			origin = "*"
		}
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	stockManager = &StockManager{
		stocks:           make(map[string]*Stock),
		historicalData:   make(map[string][]HistoricalDataPoint),
		priceSubscribers: make(map[*websocket.Conn]map[string]bool),
	}

	initializeStocks()

	go stockManager.generateAndBroadcastPriceChanges()

	r := mux.NewRouter()
	r.HandleFunc("/stocks", handleGetStocks).Methods("GET")
	r.HandleFunc("/stocks/{symbol}/history", handleGetHistory).Methods("GET")
	r.HandleFunc("/realtime-prices-ws", handleWebSocket)

	log.Println("Server starting on :3000")
	log.Fatal(http.ListenAndServe(":3000", enableCORS(r)))
}
