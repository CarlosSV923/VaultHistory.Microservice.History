# VaultHistory.Microservice.History

Microservicio desarrollado con NestJS para el modulo de historias dentro del sistema VaultHistory.

Este repositorio documenta principalmente aspectos tecnicos del proyecto: arquitectura, ejecucion local, Docker, MongoDB, Mongoose, autenticacion JWT, integracion con Gemini y flujo de pruebas.

## Stack Tecnico

- Node.js 24
- TypeScript
- NestJS
- MongoDB
- Mongoose
- Docker / Docker Compose
- Jest
- mongodb-memory-server
- Swagger / OpenAPI
- Google Gemini API

## Arquitectura

El proyecto esta organizado por capas, separando dominio, casos de uso, infraestructura y API.

```txt
src/
  api/
  application/
  domain/
  infrastructure/
  app.module.ts
  main.ts

test/
  integration/
  src/
```

### Domain

Contiene el modelo de dominio y las reglas principales del sistema.

Incluye:

- Entities
- Abstracciones compartidas del dominio
- Result y Error entities
- Interfaces/puertos de repositorios
- Interfaces/puertos para servicios externos

Esta capa no depende de infraestructura, frameworks externos ni detalles de persistencia.

### Application

Contiene los casos de uso y la logica de aplicacion.

Incluye:

- Use Cases
- Coordinacion entre dominio, repositorios y servicios externos
- Modulo de aplicacion

Casos de uso principales:

- Generar una historia con IA.
- Consultar historias activas por filtros.
- Desactivar una historia por identificador.
- Desactivar todas las historias de un usuario.

Esta capa coordina el flujo de trabajo entre el dominio y las dependencias externas, sin conocer detalles concretos de infraestructura.

### Infrastructure

Contiene implementaciones concretas para persistencia y servicios externos.

Incluye:

- Modelo Mongoose `History`
- Adaptador de repositorio MongoDB
- Mapper entre modelo persistente y entidad de dominio
- Adaptador de Gemini
- Configuracion de proveedores de infraestructura

### Api

Expone los endpoints HTTP del microservicio.

Incluye:

- Controller de historias
- DTOs de request/response
- Guard de autenticacion JWT
- Strategy JWT
- Decorador de usuario autenticado
- Filtro global de excepciones
- Swagger / OpenAPI

Endpoints principales:

```txt
POST  /api/v1/history/generate
GET   /api/v1/history/list
PATCH /api/v1/history/deactivate-by-id/:id
PATCH /api/v1/history/deactivate-by-user
```

Todos los endpoints de historias requieren un JWT valido mediante `Authorization: Bearer <token>`.

## Domain-Driven Design

El proyecto aplica conceptos de Domain-Driven Design para mantener el dominio aislado y expresivo.

Conceptos utilizados:

- **Entities**: objetos con identidad propia.
- **Ports**: contratos definidos desde el dominio para acceder a persistencia o servicios externos.
- **Adapters**: implementaciones concretas de los puertos en infraestructura.
- **Result Pattern**: respuesta explicita de exito o error sin depender de excepciones para el flujo esperado.
- **Error Entity**: representacion uniforme de errores de dominio, base de datos, autenticacion o SDK.

## Configuracion Local

La API carga configuracion desde la carpeta:

```txt
config/
```

El archivo cargado depende de `NODE_ENV`:

```txt
config/.env.local
config/.env.development
config/.env.test
config/.env.production
Environment variables
```

Para ejecucion local, normalmente se usa el ambiente `local`.

Ejemplo basado en `config/.env.local.example`:

```env
GOOGLE_API_KEY=api_key_here
PORT=3000
MONGO_URI=mongodb://vault_history:vault_history_password@localhost:27017/vault_history_local?authSource=admin
JWT_SECRET=Your-Super-Secret-Key-That-Should-Be-Long-And-Secure
JWT_ISSUER=VaultHistory.User.Api
JWT_AUDIENCE=VaultHistory.User.Clients
SWAGGER_ENABLE=true
```

Cuando la API corre dentro de Docker, la connection string debe usar el nombre del servicio de MongoDB:

```txt
mongodb://vault_history:vault_history_password@mongodb:27017/vault_history_local?authSource=admin
```

## Instalar Dependencias

Desde la raiz del repositorio:

```bash
pnpm install
```

## Ejecutar Con pnpm

Desde la raiz del repositorio:

```bash
pnpm run start
```

Para ejecutar en modo watch:

```bash
pnpm run start:dev
```

Para ejecutar en modo debug:

```bash
pnpm run start:debug
```

Para compilar el proyecto:

```bash
pnpm run build
```

Para ejecutar la version compilada en modo produccion:

```bash
pnpm run start:prod
```

La API queda disponible por defecto en:

```txt
http://localhost:3000
```

Swagger, cuando `SWAGGER_ENABLE=true` y el ambiente no es `production`:

```txt
http://localhost:3000/docs/v1
```

## Ejecutar Con Docker

La configuracion Docker esta ubicada dentro de la carpeta:

```txt
docker/
```

Estructura:

```txt
docker/
  Dockerfile
  Dockerfile.dockerignore
  docker-compose.yml
```

Para levantar la API junto con MongoDB y Mongo Express:

```bash
docker compose -f docker/docker-compose.yml up --build
```

Tambien se puede ejecutar desde la carpeta `docker`:

```bash
cd docker
docker compose up --build
```

La API queda disponible en:

```txt
http://localhost:3000
```

Swagger:

```txt
http://localhost:3000/docs/v1
```

Mongo Express:

```txt
http://localhost:8081
```

Credenciales de Mongo Express definidas en `docker/docker-compose.yml`:

```txt
Username: admin
Password: admin
```

Para detener los contenedores:

```bash
docker compose -f docker/docker-compose.yml down
```

Para detener los contenedores y eliminar el volumen de MongoDB:

```bash
docker compose -f docker/docker-compose.yml down -v
```

## MongoDB Y Mongoose

El proyecto usa MongoDB como base de datos y Mongoose como ODM.

El modelo persistente principal se encuentra en:

```txt
src/infrastructure/database/history.model.ts
```

Campos principales del documento `History`:

```txt
userId
date
theme
content
character
isActive
generateAt
```

La coleccion almacena historias generadas para un usuario. Las eliminaciones funcionales se manejan mediante `isActive=false`, por lo que las consultas de listado retornan solo historias activas.

## Flujo Recomendado Para Cambios De Base De Datos

Cada vez que se modifique el modelo persistente:

```txt
1. Actualizar el schema Mongoose.
2. Actualizar el mapper entre modelo y entidad, si aplica.
3. Ajustar puertos/adaptadores de repositorio, si aplica.
4. Actualizar o agregar pruebas unitarias.
5. Actualizar o agregar pruebas de integracion cuando cambie el comportamiento persistente.
6. Probar el proyecto localmente.
```

Comandos utiles:

```bash
pnpm run test
pnpm run test:e2e
pnpm run test:cov
```

Si se desea probar Docker desde cero despues de cambios de persistencia:

```bash
docker compose -f docker/docker-compose.yml down -v
docker compose -f docker/docker-compose.yml up --build
```

## Tests

Ejecutar todos los tests unitarios:

```bash
pnpm run test
```

Ejecutar tests en modo watch:

```bash
pnpm run test:watch
```

Ejecutar tests con cobertura:

```bash
pnpm run test:cov
```

Ejecutar tests end-to-end/integracion:

```bash
pnpm run test:e2e
```

Los tests de integracion usan `mongodb-memory-server`, por lo que levantan una instancia temporal de MongoDB para probar la API sin depender de la base local de Docker.

## Calidad De Codigo

Formatear codigo:

```bash
pnpm run format
```

Ejecutar ESLint con autofix:

```bash
pnpm run lint
```

## Herramientas Necesarias

- Node.js 24
- pnpm
- Docker Desktop
- MongoDB, opcional si se usa Docker
- Google API Key para Gemini
- Volta, opcional pero recomendado para fijar la version de Node.js

Habilitar pnpm mediante Corepack:

```bash
corepack enable
```

## Manejo De Versiones Con Volta

El proyecto declara versiones recomendadas de runtime en `package.json` mediante Volta:

```json
{
    "volta": {
        "node": "24.16.0",
        "npm": "11.4.0"
    }
}
```

Volta es opcional, pero preferible para asegurar que todos los entornos de desarrollo usen la misma version de Node.js al entrar al repositorio.

Instalar Volta:

```bash
winget install Volta.Volta
```

Verificar la instalacion:

```bash
volta --version
```

Una vez instalado, Volta detecta automaticamente la configuracion del proyecto y usa la version definida en `package.json`.

Verificar versiones:

```bash
node --version
pnpm --version
```
