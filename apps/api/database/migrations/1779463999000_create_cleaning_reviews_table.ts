import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cleaning_reviews'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table
        .integer('assigned_employee_id')
        .unsigned()
        .references('id')
        .inTable('employees')
        .onDelete('CASCADE')
      table
        .integer('reservation_id')
        .unsigned()
        .references('id')
        .inTable('reservations')
        .onDelete('CASCADE')
      table.text('additionnal_infos').nullable()
      table.enum('status', ['Created', 'AI Analizing', 'Analized', 'Done', 'Failed']).notNullable()
      table.json('ai_output').nullable()
      table.string('local_video_path').nullable()
      table.string('uri').nullable()
      table.string('mime_type').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
