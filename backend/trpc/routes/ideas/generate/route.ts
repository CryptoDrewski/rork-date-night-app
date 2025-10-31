import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { generateText } from "@rork/toolkit-sdk";

const AI_SYSTEM_PROMPT = `You are "Date Night Genie," an expert concierge for couples. Generate 5-8 diverse date ideas tailored to the user's vibe, location, and real local events/venues. Return valid JSON only with this schema:
{
  "ideas": [
    {
      "title": string,
      "description": string,
      "budget": "$" | "$$" | "$$$",
      "durationMinutes": number,
      "tags": string[],
      "idealTime": "day" | "night" | "flex",
      "suggestedVenueTypes": string[]
    }
  ]
}

IMPORTANT: 
- Use the user's ACTUAL LOCATION to suggest REAL places and events happening NOW or SOON
- Include specific venue names, local attractions, seasonal events, festivals, markets, etc.
- Check current date/time and suggest timely activities
- If near a city, mention actual neighborhoods, parks, restaurants, entertainment venues
- Prioritize diverse options: outdoors, food, arts/culture, budget-friendly, cozy/quiet, adventurous
- Make suggestions feel local and specific, not generic`;

export const generateIdeasProcedure = publicProcedure
  .input(
    z.object({
      prompt: z.string(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      city: z.string().optional(),
      relationshipStage: z.string(),
      minBudget: z.string(),
      maxBudget: z.string(),
      interests: z.array(z.string()),
      radiusKm: z.number(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('🎯 Starting AI generation...');
    console.log('📝 User prompt:', input.prompt);
    console.log('📍 Location:', input.latitude && input.longitude ? `${input.latitude}, ${input.longitude}` : 'None');
    
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const timeOfDay = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
    const season = now.getMonth() < 3 ? 'winter' : now.getMonth() < 6 ? 'spring' : now.getMonth() < 9 ? 'summer' : 'fall';
    
    let locationContext = '';
    if (input.latitude && input.longitude) {
      locationContext = `\n- GPS Coordinates: ${input.latitude.toFixed(4)}, ${input.longitude.toFixed(4)}`;
    }
    if (input.city) {
      locationContext += `\n- City/Area: ${input.city}`;
    }
    
    const contextPrompt = `
CURRENT CONTEXT:
- Date: ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
- Day: ${dayOfWeek}
- Time: ${timeOfDay} (${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')})
- Season: ${season}${locationContext}

USER PROFILE:
- Relationship Stage: ${input.relationshipStage}
- Budget Range: ${input.minBudget} to ${input.maxBudget}
- Interests: ${input.interests.join(", ") || "Open to anything"}
- Search Radius: ${Math.round(input.radiusKm / 1.60934)} miles

USER REQUEST: ${input.prompt}

Generate SPECIFIC, LOCAL date ideas. Use real place names if you know them. Suggest actual events, venues, or activities that would be happening in this location at this time. Be creative and timely!`;

    console.log('🤖 Calling AI with context...');
    
    const result = await generateText({
      messages: [
        { role: "user", content: AI_SYSTEM_PROMPT + "\n\n" + contextPrompt },
      ],
    });
    
    console.log('✅ AI response received');
    console.log('📄 Raw response:', result.substring(0, 200) + '...');

    let cleanedResult = result.trim();
    if (cleanedResult.startsWith('```json')) {
      cleanedResult = cleanedResult.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (cleanedResult.startsWith('```')) {
      cleanedResult = cleanedResult.replace(/```\n?/g, '');
    }
    
    console.log('🧹 Cleaned response:', cleanedResult.substring(0, 200) + '...');
    
    const parsed = JSON.parse(cleanedResult);
    const ideas = parsed.ideas.map((idea: any, index: number) => {
      console.log(`💡 Idea ${index + 1}:`, idea.title);
      return {
        id: `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...idea,
        createdAt: new Date().toISOString(),
      };
    });

    console.log(`✨ Generated ${ideas.length} ideas successfully`);
    return ideas;
  });
