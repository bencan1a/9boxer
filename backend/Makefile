.PHONY: build-exe
build-exe: ## Build standalone executable with PyInstaller
	@echo "Building standalone executable..."
	./scripts/build_executable.sh

.PHONY: clean-build
clean-build: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	rm -rf build dist *.spec
	rm -rf build_config/__pycache__

.PHONY: test-exe
test-exe: ## Test the built executable
	@echo "Testing executable..."
	@if [ -f "dist/ninebox/ninebox" ]; then \
		echo "Executable found, size:"; \
		du -sh dist/ninebox; \
	else \
		echo "Executable not found. Run: make build-exe"; \
		exit 1; \
	fi

.PHONY: help
help: ## Show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'
