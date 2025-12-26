import { httpRouter } from 'convex/server'
import { Webhook } from 'svix'
import { httpAction } from './_generated/server'
import { internal } from './_generated/api'

const http = httpRouter()

/**
 * Clerk Webhook Handler
 *
 * This endpoint receives webhook events from Clerk.
 * On `user.created` events, it links the new Clerk user to an existing
 * placeholder employee record (the "Invite & Claim" pattern).
 *
 * Setup required:
 * 1. In Clerk Dashboard > Webhooks, create a webhook pointing to:
 *    https://<your-convex-deployment>.convex.site/clerk-webhook
 * 2. Subscribe to the `user.created` event
 * 3. Copy the Signing Secret and add it to Convex Dashboard as CLERK_WEBHOOK_SECRET
 */
http.route({
  path: '/clerk-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text()
    const headerPayload = request.headers

    try {
      // Extract Svix headers for verification
      const svixId = headerPayload.get('svix-id')
      const svixTimestamp = headerPayload.get('svix-timestamp')
      const svixSignature = headerPayload.get('svix-signature')

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.error('Webhook: Missing svix headers')
        return new Response('Missing svix headers', { status: 400 })
      }

      // Verify the webhook signature
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET
      if (!webhookSecret) {
        console.error('Webhook: CLERK_WEBHOOK_SECRET not configured')
        return new Response('Webhook secret not configured', { status: 500 })
      }

      const wh = new Webhook(webhookSecret)
      const evt = wh.verify(payloadString, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkWebhookEvent

      // Handle the event
      if (evt.type === 'user.created') {
        const { id, email_addresses } = evt.data

        // Clerk sends an array of emails, grab the primary one
        const primaryEmail = email_addresses.find(
          (e) => e.id === evt.data.primary_email_address_id,
        )
        const email =
          primaryEmail?.email_address ?? email_addresses[0]?.email_address

        if (email) {
          console.log(`Webhook: Processing user.created for ${email}`)

          await ctx.runMutation(internal.employees.linkUser, {
            clerkUserId: id,
            email: email,
          })
        } else {
          console.warn(`Webhook: No email found for user ${id}`)
        }
      }

      return new Response('Webhook processed', { status: 200 })
    } catch (err) {
      console.error('Webhook Error:', err)
      return new Response('Webhook verification failed', { status: 400 })
    }
  }),
})

// Type definitions for Clerk webhook events
interface ClerkWebhookEvent {
  type: string
  data: {
    id: string
    primary_email_address_id: string
    email_addresses: Array<{
      id: string
      email_address: string
    }>
  }
}

export default http
