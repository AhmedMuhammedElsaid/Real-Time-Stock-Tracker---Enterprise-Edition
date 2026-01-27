package main

import (
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Stock struct {
	Symbol string  `json:"symbol"`
	Name   string  `json:"name"`
	Price  float64 `json:"price"`
}

type StockListItemResponse struct {
	Symbol string  `json:"symbol"`
	Name   string  `json:"name"`
	Price  float64 `json:"price"`
}

type PriceUpdate struct {
	Symbol    string    `json:"symbol"`
	Price     float64   `json:"price"`
	Timestamp time.Time `json:"timestamp"`
}

type HistoricalDataPoint struct {
	Timestamp time.Time `json:"timestamp"`
	Price     float64   `json:"price"`
}

type WSMessage struct {
	Action  string   `json:"action"`
	Symbols []string `json:"symbols"`
}

type StockManager struct {
	stocks           map[string]*Stock
	historicalData   map[string][]HistoricalDataPoint
	mu               sync.RWMutex
	priceSubscribers map[*websocket.Conn]map[string]bool
	subMu            sync.RWMutex
}
