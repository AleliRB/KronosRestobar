# =====================================================
# ETAPA 1: BUILD DE LA APLICACIÓN ANGULAR
# =====================================================
FROM node:20-alpine AS build

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de Node.js
RUN npm install --legacy-peer-deps

# Copiar todo el código fuente del proyecto
COPY . .

# Compilar la aplicación Angular para producción
RUN npm run build

# =====================================================
# ETAPA 2: SERVIDOR DE PRODUCCIÓN CON NGINX
# =====================================================
FROM nginx:alpine

# Copiar archivos compilados desde la etapa de build
# NOTA: Si tu outputPath en angular.json es diferente, ajusta esta ruta
COPY --from=build /app/dist/restobar-kronos/browser /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]