import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reservations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.timestamp('move_in_date').notNullable()
      table.timestamp('move_out_date').notNullable()
      table.integer('number_of_adult').notNullable()
      table.integer('number_of_child').notNullable()
      table.integer('number_of_baby').notNullable()
      table.text('special_infos').nullable()
      table
        .integer('housing_id')
        .unsigned()
        .references('id')
        .inTable('housings')
        .onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
