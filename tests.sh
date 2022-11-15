go test github.com/cis3296f22/ottomh/backend/types -v -coverprofile=coverage.out -timeout=10s
go tool cover -html=coverage.out