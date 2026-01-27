FROM golang:1.21-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -o stockserver .

###############

FROM alpine:latest

EXPOSE 3000

WORKDIR /app/stockserver

COPY stocks_data.json ./
COPY --from=builder /app/stockserver /app/stockserver

CMD ["./stockserver"]
