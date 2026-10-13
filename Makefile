.PHONY: install dev build preview test typecheck data check clean

install: ## Install dependencies
	npm install

dev: ## Start the dev server
	npm run dev

build: ## Build the single-file bundle into dist/
	npm run build

preview: ## Serve the production build locally
	npm run preview

test: ## Run the test suite once
	npm test

typecheck: ## Type-check without emitting
	npm run typecheck

data: ## Rebuild src/data/pokemon.json from the Tyradex API
	npm run data

check: typecheck test ## Type-check then test

clean: ## Remove build output
	rm -rf dist
