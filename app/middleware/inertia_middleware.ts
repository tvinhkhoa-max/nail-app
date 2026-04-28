import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import router from '@adonisjs/core/services/router'

export default class InertiaMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    /**
     * Middleware logic goes here (before the next call)
     */

    ctx.inertia.share({
      // Lấy các tin nhắn flash từ session
      flash: () => {
        return ctx.session?.flashMessages.all() || {}
      },

      ziggy: () => {
        const routesJSON = router.toJSON()
        const formattedRoutes: any = {}

        routesJSON.root.forEach((route) => {
          if (route.name) {
            formattedRoutes[route.name] = {
              uri: route.pattern.startsWith('/') ? route.pattern.substring(1) : route.pattern,
              methods: route.methods,
            }
          }
        })

        return {
          url: ctx.request.completeUrl().replace(ctx.request.url(), ''), // Lấy http://localhost:3333
          routes: formattedRoutes,
          location: ctx.request.url(),
          defaults: {},
        }
      },

      PATH:  {
        URL_STATIC_UPLOAD: (process.env.NODE_ENV && process.env.NODE_ENV != 'development' ? process.env.SUPABASE_URL_STATIC_UPLOAD : process.env.LOCAL_URL_STATIC_UPLOAD),
      }

      // Nếu bạn có thông tin user, cũng share ở đây luôn
      // auth: () => ({ user: ctx.auth?.user })
    })

    return await next()
  }
}