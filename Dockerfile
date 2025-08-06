# Simple single-stage build using working Ubuntu base
FROM ubuntu:22.04

# Install OpenJDK 17 JDK for compilation, then remove unnecessary parts
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set UTF-8 locale
ENV LANG=C.UTF-8

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN groupadd -r rekno && useradd -r -g rekno rekno

# Copy source files and dependencies
COPY lib/ ./lib/
COPY src/ ./src/
COPY web/ ./web/
COPY graph.json ./graph.json

# Compile Java source files
RUN mkdir -p out && \
    javac -encoding UTF-8 -cp ".:lib/gson-2.10.1.jar" -d out \
    src/model/*.java \
    src/persistence/*.java \
    src/server/*.java \
    src/Main.java

# Remove source files and JDK to reduce image size, keep only JRE
RUN rm -rf src/ && \
    apt-get update && \
    apt-get remove -y openjdk-17-jdk && \
    apt-get install -y openjdk-17-jre-headless && \
    apt-get autoremove -y && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Change ownership to non-root user
RUN chown -R rekno:rekno /app

# Switch to non-root user
USER rekno

# Expose port (Render will set PORT env var dynamically)
EXPOSE $PORT
ENV PORT=8000

# Run the application
CMD ["java", "-cp", ".:out:lib/gson-2.10.1.jar", "Main"]
