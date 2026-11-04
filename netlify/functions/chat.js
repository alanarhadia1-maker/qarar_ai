exports.handler = async function (event) {
  // استقبال طلبات POST فقط
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body || "{}");
    if (!prompt) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing prompt" }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "API key not configured" }) };
    }

    const systemPrompt = `أنت "مستشار قرار AI" - مستشار مالي واقتصادي ذكي محترف.
دورك: أجب بدقة واحترافية وبشكل مباشر على أي سؤال مالي (مصر، الخليج، الإمارات، الأسواق العالمية، العملات، الذهب) كخبير استثماري متكامل دون أي روابط خارجية، بلهجة عربية مهنية وودودة.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: `${systemPrompt}\n\nسؤال المستخدم: ${prompt}` }] }
        ]
      })
    });

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "لم أستطع الحصول على إجابة في الوقت الحالي.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: replyText })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Server Error" })
    };
  }
};
