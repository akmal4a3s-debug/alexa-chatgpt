export default async function handler(req, res) {
  try {
    let userInput = "Hello";

    // ✅ Handle Alexa POST request
    if (req.method === "POST") {
      const body = req.body || {};
      userInput =
        body?.request?.intent?.slots?.query?.value || "Hello";
    }

    // ✅ Handle browser GET request (testing)
    if (req.method === "GET") {
      userInput = req.query?.q || "Hello";
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: userInput }
        ]
      })
    });

    const data = await openaiRes.json();

    console.log("OPENAI RESPONSE:", data);

    const reply =
      data.choices?.[0]?.message?.content ||
      "No response from AI";

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
    console.error("ERROR:", error);

    res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: error.message || "Error occurred"
        },
        shouldEndSession: true
      }
    });
  }
}
