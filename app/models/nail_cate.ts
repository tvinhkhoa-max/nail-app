import { DateTime } from 'luxon'
import { BaseModel, column, computed, beforeCreate } from '@adonisjs/lucid/orm'
import { changeStatus } from '#helpers/index'
import { v4 as uuid } from 'uuid'
import slugify from 'slugify';

export default class NailCate extends BaseModel {
  public static selfAssignPrimaryKey = true
  public static table = 'nail_cates'

  @column({ isPrimary: true })
  declare id: String

  @column()
  declare name: String

  @column()
  declare hot: Boolean

  @column()
  declare tag: String

  @column()
  declare price: Number

  @column()
  declare desc: String

  @column()
  declare status: Number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @computed()
  public get statusText() {
    // const statusMap: Record<number, string> = {
    //   0: 'Draft',
    //   1: 'Published',
    //   2: 'Archived',
    // }
    return changeStatus(this.status as number) || 'Unknown'
  }

  @beforeCreate()
  public static assignBeforeCreate(item: NailCate) {
    // item.hot = Number(item.hot)
    item.status = Number(item.status)

    if (!item.id) item.id = uuid();
    if (!item.tag) {
      item.tag = slugify(item.name.toLowerCase().replace(/\s+/g, '-'), {
        lower: true,      // Chuyển thành chữ thường
        strict: true,     // Loại bỏ các ký tự đặc biệt
        locale: 'vi'      // Hỗ trợ tiếng Việt
      });
    }
  }
}