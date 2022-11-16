# Coverage tests for backend
go test github.com/cis3296f22/ottomh/backend/types -v -coverprofile=coverage.out -timeout=10s -json | go-test-report
open test_report.html
go tool cover -html=coverage.out

# Coverage tests for frontend
# Need to make sure the server is running first
go run server.go &

npx playwright test

npx c8 report --reporter=html -x=["coverage/**","packages/*/test{,s}/**","**/*.d.ts","test{,s}/**","test{,-*}.{js,cjs,mjs,ts,tsx,jsx}","**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}","**/__tests__/**","**/{ava,babel,nyc}.config.{js,cjs,mjs}","**/jest.config.{js,cjs,mjs,ts}","**/{karma,rollup,webpack}.config.js","**/.{eslint,mocha}rc.{js,cjs}","node_modules", "webpack"]
open coverage/index.html
npx playwright show-report

# Close down any children processes
kill -TERM $$
