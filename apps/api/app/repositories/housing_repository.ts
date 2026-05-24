import { type HousingSchema } from '#database/schema'
import Housing from '#models/housing'
import { type ModelProps } from '#utils/generics'
import { type TransactionClientContract } from '@adonisjs/lucid/types/database'
export default class HousingRepository {
  private model = Housing
  get getModel(): typeof Housing {
    return this.model
  }

  async create(data: ModelProps<HousingSchema>, trx?: TransactionClientContract): Promise<Housing> {
    const housing = new this.model()
    if (trx) {
      housing.useTransaction(trx)
    }
    housing.fill(data)
    await housing.save()
    return housing
  }

  async update(
    housing: Housing,
    data: Partial<ModelProps<HousingSchema>>,
    trx?: TransactionClientContract
  ): Promise<Housing> {
    if (trx) {
      housing.useTransaction(trx)
    }
    return housing.merge(data).save()
  }

  async delete(housing: Housing, trx?: TransactionClientContract): Promise<void> {
    if (trx) {
      housing.useTransaction(trx)
    }
    await housing.delete()
  }

  async deleteById(id: number): Promise<void> {
    await this.model.query().where('id', id).delete()
  }

  async findById(id: number): Promise<Housing> {
    return this.model.findOrFail(id)
  }

  async findByNameForUser(userId: number, name: string): Promise<Housing | null> {
    return this.model.query().where('user_id', userId).where('name', name).first()
  }

  async createMany(data: ModelProps<HousingSchema>[]): Promise<Housing[]> {
    const housings = await this.model.createMany(data)
    return housings
  }

  async updateMany(
    data: Array<{ id: number; data: Partial<ModelProps<HousingSchema>> }>
  ): Promise<Housing[]> {
    const housings: Housing[] = []
    for (const item of data) {
      const housing = await this.findById(item.id)
      housings.push(await this.update(housing, item.data))
    }
    return housings
  }

  async findAllByUserId(userId: number): Promise<Housing[]> {
    return this.model.query().where('user_id', userId)
  }

  async paginateByUserId(userId: number, page: number, perPage: number) {
    return this.model.query().where('user_id', userId).paginate(page, perPage)
  }
}
