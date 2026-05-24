import env from '#start/env'
import { GoogleGenAI } from '@google/genai'
import { HumanMessage } from '@langchain/core/messages'
import { ChatGoogle } from '@langchain/google'
import path from 'node:path'
import z from 'zod'

export class AiService {
  ai = new GoogleGenAI({
    apiKey: env.get('GOOGLE_API_KEY'),
  })
  model = new ChatGoogle({
    model: 'gemini-2.5-flash',
    apiKey: env.get('GOOGLE_API_KEY'),
  })
  schema = z.object({
    summary: z.string().describe('A concise summary of what happens in the video'),
    detectedObjects: z.array(z.string()).describe('List of prominent objects visible'),
    dominantMood: z.string().describe('The overarching mood or atmosphere of the footage'),
  })
  PROMPT: string =
    'Analyze the video and provide insights strictly following the defined schema. Focus on accuracy and relevance in your response.'
  structuredModel = this.model.withStructuredOutput(this.schema)

  async uploadMedia(localVideoPath: string) {
    const VIDEO_PATH = path.join(process.cwd(), localVideoPath)
    const uploadedFile = await this.ai.files.upload({
      file: VIDEO_PATH,
      config: { mimeType: 'video/mp4' },
    })
    return uploadedFile
  }

  async analyzeVideo(localVideoPath: string) {
    const uploadedFile = await this.uploadMedia(localVideoPath)
    return await this.structuredModel.invoke([
      new HumanMessage({
        content: [
          {
            type: 'text',
            text: this.PROMPT,
          },
          {
            type: 'media',
            fileUri: uploadedFile.uri, // Using cached structural mapping keys
            mimeType: uploadedFile.mimeType,
          },
        ],
      }),
    ])
  }
}
