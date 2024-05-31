package config

import "time"

type Config struct {
	App AppConfig      `json:"app"`
	Sql DatabaseConfig `json:"sql"`
	Jwt JWTConfig      `json:"jwt"`
}

type AppConfig struct {
	Name string `json:"name"`

	//Log level, 1 for debug 2 for production
	Level int64  `json:"level"`
	Port  string `json:"port"`
}

type DatabaseConfig struct {
	Host string `json:"host"`
	Type string `json:"type"`
}

type PaymentConfig struct {
	ApiKey string `json:"api_key"`
	Host   string `json:"host"`
}

type JWTConfig struct {
	AccessSecret  string        `json:"access_secret"`
	RefreshSecret string        `json:"refresh_secret"`
	Span          time.Duration `json:"span"`
}
