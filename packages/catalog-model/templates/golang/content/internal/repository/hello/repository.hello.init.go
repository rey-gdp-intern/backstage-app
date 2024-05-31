package hello

import "go-be-template/internal/model/config"

type Repository struct {
	cfg *config.Config
}

func New(cfg *config.Config) (*Repository, error) {
	return &Repository{
		cfg: cfg,
	}, nil
}
