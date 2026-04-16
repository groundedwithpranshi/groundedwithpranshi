import { useState } from "react";
import { useDocumentOperation, DocumentActionProps, DocumentActionDescription } from "sanity";

function extractJson(text: string): any {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "");
  return JSON.parse(cleaned);
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export function GenerateBlogWithGeminiAction(props: DocumentActionProps): DocumentActionDescription {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { patch, publish } = useDocumentOperation(props.id, props.type);

  return {
    label: isGenerating ? "Generating with Gemini..." : "Generate with Gemini",
    tone: "primary",
    disabled: isGenerating,
    title: error || "Generate fresh blog categories via Gemini",
    onHandle: async () => {
      const apiKey = process.env.SANITY_STUDIO_GEMINI_API_KEY;
      if (!apiKey) {
        setError("Missing SANITY_STUDIO_GEMINI_API_KEY in sanity/.env");
        props.onComplete();
        return;
      }

      setError(null);
      setIsGenerating(true);
      try {
        const prompt = `
Generate blog category content for a spiritual healing website.
Return STRICT JSON only with this shape:
{
  "blogCategories": [
    {
      "title": "Spiritual Astrology",
      "description": "string",
      "items": ["string", "string", "string", "string", "string"]
    },
    {
      "title": "Energy",
      "description": "string",
      "items": ["string", "string", "string", "string", "string"]
    },
    {
      "title": "Holistic Health",
      "description": "string",
      "items": ["string", "string", "string", "string", "string"]
    }
  ]
}
Style: warm, grounded, reflective, practical, no medical claims.
`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.status}`);
        }

        const data: GeminiResponse = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error("Gemini returned empty content.");
        }

        const generated = extractJson(text);
        if (!Array.isArray(generated.blogCategories)) {
          throw new Error("Gemini response missing blogCategories.");
        }

        patch.execute([
          {
            set: {
              blogCategories: generated.blogCategories.map((category: any) => ({
                _type: "category",
                title: category.title || "",
                description: category.description || "",
                items: Array.isArray(category.items) ? category.items : []
              }))
            }
          }
        ]);
        publish.execute();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gemini generation failed.");
      } finally {
        setIsGenerating(false);
        props.onComplete();
      }
    }
  };
}
