# ============================================
# ÉTAPE 1 : BUILD avec Maven
# ============================================
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Copier le pom.xml en premier pour profiter du cache Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copier le code source
COPY src ./src

# Compiler sans les tests
RUN mvn clean package -DskipTests -Pprod

# ============================================
# ÉTAPE 2 : IMAGE FINALE légère
# ============================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Créer les dossiers nécessaires
RUN mkdir -p logs uploads/courriers

# Copier le jar compilé
COPY --from=builder /app/target/*.jar app.jar

# Port exposé (Render utilise 8080)
EXPOSE 8080

# Lancer avec le profil prod
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=prod", "app.jar"]
