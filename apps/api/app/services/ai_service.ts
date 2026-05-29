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
    summary: z
      .string()
      .describe(
        "Un resume concis du contenu de la vidéo, donnant un avis genéral sur l'etat actuel logement"
      ),
    detectedObjects: z
      .array(z.string())
      .describe(
        'Une liste d\'objets ou de problèmes spécifiques détectés dans la vidéo (ex: "fuite d\'eau", "moisissure", "fissure")'
      ),
    positiveAspects: z
      .array(z.string())
      .describe(
        'Une liste d\'aspects positifs ou de points forts du logement détectés dans la vidéo (ex: "bonne luminosité", "espace suffisant", "propreté générale")'
      ),
    negativeAspects: z
      .array(z.string())
      .describe(
        "Une liste d'aspects négatifs ou de points faibles du logement détectés dans la vidéo (ex: 'fuite d'eau', 'moisissure', 'fissure')"
      ),
    score: z
      .number()
      .describe(
        "Un score global de l'état du logement sur une échelle de 1 à 10, où 10 représente un excellent état et 1 un état très mauvais"
      ),
    toDo: z
      .array(z.string())
      .describe(
        'Une liste de recommandations ou d\'actions à entreprendre pour améliorer l\'état du logement pour s\'arranger avec la reservation, basée sur les problèmes détectés (ex: "réparer la fuite d\'eau", "nettoyer la moisissure", "sceller les fissures")'
      ),
    missingProducts: z
      .array(z.string())
      .optional()
      .describe(
        "Une liste de produits manquants ou à acheter pour améliorer l'état du logement pour s'arranger avec la reservation, basée sur les problèmes détectés"
      ),
  })
  PROMPT: string =
    "Tu es un expert en évaluation de l'état d'un logement à partir de vidéos. Un agent de netoyage vien juste de faire le menage et a fait cette video. Analyse attentivement le contenu de la vidéo et fournis une évaluation détaillée de la conformité du logement avec la reservations et ses details, en mettant en évidence les problèmes détectés, les aspects positifs, et en attribuant un score de conformite global sur 10. Propose également des recommandations concrètes pour arriver a un etat de conformite execelent du logement, ainsi que les produits nécessaires pour effectuer ces améliorations si applicable. On veut pouvoir reperer es points d oublis dans le menage."

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

  private async invokeWithRetry(messages: HumanMessage[], maxRetries = 4, baseDelayMs = 5_000) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.structuredModel.invoke(messages)
      } catch (error: any) {
        const isOverloaded =
          error?.statusCode === 503 || error?.data?.error?.status === 'UNAVAILABLE'
        if (!isOverloaded || attempt === maxRetries) throw error
        const delay = baseDelayMs * Math.pow(2, attempt)
        this.logger.warn(
          `[AiService]: Google AI overloaded (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms…`
        )
        await new Promise<void>((r) => setTimeout(r, delay))
      }
    }
  }

  async analyzeVideo(
    file: Awaited<ReturnType<AiService['uploadFileToGoogleAi']>>,
    CUSTOM_PROMPT?: string
  ) {
    this.logger.info(`[AiService]: Analyzing video content...`)
    const PROMPT = this.PROMPT + (CUSTOM_PROMPT ? `\n\n${CUSTOM_PROMPT}` : '')
    console.log(PROMPT)

    return await this.invokeWithRetry([
      new HumanMessage({
        content: [
          {
            type: 'text',
            text: PROMPT,
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
  async uploadAndAnalyzeVideo(localVideoPath: string, uri?: string, CUSTOM_PROMPT?: string) {
    const uploadedFile = await this.uploadFileToGoogleAi(localVideoPath, uri)

    return this.analyzeVideo(uploadedFile, CUSTOM_PROMPT).then((response) => {
      this.logger.info(`[AiService]: Video analysis completed.`)
      transmit.broadcast(`cleaning-reviews/${uri}`, { message: 'VIDEO_ANALYZED_BY_GOOGLE_AI' })
      return response
    })
  }
}
