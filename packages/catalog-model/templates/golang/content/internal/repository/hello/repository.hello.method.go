package hello

import (
	"go-be-template/internal/model/entity"
	"go-be-template/internal/model/entity/wrapper"
)

func (r *Repository) GetHelloMessage() (*entity.HelloEntity, *wrapper.ErrorWrapper) {
	return &entity.HelloEntity{
		Message: "Hello, World!",
	}, nil
}
