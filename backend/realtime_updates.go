package main

import (
	"log"
)

func (sm *StockManager) sendToSubscribers(symbol string, update PriceUpdate) {
	sm.subMu.RLock()
	defer sm.subMu.RUnlock()

	for conn, subscriptions := range sm.priceSubscribers {
		if subscriptions[symbol] {
			if err := conn.WriteJSON(update); err != nil {
				log.Printf("Error sending update: %v", err)
			}
		}
	}
}
