import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'nail_customers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name', 50)
      table.string('sex', 5).nullable()
      table.string('phone', 20)
      table.string('email', 20).nullable()
      table.string('password', 50).nullable()
      table.string('avatar', 255).nullable()
      table.integer('status').nullable().defaultTo(1)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}