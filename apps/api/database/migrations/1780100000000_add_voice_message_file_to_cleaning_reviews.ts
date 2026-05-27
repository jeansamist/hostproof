import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'cleaning_reviews'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('voice_message_file').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('voice_message_file')
    })
  }
}
