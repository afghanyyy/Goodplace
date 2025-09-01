import { generatePrompt, processBotResponse } from '@/lib/chatConfig';
import { HfInference } from '@huggingface/inference';

export async function generateAIResponse(userMessage: string) {
  try {
    console.log('Sending request to AI API...');
    
    const prompt = generatePrompt(userMessage);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: prompt })
    });

    if (!response.ok) {
      throw new Error('Failed to get response from AI service');
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }

    const aiResponse = processBotResponse(data.response);

    if (aiResponse.length < 10) {
      throw new Error('Response too short');
    }

    return aiResponse;
  } catch (error) {
    console.error('AI Service Error:', error);
    
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      throw new Error('Network error when connecting to AI service. Please check your internet connection and try again.');
    }
    
    if (error instanceof Error && error.message.includes('model')) {
      throw new Error('Model not available. Please try again later.');
    }

    throw new Error('An unexpected error occurred with the AI service. Please try again.');
  }
}
