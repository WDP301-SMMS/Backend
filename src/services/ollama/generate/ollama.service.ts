import ollamaClient from '@/config/ollama-client';


class OllamaService {
  static async generate(prompt: string) {
    try {
      const response = await ollamaClient.post('/generate', {
        model: process.env.OLLAMA_MODEL || 'deepseek-r1:8b',
        prompt: prompt,
        stream: false,
      });

      return response.data;
    } catch (error) {
      console.error('Error generating response from Ollama:', error);
      throw error;
    }
  }
}
export default OllamaService;
