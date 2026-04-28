import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'nail_bookings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('id_ext')
      table.string('customer');
      table.string('phone');
      table.string('service');
      table.string('set');
      table.string('note', 255);
      table.timestamp('order_at');
      table.integer('status').nullable().defaultTo(2) // .default(true)

      table.timestamp('created_at');
      table.timestamp('updated_at');
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}