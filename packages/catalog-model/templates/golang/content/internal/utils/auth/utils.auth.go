package auth

import (
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"go-be-template/internal/model/config"
	"go-be-template/internal/model/entity/wrapper"
	"net/http"
	"time"
)

func CreateAccessToken(cfg config.JWTConfig, userId string) (string, *wrapper.ErrorWrapper) {
	claims := jwt.RegisteredClaims{
		Issuer:    "rest-be",
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Minute * cfg.Span)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ID:        userId,
	}
	token, err := signToken(cfg.AccessSecret, claims)
	if err != nil {
		return "", &wrapper.ErrorWrapper{
			StatusCode: http.StatusInternalServerError,
			Error:      err,
		}
	}
	return token, nil
}

func signToken(secret string, claims jwt.Claims) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS512, claims)
	return token.SignedString([]byte(secret))
}

func CreateRefreshToken(cfg config.JWTConfig, userId string) (string, *wrapper.ErrorWrapper) {
	claims := jwt.RegisteredClaims{
		Issuer:    "rest-be",
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Minute * cfg.Span)),
		NotBefore: jwt.NewNumericDate(time.Now().Add(time.Minute * cfg.Span)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		ID:        userId,
	}
	token, err := signToken(cfg.RefreshSecret, claims)
	if err != nil {
		return "", &wrapper.ErrorWrapper{
			StatusCode: http.StatusInternalServerError,
			Error:      err,
		}
	}
	return token, nil
}

func ParseRefreshToken(cfg config.JWTConfig, refreshToken string) (*jwt.RegisteredClaims, *wrapper.ErrorWrapper) {
	secret := []byte(cfg.RefreshSecret)
	token, err := jwt.ParseWithClaims(refreshToken, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})
	if err != nil {
		return nil, &wrapper.ErrorWrapper{
			StatusCode: http.StatusBadRequest,
			Error:      err,
		}
	}
	if claims, ok := token.Claims.(*jwt.RegisteredClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, &wrapper.ErrorWrapper{
		StatusCode: http.StatusInternalServerError,
		Error:      errors.New("cannot decode token"),
	}
}

func GetClaims(e echo.Context) (*jwt.RegisteredClaims, *wrapper.ErrorWrapper) {
	claims, ok := e.Get("claims").(*jwt.RegisteredClaims)
	if !ok {
		return nil, &wrapper.ErrorWrapper{
			StatusCode: http.StatusInternalServerError,
			Error:      errors.New("cannot decode or find authorization claims"),
		}
	}
	return claims, nil
}
