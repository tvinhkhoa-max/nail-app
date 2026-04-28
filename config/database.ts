import app from '@adonisjs/core/services/app'
import { defineConfig } from '@adonisjs/lucid'
import env from '#start/env'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION','sqlite'),

  connections: {
    sqlite: {
      client: 'better-sqlite3',
      connection: {
        filename: env.get('DB_SQLITE_DATABASE', app.tmpPath('db.sqlite3'))
      },
      useNullAsDefault: true,
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
      debug: false,
    },

    pg: {
      client: 'pg',
      connection: {
        host: env.get('DB_POSTGRE_HOST', '127.0.0.1') as string,
        port: Number(env.get('DB_POSTGRE_PORT', '5432')),
        user: env.get('DB_POSTGRE_USER', '') as string,
        password: env.get('DB_POSTGRE_PASSWORD', 'C0py@right#8487') as string,
        database: env.get('DB_POSTGRE_NAME', 'lucid') as string,
      },
    },
  },
})

export default dbConfig