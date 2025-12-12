
export interface GenerateContentResponse {
    candidates?: {
        content: {
            parts: {
                text: string;
            }[];
        };
    }[];
}

export async function generateViaProxy(body: any): Promise<GenerateContentResponse> {
  const endpoint = '/v1/generate'; // Use relative path for Vite proxy
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => 'Failed to get error details');
    throw new Error(`GenAI proxy error ${res.status}: ${detail}`);
  }
  return res.json();
}
