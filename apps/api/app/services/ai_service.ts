import env from '#start/env'
import { inject } from '@adonisjs/core'
import { Logger } from '@adonisjs/core/logger'
import transmit from '@adonisjs/transmit/services/main'
import { GoogleGenAI } from '@google/genai'
import { HumanMessage } from '@langchain/core/messages'
import { ChatGoogle } from '@langchain/google'
import path from 'node:path'
import z from 'zod'

@inject()
export class AiService {
  constructor(protected readonly logger: Logger) {}
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

  async uploadFileToGoogleAi(localVideoPath: string, uri?: string) {
    const VIDEO_PATH = path.join(process.cwd(), 'public', localVideoPath)
    this.logger.info(`[AiService]: Uploading video file to Google AI for analysis...`)
    const uploadedFile = await this.ai.files.upload({
      file: VIDEO_PATH,
      config: { mimeType: 'video/mp4' },
    })

    if (!uploadedFile.name) {
      throw new Error('Google Files API: upload returned no file name')
    }
    transmit.broadcast(`cleaning-reviews/${uri}`, { message: 'VIDEO_UPLOADED_TO_GOOGLE_AI' })

    const activeFile = await this.waitForFileActiveByGoogleAi(uploadedFile.name, uri)
    return activeFile
  }

  async waitForFileActiveByGoogleAi(
    fileName: string,
    uri?: string,
    maxWaitMs = 120_000,
    pollIntervalMs = 3_000
  ) {
    this.logger.info(`[AiService]: Waiting for file to become active...`)
    const deadline = Date.now() + maxWaitMs
    while (Date.now() < deadline) {
      const file = await this.ai.files.get({ name: fileName })
      if (file.state === 'ACTIVE') {
        this.logger.info(`[AiService]: File ${fileName} is now active.`)
        transmit.broadcast(`cleaning-reviews/${uri}`, { message: 'VIDEO_PROCESSED_BY_GOOGLE_AI' })
        return file
      }
      if (file.state === 'FAILED') {
        throw new Error(`Google Files API: file ${fileName} processing failed`)
      }
      await new Promise<void>((r) => setTimeout(r, pollIntervalMs))
    }
    throw new Error(
      `Google Files API: file ${fileName} did not become ACTIVE within ${maxWaitMs}ms`
    )
  }

  async analyzeVideo(file: Awaited<ReturnType<AiService['uploadFileToGoogleAi']>>) {
    this.logger.info(`[AiService]: Analyzing video content...`)
    return await this.structuredModel.invoke([
      new HumanMessage({
        content: [
          {
            type: 'text',
            text: this.PROMPT,
          },
          {
            type: 'media',
            fileUri: file.uri,
            mimeType: file.mimeType,
          },
        ],
      }),
    ])
  }
  async uploadAndAnalyzeVideo(localVideoPath: string, uri?: string) {
    const uploadedFile = await this.uploadFileToGoogleAi(localVideoPath)

    return this.analyzeVideo(uploadedFile).then((response) => {
      this.logger.info(`[AiService]: Video analysis completed.`)
      transmit.broadcast(`cleaning-reviews/${uri}`, { message: 'VIDEO_ANALYZED_BY_GOOGLE_AI' })
      return response
    })
  }
}
