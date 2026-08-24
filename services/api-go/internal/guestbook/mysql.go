package guestbook

import (
	"context"
	"database/sql"
	"embed"
	"errors"
	"fmt"
	"io/fs"
	"net"
	"net/url"
	"strconv"
	"strings"
	"time"

	mysql "github.com/go-sql-driver/mysql"
)

const migrationLockName = "selfweb_guestbook_migrations"

//go:embed migrations/*.sql
var migrationFiles embed.FS

// MySQLStore persists guestbook messages in MySQL through database/sql.
type MySQLStore struct {
	db *sql.DB
}

// NewMySQLStore creates a bounded, lazily connected MySQL pool. It accepts both
// the Go driver's DSN format and a mysql:// URL from hosting providers.
func NewMySQLStore(databaseURL string) (*MySQLStore, error) {
	dsn, err := normalizeMySQLDSN(databaseURL)
	if err != nil {
		return nil, err
	}

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("open mysql: %w", err)
	}
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(2)
	db.SetConnMaxLifetime(5 * time.Minute)
	db.SetConnMaxIdleTime(time.Minute)

	return &MySQLStore{db: db}, nil
}

// OpenMySQL creates a bounded MySQL connection pool and verifies that the
// database is reachable. Commands that must fail fast, such as migrations,
// should use this instead of NewMySQLStore.
func OpenMySQL(ctx context.Context, databaseURL string) (*MySQLStore, error) {
	store, err := NewMySQLStore(databaseURL)
	if err != nil {
		return nil, err
	}

	if err := store.db.PingContext(ctx); err != nil {
		store.db.Close()
		return nil, fmt.Errorf("ping mysql: %w", err)
	}

	return store, nil
}

// Close releases the database pool during process shutdown.
func (store *MySQLStore) Close() error {
	return store.db.Close()
}

// Migrate applies each embedded migration once while a MySQL named lock keeps
// concurrent deployment commands from applying the same version together.
func (store *MySQLStore) Migrate(ctx context.Context) error {
	connection, err := store.db.Conn(ctx)
	if err != nil {
		return fmt.Errorf("open migration connection: %w", err)
	}
	defer connection.Close()

	var locked sql.NullInt64
	if err := connection.QueryRowContext(ctx, "SELECT GET_LOCK(?, ?)", migrationLockName, 10).Scan(&locked); err != nil {
		return fmt.Errorf("acquire migration lock: %w", err)
	}
	if !locked.Valid || locked.Int64 != 1 {
		return errors.New("timed out acquiring migration lock")
	}
	defer releaseMySQLMigrationLock(connection)

	if _, err := connection.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
	`); err != nil {
		return fmt.Errorf("create migration table: %w", err)
	}

	entries, err := fs.ReadDir(migrationFiles, "migrations")
	if err != nil {
		return fmt.Errorf("read embedded migrations: %w", err)
	}

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".sql") {
			continue
		}
		contents, err := migrationFiles.ReadFile("migrations/" + entry.Name())
		if err != nil {
			return fmt.Errorf("read migration %s: %w", entry.Name(), err)
		}
		if err := applyMySQLMigration(ctx, connection, entry.Name(), string(contents)); err != nil {
			return err
		}
	}

	return nil
}

func releaseMySQLMigrationLock(connection *sql.Conn) {
	contextWithTimeout, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	var released sql.NullInt64
	_ = connection.QueryRowContext(contextWithTimeout, "SELECT RELEASE_LOCK(?)", migrationLockName).Scan(&released)
}

func applyMySQLMigration(ctx context.Context, connection *sql.Conn, version, statement string) error {
	tx, err := connection.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("begin migration %s: %w", version, err)
	}
	defer tx.Rollback()

	var applied bool
	if err := tx.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = ?)", version).Scan(&applied); err != nil {
		return fmt.Errorf("check migration %s: %w", version, err)
	}
	if !applied {
		if _, err := tx.ExecContext(ctx, statement); err != nil {
			return fmt.Errorf("apply migration %s: %w", version, err)
		}
		if _, err := tx.ExecContext(ctx, "INSERT INTO schema_migrations (version) VALUES (?)", version); err != nil {
			return fmt.Errorf("record migration %s: %w", version, err)
		}
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit migration %s: %w", version, err)
	}
	return nil
}

// ListApproved returns at most limit public messages, ordered newest first.
func (store *MySQLStore) ListApproved(ctx context.Context, limit int, beforeID int64) (Page, error) {
	rows, err := store.db.QueryContext(ctx, `
		SELECT CAST(id AS CHAR), name, content, likes, created_at, status
		FROM guestbook_messages
		WHERE status = ? AND (? = 0 OR id < ?)
		ORDER BY id DESC
		LIMIT ?
	`, StatusApproved, beforeID, beforeID, limit+1)
	if err != nil {
		return Page{}, fmt.Errorf("list approved guestbook messages: %w", err)
	}
	defer rows.Close()

	messages := make([]Message, 0, limit+1)
	for rows.Next() {
		message, err := scanMessage(rows)
		if err != nil {
			return Page{}, err
		}
		messages = append(messages, message)
	}
	if err := rows.Err(); err != nil {
		return Page{}, fmt.Errorf("iterate guestbook messages: %w", err)
	}

	page := Page{Messages: messages}
	if len(messages) > limit {
		page.Messages = messages[:limit]
		page.NextCursor = page.Messages[len(page.Messages)-1].ID
	}
	return page, nil
}

// Create stores a message with a configurable moderation status.
func (store *MySQLStore) Create(ctx context.Context, input CreateInput, status Status) (Message, error) {
	result, err := store.db.ExecContext(ctx, `
		INSERT INTO guestbook_messages (name, content, status)
		VALUES (?, ?, ?)
	`, input.Name, input.Text, status)
	if err != nil {
		return Message{}, fmt.Errorf("create guestbook message: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return Message{}, fmt.Errorf("read created guestbook id: %w", err)
	}
	message, err := loadMySQLMessage(ctx, store.db, id)
	if err != nil {
		return Message{}, fmt.Errorf("load created guestbook message: %w", err)
	}
	return message, nil
}

// IncrementLikes updates one row and reads the resulting value inside the same
// transaction, so concurrent increments cannot overwrite each other.
func (store *MySQLStore) IncrementLikes(ctx context.Context, id int64) (Message, error) {
	tx, err := store.db.BeginTx(ctx, nil)
	if err != nil {
		return Message{}, fmt.Errorf("begin guestbook like: %w", err)
	}
	defer tx.Rollback()

	result, err := tx.ExecContext(ctx, `
		UPDATE guestbook_messages
		SET likes = likes + 1
		WHERE id = ? AND status = ?
	`, id, StatusApproved)
	if err != nil {
		return Message{}, fmt.Errorf("increment guestbook likes: %w", err)
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return Message{}, fmt.Errorf("read liked guestbook rows: %w", err)
	}
	if rowsAffected == 0 {
		return Message{}, ErrNotFound
	}

	message, err := loadMySQLMessage(ctx, tx, id)
	if err != nil {
		return Message{}, fmt.Errorf("load liked guestbook message: %w", err)
	}
	if err := tx.Commit(); err != nil {
		return Message{}, fmt.Errorf("commit guestbook like: %w", err)
	}
	return message, nil
}

type rowQuerier interface {
	QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}

func loadMySQLMessage(ctx context.Context, queryer rowQuerier, id int64) (Message, error) {
	row := queryer.QueryRowContext(ctx, `
		SELECT CAST(id AS CHAR), name, content, likes, created_at, status
		FROM guestbook_messages
		WHERE id = ?
	`, id)
	return scanMessage(row)
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanMessage(row rowScanner) (Message, error) {
	var message Message
	var createdAt time.Time
	if err := row.Scan(&message.ID, &message.Name, &message.Text, &message.Likes, &createdAt, &message.Status); err != nil {
		return Message{}, err
	}
	message.Date = createdAt.UTC().Format(time.DateOnly)
	return message, nil
}

// ParseCursor accepts numeric database identifiers without exposing an integer
// JSON precision issue to the browser.
func ParseCursor(value string) (int64, error) {
	if value == "" {
		return 0, nil
	}
	cursor, err := strconv.ParseInt(value, 10, 64)
	if err != nil || cursor <= 0 {
		return 0, errors.New("cursor must be a positive integer")
	}
	return cursor, nil
}

func normalizeMySQLDSN(value string) (string, error) {
	value = strings.TrimSpace(value)
	if value == "" {
		return "", errors.New("database url is required")
	}
	if strings.HasPrefix(strings.ToLower(value), "mysql://") {
		return mysqlURLToDSN(value)
	}

	config, err := mysql.ParseDSN(value)
	if err != nil {
		return "", fmt.Errorf("parse mysql dsn: %w", err)
	}
	config.ParseTime = true
	config.Loc = time.UTC
	return config.FormatDSN(), nil
}

func mysqlURLToDSN(value string) (string, error) {
	connectionURL, err := url.Parse(value)
	if err != nil {
		return "", fmt.Errorf("parse mysql url: %w", err)
	}
	if connectionURL.User == nil || connectionURL.User.Username() == "" || connectionURL.Host == "" {
		return "", errors.New("mysql url must include a user and host")
	}
	databaseName := strings.TrimPrefix(connectionURL.Path, "/")
	if databaseName == "" {
		return "", errors.New("mysql url must include a database name")
	}

	address := connectionURL.Host
	if _, _, err := net.SplitHostPort(address); err != nil {
		address = net.JoinHostPort(connectionURL.Hostname(), "3306")
	}

	config := mysql.NewConfig()
	config.User = connectionURL.User.Username()
	config.Passwd, _ = connectionURL.User.Password()
	config.Net = "tcp"
	config.Addr = address
	config.DBName = databaseName
	config.ParseTime = true
	config.Loc = time.UTC
	config.Collation = "utf8mb4_unicode_ci"

	query := connectionURL.Query()
	if tlsMode := query.Get("tls"); tlsMode != "" {
		config.TLSConfig = tlsMode
	} else {
		switch strings.ToLower(query.Get("ssl-mode")) {
		case "required", "verify_ca", "verify_identity":
			config.TLSConfig = "true"
		case "disabled":
			config.TLSConfig = "false"
		}
	}

	return config.FormatDSN(), nil
}
