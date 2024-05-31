package hello

import (
	"github.com/labstack/echo/v4"
	"go-be-template/internal/model/dto/hello"
	"net/http"
)

func (h *Handler) GetHelloMessageHandler(e echo.Context) error {
	msg, err := h.helloUsecase.GetHelloMessageUsecase()
	if err != nil {
		return e.JSON(err.StatusCode, err.GetError())
	}
	accessToken, err := h.helloUsecase.CreateBearerTokenUsecase()
	if err != nil {
		return e.JSON(err.StatusCode, err.GetError())
	}
	return e.JSON(http.StatusOK, hello.HelloResponseDTO{
		Message:      msg.Message,
		AcccessToken: accessToken,
	})
}
