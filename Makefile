# Makefile for Skillyug Docker Orchestration

.PHONY: help dev prod clean build up down logs shell migrate seed studio

# Default environment
ENV ?= dev

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
NC := \033[0m # No Color

help: ## Show this help message
	@echo "${BLUE}Skillyug Docker Management${NC}"
	@echo ""
	@echo "Usage: make [target] [ENV=dev|prod]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  ${GREEN}%-15s${NC} %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "Examples:"
	@echo "  ${YELLOW}make dev${NC}           # Start development environment"
	@echo "  ${YELLOW}make prod${NC}          # Start production environment"
	@echo "  ${YELLOW}make logs ENV=prod${NC} # View production logs"

dev: ## Start development environment
	@echo "${BLUE}🚀 Starting Skillyug Development Environment${NC}"
	@cp .env.development .env 2>/dev/null || true
	@docker compose -f docker-compose.dev.yml up --build

prod: ## Start production environment
	@echo "${BLUE}🚀 Starting Skillyug Production Environment${NC}"
	@if [ ! -f .env ]; then echo "${RED}❌ .env file not found. Please copy .env.production to .env and configure it.${NC}"; exit 1; fi
	@docker compose -f docker-compose.yml up --build -d

build: ## Build all services
	@echo "${BLUE}🔨 Building Skillyug Services${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml build; \
	else \
		docker compose -f docker-compose.dev.yml build; \
	fi

up: ## Start services (without build)
	@echo "${BLUE}⬆️  Starting Skillyug Services${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml up -d; \
	else \
		docker compose -f docker-compose.dev.yml up; \
	fi

down: ## Stop and remove all services
	@echo "${BLUE}⬇️  Stopping Skillyug Services${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml down; \
	else \
		docker compose -f docker-compose.dev.yml down; \
	fi

clean: ## Stop services and remove volumes
	@echo "${BLUE}🧹 Cleaning up Skillyug Environment${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml down -v --remove-orphans; \
	else \
		docker compose -f docker-compose.dev.yml down -v --remove-orphans; \
	fi
	@docker system prune -f

logs: ## View service logs
	@echo "${BLUE}📋 Viewing Skillyug Logs${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml logs -f; \
	else \
		docker compose -f docker-compose.dev.yml logs -f; \
	fi

shell-backend: ## Open backend container shell
	@echo "${BLUE}🐚 Opening Backend Shell${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker exec -it skillyug-backend sh; \
	else \
		docker exec -it skillyug-backend-dev sh; \
	fi

shell-frontend: ## Open frontend container shell
	@echo "${BLUE}🐚 Opening Frontend Shell${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker exec -it skillyug-frontend sh; \
	else \
		docker exec -it skillyug-frontend-dev sh; \
	fi

shell-db: ## Open database shell
	@echo "${BLUE}🐚 Opening Database Shell${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker exec -it skillyug-postgres psql -U skillyug_user -d skillyug; \
	else \
		docker exec -it skillyug-postgres-dev psql -U skillyug_user -d skillyug_dev; \
	fi

migrate: ## Run database migrations
	@echo "${BLUE}🗃️  Running Database Migrations${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml run --rm migrate; \
	else \
		docker compose -f docker-compose.dev.yml run --rm migrate; \
	fi

seed: ## Seed the database
	@echo "${BLUE}🌱 Seeding Database${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml run --rm seed; \
	else \
		docker compose -f docker-compose.dev.yml run --rm seed; \
	fi

studio: ## Start Prisma Studio (dev only)
	@echo "${BLUE}🎨 Starting Prisma Studio${NC}"
	@docker compose -f docker-compose.dev.yml up prisma-studio

setup: ## Initial setup for development
	@echo "${BLUE}⚙️  Setting up Skillyug Development Environment${NC}"
	@if [ ! -f .env ]; then cp .env.development .env; echo "${GREEN}✅ Created .env from .env.development${NC}"; else echo "${YELLOW}⚠️  .env already exists${NC}"; fi
	@docker compose -f docker-compose.dev.yml up --build -d postgres redis chromadb
	@echo "${YELLOW}⏳ Waiting for services to be ready...${NC}"
	@sleep 15
	@$(MAKE) migrate ENV=dev
	@$(MAKE) seed ENV=dev
	@echo "${GREEN}✅ Development environment setup complete!${NC}"
	@echo "${YELLOW}💡 Run 'make dev' to start the application${NC}"

status: ## Show container status
	@echo "${BLUE}📊 Container Status${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml ps; \
	else \
		docker compose -f docker-compose.dev.yml ps; \
	fi

restart: ## Restart all services
	@echo "${BLUE}🔄 Restarting Skillyug Services${NC}"
	@$(MAKE) down ENV=$(ENV)
	@$(MAKE) up ENV=$(ENV)

restart-backend: ## Restart only backend service
	@echo "${BLUE}🔄 Restarting Backend Service${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml restart backend; \
	else \
		docker compose -f docker-compose.dev.yml restart backend; \
	fi

restart-frontend: ## Restart only frontend service
	@echo "${BLUE}🔄 Restarting Frontend Service${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml restart frontend; \
	else \
		docker compose -f docker-compose.dev.yml restart frontend; \
	fi

backup: ## Backup production database
	@echo "${BLUE}💾 Creating Database Backup${NC}"
	@mkdir -p backups
	@docker exec skillyug-postgres pg_dump -U skillyug_user skillyug > backups/backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "${GREEN}✅ Backup created in backups/ directory${NC}"

health: ## Check service health
	@echo "${BLUE}🏥 Checking Service Health${NC}"
	@echo "Frontend: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo 'DOWN')"
	@echo "Backend: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/test || echo 'DOWN')"
	@echo "Database: $$(docker exec skillyug-postgres$$([ "$(ENV)" = "dev" ] && echo "-dev" || echo "") pg_isready -U skillyug_user 2>/dev/null && echo 'UP' || echo 'DOWN')"
	@echo "ChromaDB: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/heartbeat || echo 'DOWN')"
	@echo "Recommendation Engine: $$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8003/health || echo 'DOWN')"

test-recommendations: ## Test recommendation engine
	@echo "${BLUE}🧪 Testing Recommendation Engine${NC}"
	@curl -X POST http://localhost:8003/api/recommendations \
		-H "Content-Type: application/json" \
		-d '{"user_query": "I want to learn Python for beginners", "max_results": 3}' \
		| jq '.' || echo "${RED}❌ Recommendation engine not available${NC}"

shell-recommendations: ## Open shell in recommendation engine container
	@echo "${BLUE}🐚 Opening Recommendation Engine Shell${NC}"
	@docker exec -it skillyug-recommendation-engine-dev sh

logs-recommendations: ## View recommendation engine logs
	@echo "${BLUE}📋 Recommendation Engine Logs${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml logs -f recommendation-engine; \
	else \
		docker compose -f docker-compose.dev.yml logs -f recommendation-engine; \
	fi

restart-recommendations: ## Restart recommendation engine service
	@echo "${BLUE}🔄 Restarting Recommendation Engine${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml restart recommendation-engine; \
	else \
		docker compose -f docker-compose.dev.yml restart recommendation-engine; \
	fi

dev-tools: ## Start development tools (Prisma Studio, Redis Commander)
	@echo "${BLUE}🛠️  Starting Development Tools${NC}"
	@docker compose -f docker-compose.dev.yml --profile tools up -d prisma-studio redis-commander
	@echo "${GREEN}✅ Development tools started:${NC}"
	@echo "  - Prisma Studio: http://localhost:5555"
	@echo "  - Redis Commander: http://localhost:8081"

stop-tools: ## Stop development tools
	@echo "${BLUE}🛠️  Stopping Development Tools${NC}"
	@docker compose -f docker-compose.dev.yml --profile tools down

pull: ## Pull latest images
	@echo "${BLUE}📥 Pulling Latest Images${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose -f docker-compose.yml pull; \
	else \
		docker compose -f docker-compose.dev.yml pull; \
	fi

reset: ## Reset entire development environment (CAUTION: destroys all data)
	@echo "${RED}⚠️  WARNING: This will destroy all data!${NC}"
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ] || exit 1
	@echo "${BLUE}🔄 Resetting Development Environment${NC}"
	@$(MAKE) clean ENV=dev
	@docker volume prune -f
	@$(MAKE) setup ENV=dev

check-env: ## Check if environment variables are set
	@echo "${BLUE}🔍 Checking Environment Variables${NC}"
	@if [ ! -f .env ]; then echo "${RED}❌ .env file not found${NC}"; exit 1; fi
	@echo "${GREEN}✅ .env file exists${NC}"
	@echo "Environment variables:"
	@grep -v '^#' .env | grep -v '^$$' | head -10 | sed 's/=.*/=***/' || echo "${YELLOW}⚠️  No variables found${NC}"

docker-version: ## Check Docker and Docker Compose versions
	@echo "${BLUE}🐳 Docker Version Information${NC}"
	@docker version --format "Docker Engine: {{.Server.Version}}"
	@docker compose version --short