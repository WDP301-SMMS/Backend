# 🧠 How To Integrate AI Into Your Project with Ollama

This guide walks you through setting up an AI model locally using [Ollama](https://ollama.com) and interacting with it via a browser-friendly UI using [Open WebUI](https://github.com/open-webui/open-webui). Everything runs in Docker, so it's isolated and easy to manage.

---

## 🚀 Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop) installed and running
- An NVIDIA GPU with CUDA support
- NVIDIA Container Toolkit installed: [Installation Guide](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html)

---

## 📦 Step 1: Set Up Docker Compose

Create a `docker-compose.yml` file and copy the following configuration into it:

```yaml
services:
  ollama:
    image: ollama/ollama
    container_name: ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    deploy:
      resources:
        limits:
          memory: 10g
          cpus: "5"
    security_opt:
      - no-new-privileges
    cap_drop:
      - ALL
    cap_add:
      - SYS_NICE
    read_only: true
    volumes:
      - ollama:/root/.ollama
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
      - NVIDIA_DRIVER_CAPABILITIES=compute,utility
    runtime: nvidia
    shm_size: '1gb'
    entrypoint: >
      sh -c "
        echo 'Starting Ollama service...'
        /bin/ollama serve &
        OLLAMA_PID=$!
        echo 'Waiting for Ollama to become available...'
        while ! ollama ps > /dev/null 2>&1; do
          sleep 1
        done
        echo 'Ollama is up. Pulling model (deepseek-r1:8b)...'
        ollama pull deepseek-r1:8b
        echo 'Model pull complete. The container will now wait for the Ollama process to exit.'
        wait $OLLAMA_PID
      "

  open-webui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: open-webui
    restart: unless-stopped
    ports:
      - "3000:8080"
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434/
    volumes:
      - open-webui:/app/backend/data
    depends_on:
      - ollama

volumes:
  ollama:
    driver: local
  open-webui:
    driver: local
```

## Step 2: Start the Services

```yaml
    docker compose up -d
```

## Step 3: Run an AI Model (CLI Option)

1. Go to your Docker dashboard or use terminal to access the ollama container:
```yaml
    docker exec -it ollama bash
```

2. Run a model (replace [model_name] with the name you want):
```yaml
    ollama run [model_name]
```

### To find available model names: [Ollama Models](https://ollama.com/search)


