import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'nail_cates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // table.increments('id')
      table.uuid('id').primary()
      table.string('name', 100)
      table.boolean('hot').defaultTo(false)
      table.string('tag', 50)
      table.float('price').nullable()
      table.string('desc', 255).nullable()
      table.integer('status').nullable().defaultTo(1) // .default(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}