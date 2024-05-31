package auth

import (
	"github.com/labstack/echo/v4"
	"go-be-template/internal/model/dto/auth"
	"go-be-template/internal/model/dto/wrapper"
	"net/http"
)

func (h *Handler) RefreshAccessTokenHandler(e echo.Context) error {
	var req auth.RefreshTokenRequestDTO

	if err := e.Bind(&req); err != nil {
		return e.JSON(http.StatusInternalServerError, wrapper.BaseResponseDTO{
			Code:    http.StatusInternalServerError,
			Message: "cannot bind request body",
		})
	}

	if err := e.Validate(&req); err != nil {
		return e.JSON(http.StatusInternalServerError, wrapper.BaseResponseDTO{
			Code:    http.StatusBadRequest,
			Message: err.Error(),
		})
	}

	return nil
}
