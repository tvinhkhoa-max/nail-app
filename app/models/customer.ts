import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Customer extends BaseModel {
  public static table = 'nail_customers'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare sex: string

  @column()
  declare phone: string

  @column()
  declare email: string

  @column()
  declare password: string

  @column()
  declare avatar: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}