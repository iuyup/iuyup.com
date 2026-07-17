package guestbook

import (
	"strings"
	"testing"
	"time"

	mysql "github.com/go-sql-driver/mysql"
)

func TestValidateCreateInputTrimsAndCountsRunes(t *testing.T) {
	input, err := ValidateCreateInput(CreateInput{
		Name: "  小王  ",
		Text: "  你好，网站很好看。  ",
	})
	if err != nil {
		t.Fatalf("ValidateCreateInput() error = %v", err)
	}
	if input.Name != "小王" || input.Text != "你好，网站很好看。" {
		t.Fatalf("ValidateCreateInput() = %#v", input)
	}

	_, err = ValidateCreateInput(CreateInput{Name: strings.Repeat("你", MaxNameRunes+1), Text: "ok"})
	if err == nil {
		t.Fatal("ValidateCreateInput() accepted a name over the rune limit")
	}
}

func TestParseCursor(t *testing.T) {
	for _, test := range []struct {
		value string
		want  int64
		valid bool
	}{
		{value: "", want: 0, valid: true},
		{value: "42", want: 42, valid: true},
		{value: "0", valid: false},
		{value: "abc", valid: false},
	} {
		got, err := ParseCursor(test.value)
		if test.valid && err != nil {
			t.Fatalf("ParseCursor(%q) error = %v", test.value, err)
		}
		if !test.valid && err == nil {
			t.Fatalf("ParseCursor(%q) error = nil", test.value)
		}
		if got != test.want {
			t.Fatalf("ParseCursor(%q) = %d, want %d", test.value, got, test.want)
		}
	}
}

func TestNormalizeMySQLDSNAcceptsDriverAndURLFormats(t *testing.T) {
	for _, input := range []string{
		"app:secret@tcp(127.0.0.1:3306)/selfweb?tls=true",
		"mysql://app:secret@example.com:3306/selfweb?ssl-mode=REQUIRED",
	} {
		dsn, err := normalizeMySQLDSN(input)
		if err != nil {
			t.Fatalf("normalizeMySQLDSN(%q) error = %v", input, err)
		}
		for _, expected := range []string{"parseTime=true", "tls=true"} {
			if !strings.Contains(dsn, expected) {
				t.Fatalf("normalizeMySQLDSN(%q) = %q, missing %q", input, dsn, expected)
			}
		}
		config, err := mysql.ParseDSN(dsn)
		if err != nil {
			t.Fatalf("parse normalized DSN: %v", err)
		}
		if !config.ParseTime || config.Loc != time.UTC {
			t.Fatalf("normalized config = %#v, want parseTime with UTC", config)
		}
	}
}
