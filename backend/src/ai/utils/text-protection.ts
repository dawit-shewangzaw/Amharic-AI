type TextMasker = {
  mask: (text: string) => string;
  unmask: (text: string) => string;
};

const PLACEHOLDER_PREFIX = '__AI_TEXT_';

function buildPattern(): RegExp {
  return /```[\s\S]*?```|`[^`]+`|https?:\/\/[^\s]+|www\.[^\s]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\b\d{1,4}[-/\.]\d{1,2}[-/\.\d{0,4}]\b|\b\d+(?:[.,]\d+)?\b/g;
}

export function normalizeUserText(text: string): string {
  return text
    .replace(/\u00A0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

export function createTextMasker(): TextMasker {
  const placeholders = new Map<string, string>();
  let counter = 0;

  const mask = (text: string): string =>
    text.replace(buildPattern(), (match) => {
      const token = `${PLACEHOLDER_PREFIX}${counter++}__`;
      placeholders.set(token, match);
      return token;
    });

  const unmask = (text: string): string => {
    let output = text;
    for (const [token, original] of placeholders.entries()) {
      output = output.split(token).join(original);
    }
    return output;
  };

  return { mask, unmask };
}