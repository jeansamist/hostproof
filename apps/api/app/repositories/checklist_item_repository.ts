import { type ChecklistItemSchema } from '#database/schema'
import ChecklistItem from '#models/checklist_item'
import { type ModelProps } from '#utils/generics'

export default class ChecklistItemRepository {
  private model = ChecklistItem

  async findAllByUserId(userId: number): Promise<ChecklistItem[]> {
    return this.model.query().where('user_id', userId).orderBy('position', 'asc')
  }

  async findById(id: number): Promise<ChecklistItem> {
    return this.model.findOrFail(id)
  }

  async create(data: ModelProps<ChecklistItemSchema> & { userId: number }): Promise<ChecklistItem> {
    return this.model.create(data as any)
  }

  async update(
    item: ChecklistItem,
    data: Partial<ModelProps<ChecklistItemSchema>>
  ): Promise<ChecklistItem> {
    return item.merge(data as any).save()
  }

  async delete(item: ChecklistItem): Promise<void> {
    await item.delete()
  }

  async countByUserId(userId: number): Promise<number> {
    const result = await this.model.query().where('user_id', userId).count('* as total')
    return Number((result[0] as any).$extras.total ?? 0)
  }
}
