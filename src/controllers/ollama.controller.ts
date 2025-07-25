import AIChatService from '@/services/ollama/aichat/ai.chat.service';
import OllamaService from '@/services/ollama/generate/ollama.service';
import { handleSuccessResponse } from '@/utils/responseHandler';
import { Request, Response } from 'express';

const handleFirstChat = async (req: Request, res: Response) => {
  const user = req.user;

  try {
    if (!user?._id) {
      return res
        .status(400)
        .json({ error: 'User ID is required to retrieve student data' });
    }
    const studentData = await AIChatService.getStudentData(user._id);

    // console.log('Student Data:', studentData);

    if (!studentData || studentData.length === 0) {
      return res.status(404).json({ error: 'No student data found' });
    }

    const initialPrompt = AIChatService.initPrompt(
      user,
      JSON.stringify(studentData),
    );

    const response = await OllamaService.generate(initialPrompt);

    const formatAiResponse = await AIChatService.handleAIResponse(
      response.response,
    );
    handleSuccessResponse(
      res,
      200,
      'AI initial successfully ',
      formatAiResponse,
    );
  } catch (error) {
    console.error('Error in handleFirstChat:', error);
    return res.status(500).json({ error: 'Failed to initial with Ollama' });
  }
};

const handleChatProgress = async (req: Request, res: Response) => {
  const user = req.user;
  const { prompt } = req.body;

  if (!user?._id || !prompt) {
    return res.status(400).json({ error: 'User ID and prompt are required' });
  }

  try {
    const clientChatPrompt = AIChatService.clientChatPrompt(prompt);

    const response = await OllamaService.generate(clientChatPrompt);

    const formatAiResponse = await AIChatService.handleAIResponse(response.response);
    handleSuccessResponse(
      res,
      200,
      'AI response successfully',
      formatAiResponse,
    );
  } catch (error) {
    console.error('Error in handle chat progress:', error);
    return res.status(500).json({ error: 'Failed to chat with Ollama' });
  }
};

export { handleChatProgress, handleFirstChat };
