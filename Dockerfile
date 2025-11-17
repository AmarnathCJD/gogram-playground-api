FROM tinygo/tinygo:0.31.2

# Install Go server
RUN apt-get update && apt-get install -y golang

WORKDIR /app

COPY . .

RUN go build -o server main.go

EXPOSE 10000

CMD ["./server"]
