# ============================================================
#  Dockerfile - Backend Spring Boot
#  Java 21 — Compatible con Apple Silicon (M1/M2/M3) y x86_64
#  Etapa 1: Construcción con Maven
# ============================================================
FROM --platform=$BUILDPLATFORM maven:3.9.6-eclipse-temurin-21 AS construccion

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# ============================================================
#  Etapa 2: Imagen final (jammy = Ubuntu 22.04, ARM64 nativo)
# ============================================================
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

RUN groupadd -r vintagegroup && useradd -r -g vintagegroup vintageuser

COPY --from=construccion /app/target/*.jar tienda-vintage.jar

RUN chown vintageuser:vintagegroup tienda-vintage.jar

USER vintageuser

EXPOSE 8080

ENTRYPOINT ["java", \
  "-jar", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "tienda-vintage.jar"]
