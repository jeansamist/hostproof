import { BaseTransformer } from '@adonisjs/core/transformers'
import ChecklistItem from '#models/checklist_item'

export default class ChecklistItemTransformer extends BaseTransformer<ChecklistItem> {
  toObject() {
    return this.pick(this.resource, ['id', 'label', 'position', 'userId', 'createdAt', 'updatedAt'])
  }
}
