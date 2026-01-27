package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleGetStocks(w http.ResponseWriter, r *http.Request) {
	if randomizer.Intn(10) == 0 {
		http.Error(w, "Simulated server error", http.StatusInternalServerError)
		return
	}
	stockManager.mu.RLock()
	defer stockManager.mu.RUnlock()

	stocks := make([]StockListItemResponse, 0, len(stockManager.stocks))
	for _, stock := range stockManager.stocks {
		stocks = append(stocks, StockListItemResponse{
			Symbol: stock.Symbol,
			Name:   stock.Name,
			Price:  stock.Price,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stocks)
}

func handleGetHistory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	symbol := vars["symbol"]

	if randomizer.Intn(10) == 0 {
		http.Error(w, "Simulated server error", http.StatusInternalServerError)
		return
	}

	stockManager.mu.RLock()
	history, exists := stockManager.historicalData[symbol]
	stockManager.mu.RUnlock()

	if !exists {
		http.Error(w, "Stock not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	stockManager.subMu.Lock()
	stockManager.priceSubscribers[conn] = make(map[string]bool)
	stockManager.subMu.Unlock()

	defer func() {
		stockManager.subMu.Lock()
		delete(stockManager.priceSubscribers, conn)
		stockManager.subMu.Unlock()
		conn.Close()
	}()

	disconnectTimer := time.AfterFunc(
		time.Duration(120+randomizer.Intn(480))*time.Second,
		func() {
			conn.Close()
		},
	)
	defer disconnectTimer.Stop()

	for {
		var msg WSMessage
		err := conn.ReadJSON(&msg)
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}

		stockManager.subMu.Lock()
		switch msg.Action {
		case "subscribe":
			for _, symbol := range msg.Symbols {
				if _, exists := stockManager.stocks[symbol]; exists {
					stockManager.priceSubscribers[conn][symbol] = true
				}
			}
		case "unsubscribe":
			for _, symbol := range msg.Symbols {
				delete(stockManager.priceSubscribers[conn], symbol)
			}
		}
		stockManager.subMu.Unlock()
	}
}
