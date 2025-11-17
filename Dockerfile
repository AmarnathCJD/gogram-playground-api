FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y wget git ca-certificates build-essential

# Install Go
RUN wget https://go.dev/dl/go1.22.5.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go1.22.5.linux-amd64.tar.gz \
    && rm go1.22.5.linux-amd64.tar.gz
ENV PATH="/usr/local/go/bin:${PATH}"

# Install TinyGo
RUN wget https://github.com/tinygo-org/tinygo/releases/download/v0.31.2/tinygo_0.31.2_amd64.deb \
    && dpkg -i tinygo_0.31.2_amd64.deb \
    && rm tinygo_0.31.2_amd64.deb

WORKDIR /app

COPY . .

RUN go build -o server main.go

EXPOSE 10000

CMD ["./server"]
