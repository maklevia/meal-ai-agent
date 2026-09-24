import {createOpenAI} from '@ai-sdk/openai'
import { env } from 'src/config/env'

const llmapi = createOpenAI({
    baseURL: "https://api.llmapi.ai/v1",
    apiKey: env.LLM_API_KEY,
})

export const agentConfig = {
    model: llmapi.chat(env.AGENT_MODEL),
    maxSteps: env.AGENT_MAX_STEPS,
} as const
