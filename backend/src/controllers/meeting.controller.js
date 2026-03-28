import httpStatus from "http-status";
import { Meeting } from "../models/meeting.model.js";
import { GoogleGenAI } from "@google/genai";

const summarizeMeeting = async (req, res) => {
  try {
    const { meetingCode, transcript } = req.body;
    if (!meetingCode || !transcript) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: "meetingCode and transcript are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "GEMINI_API_KEY is not configured" });
    }

    const prompt = `
You are an assistant generating a concise meeting recap from a transcript.
Return Markdown with these sections:
## Summary
## Key Decisions
## Action Items

Keep it brief, bullet points where helpful. Do not include any preamble.

Transcript:
${transcript}
`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    });
    const text = response.text || "";

    let meeting = await Meeting.findOne({ meetingCode });
    if (!meeting) {
      meeting = new Meeting({ meetingCode });
    }
    meeting.recap_markdown = text;
    meeting.transcript = transcript;
    meeting.recap_generated_at = new Date();
    await meeting.save();

    return res.status(httpStatus.OK).json({ recap: text });
  } catch (e) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: `Failed to summarize: ${e.message || e}` });
  }
};

export { summarizeMeeting };
