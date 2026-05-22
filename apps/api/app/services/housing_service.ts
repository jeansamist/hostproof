import { HousingSchema } from '#database/schema'
import HousingRepository from '#repositories/housing_repository'
import { httpError } from '#utils/http_error'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

type CreateHousingPayload = {
  name: string
  address: string
  type: 'apartment' | 'house' | 'villa'
  capacity: number
}

type UpdateHousingPayload = Partial<CreateHousingPayload>

@inject()
export class HousingService {
  constructor(
    private readonly repository: HousingRepository,
    private readonly ctx: HttpContext
  ) {}

  private get userId() {
    return this.ctx.auth.user!.id
  }

  checkOwnership(housing: HousingSchema) {
    if (housing.userId !== this.userId) {
      throw httpError(403, 'You are not allowed to access this housing')
    }
  }

  async getPaginatedUserHousings(page: number, perPage: number) {
    return this.repository.paginateByUserId(this.userId, page, perPage)
  }

  async createHousing(data: CreateHousingPayload) {
    const existingHousing = await this.repository.findByNameForUser(this.userId, data.name)
    if (existingHousing) {
      throw httpError(400, 'Housing with the same name already exists for this user.')
    }
    return this.repository.create({ ...data, userId: this.userId })
  }

  async updateHousing(id: number, data: UpdateHousingPayload) {
    const housing = await this.repository.findById(id)
    this.checkOwnership(housing)
    if (data.name) {
      const existingHousing = await this.repository.findByNameForUser(this.userId, data.name)
      if (existingHousing && existingHousing.id !== id) {
        throw httpError(400, 'Housing with the same name already exists for this user.')
      }
    }
    return this.repository.update(housing, data)
  }

  async deleteHousing(id: number) {
    const housing = await this.repository.findById(id)
    this.checkOwnership(housing)
    return this.repository.delete(housing)
  }

  async getHousingsForUser() {
    return this.repository.findAllByUserId(this.userId)
  }

  async getHousingById(id: number) {
    const housing = await this.repository.findById(id)
    this.checkOwnership(housing)
    return housing
  }
}
