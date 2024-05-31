package app

import (
	_ "database/sql"
	_ "github.com/jackc/pgx/v4/stdlib"
	"github.com/jmoiron/sqlx"
	"go-be-template/internal/model/config"
)

type CommonResource struct {
	Db *sqlx.DB
}

func NewCommonResource(cfg *config.Config) (*CommonResource, error) {
	db, err := sqlx.Open(cfg.Sql.Type, cfg.Sql.Host)
	if err != nil {
		return nil, err
	}
	if err = db.Ping(); err != nil {
		return nil, err
	}
	return &CommonResource{
		Db: db,
	}, nil
}
