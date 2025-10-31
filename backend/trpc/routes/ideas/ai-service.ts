type UserMessage = { role: "user"; content: string };
type AssistantMessage = { role: "assistant"; content: string };

export async function generateDateIdeas(params: {
  messages: (UserMessage | AssistantMessage)[];
}): Promise<string> {
  const { generateText } = await import("@rork/toolkit-sdk");
  return await generateText(params);
}
