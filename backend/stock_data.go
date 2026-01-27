package main

import (
	"encoding/json"
	"log"
	"math"
	"os"
	"time"
)

func initializeStocks() {
	loadStocks()
	generateHistoricalData()
}

func calculateNextPrice(currentPrice float64) float64 {
	changePercent := (randomizer.Float64() - 0.5) * 0.08 // +/- 4%
	newPrice := currentPrice * (1 + changePercent)
	if newPrice < 1.0 {
		newPrice = 1.0
	}
	return math.Round(newPrice*100) / 100
}

func loadStocks() {
	file, err := os.Open("stocks_data.json")
	if err != nil {
		log.Fatalf("Failed to open stocks.json: %v", err)
	}
	defer file.Close()

	var stockList []Stock
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&stockList); err != nil {
		log.Fatalf("Failed to decode stocks.json: %v", err)
	}

	for _, s := range stockList {
		stockManager.stocks[s.Symbol] = &Stock{
			Symbol: s.Symbol,
			Name:   s.Name,
			Price:  s.Price,
		}
	}

}

func generateHistoricalData() {
	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	for symbol, stock := range stockManager.stocks {
		history := []HistoricalDataPoint{}
		currentPrice := stock.Price
		currentTime := startOfDay

		for currentTime.Before(now) {
			randomSeconds := randomizer.Intn(10) + 20
			currentTime = currentTime.Add(time.Duration(randomSeconds) * time.Second)

			if currentTime.After(now) {
				break
			}

			currentPrice = calculateNextPrice(currentPrice)

			history = append(history, HistoricalDataPoint{
				Timestamp: currentTime,
				Price:     math.Round(currentPrice*100) / 100,
			})
		}

		stockManager.historicalData[symbol] = history
		stock.Price = history[len(history)-1].Price
	}
}

func (sm *StockManager) generateAndBroadcastPriceChanges() {
	ticker := time.NewTicker(20 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		sm.mu.Lock()
		for symbol, stock := range sm.stocks {
			stock.Price = calculateNextPrice(stock.Price)

			timestamp := time.Now()

			update := PriceUpdate{
				Symbol:    symbol,
				Price:     stock.Price,
				Timestamp: timestamp,
			}
			sm.historicalData[symbol] = append(sm.historicalData[symbol], HistoricalDataPoint{
				Timestamp: timestamp,
				Price:     stock.Price,
			})

			sm.sendToSubscribers(symbol, update)
		}
		sm.mu.Unlock()
	}
}
