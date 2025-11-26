# ReactBis - Building Information System

## Resumen del Proyecto

Sistema para gestionar información de edificios (buildings) agrupados por proyectos. Migrado desde Google Apps Script + AWS Lambda a una arquitectura React + Node.js independiente.

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   [React Frontend]  ←──→  [Node.js Backend]  ←──→  [MongoDB]    │
│      localhost:5173         localhost:4000         Atlas        │
│      (Vite)                 (Express)              Cloud        │
│                                                                  │
│   Carpeta: frontend/        Carpeta: backend/                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Base de Datos

- **Proveedor**: MongoDB Atlas
- **Cluster**: wrs-fam-app.mmupf85.mongodb.net
- **Database**: `wrs-projecs-buildings`
- **Collection**: `buildingexternals`
- **Conexión**: `mongodb+srv://wrs_developer:***@wrs-fam-app.mmupf85.mongodb.net/`

### Índices creados:
```javascript
{ projectId: 1 }
{ projectName: 1 }
{ projectId: 1, projectName: 1 }
```

---

## Backend (Node.js/Express)

### Estructura de Carpetas

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # Conexión MongoDB
│   ├── controllers/
│   │   └── building.controller.ts
│   ├── models/
│   │   └── building.model.ts # Interfaces TypeScript
│   ├── routes/
│   │   └── building.routes.ts
│   ├── services/
│   │   └── building.service.ts
│   ├── app.ts                # Express config + CORS
│   └── server.ts             # Entry point
├── .env                      # Variables de entorno
├── .env.example
├── package.json
└── tsconfig.json
```

### Variables de Entorno (.env)

```env
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
DB_NAME=wrs-projecs-buildings
FRONTEND_URL=http://localhost:5173
```

**IMPORTANTE**: El `FRONTEND_URL` debe coincidir con el puerto del frontend (5173 para Vite dev server).

### Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check del servidor |
| GET | `/api/projects/summary?page=1&limit=20` | Proyectos paginados (sin buildings) |
| GET | `/api/projects/search?q=texto&page=1&limit=20` | Búsqueda server-side |
| GET | `/api/projects/:projectId/buildings` | Buildings de un proyecto (lazy loading) |
| GET | `/api/projects/:projectId/info` | Info agregada del proyecto |
| GET | `/api/projects/all` | Todos los proyectos con buildings (legacy) |
| GET | `/api/buildings/:id` | Un building por ID |
| POST | `/api/buildings/:id/edit` | Editar building |
| DELETE | `/api/buildings/:id` | Eliminar building |
| POST | `/api/buildings` | Crear building |
| POST | `/api/buildings/upload` | Subir múltiples buildings |
| DELETE | `/api/projects/:projectId/buildings` | Eliminar todos los buildings de un proyecto |

### Modelo de Datos

```typescript
interface Building {
  _id: string;

  // Campos principales
  projectId?: string;
  projectSubId?: string;
  projectName: string;
  buildingName: string;
  address?: string;

  // Áreas
  areaClient?: number;
  qualifyingArea?: number;

  // Datos técnicos
  yearPIS?: number;
  bldgType?: string;
  improvements?: string;
  attemptWholeBldg?: string;

  // Wattage/LPD
  allowedWattage?: number;
  proposedWattage?: number;
  baselineLPD?: number;
  proposedLPD?: number;
  reductionPercent?: number;

  // Categorías
  guaranteedCat?: string;
  possibleCat?: string;
  confirmedBy?: string;

  // Otros
  costEEBCP?: number;
  legalEntity?: string;
  missingInfo?: string;
  submitFA?: string;
  notes?: string;
  additionalNotes?: string;
  sharefileLink?: string;
  startDate?: string;
  dueDate?: string;
  inspectionDate?: string;
  createdAt?: Date;
}

interface ProjectSummary {
  projectId: string;
  projectName: string;
  buildingCount: number;
  totalArea: number;
  totalQualifyingArea: number;
}

interface PaginatedResponse<T> {
  result: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### Comandos Backend

```bash
# Desarrollo
npm run dev

# Compilar
npm run build

# Producción
npm start

# Limpiar dist
npm run clean
```

---

## Frontend (React + Vite + TypeScript)

### Estructura de Carpetas

```
frontend/
├── src/
│   ├── components/
│   │   ├── ProjectsTable.tsx    # Tabla principal con proyectos
│   │   ├── BuildingModal.tsx    # Modal para crear/editar buildings
│   │   ├── DeleteModal.tsx      # Modal de confirmación de eliminación
│   │   └── Toast.tsx            # Notificaciones success/error
│   ├── services/
│   │   └── api.ts               # Cliente axios con todos los endpoints
│   ├── types/
│   │   └── index.ts             # Interfaces TypeScript
│   ├── App.tsx                  # Componente principal con React Query
│   ├── main.tsx                 # Entry point
│   └── index.css                # Estilos globales + Bootstrap overrides
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
```

### Tecnologías Utilizadas

- **React 18** + TypeScript
- **Vite** (bundler, dev server en puerto 5173)
- **@tanstack/react-query** (React Query v5) para data fetching y cache
- **Bootstrap 5** para estilos
- **Axios** para HTTP requests

### Dependencias (package.json)

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "@tanstack/react-query": "^5.x",
    "axios": "^1.x",
    "bootstrap": "^5.x"
  },
  "devDependencies": {
    "@types/react": "^18.x",
    "@types/react-dom": "^18.x",
    "typescript": "~5.x",
    "vite": "^7.x"
  }
}
```

### Configuración TypeScript Importante

El proyecto usa `verbatimModuleSyntax: true` en tsconfig. Esto requiere usar `type` imports para tipos:

```typescript
// CORRECTO
import type { Building, ProjectSummary } from './types';

// INCORRECTO (causa error)
import { Building, ProjectSummary } from './types';
```

### Componentes

#### ProjectsTable.tsx
- Tabla principal con lista de proyectos paginados
- Búsqueda con debounce (300ms)
- Expandir/colapsar para ver buildings (lazy loading)
- Botones: New Building, Refresh, View, Add, Delete All
- Paginación: First, Previous, Next, Last

#### BuildingModal.tsx
- Modal grande (modal-xl) con scroll
- Formulario completo con todos los campos del building
- Secciones: Basic Info, Area, Wattage & LPD, Categories, Dates, Additional Info
- Funciona para crear y editar

#### DeleteModal.tsx
- Modal de confirmación simple
- Prop `isDanger` para mostrar botón rojo en eliminación masiva

#### Toast.tsx
- Notificaciones en esquina inferior derecha
- Tipos: success (verde) y error (rojo)
- Auto-hide después de 3 segundos

### Variables de Entorno Frontend

```env
# .env o .env.local
VITE_API_URL=http://localhost:4000/api
```

Si no se define, usa `http://localhost:4000/api` por defecto.

### Comandos Frontend

```bash
# Instalar dependencias
npm install

# Desarrollo (puerto 5173)
npm run dev

# Compilar para producción
npm run build

# Preview del build
npm run preview
```

---

## Optimizaciones Implementadas

### Problema Original (inspection-server)
```javascript
// Cargaba TODOS los proyectos con TODOS los buildings
$group: {
  _id: '$projectName',
  buildings: { $push: '$$ROOT' }  // Sin paginación
}
```

### Solución Implementada
1. **Paginación**: `$facet` con `$skip` y `$limit`
2. **Lazy Loading**: Buildings se cargan solo al expandir
3. **Búsqueda Server-Side**: `$regex` en MongoDB
4. **Agrupación por ID**: Más preciso que por nombre
5. **Cache con React Query**: Evita requests duplicados

### Comparación de Rendimiento

| Métrica | Antes (AWS) | Después (ReactBis) |
|---------|-------------|-------------------|
| Carga inicial | ~5-10s (todo) | ~200ms (20 items) |
| Búsqueda | Client-side | Server-side |
| Buildings | Embebidos | Lazy loading |
| Paginación | No | Sí |

---

## Ejecución Local

### 1. Backend
```bash
cd ReactBis/backend
npm install
npm run dev
# Servidor en http://localhost:4000
```

### 2. Frontend
```bash
cd ReactBis/frontend
npm install
npm run dev
# Aplicación en http://localhost:5173
```

### 3. Verificar
- Backend health: http://localhost:4000/health
- Frontend: http://localhost:5173

---

## Despliegue (Pendiente)

### Opción recomendada: AWS Lightsail

| Componente | Plan | Costo |
|------------|------|-------|
| Backend | $5/mes (1GB RAM) | $5 |
| Frontend | Vercel (gratis) | $0 |
| MongoDB | Atlas (ya existe) | $0-9 |
| **Total** | | **$5-14/mes** |

### Pasos para despliegue:
1. Crear instancia Lightsail
2. Instalar Node.js
3. Clonar repo y configurar .env
4. Usar PM2 para process manager
5. Configurar Nginx como reverse proxy
6. SSL con Let's Encrypt
7. Actualizar CORS en backend (.env FRONTEND_URL)

---

## Historial de Cambios

### 2024-11-26
- Creación del proyecto ReactBis
- Backend completo con todos los endpoints
- Conexión a MongoDB Atlas existente
- Pruebas de todos los endpoints exitosas
- **Frontend completo**:
  - Proyecto Vite + React + TypeScript
  - Componentes: ProjectsTable, BuildingModal, DeleteModal, Toast
  - React Query para data fetching
  - Bootstrap 5 para estilos
  - Corregido TypeScript `verbatimModuleSyntax` (type imports)
  - CORS configurado para puerto 5173

### Origen
- Migrado desde: `reactIMS/backend/src/bis/`
- Base original: `inspection-server` (AWS Lambda)
- Google Apps Script: `BIS/Code.js` (no modificado)

---

## Troubleshooting

### Error: CORS policy blocked
**Causa**: El backend tiene `FRONTEND_URL` incorrecto en `.env`
**Solución**: Cambiar a `FRONTEND_URL=http://localhost:5173` y reiniciar backend

### Error: Type import required
**Causa**: TypeScript con `verbatimModuleSyntax` requiere `type` imports
**Solución**: Cambiar `import { Type }` a `import type { Type }`

### Error: Port already in use
**Causa**: Otro proceso está usando el puerto
**Solución Windows**:
```bash
netstat -ano | findstr :4000
taskkill //F //PID <PID>
```

### Página en blanco
**Posibles causas**:
1. Error de TypeScript en consola del navegador (F12)
2. Bootstrap JS import (removido, no es necesario)
3. Fragmentos React sin key

---

## Contacto y Recursos

- **MongoDB Atlas**: https://cloud.mongodb.com
- **Cluster**: wrs-fam-app
- **Database**: wrs-projecs-buildings
- **Collection**: buildingexternals

---

## Notas Importantes

1. El Google Apps Script (`BIS/Code.js`) sigue funcionando pero no se usa
2. La base de datos es compartida con el sistema anterior
3. Los índices de MongoDB ya están creados
4. CORS configurado para `localhost:5173` (cambiar en producción)
5. Usar `type` imports para interfaces TypeScript
