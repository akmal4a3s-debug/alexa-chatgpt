export default async function handler(req, res) {
  try {
    // ✅ Ensure JSON body parsing
    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body);
    }

    // ✅ Handle LaunchRequest
    if (body?.request?.type === "LaunchRequest") {
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
    if (body?.request?.type === "IntentRequest") {
      userInput =
        body?.request?.intent?.slots?.query?.value || "Hello";
    }

    // ✅ Handle GET (testing)
    if (req.method === "GET") {
      userInput = req.query?.q || "Hello";
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
            {
    role: "system",
    content: `
You are a smart assistant that can handle both general and Islamic questions.

Rules:
- If the question is about Islam (Quran, Hadith, duas, الصلاة, etc):
  - Answer in an Islamic respectful tone
  - Provide Quran references when relevant
  - Include Arabic duas with English meaning when needed

- If the question is general (business, tech, daily life):
  - Answer normally like a helpful assistant

- Keep answers:
  - Short
  - Clear
  - Natural for voice (Alexa)

- Avoid long paragraphs
- Be friendly and conversational
`
  },
  {
    role: "user",
    content: userInput
  }
],
        max_tokens: 100
      })
    });

    const data = await openaiRes.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Sorry, I couldn't answer.";

    return res.status(200).json({
      version: "1.0",
      response: {
        outputSpeech: {
                type: "SSML",
ssml: `
<speak>
  <amazon:domain name="conversational">
    <prosody rate="92%" pitch="+3%">
      ${cleanReply}
      <break time="300ms"/>
    </prosody>
  </amazon:domain>
</speak>
        },
        shouldEndSession: false
      }
    });

  } catch (error) {
    console.error("ERROR:", error);

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
