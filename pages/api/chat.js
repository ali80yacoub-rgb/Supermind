export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages, mode } = req.body;

  const PROMPTS = {
    chat:  "You are SuperMind, a brilliantly helpful AI assistant. Be concise, warm, and insightful.",
    write: "You are SuperMind's elite writing assistant. Help craft compelling, polished content.",
    code:  "You are SuperMind's expert coding assistant. Write clean, commented, production-ready code.",
    image: "You are SuperMind's visual AI. Describe images vividly and generate DALL-E style prompts.",
    coach: "You are SuperMind's personal AI coach. Be motivating, direct, and insightful.",
  };

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: PROMPTS[mode] || PROMPTS.chat,
        messages,
      }),
    });
    const data = await response.json();
    res.status(200).json({ reply: data?.content?.[0]?.text || "Something went wrong." });
  } catch (e) {
    res.status(500).json({ reply: "Server error. Please try again." });
  }
      }
