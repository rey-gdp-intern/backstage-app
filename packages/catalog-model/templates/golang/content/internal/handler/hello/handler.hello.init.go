package hello

import (
	"go-be-template/internal/model/config"
	"go-be-template/internal/usecase/hello"
)

type Handler struct {
	cfg          *config.Config
	helloUsecase *hello.Usecase
}

func New(cfg *config.Config, helloUsecase *hello.Usecase) *Handler {
	return &Handler{
		cfg:          cfg,
		helloUsecase: helloUsecase,
	}
}
