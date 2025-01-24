# Variables d'environnement
POSTGRES_PASSWORD ?= postgres
PGADMIN_DEFAULT_EMAIL ?= admin@admin.com
PGADMIN_DEFAULT_PASSWORD ?= pgadmin4

# Service db
db:
	docker-compose up -d db

# Service app
app:
	docker-compose up -d app

# Service pgadmin
pgadmin:
	docker-compose up -d pgadmin

# Arrêter tous les services
stop:
	docker-compose down

# Démarrer les services
start:
	docker-compose up --build

# Construire les services
build:
	docker-compose build

# Afficher l'état des services
status:
	docker-compose ps

# Redémarrer tous les services
restart:
	docker-compose down && docker-compose up -d

# Lancer les tests
test:
	docker-compose exec app npm run test

# Nettoyer les volumes Docker
clean:
	docker-compose down -v
