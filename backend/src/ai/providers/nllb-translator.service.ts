import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

type TranslatorResponse = {
  result?: string;
  translated_text?: string;
  translation?: string;
  text?: string;
};

@Injectable()
export class NllbTranslatorService {
  private readonly baseUrl =
    process.env.NLLB_TRANSLATOR_URL ??
    'https://winstxnhdw-nllb-api.hf.space/api/v4/translator';

  async translateToEnglish(text: string): Promise<string> {
    return this.translate(text, 'amh_Ethi', 'eng_Latn');
  }

  async translateToAmharic(text: string): Promise<string> {
    return this.translate(text, 'eng_Latn', 'amh_Ethi');
  }

  private async translate(
    text: string,
    source: string,
    target: string,
  ): Promise<string> {
    const url = new URL(this.baseUrl);
    url.searchParams.set('text', text);
    url.searchParams.set('source', source);
    url.searchParams.set('target', target);

    try {
      const response = await fetch(url.toString(), { method: 'GET' });
      const data = (await response.json()) as TranslatorResponse | string;

      if (!response.ok) {
        const message =
          typeof data === 'string'
            ? data
            : data.result ?? data.translation ?? data.text ?? 'Translation failed';
        throw new HttpException(message, response.status);
      }

      if (typeof data === 'string') {
        return data.trim();
      }

      const result =
        data.result ?? data.translated_text ?? data.translation ?? data.text;

      if (!result) {
        throw new HttpException(
          'Translator returned an empty response',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return result.trim();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Translator service error';
      throw new HttpException(message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}