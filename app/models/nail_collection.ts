import { DateTime } from 'luxon'
import { BaseModel, column, computed, beforeCreate } from '@adonisjs/lucid/orm'
import { v4 as uuid } from 'uuid'
import { changeStatus } from '#helpers/index'
import slugify from 'slugify';

export default class NailCollection extends BaseModel {
  public static selfAssignPrimaryKey = true
  public static table = 'nail_collections'

  @column({ isPrimary: true })
  declare id: String

  @column()
  declare name: String

  @column()
  declare cate: String

  @column()
  declare cate_name: String

  @column()
  declare tag: String

  @column()
  declare style: String

  @column()
  declare occasion: String

  @column()
  declare color: String

  @column()
  declare desc: String

  @column()
  declare img: String

  @column()
  declare status: Number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  public get statusText() {
    return changeStatus(this.status as number) || 'Unknown'
  }

  @beforeCreate()
  public static assignBeforeCreate(item: NailCollection) {
    if (!item.id) item.id = uuid();
    item.tag = slugify(item.name.toLowerCase().replace(/\s+/g, '-'), {
      lower: true,      // Chuyển thành chữ thường
      strict: true,     // Loại bỏ các ký tự đặc biệt
      locale: 'vi'      // Hỗ trợ tiếng Việt
    });
  }
}