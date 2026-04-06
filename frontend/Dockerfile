# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: serve with nginx ──────────────────────────────────────────────────
FROM nginx:alpine
# MUST match API Web App default HTTPS URL or nginx → API returns 502.
# In Azure: az webapp show -g Mobirehab_group -n Mobirehab --query defaultHostName -o tsv
# Then: https://<that-host>   (no trailing slash)
# Build override: docker build --build-arg BACKEND_PUBLIC_URL=https://YOUR-API... .
ARG BACKEND_PUBLIC_URL=https://mobirehab-bbaahwfybghmb6cx.canadacentral-01.azurewebsites.net
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /tmp/nginx.conf
# Strip trailing slash so proxy_pass gets https://host (no path)
RUN BACKEND=$(echo "${BACKEND_PUBLIC_URL}" | sed 's|/$||') \
  && BH=$(echo "${BACKEND}" | sed 's|^https://||;s|^http://||' | sed 's|/.*||') \
  && sed -e "s|__BACKEND_PUBLIC_URL__|${BACKEND}|g" \
         -e "s|__BACKEND_PUBLIC_HOST__|${BH}|g" \
         /tmp/nginx.conf > /etc/nginx/nginx.conf \
  && rm /tmp/nginx.conf \
  && echo "nginx API upstream:" && grep -n proxy_pass /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
