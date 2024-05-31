package main

import (
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"go-be-template/app"
	"go-be-template/internal/handler/auth"
	"go-be-template/internal/handler/hello"
	"go-be-template/internal/middleware/authentication"
	"go-be-template/internal/model/config"
)

type CustomValidator struct {
	validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	return cv.validator.Struct(i)
}

func applicationDelegate(cfg *config.Config) (*echo.Echo, error) {
	rsc, err := app.NewCommonResource(cfg)
	if err != nil {
		return nil, err
	}
	repos, err := app.NewCommonRepository(cfg, rsc)
	if err != nil {
		return nil, err
	}
	usecases, err := app.NewCommonUsecase(cfg, repos)
	if err != nil {
		return nil, err
	}
	helloHandler := hello.New(cfg, usecases.HelloUsecase)
	authHandler := auth.New(cfg)
	e := echo.New()
	e.Validator = &CustomValidator{validator: validator.New()}
	// hello example
	helloGroup := e.Group("/hello")
	helloGroup.GET("", helloHandler.GetHelloMessageHandler)
	helloGroup.GET(
		"/protected",
		helloHandler.GetHelloMessageHandler,
		authentication.AuthorizationMiddleware(cfg.Jwt.AccessSecret))

	e.POST("/refresh", authHandler.RefreshAccessTokenHandler)
	return e, nil
}
