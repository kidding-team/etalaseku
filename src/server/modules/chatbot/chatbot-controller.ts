import { createServerFn } from '@tanstack/react-start'
import { chatCatalogSchema } from './chatbot-schema'
import { chatbotService } from './chatbot-services'

export const chatCatalog = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => chatCatalogSchema.parse(data))
  .handler(async ({ data }) => {
    return chatbotService.chatCatalog(data)
  })
