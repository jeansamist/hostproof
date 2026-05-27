import ChecklistItemRepository from '#repositories/checklist_item_repository'
import { httpError } from '#utils/http_error'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'

@inject()
export class ChecklistItemService {
  constructor(
    private readonly repository: ChecklistItemRepository,
    private readonly ctx: HttpContext
  ) {}

  private get userId() {
    return this.ctx.auth.user!.id
  }

  async getItems() {
    return this.repository.findAllByUserId(this.userId)
  }

  async createItem(label: string) {
    const count = await this.repository.countByUserId(this.userId)
    return this.repository.create({ userId: this.userId, label, position: count })
  }

  async updateItem(id: number, data: { label?: string; position?: number }) {
    const item = await this.repository.findById(id)
    if (item.userId !== this.userId) throw httpError(403, 'Forbidden')
    return this.repository.update(item, data)
  }

  async deleteItem(id: number) {
    const item = await this.repository.findById(id)
    if (item.userId !== this.userId) throw httpError(403, 'Forbidden')
    await this.repository.delete(item)
  }
}
