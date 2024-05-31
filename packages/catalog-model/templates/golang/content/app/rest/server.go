package main

import (
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
	"go-be-template/internal/model/config"
)

func runServer(cfg *config.Config, e *echo.Echo) {
	e.HideBanner = true
	e.HidePort = true
	fmt.Println(fmt.Sprintf("⇨ %s http-server is running on port \x1b[%dm[::]%s\x1b[0m", cfg.App.Name, 31, cfg.App.Port))
	log.Fatal(e.Start(cfg.App.Port))
}
