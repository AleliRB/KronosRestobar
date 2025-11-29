# =====================================================
# ETAPA 1: BUILD DE LA APLICACIÓN ANGULAR
# =====================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar los archivos de dependencias
COPY package*.json ./

# Instalar dependencias correctamente
RUN npm install --legacy-peer-deps

# Copiar el resto del proyecto
COPY . .

# Compilar Angular
RUN npm run build

# =====================================================
# ETAPA 2: SERVIR CON NGINX
# =====================================================
FROM nginx:alpine

# Copiar build de angular (verifica nombre en /dist/)
COPY --from=build /app/dist/restobar-kronos/browser /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
