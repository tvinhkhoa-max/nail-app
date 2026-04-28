import { DateTime } from 'luxon'
import { BaseModel, column, computed, beforeCreate, belongsTo  } from '@adonisjs/lucid/orm' // , beforeSave
// import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { v4 as uuid } from 'uuid'
import { changeStatus } from '#helpers/index'

// import NailCollection from '#models/nail_collection'
// import NailCate from '#models/nail_cate'

export default class Nail extends BaseModel {
  public static selfAssignPrimaryKey = true
  public static table = 'nail_nails'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare collection: string

  @column()
  declare collection_name: string

  @column()
  declare cate: string

  @column()
  declare cate_name: string

  @column()
  declare img: string

  @column()
  declare status: Number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // @belongsTo(() => NailCollection)
  // declare collection: BelongsTo<typeof NailCollection>

  // @belongsTo(() => NailCate)
  // declare cate: BelongsTo<typeof NailCate>

  @computed()
  public get statusText() {
    return changeStatus(this.status as number) || 'Unknown'
  }

  @beforeCreate()
  public static assignUuid(nail: Nail) {
    nail.id = uuid();
  }
}