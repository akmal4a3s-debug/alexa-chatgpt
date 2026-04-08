export default async function handler(req, res) {
  try {
    const body = req.body || {};

    // ✅ Handle LaunchRequest (VERY IMPORTANT)
    if (body.request?.type === "LaunchRequest") {
      return res.status(200).json({
        version: "1.0",
        response: {
          outputSpeech: {
            type: "PlainText",
            text: "Hello! You can ask me anything."
          },
          shouldEndSession: false
        }
      });
    }

    let userInput = "Hello";

    // ✅ Handle IntentRequest
    if (body.request?.type === "IntentRequest") {
      userInput =
        body.request?.intent?.slots?.query?.value || "Hello";
    }

    // ✅ Handle GET (browser testing)
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

    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't answer.";

    return res.status(200).json({
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
    console.error(error);

    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
          type: "PlainText",
          text: "Error occurred"
        },
        shouldEndSession: true
      }
    });
  }
}
