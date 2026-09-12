PROJECT_NAME=bootloader-manager-app
DOCKER_COMPOSE=docker compose
FRONTEND_BUILD_DIR=frontend-output
NGINX_HTML_DIR=/var/www/$(PROJECT_NAME)/html
BACKUP_DIR=./backups
# Reusable base command for SQL
PSQL_CMD = $(DOCKER_COMPOSE) exec -T db sh -c 'PGPASSWORD=$$POSTGRES_PASSWORD psql -U $$POSTGRES_USER $$POSTGRES_DB

test-make:
	echo "Project: $(PROJECT_NAME) - ✅ Deploy completed!"

# BASIC COMMANDS
up:
	$(DOCKER_COMPOSE) up -d --build

down:
	$(DOCKER_COMPOSE) down

reborn:
	$(DOCKER_COMPOSE) down && $(DOCKER_COMPOSE) build --no-cache && $(DOCKER_COMPOSE) up -d
	
logs:
	$(DOCKER_COMPOSE) logs -f

back-logs:
	$(DOCKER_COMPOSE) logs -f backend

front-logs:
	$(DOCKER_COMPOSE) logs -f frontend

db-logs: 
	$(DOCKER_COMPOSE) logs -f db

restart:
	$(DOCKER_COMPOSE) down && $(DOCKER_COMPOSE) up -d --build

# INDIVIDUAL
frontend:
	$(DOCKER_COMPOSE) up -d --build frontend

backend:
	$(DOCKER_COMPOSE) up -d --build backend

# DATABASE
db:
	$(DOCKER_COMPOSE) up -d db

backup-db:
	$(DOCKER_COMPOSE) exec -T db sh -c 'PGPASSWORD=$$POSTGRES_PASSWORD pg_dump -U $$POSTGRES_USER $$POSTGRES_DB > $(BACKUP_DIR)/backup_$$(date +"%Y-%m-%d_%H-%M-%S").sql'

# make restore-db FILE=backup_2025-08-31_23-22-46.sql
restore-db:
	$(PSQL_CMD) < $(BACKUP_DIR)/$(FILE)'

# DROP ALL TABLES OF DATABASE
drop-tables:
	$(PSQL_CMD) -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO $$POSTGRES_USER; GRANT ALL ON SCHEMA public TO public;"'

list-tables:
	$(PSQL_CMD) -c "\\dt"'

alembic-current:
	$(DOCKER_COMPOSE) run --rm backend poetry run alembic current

alembic-history:
	$(DOCKER_COMPOSE) run --rm backend poetry run alembic history --verbose
	
migrate:
	$(DOCKER_COMPOSE) run --rm backend poetry run alembic upgrade head

check-migrations:
	$(DOCKER_COMPOSE) run --rm backend poetry run alembic check

# RESET DATABASE (⚠️ WARNING: ALL DATA WILL BE LOST)
reset-db:
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE) up -d --build

# ============================================================================
# TIMESTAMP/TIMEZONE SETTINGS (DATABASE	)
# ============================================================================

# Timezone -  individual commands
db-tz:
	$(PSQL_CMD) -c "SHOW timezone;"'

db-now:
	$(PSQL_CMD) -c "SELECT now();"'

db-datestyle:
	$(PSQL_CMD) -c "SHOW datestyle;"'

db-intervalstyle:
	$(PSQL_CMD) -c "SHOW intervalstyle;"'

# Complete command for verification 
db-check-tz: db-tz db-now db-datestyle db-intervalstyle

db-time-settings:
	$(PSQL_CMD) -c '\''SELECT name, setting, short_desc FROM pg_settings WHERE name LIKE '\''\'\'''\''%time%'\''\'\'''\'' OR name LIKE '\''\'\'''\''%date%'\''\'\'''\'' ORDER BY name;'\'''

db-check-datetime-columns:
	$(PSQL_CMD) -c '\''SELECT table_name, column_name, data_type, CASE WHEN data_type = '\''\'\'''\''timestamp with time zone'\''\'\'''\'' THEN '\''\'\'''\''✅ WITH TIME ZONE'\''\'\'''\'' WHEN data_type = '\''\'\'''\''timestamp without time zone'\''\'\'''\'' THEN '\''\'\'''\''⚠️ WITHOUT TIME ZONE'\''\'\'''\'' ELSE data_type END as timezone_status FROM information_schema.columns WHERE data_type LIKE '\''\'\'''\''%timestamp%'\''\'\'''\'' OR data_type LIKE '\''\'\'''\''%time%'\''\'\'''\'' ORDER BY table_name, ordinal_position;'\'''

# JOBS
# Backup db - at 3am on Sunday
setup-cron:
	@echo "0 3 * * 0 cd $$(pwd) && make backup-db" | crontab -
	@echo "Cron job criado. Verifique com: crontab -l"

jobs:
	crontab -l

# EXECUTE IN CONTAINER
bash-frontend:
	$(DOCKER_COMPOSE) exec frontend sh

bash-backend:
	$(DOCKER_COMPOSE) exec backend bash

bash-db:
	$(DOCKER_COMPOSE) exec db bash

# Iteractive shell in container
bash-db-pg:
	$(DOCKER_COMPOSE) exec db psql -U $$POSTGRES_USER $$POSTGRES_DB

# INSTALL BACKEND DEPS (FastAPI w/ Poetry)
install-backend-deps:
	$(DOCKER_COMPOSE) run --rm backend poetry install

# INSTALL FRONTEND DEPS (Vite/Node)
install-frontend-deps:
	$(DOCKER_COMPOSE) run --rm frontend npm install

# 🔧 FRONTEND BUILD INSIDE CONTAINER AND MAKE A COPY TO ./frontend-output
build-frontend-copy:
	sudo rm -rf $(FRONTEND_BUILD_DIR)
	mkdir -p $(FRONTEND_BUILD_DIR)
	$(DOCKER_COMPOSE) run --rm \
		-e HOME=/tmp \
		frontend sh -c "rm -rf /app/node_modules/.tmp && npm run build && cp -r dist/* /app/output"
	sleep 2

# 🔄 COPY TO NGINX FOLDER
deploy-frontend:
	sudo rm -rf $(NGINX_HTML_DIR)
	sudo mkdir -p $(NGINX_HTML_DIR)
	sudo cp -r $(FRONTEND_BUILD_DIR)/* $(NGINX_HTML_DIR)/

# 🚀 EXEC ALL: BUILD + COPY + RELOAD NGINX
deploy: migrate build-frontend-copy deploy-frontend
	sudo systemctl reload nginx
	
.PHONY: up down logs restart frontend backend db \
        bash-frontend bash-backend bash-db \
        reset-db install-backend-deps install-frontend-deps test-backend \
        migrate build-frontend-copy deploy-frontend deploy  \
        db-tz db-now db-datestyle db-intervalstyle db-check-tz \
        db-check-datetime-columns db-time-settings


