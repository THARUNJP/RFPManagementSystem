export function buildRfpPrompt(descriptionRaw: string) {
  return `
Extract structured procurement details from the following text.

Return ONLY valid JSON in this exact format:

{
  "items": [
    { "type": "string", "quantity": number, "specs": "string" }
  ],
  "budget": number,
  "delivery_timeline": "string",
  "payment_terms": "string",
  "warranty": "string"
}

If a field is missing, return null.

Text:
"""
${descriptionRaw}
"""
`;
}

export function isEmptyResult(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && value.trim() === "") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === "object" && Object.keys(value).length === 0) return true;
  return false;
}

