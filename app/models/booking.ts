import { DateTime } from 'luxon'
import { BaseModel, column, beforeCreate } from '@adonisjs/lucid/orm'
import { v4 as uuid } from 'uuid'

export default class Booking extends BaseModel {
  // public static selfAssignPrimaryKey = true
  public static table = 'nail_bookings'

  @column({ isPrimary: true })
  declare id: Number

  @column()
  declare idExt: String

  @column()
  declare customer: String

  @column()
  declare phone: String

  @column()
  declare service: String

  @column()
  declare set: String

  @column()
  declare note: string

  @column()
  declare orderAt: DateTime

  @column()
  declare status: Boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static assignUuid(booking: Booking) {
    booking.idExt = uuid();
  }
}