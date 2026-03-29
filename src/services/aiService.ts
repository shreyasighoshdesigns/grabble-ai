import { GoogleGenAI, Type } from '@google/genai';
import { MoodboardItem } from '../types';

export const generateMoodboardTitle = async (items: MoodboardItem[]): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API Key is missing');

  const ai = new GoogleGenAI({ apiKey });

  const textContent = items.map(item => {
    if (item.type === 'text') return item.content.text;
    if (item.type === 'image') return 'Image';
    return item.type;
  }).join(', ');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Suggest a short, creative title for a moodboard containing the following items: ${textContent}. Return ONLY the title string, no quotes.`,
  });

  return response.text?.trim() || 'Untitled Moodboard';
};

export const generateMoodboardDescription = async (items: MoodboardItem[]): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API Key is missing');

  const ai = new GoogleGenAI({ apiKey });

  const textContent = items.map(item => {
    if (item.type === 'text') return item.content.text;
    if (item.type === 'image') return 'Image';
    return item.type;
  }).join(', ');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write a short, 2-sentence description for a moodboard containing the following items: ${textContent}.`,
  });

  return response.text?.trim() || '';
};

export const clusterMoodboardItems = async (items: MoodboardItem[]): Promise<MoodboardItem[]> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API Key is missing');

  const ai = new GoogleGenAI({ apiKey });

  const parts: any[] = [
    { text: "I have a list of moodboard items. Please group them into logical clusters based on their visual content, text content, or type. Return a JSON array where each object has a 'clusterName' and an array of 'itemIds'." }
  ];

  for (const item of items) {
    parts.push({ text: `\nItem ID: ${item.id}\nType: ${item.type}` });
    
    if (item.type === 'text' || item.type === 'checklist' || item.type === 'link' || item.type === 'persona') {
      parts.push({ text: `\nContent: ${JSON.stringify(item.content)}` });
    } else if (item.type === 'image' && item.content.url) {
      try {
        const response = await fetch(item.content.url);
        const blob = await response.blob();
        const base64Data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        });
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: blob.type || 'image/jpeg'
          }
        });
      } catch (e) {
        console.error("Failed to fetch image for AI", e);
        parts.push({ text: `\n(Image content unavailable)` });
      }
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            clusterName: { type: Type.STRING },
            itemIds: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['clusterName', 'itemIds']
        }
      }
    }
  });

  let clusters = [];
  try {
    const text = response.text || '[]';
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    clusters = JSON.parse(cleanText);
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return items; // Return original items if parsing fails
  }
  
  // Apply new positions based on clusters
  const newItems = [...items];
  let currentX = 100;
  let currentY = 100;

  clusters.forEach((cluster: any) => {
    let clusterY = currentY;
    cluster.itemIds.forEach((id: string) => {
      const itemIndex = newItems.findIndex(i => i.id === id);
      if (itemIndex !== -1) {
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          x: currentX,
          y: clusterY
        };
        clusterY += newItems[itemIndex].height + 20;
      }
    });
    currentX += 400; // Move to next column for next cluster
  });

  return newItems;
};

export const generateInsightCard = async (items: MoodboardItem[]): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini API Key is missing');

  const ai = new GoogleGenAI({ apiKey });

  const textContent = items.map(item => {
    if (item.type === 'text') return item.content.text;
    if (item.type === 'image') return 'Image';
    return item.type;
  }).join(', ');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the following items in a moodboard: ${textContent}, generate a short, insightful note (1-2 sentences) that connects these ideas or suggests a new direction.`,
  });

  return response.text?.trim() || 'No insights generated.';
};
