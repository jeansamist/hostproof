import { type EmployeeSchema } from '#database/schema'
import Employee from '#models/employee'
import { type ModelProps } from '#utils/generics'
import { type TransactionClientContract } from '@adonisjs/lucid/types/database'

export default class EmployeeRepository {
  private model = Employee

  get getModel(): typeof Employee {
    return this.model
  }

  async create(
    data: ModelProps<EmployeeSchema>,
    trx?: TransactionClientContract
  ): Promise<Employee> {
    const employee = new this.model()
    if (trx) {
      employee.useTransaction(trx)
    }
    employee.fill(data)
    await employee.save()
    return employee
  }

  async update(
    employee: Employee,
    data: Partial<ModelProps<EmployeeSchema>>,
    trx?: TransactionClientContract
  ): Promise<Employee> {
    if (trx) {
      employee.useTransaction(trx)
    }
    return employee.merge(data).save()
  }

  async delete(employee: Employee, trx?: TransactionClientContract): Promise<void> {
    if (trx) {
      employee.useTransaction(trx)
    }
    await employee.delete()
  }

  async deleteById(id: number): Promise<void> {
    await this.model.query().where('id', id).delete()
  }

  async findById(id: number): Promise<Employee> {
    return this.model.findOrFail(id)
  }

  async findByFullNameForUser(userId: number, fullName: string): Promise<Employee | null> {
    return this.model.query().where('user_id', userId).where('full_name', fullName).first()
  }

  async createMany(data: ModelProps<EmployeeSchema>[]): Promise<Employee[]> {
    const employees: Employee[] = []
    for (const item of data) {
      employees.push(await this.create(item))
    }
    return employees
  }

  async findAllByUserId(userId: number): Promise<Employee[]> {
    return this.model.query().where('user_id', userId)
  }

  async paginateByUserId(userId: number, page: number, perPage: number) {
    return this.model.query().where('user_id', userId).paginate(page, perPage)
  }
}
