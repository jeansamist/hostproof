import { type CleaningReviewSchema } from '#database/schema'
import CleaningReview from '#models/cleaning_review'
import { type ModelProps } from '#utils/generics'
import { type TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class CleaningReviewRepository {
  private model = CleaningReview

  get getModel(): typeof CleaningReview {
    return this.model
  }

  private async loadRelations(cleaningReview: CleaningReview) {
    await cleaningReview.load('assignedEmployee')
    await cleaningReview.load('reservation', (query) => query.preload('housing'))
    return cleaningReview
  }

  async create(
    data: ModelProps<CleaningReviewSchema>,
    trx?: TransactionClientContract
  ): Promise<CleaningReview> {
    const cleaningReview = new this.model()
    if (trx) {
      cleaningReview.useTransaction(trx)
    }
    cleaningReview.fill(data)
    await cleaningReview.save()
    return this.loadRelations(cleaningReview)
  }

  async update(
    cleaningReview: CleaningReview,
    data: Partial<ModelProps<CleaningReviewSchema>>,
    trx?: TransactionClientContract
  ): Promise<CleaningReview> {
    if (trx) {
      cleaningReview.useTransaction(trx)
    }
    await cleaningReview.merge(data).save()
    return this.loadRelations(cleaningReview)
  }

  async delete(cleaningReview: CleaningReview, trx?: TransactionClientContract): Promise<void> {
    if (trx) {
      cleaningReview.useTransaction(trx)
    }
    await cleaningReview.delete()
  }

  async deleteById(id: number): Promise<void> {
    await this.model.query().where('id', id).delete()
  }

  async findById(id: number): Promise<CleaningReview> {
    return this.model
      .query()
      .where('id', id)
      .preload('assignedEmployee')
      .preload('reservation', (query) => query.preload('housing'))
      .firstOrFail()
  }

  async createMany(data: ModelProps<CleaningReviewSchema>[]): Promise<CleaningReview[]> {
    const cleaningReviews: CleaningReview[] = []
    for (const item of data) {
      cleaningReviews.push(await this.create(item))
    }
    return cleaningReviews
  }

  async findAllByUserId(userId: number): Promise<CleaningReview[]> {
    return this.model
      .query()
      .whereHas('reservation', (query) => {
        query.whereHas('housing', (housingQuery) => housingQuery.where('user_id', userId))
      })
      .preload('assignedEmployee')
      .preload('reservation')
  }

  async paginateByUserId(userId: number, page: number, perPage: number) {
    return this.model
      .query()
      .whereHas('reservation', (query) => {
        query.whereHas('housing', (housingQuery) => housingQuery.where('user_id', userId))
      })
      .paginate(page, perPage)
  }
}
