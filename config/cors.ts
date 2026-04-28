import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: [
    'http://localhost:3000',
    'http://localhost:3333',
    'https://nailsxanh-h2x7.onrender.com',
  ],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: false,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
