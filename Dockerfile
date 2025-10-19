# Multi-stage build for Kitty Card Game
FROM sbtscala/scala-sbt:eclipse-temurin-jammy-21.0.2_13_1.10.0_3.4.2 AS builder

# Set working directory
WORKDIR /app

# Copy project files
COPY build.sbt .
COPY project ./project
COPY se_kitty_card ./se_kitty_card
COPY wa_kitty_card ./wa_kitty_card

# Build the application
RUN sbt wa_kitty_card/stage

# Production stage - smaller image
FROM eclipse-temurin:21-jre-jammy

# Install required packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy the staged application from builder
COPY --from=builder /app/wa_kitty_card/target/universal/stage /app

# Create a non-root user
RUN groupadd -r kittycard && \
    useradd -r -g kittycard kittycard && \
    chown -R kittycard:kittycard /app

# Switch to non-root user
USER kittycard

# Expose the application port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:9000/ || exit 1

# Run the application
CMD ["./bin/wa_kitty_card", "-Dhttp.port=9000", "-Dplay.server.pidfile.path=/dev/null"]
