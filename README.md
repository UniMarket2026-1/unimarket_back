# 🚀 UniMarket Backend

**NestJS API REST** para la plataforma de marketplace universitario UniMarket. Proporciona autenticación, gestión de productos, chats en tiempo real, calificaciones, moderación y características impulsadas por IA.

## 📋 Índice

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación y Setup](#instalación-y-setup)
- [Variables de Entorno](#variables-de-entorno)
- [Ejecutar Localmente](#ejecutar-localmente)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Base de Datos](#base-de-datos)
- [API Endpoints](#api-endpoints)
- [Autenticación](#autenticación)
- [Servicios](#servicios)
- [DTOs y Validación](#dtos-y-validación)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## ✨ Características

### Autenticación y Autorización
- ✅ Registro de usuarios
- ✅ Login con JWT
- ✅ Roles de usuario (STUDENT, ADMIN)
- ✅ Guards de autorización
- ✅ Refresh tokens

### Gestión de Productos
- ✅ CRUD completo de productos
- ✅ Búsqueda y filtrado avanzado
- ✅ Generación automática de descripciones con IA
- ✅ Clasificación por categoría
- ✅ Control de inventario

### Chats y Mensajería
- ✅ Crear conversaciones entre usuarios
- ✅ Enviar y recibir mensajes
- ✅ Sugerencias de IA en chats
- ✅ Historial de conversaciones
- ✅ Notificaciones de nuevos mensajes

### Calificaciones y Reseñas
- ✅ Calificar vendedores
- ✅ Calificar productos
- ✅ Validar que solo compradores califiquen
- ✅ Promedio de calificaciones

### Sistema de Reportes
- ✅ Reportar contenido inapropiado
- ✅ Dashboard de moderación (Admin)
- ✅ Resolución de reportes
- ✅ Suspensión de usuarios

### IA y Automatización
- ✅ Integración con Google Gemini API
- ✅ Generación de descripciones de productos
- ✅ Sugerencias de mensajes en chats
- ✅ Análisis de categorías

### Seeding
- ✅ Endpoint para poblar base de datos
- ✅ Datos de prueba con imágenes de perfil

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **NestJS** | 10.x | Framework principal |
| **TypeScript** | 5.x | Lenguaje de programación |
| **PostgreSQL** | 12+ | Base de datos |
| **TypeORM** | 0.3.x | ORM |
| **Passport.js** | 0.7.x | Estrategias de auth |
| **@nestjs/jwt** | 11.x | JWT handling |
| **class-validator** | 0.14.x | Validación de DTOs |
| **class-transformer** | 0.5.x | Transformación de DTOs |
| **Google Generative AI** | Latest | IA para descripciones |
| **Jest** | 29.x | Testing |

---

## 🏗️ Arquitectura

### Patrón de Módulos

UniMarket Backend utiliza la arquitectura modular de NestJS:

```
src/
├── modules/              # Módulos de features
│   ├── auth/            # Autenticación
│   ├── products/        # Productos
│   ├── chats/           # Chats y mensajes
│   ├── ratings/         # Calificaciones
│   ├── reports/         # Reportes
│   └── users/           # Usuarios
├── controllers/         # Endpoints HTTP
├── services/            # Lógica de negocio
├── entities/            # Modelos de DB
├── dto/                 # Data Transfer Objects
├── auth/                # Guards y estrategias
├── database/            # Configuración DB
└── app.module.ts        # Módulo raíz
```

### Flujo de Requests

```
HTTP Request
    ↓
Controller (valida parámetros)
    ↓
Guard (valida autenticación/autorización)
    ↓
Interceptor (transforma request)
    ↓
Service (lógica de negocio)
    ↓
Entity/Repository (accede BD)
    ↓
Response (DTO + serialización)
```

### Capas

1. **Controllers**: Punto de entrada, validan requests
2. **Services**: Lógica de negocio, coordinan operaciones
3. **Repositories**: Acceso a datos (TypeORM)
4. **Entities**: Modelos de base de datos
5. **DTOs**: Validación y transformación de datos
6. **Guards/Strategies**: Seguridad y autenticación

---

## 📦 Instalación y Setup

### Requisitos Previos

- **Node.js** 18.x o superior
- **npm** 9.x o superior (o yarn/pnpm)
- **PostgreSQL** 12.x o superior
- **Git**

### Pasos de Instalación

**1. Clonar repositorio (si no lo has hecho):**
```bash
git clone <repository-url>
cd unimarket/unimarket_back
```

**2. Instalar dependencias:**
```bash
npm install
```

**3. Crear archivo `.env`:**
```bash
cp .env.example .env
# Editar .env con tus valores
```

**4. Inicializar base de datos:**
```bash
# Migrar esquema (si está configurado)
npm run typeorm migration:run

# O levantar PostgreSQL con Docker:
docker run --name postgres-unimarket \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=unimarket \
  -p 5432:5432 \
  -d postgres:15
```

**5. Verificar instalación:**
```bash
npm run start:dev
# Debería conectar a BD e iniciar en puerto 3001
```

---

## 🔑 Variables de Entorno

Crear archivo `.env` en la raíz de `unimarket_back`:

```env
# ============================================
# DATABASE
# ============================================
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=unimarket
DATABASE_LOGGING=false              # true para ver queries SQL

# ============================================
# AUTENTICACIÓN
# ============================================
JWT_SECRET=tu_secret_muy_seguro_min_32_caracteres
JWT_EXPIRATION=3600                 # Segundos (1 hora)
JWT_REFRESH_SECRET=tu_refresh_secret
JWT_REFRESH_EXPIRATION=604800       # Segundos (7 días)

# ============================================
# IA (GEMINI)
# ============================================
GEMINI_API_KEY=tu_api_key_de_gemini # Obtén en: https://aistudio.google.com/
GEMINI_MODEL=gemini-1.5-flash       # Modelo a usar

# ============================================
# APLICACIÓN
# ============================================
NODE_ENV=development                # development|production|test
PORT=3001
API_PREFIX=api

# ============================================
# CORS
# ============================================
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# ============================================
# LOGGING
# ============================================
LOG_LEVEL=debug                     # debug|info|warn|error
```

### Obtener Google Gemini API Key

1. Ir a [Google AI Studio](https://aistudio.google.com/)
2. Click en "Get API Key"
3. Crear nueva clave en proyecto
4. Copiar key a `.env`

---

## 🚀 Ejecutar Localmente

### Modo Desarrollo

```bash
# Iniciar con hot-reload
npm run start:dev

# Salida esperada:
# [Nest] 12345 - 01/15/2025 10:30:00 [NestFactory] Starting Nest application...
# [Nest] 12345 - 01/15/2025 10:30:02 [InstanceLoader] AppModule dependencies initialized
# [Nest] 12345 - 01/15/2025 10:30:03 [InstanceLoader] DatabaseModule dependencies...
# 🚀 UniMarket Backend running on port 3001
# 📡 API available at http://localhost:3001/api
```

### Modo Producción

```bash
# Compilar TypeScript
npm run build

# Ejecutar
npm run start

# O en un solo paso:
npm run start:prod
```

### Con Docker

```bash
# Construir imagen
docker build -t unimarket-backend .

# Ejecutar contenedor
docker run -p 3001:3001 \
  -e DATABASE_HOST=host.docker.internal \
  -e DATABASE_PASSWORD=postgres \
  unimarket-backend

# O usar docker-compose desde raíz:
cd ..
docker-compose up unimarket_back
```

---

## 📜 Scripts Disponibles

| Script | Propósito |
|--------|-----------|
| `npm run start` | Ejecutar servidor |
| `npm run start:dev` | Desarrollo con hot-reload |
| `npm run start:debug` | Debug con inspector |
| `npm run build` | Compilar TypeScript |
| `npm test` | Ejecutar tests |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:cov` | Tests con coverage |
| `npm run test:e2e` | Tests E2E |
| `npm run lint` | Linter (ESLint) |
| `npm run format` | Formatear código (Prettier) |

---

## 📁 Estructura del Proyecto

```
src/
│
├── 🔐 AUTH (Autenticación)
│   ├── jwt.strategy.ts          # Estrategia JWT
│   ├── jwt-auth.guard.ts        # Guard para rutas protegidas
│   └── admin.guard.ts           # Guard para rutas admin
│
├── 🎮 CONTROLLERS (Endpoints)
│   ├── app.controller.ts        # Controlador raíz
│   ├── auth.controller.ts       # Endpoints de auth
│   ├── products.controller.ts   # Endpoints de productos
│   ├── chats.controller.ts      # Endpoints de chats
│   ├── ratings.controller.ts    # Endpoints de calificaciones
│   ├── reports.controller.ts    # Endpoints de reportes
│   ├── users.controller.ts      # Endpoints de usuarios
│   └── seed.controller.ts       # Endpoint para poblar BD
│
├── 🔧 SERVICES (Lógica)
│   ├── app.service.ts           # Servicio raíz
│   ├── auth.service.ts          # Autenticación
│   ├── products.service.ts      # CRUD de productos
│   ├── chats.service.ts         # Gestión de chats
│   ├── ratings.service.ts       # Calificaciones
│   ├── reports.service.ts       # Reportes
│   ├── users.service.ts         # Usuarios
│   ├── seed.service.ts          # Seeding de datos
│   └── ai.service.ts            # Integración Gemini
│
├── 📊 ENTITIES (Modelos DB)
│   ├── user.entity.ts           # Tabla: users
│   ├── product.entity.ts        # Tabla: products
│   ├── chat.entity.ts           # Tabla: chats
│   ├── message.entity.ts        # Tabla: messages
│   ├── rating.entity.ts         # Tabla: ratings
│   └── report.entity.ts         # Tabla: reports
│
├── 📝 DTOs (Validación)
│   ├── user.dto.ts
│   ├── product.dto.ts
│   ├── chat.dto.ts
│   ├── rating.dto.ts
│   └── report.dto.ts
│
├── 🗂️ MODULES (Feature Modules)
│   ├── auth.module.ts
│   ├── products.module.ts
│   ├── chats.module.ts
│   ├── ratings.module.ts
│   ├── reports.module.ts
│   └── users.module.ts
│
├── 🗄️ DATABASE
│   └── database.module.ts       # Config TypeORM
│
├── 📜 SCRIPTS
│   └── seed.ts                  # Script de seeding manual
│
├── app.module.ts                # Módulo raíz
└── main.ts                      # Punto de entrada
```

### Descripción de Archivos Clave

#### `src/main.ts` - Punto de Entrada
```typescript
// Inicia la aplicación NestJS
// Configura validación de DTOs globalmente
// Habilita CORS
```

#### `src/app.module.ts` - Módulo Raíz
```typescript
// Importa todos los módulos de features
// Configura base de datos
// Registra guards globales
```

#### `src/database/database.module.ts` - Configuración TypeORM
```typescript
// Configura conexión a PostgreSQL
// Sincroniza esquema
// Registra entities
```

---

## 🗄️ Base de Datos

### Esquema

```sql
-- Tabla: users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  profileImageUrl VARCHAR(500),
  role ENUM('STUDENT', 'ADMIN') DEFAULT 'STUDENT',
  status ENUM('ACTIVE', 'SUSPENDED', 'BANNED') DEFAULT 'ACTIVE',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Tabla: products
CREATE TABLE products (
  id UUID PRIMARY KEY,
  sellerId UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100),
  condition ENUM('like-new', 'good', 'fair', 'poor'),
  images JSON,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Tabla: chats
CREATE TABLE chats (
  id UUID PRIMARY KEY,
  user1Id UUID NOT NULL REFERENCES users(id),
  user2Id UUID NOT NULL REFERENCES users(id),
  productId UUID REFERENCES products(id),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Tabla: messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  chatId UUID NOT NULL REFERENCES chats(id),
  senderId UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Tabla: ratings
CREATE TABLE ratings (
  id UUID PRIMARY KEY,
  sellerId UUID NOT NULL REFERENCES users(id),
  buyerId UUID NOT NULL REFERENCES users(id),
  productId UUID REFERENCES products(id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Tabla: reports
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  reporterId UUID NOT NULL REFERENCES users(id),
  targetUserId UUID REFERENCES users(id),
  targetProductId UUID REFERENCES products(id),
  type VARCHAR(100),
  reason TEXT,
  status ENUM('PENDING', 'RESOLVED', 'DISMISSED'),
  resolvedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Relaciones

- `users` 1-to-N `products` (un usuario vende muchos productos)
- `users` 1-to-N `chats` (un usuario está en muchos chats)
- `products` 1-to-N `ratings` (un producto tiene muchas calificaciones)
- `chats` 1-to-N `messages` (un chat tiene muchos mensajes)

### Semillas de Datos

**Endpoint de seeding:**
```bash
POST http://localhost:3001/api/seed
```

**Crea:**
- 9 usuarios (1 admin + 8 estudiantes)
- 8 productos
- 4 calificaciones

**Credenciales de acceso:**
```
Admin: admin@unimarket.edu / admin123
User:  maria.garcia@universidad.edu / student123
```

---

## 📡 API Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/register` | Registrar nuevo usuario |
| POST | `/login` | Iniciar sesión |
| GET | `/me` | Usuario autenticado actual |
| POST | `/refresh` | Refresh token |

**Ejemplo: POST /register**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo@universidad.edu",
    "password": "Password123!",
    "name": "Nuevo Usuario"
  }'
```

**Ejemplo: POST /login**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@unimarket.edu",
    "password": "admin123"
  }'
```

### Productos (`/api/products`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar productos (con paginación) |
| POST | `/` | Crear producto (requiere auth) |
| GET | `/:id` | Detalles del producto |
| PUT | `/:id` | Actualizar producto |
| DELETE | `/:id` | Eliminar producto |
| GET | `/search` | Buscar productos |
| POST | `/:id/generate-description` | Generar descripción con IA |

**Ejemplo: GET /products**
```bash
curl "http://localhost:3001/api/products?page=1&limit=10&category=tech" \
  -H "Authorization: Bearer {token}"
```

### Chats (`/api/chats`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/` | Crear/obtener chat |
| GET | `/user/:userId` | Chats del usuario |
| GET | `/:chatId/messages` | Mensajes del chat |
| POST | `/:chatId/messages` | Enviar mensaje |
| GET | `/:chatId/suggestion` | Obtener sugerencia IA |

### Calificaciones (`/api/ratings`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/` | Crear calificación |
| GET | `/seller/:sellerId` | Calificaciones del vendedor |
| GET | `/product/:productId` | Calificaciones del producto |

### Reportes (`/api/reports`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/` | Crear reporte |
| GET | `/` | Listar reportes (admin) |
| POST | `/:id/resolve` | Resolver reporte (admin) |

### Seeding (`/api/seed`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/` | Poblar base de datos con datos de prueba |

---

## 🔐 Autenticación

### Flujo JWT

1. Usuario envía credenciales a `/auth/login`
2. Backend valida y genera JWT token
3. Cliente almacena token (localStorage/cookie)
4. Cliente incluye token en header `Authorization: Bearer {token}`
5. Backend valida token con `JwtStrategy`
6. Si válido, procesa request; si no, retorna 401

### Guards

**JwtAuthGuard** - Protege rutas que requieren autenticación:
```typescript
@UseGuards(JwtAuthGuard)
@Post('/products')
createProduct(@Body() dto: CreateProductDto) {
  // Usuario debe estar autenticado
}
```

**AdminGuard** - Protege rutas admin:
```typescript
@UseGuards(JwtAuthGuard, AdminGuard)
@Post('/reports/:id/resolve')
resolveReport(@Param('id') id: string) {
  // Solo administradores
}
```

### Roles

- `STUDENT` - Usuario regular (por defecto)
- `ADMIN` - Acceso administrativo

---

## 🔧 Servicios

### AuthService
**Archivo:** `src/services/auth.service.ts`

Responsabilidades:
- Registrar usuarios
- Validar credenciales
- Generar/validar JWT
- Gestionar sesiones

### ProductService
**Archivo:** `src/services/products.service.ts`

Responsabilidades:
- CRUD de productos
- Búsqueda y filtrado
- Validar propiedad del producto
- Integración con IA

### ChatService
**Archivo:** `src/services/chats.service.ts`

Responsabilidades:
- Crear/obtener conversaciones
- Gestionar mensajes
- Generar sugerencias con IA

### RatingService
**Archivo:** `src/services/ratings.service.ts`

Responsabilidades:
- Crear calificaciones
- Validar que solo compradores califiquen
- Calcular promedio de ratings

### ReportService
**Archivo:** `src/services/reports.service.ts`

Responsabilidades:
- Crear reportes
- Listar para moderadores
- Resolver reportes

### AiService
**Archivo:** `src/services/ai.service.ts`

Responsabilidades:
- Integración con Google Gemini
- Generar descripciones de productos
- Generar sugerencias de chats

### SeedService
**Archivo:** `src/services/seed.service.ts`

Responsabilidades:
- Poblar base de datos
- Crear usuarios de prueba
- Crear productos de prueba

---

## 📝 DTOs y Validación

Los DTOs (Data Transfer Objects) validan datos de entrada.

### Ejemplo: CreateProductDto

```typescript
export class CreateProductDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsEnum(['tech', 'books', 'furniture'])
  category: string;

  @IsArray()
  @IsUrl({}, { each: true })
  images: string[];
}
```

**Validación automática:**
- Si datos no cumplen reglas → retorna 400 Bad Request
- Errores detallados por campo
- Transformación de tipos

---

## 🧪 Testing

### Tests Unitarios

```bash
# Ejecutar tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov
```

**Estructura:**
```
src/
├── services/__tests__/
│   ├── auth.service.spec.ts
│   ├── products.service.spec.ts
│   └── ...
└── ...
```

### Ejemplo de Test

```typescript
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService]
    }).compile();
    
    service = module.get<AuthService>(AuthService);
  });

  it('debe registrar usuario', async () => {
    const result = await service.register({
      email: 'test@test.com',
      password: '123456',
      name: 'Test User'
    });
    
    expect(result).toHaveProperty('id');
  });
});
```

---

## 🚀 Deployment

### Azure App Service

**Requisitos:**
- Azure CLI
- Docker
- Azure Container Registry

**Pasos:**

1. **Crear Container Registry:**
```bash
az acr create --resource-group rg-unimarket \
  --name unimarketregistry --sku Basic
```

2. **Construir y pushear imagen:**
```bash
az acr build --registry unimarketregistry \
  --image unimarket-backend:latest ./unimarket_back
```

3. **Crear Web App:**
```bash
az webapp create --resource-group rg-unimarket \
  --plan unimarket-plan \
  --name unimarket-api \
  --deployment-container-image-name \
    unimarketregistry.azurecr.io/unimarket-backend:latest
```

4. **Configurar variables de entorno:**
```bash
az webapp config appsettings set \
  --resource-group rg-unimarket \
  --name unimarket-api \
  --settings \
    DATABASE_HOST=$DB_HOST \
    DATABASE_PASSWORD=$DB_PASS \
    JWT_SECRET=$JWT_SECRET \
    GEMINI_API_KEY=$GEMINI_KEY
```

---

## 🐛 Troubleshooting

### Problema: Conexión a BD rechazada

**Síntomas:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solución:**
```bash
# Verificar que PostgreSQL está corriendo
psql -U postgres -d unimarket

# Si no existe BD:
createdb unimarket

# O con Docker:
docker ps | grep postgres
docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:15
```

### Problema: JWT expirado

**Síntomas:** `401 Unauthorized: Token expired`

**Solución:**
- Usar endpoint de refresh token
- O hacer login nuevamente

### Problema: API Key de Gemini inválida

**Síntomas:** `Error: Invalid API Key`

**Solución:**
1. Verificar `.env` tiene `GEMINI_API_KEY`
2. Obtener nueva key en [Google AI Studio](https://aistudio.google.com/)
3. Reiniciar servidor

### Problema: Puerto 3001 en uso

**Síntomas:** `Error: listen EADDRINUSE :::3001`

**Solución:**
```bash
# Encontrar proceso en puerto 3001
lsof -i :3001

# Matar proceso (Linux/Mac)
kill -9 <PID>

# En Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Problema: TypeORM no sincroniza schema

**Síntomas:** Tablas no existen, queries fallan

**Solución:**
```typescript
// En database.module.ts, asegurar:
synchronize: true,  // En desarrollo
logging: true,      // Ver queries
```

---

## 📚 Recursos Adicionales

- [NestJS Docs](https://docs.nestjs.com)
- [TypeORM Docs](https://typeorm.io/)
- [Passport.js Docs](http://www.passportjs.org/)
- [Google Gemini API](https://ai.google.dev/)

---

## 🤝 Contribuir

1. Fork repositorio
2. Crear rama (`git checkout -b feature/MiFeature`)
3. Commit cambios (`git commit -m 'Add MiFeature'`)
4. Push (`git push origin feature/MiFeature`)
5. Pull Request

---

## 📄 Licencia

MIT License