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
	@cp --update=none .env.development .env || true
	@docker compose -f docker-compose.dev.yml up --build

prod: ## Start production environment
	@echo "${BLUE}🚀 Starting Skillyug Production Environment${NC}"
	@if [ ! -f .env ]; then echo "${RED}❌ .env file not found. Please copy .env.production to .env and configure it.${NC}"; exit 1; fi
	@docker compose up --build -d

build: ## Build all services
	@echo "${BLUE}🔨 Building Skillyug Services${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose build; \
	else \
		docker compose -f docker-compose.dev.yml build; \
	fi

up: ## Start services (without build)
	@echo "${BLUE}⬆️  Starting Skillyug Services${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose up -d; \
	else \
		docker compose -f docker-compose.dev.yml up; \
	fi

down: ## Stop and remove all services
	@echo "${BLUE}⬇️  Stopping Skillyug Services${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose down; \
	else \
		docker compose -f docker-compose.dev.yml down; \
	fi

clean: ## Stop services and remove volumes
	@echo "${BLUE}🧹 Cleaning up Skillyug Environment${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose down -v --remove-orphans; \
	else \
		docker compose -f docker-compose.dev.yml down -v --remove-orphans; \
	fi
	@docker system prune -f

logs: ## View service logs
	@echo "${BLUE}📋 Viewing Skillyug Logs${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose logs -f; \
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
		docker compose run --rm migrate; \
	else \
		docker compose -f docker-compose.dev.yml run --rm migrate; \
	fi

seed: ## Seed the database
	@echo "${BLUE}🌱 Seeding Database${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose run --rm seed; \
	else \
		docker compose -f docker-compose.dev.yml run --rm seed; \
	fi

studio: ## Start Prisma Studio (dev only)
	@echo "${BLUE}🎨 Starting Prisma Studio${NC}"
	@docker compose -f docker-compose.dev.yml up prisma-studio

setup: ## Initial setup for development
	@echo "${BLUE}⚙️  Setting up Skillyug Development Environment${NC}"
	@cp --update=none .env.development .env || echo "${YELLOW}⚠️  .env already exists${NC}"
	@docker compose -f docker-compose.dev.yml up --build -d postgres redis
	@sleep 10
	@$(MAKE) migrate ENV=dev
	@$(MAKE) seed ENV=dev
	@echo "${GREEN}✅ Development environment setup complete!${NC}"
	@echo "${YELLOW}💡 Run 'make dev' to start the application${NC}"

status: ## Show container status
	@echo "${BLUE}📊 Container Status${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose ps; \
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
		docker compose restart backend; \
	else \
		docker compose -f docker-compose.dev.yml restart backend; \
	fi

restart-frontend: ## Restart only frontend service
	@echo "${BLUE}🔄 Restarting Frontend Service${NC}"
	@if [ "$(ENV)" = "prod" ]; then \
		docker compose restart frontend; \
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