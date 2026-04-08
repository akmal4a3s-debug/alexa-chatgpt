export default async function handler(req, res) {
  try {
    const body = req.body;

    const userInput =
      body.request?.intent?.slots?.query?.value ||
      "Hello";

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Keep answers short and voice-friendly."
          },
          {
            role: "user",
            content: userInput
          }
        ],
        max_tokens: 120
      })
    });

    const data = await openaiRes.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't respond.";

    res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: reply
        },
        shouldEndSession: false
      }
    });
  } catch (error) {
    res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "There was an error."
        },
        shouldEndSession: true
      }
    });
  }
}