import { DateTime } from 'luxon'
import { BaseModel, column, computed } from '@adonisjs/lucid/orm'
import { changeStatus } from '#helpers/index'

export default class Service extends BaseModel {
  public static table = 'nail_services'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare price: string

  @column()
  declare desc: string

  @column()
  declare type: string

  @column()
  declare duration: string

  @column()
  declare typeName: string

  @column()
  declare status: number

  @computed()
  public get statusText() {
    return changeStatus(this.status as number) || 'Unknown'
  }

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}