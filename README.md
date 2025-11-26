# ReactBis - Building Information System

Sistema para gestionar información de edificios (buildings) agrupados por proyectos.

## Requisitos

- Node.js 18+
- npm

## Inicialización

### 1. Instalar dependencias

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Iniciar servidores

```bash
# Terminal 1 - Backend (puerto 4000)
cd backend
npm run dev

# Terminal 2 - Frontend (puerto 5173)
cd frontend
npm run dev
```

### 3. Verificar

- Backend: http://localhost:4000/health
- Frontend: http://localhost:5173

## Estructura

```
ReactBis/
├── backend/          # Node.js + Express + MongoDB
│   └── src/
├── frontend/         # React + Vite + TypeScript
│   └── src/
└── DOCUMENTATION.md  # Documentación completa
```
