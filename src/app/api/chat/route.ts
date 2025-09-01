import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.NEXT_PUBLIC_HUGGING_FACE_TOKEN);

const FALLBACK_RESPONSES = [
  "Mohon maaf atas ketidaknyamanannya. Silakan coba pertanyaan lain atau hubungi kami melalui WhatsApp untuk bantuan lebih lanjut.",
  "Maaf, saya sedang mengalami kendala teknis. Silakan pilih dari menu berikut atau hubungi kami via WhatsApp.",
  "Mohon maaf, saya belum bisa menjawab pertanyaan tersebut. Silakan tanyakan hal lain seputar parfum kami."
];

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    const response = await hf.textGeneration({
      model: 'gpt2',
      inputs: message,
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        top_p: 0.95,
        return_full_text: false,
        repetition_penalty: 1.2
      }
    });

    // If response is empty or too short, use a fallback
    if (!response.generated_text || response.generated_text.length < 10) {
      const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
      return NextResponse.json({ response: fallback });
    }

    return NextResponse.json({ response: response.generated_text });
  } catch (error) {
    console.error('API Error:', error);
    const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    return NextResponse.json({ response: fallback });
  }
}
