package chat

import "context"

type localeKey struct{}

func WithLocale(ctx context.Context, locale string) context.Context {
	return context.WithValue(ctx, localeKey{}, locale)
}

func Locale(ctx context.Context) string {
	if locale, _ := ctx.Value(localeKey{}).(string); locale == "en" {
		return "en"
	}
	return "zh-CN"
}
