package auth

import "go-be-template/internal/model/config"

type Handler struct {
	cfg *config.Config
}

func New(cfg *config.Config) *Handler {
	return &Handler{
		cfg: cfg,
	}
}
