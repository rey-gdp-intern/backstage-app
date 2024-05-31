package app

import (
	"go-be-template/internal/model/config"
	"go-be-template/internal/usecase/hello"
)

type CommonUsecase struct {
	HelloUsecase *hello.Usecase
}

func NewCommonUsecase(cfg *config.Config, commonRepo *CommonRepository) (*CommonUsecase, error) {
	helloUsecase, err := hello.New(cfg, commonRepo.helloRepo)
	if err != nil {
		return nil, err
	}
	return &CommonUsecase{
		HelloUsecase: helloUsecase,
	}, nil
}
