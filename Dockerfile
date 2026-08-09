# =====================================================================
# Build 1 image duy nhất chứa cả frontend (React) + backend (Spring Boot).
# Frontend được build ra file tĩnh rồi nhét vào backend để phục vụ chung
# một domain -> đường dẫn /api tương đối chạy luôn, không cần CORS/URL riêng.
# =====================================================================

# ---- Stage 1: build frontend (React + Vite) ----
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build          # kết quả nằm ở /app/frontend/dist

# ---- Stage 2: build backend (Spring Boot) + gắn frontend vào ----
FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /app/backend
COPY backend/pom.xml ./
COPY backend/src ./src
# Nhét bản build của frontend vào thư mục static của Spring Boot.
COPY --from=frontend /app/frontend/dist ./src/main/resources/static
RUN mvn -q clean package -DskipTests   # ra file target/*.jar

# ---- Stage 3: runtime (chỉ cần JRE, image nhẹ) ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=backend /app/backend/target/*.jar app.jar
# Render sẽ đặt biến PORT; app đọc PORT qua application-prod.properties.
EXPOSE 8090
ENTRYPOINT ["java", "-jar", "app.jar"]
