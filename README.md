# 🚀 Wallbit Dashboard - Advanced Cache Middleware

Un dashboard moderno y premium para visualizar tus activos y transacciones de **Wallbit** en tiempo real, con una arquitectura optimizada para evitar límites de API (Rate Limiting) y garantizar la persistencia de datos.

![Wallbit Dashboard](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![NodeJS](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)

## ✨ Características Principales

- 💳 **Balance en Vivo**: Visualización en tiempo real de cuentas de Checking e Inversiones (Stocks).
- 🕒 **Sincronización Inteligente**: Middleware de Cache (Express) que refresca datos cada **5 min** de la API oficial. El frontend incluye un **Timer Visual** con barra de progreso que sincroniza localmente cada 5 min.
- 🇦🇷 **Conversión a ARS (Real-time)**: Integración de "píldoras" de conversión a Pesos Argentinos (Dólar Oficial) en todas las tarjetas de saldo y gastos, facilitando el control financiero local.
- 🔍 **Buscador Premium**: Historial de transacciones con buscador estilo "píldora" responsivo, con efectos interactivos y estados de foco mejorados.
- 📉 **Analíticas Avanzadas**: Gráficos interactivos de depósitos mensuales (ARS) y distribución de gastos por categoría usando Recharts.
- 💵 **Tasa en Tiempo Real**: Integración con DolarAPI para obtener el tipo de cambio oficial automáticamente.
- 🌍 **Historial Completo**: Procesamiento optimizado de cientos de transacciones con filtros y búsqueda.
- 🛍️ **Gastos Recientes**: Sección dedicada para analizar el consumo de los últimos 7 días con totales en USD.
- 🎨 **Diseño Persistente**: Interfaz moderna con Glassmorphism, tipografía **Outfit** unificada para una estética premium, animaciones fluidas, y selector de temas (Light/Dark/System).
- 🐳 **Docker-Ready**: Infraestructura completa con Docker Compose y builds optimizados en GHCR.

## 🏗️ Arquitectura

- **Frontend**: React 19 + Vite (Servido via Nginx).
- **Backend**: Node.js 20 (Express) con Cron Jobs para sincronización.
- **Proxy**: Nginx como Reverse Proxy para unificar API y Frontend bajo un mismo puerto.
- **CI/CD**: GitHub Actions para builds automatizados en GHCR. Soporta arquitecturas **amd64** y **arm64** (Oracle ARM, Raspberry Pi) mediante builds optimizados.

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
