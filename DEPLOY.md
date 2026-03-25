# Guía de Despliegue con Docker y Cloudflare

Esta guía explica cómo desplegar tu Wallbit Dashboard en un servidor público utilizando Docker Compose y exponerlo de forma segura con Cloudflare Tunnels (Zero Trust).

## 1. Requisitos Previos
- Docker y Docker Compose instalados en tu servidor.
- Una cuenta en Cloudflare con un dominio configurado.
- Acceso a Cloudflare Zero Trust (gratuito para uso personal).

## 2. Configuración de Archivos
Asegúrate de tener los siguientes archivos en la raíz de tu proyecto:
- `Dockerfile.frontend`: Define cómo construir la app React y servirla con Nginx.
- `Dockerfile.backend`: Define el servidor Express de cache.
- `docker-compose.yml`: Orquestador de ambos servicios.
- `nginx.conf`: Configuración de Nginx con Reverse Proxy para `/api`.

## 3. Despliegue con Docker Compose

### Desarrollo Local (Build):
```bash
docker compose up -d --build
```

### Producción (Registry - GHCR):
Una vez que las imágenes estén en el registry, usa:
```bash
docker compose -f docker-compose.prod.yml up -d
```
Esto levantará el frontend en el puerto **80** (estándar HTTP) y el backend internamente.

### 4. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto para mayor seguridad:
```env
WALLBIT_API_KEY=tu_api_key_aqui
DASHBOARD_TOKEN=un_token_seguro_para_tu_dashboard
```
El `DASHBOARD_TOKEN` es esencial para proteger el acceso a tus datos financieros desde el dashboard. 

**Nota**: Si utilizas la imagen de Docker pre-construida, el frontend te pedirá el token la primera vez que entres y lo guardará en tu navegador de forma segura.

## 4. Configurar Cloudflare Tunnel
Para exponer el proyecto públicamente sin abrir puertos en tu router/firewall:

1. Ve a **Cloudflare Zero Trust** > **Networks** > **Tunnels**.
2. Crea un nuevo túnel (ej. `wallbit-dash`).
3. Sigue las instrucciones para instalar el conector (`cloudflared`) en tu servidor Docker.
4. En la pestaña **Public Hostname**, añade:
   - **Subdominio**: `dashboard` (ej. `dashboard.tudominio.com`).
   - **Service**: `http://localhost:8080`.

## 5. CI/CD con GitHub Actions
El archivo `.github/workflows/deploy.yml` está configurado para:
1. Detectar cambios en la rama `main`.
2. (Recomendado) Puedes añadir tus credenciales SSH en los **Secrets** de GitHub para que el servidor haga un `git pull` y `docker compose up` automáticamente.
