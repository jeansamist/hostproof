import { BaseTransformer } from '@adonisjs/core/transformers'
import Employee from '#models/employee'

export default class EmployeeTransformer extends BaseTransformer<Employee> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'fullName',
      'gender',
      'tel',
      'email',
      'avatar',
      'createdAt',
      'updatedAt',
    ])
  }
}
