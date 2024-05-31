package wrapper

type ErrorWrapper struct {
	StatusCode int
	Error      error
}

func (w *ErrorWrapper) GetError() string {
	return w.Error.Error()
}
