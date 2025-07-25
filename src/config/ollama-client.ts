import axios from 'axios';

const ollamaClient = axios.create({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default ollamaClient;
