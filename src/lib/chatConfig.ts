interface ChatbotResponse {
  role: 'user' | 'assistant';
  content: string;
}

const PERSONA = {
  greeting: "Halo! Saya CS Goodplace, siap membantu Anda menemukan parfum yang sempurna! 😊",
  unsure: "Maaf, informasi itu belum tersedia di website kami.",
  error: "Mohon maaf, sedang terjadi kendala teknis. Silakan coba lagi nanti atau hubungi kami melalui WhatsApp.",
};

const PRODUCT_INFO = {
  features: [
    "Parfum berkualitas premium dengan ketahanan 6-10 jam",
    "Dibuat dengan bahan-bahan pilihan terbaik",
    "Tersedia dalam ukuran 30ml (travel size) dan 100ml",
    "Cocok untuk pria dan wanita (unisex)",
  ],
  categories: [
    "Parfum Pria",
    "Parfum Wanita",
    "Parfum Unisex",
    "Travel Size",
  ],
};

export function formatResponse(text: string): string {
  return text
    .replace(/\n{3,}/g, "\n\n") // Remove excess newlines
    .replace(/([.!?])\s*(\w)/g, "$1\n$2") // Add newlines after sentences
    .trim();
}

export const generatePrompt = (userMessage: string): string => {
  return `You are the Goodplace Perfume Store's customer service chatbot. Respond in Bahasa Indonesia, be friendly but professional.

Key Information:
- Goodplace adalah toko parfum premium
- Parfum kami bertahan 6-10 jam
- Tersedia ukuran 30ml dan 100ml
- Menggunakan bahan berkualitas tinggi
- Pilihan parfum unisex tersedia

Guidelines:
- Keep responses under 3 sentences
- Use casual but polite Bahasa Indonesia
- If information is not available, say: "${PERSONA.unsure}"
- Use bullet points for lists
- Stay friendly and helpful

Customer: ${userMessage}
Assistant: `;
};

export const processBotResponse = (response: string): string => {
  // Clean up the response
  let cleanResponse = response
    .split("Customer:")[0]
    .split("Assistant:")[0]
    .trim();

  // Add bullet points if it's a list
  if (cleanResponse.includes("\n")) {
    cleanResponse = cleanResponse
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.startsWith("-") ? line : `- ${line}`)
      .join("\n");
  }

  return formatResponse(cleanResponse);
};
