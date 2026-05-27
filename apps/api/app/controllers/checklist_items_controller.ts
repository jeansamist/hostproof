import { ChecklistItemService } from '#services/checklist_item_service'
import ChecklistItemTransformer from '#transformers/checklist_item_transformer'
import { ApiResponse } from '#utils/api_response'
import {
  createChecklistItemValidator,
  updateChecklistItemValidator,
} from '#validators/checklist_item'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'

@inject()
export default class ChecklistItemsController {
  constructor(private readonly service: ChecklistItemService) {}

  async index({ serialize, response }: HttpContext) {
    const items = await this.service.getItems()
    const serialized = await serialize(ChecklistItemTransformer.transform(items))
    return response.ok(ApiResponse.success(serialized.data, 'Checklist items retrieved successfully'))
  }

  async store({ request, serialize, response }: HttpContext) {
    const { label } = await request.validateUsing(createChecklistItemValidator)
    const item = await this.service.createItem(label)
    const serialized = await serialize(ChecklistItemTransformer.transform(item))
    return response.ok(ApiResponse.success(serialized.data, 'Checklist item created successfully'))
  }

  async update({ params, request, serialize, response }: HttpContext) {
    const payload = await request.validateUsing(updateChecklistItemValidator)
    const item = await this.service.updateItem(Number(params.id), payload)
    const serialized = await serialize(ChecklistItemTransformer.transform(item))
    return response.ok(ApiResponse.success(serialized.data, 'Checklist item updated successfully'))
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.deleteItem(Number(params.id))
    return response.ok(ApiResponse.success(null, 'Checklist item deleted successfully'))
  }
}
