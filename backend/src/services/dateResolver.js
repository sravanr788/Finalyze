import * as chrono from 'chrono-node';

function resolveDate(text, aiDate) {
  // 1. If AI already gave a valid ISO date
  if (aiDate) return new Date(aiDate);

  // 2. Try parsing natural language from the full input text
  const parsed = chrono.parseDate(text);
  if (parsed) return parsed;

  // 3. Fallback → today
  return new Date();
}

export default resolveDate;
