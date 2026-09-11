import {streamText} from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { env } from "src/config/env";

const llm = createOpenAICompatible({
    name: "llmapi",
    baseURL: "https://api.llmapi.ai/v1",
    apiKey: env.LLM_API_KEY
});

const {textStream} = await streamText({
    model: llm.chatModel("gpt-4o-mini"),
    system: "You are my friendly assistant",
    prompt: "Write a funny little poem about my boyfriend Pasha Kakasha who farts a lot"
});

console.log(textStream);