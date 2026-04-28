import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'nail_collections'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      // table.increments('id')
      table.uuid('id').primary()
      table.string('name', 50)
      table.uuid('cate').nullable()
      table.string('tag', 50).nullable()
      table.string('style', 50).nullable()
      table.string('occasion', 50).nullable()
      table.string('color', 20).nullable()
      table.string('desc', 255).nullable()
      table.string('img', 255).nullable()
      table.integer('status').nullable().defaultTo(1)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}