import fs from "fs";
import path from "path";

function getTasks() {
  const filePath = path.join(process.cwd(), "data", "db.json");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(fileContent);
}

export async function POST(req) {
  try {
    const { message } = await req.json();

    const tasks = getTasks();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Nexus AI"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-001",
        messages: [
          {
            role: "system",
            content: `You are Nexus AI, an intelligent assistant for a disaster resource allocation platform used by an NGO.

You help coordinators make smart decisions about task prioritization and resource allocation during crises.

Here are all the current tasks in the system:
${JSON.stringify(tasks, null, 2)}

Each task has:
- title & description: what the crisis is about
- location: where it is happening
- category: type of crisis (Food, Medical, Shelter, etc.)
- affectedCount: number of people affected
- priority: urgency score (0-100, higher = more urgent)
- status: current state (Pending, InProgress, Completed)
- createdAt: when it was reported

You can help with:
- Which tasks to prioritize first
- Which locations need immediate attention
- How many people are affected in total or by category
- Summarizing the current crisis situation
- Recommending resource allocation strategies

Always base your answers strictly on the task data above. Be concise and actionable.

whenever asked to list data or anything related to tasks, volunteers, or assignments, dont give task ids.
list it point wise and make it human readable instead of paragraphs.
`
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok || !data.choices?.length) {
      throw new Error(data.error?.message || "Invalid response from OpenRouter");
    }

    const text = data.choices[0].message.content;
    return Response.json({ reply: text });

  } catch (error) {
    console.error("Chat API error:", error.message);
    return Response.json({
      reply: "AI services are temporarily unavailable. Please try again later."
    });
  }
}