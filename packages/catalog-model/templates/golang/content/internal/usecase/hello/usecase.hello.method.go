package hello

import (
	"go-be-template/internal/model/entity"
	"go-be-template/internal/model/entity/wrapper"
	"go-be-template/internal/utils/auth"
)

func (u *Usecase) GetHelloMessageUsecase() (*entity.HelloEntity, *wrapper.ErrorWrapper) {
	return u.helloRepo.GetHelloMessage()
}

func (u *Usecase) CreateBearerTokenUsecase() (string, *wrapper.ErrorWrapper) {
	return auth.CreateAccessToken(u.cfg.Jwt, "iaitb")
}
