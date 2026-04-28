import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: ['http://localhost:3000','http://localhost:3333', 'http://192.168.239.145:3000', '*'],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: false,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
