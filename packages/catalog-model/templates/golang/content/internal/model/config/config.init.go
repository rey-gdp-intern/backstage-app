package config

import (
	"encoding/json"
	"io"
	"os"
)

func LoadConfig() (*Config, error) {
	secret, err := os.Open("files/secrets/secrets.config.json")
	if err != nil {
		return nil, err
	}
	defer secret.Close()
	byteValue, err := io.ReadAll(secret)
	if err != nil {
		return nil, err
	}
	conf := Config{}
	err = json.Unmarshal(byteValue, &conf)
	if err != nil {
		return nil, err
	}
	return &conf, nil
}
