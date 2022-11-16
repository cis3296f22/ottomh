# Coverage tests for backend
go test github.com/cis3296f22/ottomh/backend/types -v -coverprofile=coverage.out -timeout=10s -json | go-test-report
open test_report.html
go tool cover -html=coverage.out

# Coverage tests for frontend
# Need to make sure the server is running first
go run server.go &

npx playwright test

# Close down server now that frontend tests are done
kill -9 $!

npx playwright show-report
