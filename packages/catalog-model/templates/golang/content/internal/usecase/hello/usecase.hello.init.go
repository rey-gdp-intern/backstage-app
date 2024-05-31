package hello

import (
	"go-be-template/internal/model/config"
	"go-be-template/internal/repository/hello"
)

type Usecase struct {
	cfg       *config.Config
	helloRepo *hello.Repository
}

func New(cfg *config.Config, helloRepo *hello.Repository) (*Usecase, error) {
	return &Usecase{
		cfg:       cfg,
		helloRepo: helloRepo,
	}, nil
}
