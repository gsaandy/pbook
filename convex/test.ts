import { query } from './_generated/server'

export const ping = query({
  args: {},
  handler: () => {
    return {
      status: 'connected',
      timestamp: Date.now(),
      message: 'Convex is working!',
    }
  },
})
