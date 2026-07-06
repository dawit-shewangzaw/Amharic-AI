import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

type GroqMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
};

@Injectable()
export class GroqProvider {
  private readonly apiKey = process.env.GROQ_API_KEY;
  private readonly model =
    process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

  async chat(messages: GroqMessage[]): Promise<string> {
    if (!this.apiKey) {
      throw new HttpException(
        'GROQ_API_KEY is not set.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.model,
            messages,
            temperature: 0.4,
          }),
        },
      );

      const data = (await response.json()) as GroqChatCompletionResponse;

      if (!response.ok) {
        throw new HttpException(
          data.error?.message ?? 'Groq request failed',
          response.status,
        );
      }

      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new HttpException(
          'Groq returned an empty response',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return content;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const message = error instanceof Error ? error.message : 'Groq service error';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}