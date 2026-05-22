import { createServerFn } from '@tanstack/react-start'
import { verifyAccessToken } from '@/server/lib/auth-context'
import { metaPublishService } from './meta-publish-services'
import { publishNowInputSchema } from './meta-publish-schema'

export const publishContentNow = createServerFn({ method: 'POST' })
  .inputValidator(publishNowInputSchema)
  .handler(async ({ data }) => {
    const user = await verifyAccessToken(data.accessToken)
    return await metaPublishService.publishNow(user.id, data)
  })
