package main

import (
	"github.com/labstack/gommon/log"
	"go-be-template/internal/model/config"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("%s/n", err.Error())
	}
	server, err := applicationDelegate(cfg)
	if err != nil {
		log.Fatalf("%s/n", err.Error())
	}
	runServer(cfg, server)
}
