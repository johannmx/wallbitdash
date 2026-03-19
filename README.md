# 🚀 Wallbit Dashboard - Advanced Cache Middleware

Un dashboard moderno y premium para visualizar tus activos y transacciones de **Wallbit** en tiempo real, con una arquitectura optimizada para evitar límites de API (Rate Limiting) y garantizar la persistencia de datos.

![Wallbit Dashboard](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## ✨ Características Principales

- 💳 **Balance en Vivo**: Visualización en tiempo real de cuentas de Checking e Inversiones.
- 🕒 **Middleware de Cache**: Servidor Express que refresca datos cada 15 min de la API oficial y sirve al frontend cada 5 min.
- 🌍 **Historial Completo**: Soporta el procesamiento de cientos de transacciones con filtros y ordenamiento avanzado.
- 🏖️ **Tracker de Viajes**: Sección dedicada para seguir gastos específicos (ej. Viaje a Brasil Oct-Nov 2025).
- 🎨 **Diseño Moderno**: Interfaz con Glassmorphism, animaciones suaves y modo oscuro nativo.
- 🐳 **Docker-Ready**: Configuración completa con Docker Compose para despliegue productivo.

## 🏗️ Arquitectura

- **Frontend**: React 19 + Vite (Servido via Nginx).
- **Backend**: Node.js 20 (Express) con Cron Jobs para sincronización.
- **Proxy**: Nginx como Reverse Proxy para unificar API y Frontend bajo un mismo puerto.
- **CI/CD**: GitHub Actions para builds automatizados en GHCR (GitHub Container Registry).

## 🚀 Cómo Empezar

### Requisitos Previos
- Docker y Docker Compose
- Una API Key de Wallbit (Consíguela en [Wallbit Developer Portal](https://developer.wallbit.io/))

### Despliegue Rápido (Producción)
Si quieres levantarlo usando las imágenes ya compiladas en GHCR:

1. Clona el repositorio.
2. Configura tu variable de entorno en tu terminal o en un archivo `.env`:
   ```bash
   export WALLBIT_API_KEY=tu_api_key_aqui
   ```
3. Ejecuta:
   ```bash
   docker compose -f docker-compose.prod.yml up -d
   ```

### Desarrollo Local
Para trabajar en el código base:

1. Instala las dependencias:
   ```bash
   npm install
   ```
2. Define tu API Key y corre ambos servidores simultáneamente:
   ```bash
   WALLBIT_API_KEY=tu_api_key_aqui npm run dev
   ```
   El frontend estará en `http://localhost:5173` y el backend en `http://localhost:3001`.

## 💾 Persistencia de Datos
El proyecto utiliza un volumen de Docker para guardar el historial en un archivo `data.json`. Esto permite que tus datos no se pierdan si reinicias el contenedor y reduce drásticamente las llamadas innecesarias a la API de Wallbit.

## ☁️ Despliegue Público (Cloudflare)
Consulta la guía detallada en [**DEPLOY.md**](./DEPLOY.md) para exponer tu dashboard de forma segura usando Cloudflare Tunnels (Zero Trust).

---
Hecho con ✨ por **Johann** y **Antigravity**.
