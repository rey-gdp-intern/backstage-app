package wrapper

type BaseResponseDTO struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

type SuccessResponseDTO struct {
	BaseResponseDTO
	Data interface{} `json:"data"`
}

type PaginationResponseDTO struct {
	SuccessResponseDTO
	CurrentPage int64 `json:"current_page"`
	MaxPage     int64 `json:"max_page"`
}
