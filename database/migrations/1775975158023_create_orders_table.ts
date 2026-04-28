import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'nail_orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('preview_image')
      table.string('customer_name', 50)
      table.string('phone', 12)
      table.integer('nail_id')
      table.integer('status').nullable().defaultTo(1) // .default(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}