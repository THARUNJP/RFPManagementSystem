import { appEnv } from "../config/env";
import { GEMINI_API_URL } from "../lib/constant/constant";
import { InternalServerError } from "../lib/errors/httpError";

export async function Gemini(prompt: string): Promise<any> {
  const bodyPayload = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(
      `${GEMINI_API_URL}?key=${appEnv.api_key.gemini}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API Error:", err);
      throw new Error("AI request failed");
    }

    const data = await response.json();
    let output = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Strip ```json ``` and any backticks
    output = output
      .replace(/```json\s*/, "")
      .replace(/```/g, "")
      .trim();

    // Parse to JSON
    return JSON.parse(output);
  } catch (error: any) {
    console.error("Gemini Error:", error.message);
    throw new InternalServerError(
      "Error while communicating with the Gemini API"
    );
  }
}
