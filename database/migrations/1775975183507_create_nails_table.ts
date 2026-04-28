import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'nail_nails'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // table.increments('id')
      table.uuid('id').primary()
      table.string('name')
      table.uuid('cate')
      table.uuid('collection')
      table.string('img', 255).nullable()
      table.integer('status').nullable() // .default(true)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
