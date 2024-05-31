package auth

type RefreshTokenRequestDTO struct {
	Token string `json:"token" validate:"required"`
}

type TokenResponseDTO struct {
	Token      string `json:"token"`
	BestBefore string `json:"best_before"`
}

type SignInResponseDTO struct {
	AccessToken  TokenResponseDTO `json:"access_token"`
	RefreshToken TokenResponseDTO `json:"refresh_token"`
}
