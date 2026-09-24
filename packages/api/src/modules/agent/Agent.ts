import { isStepCount, streamText } from "ai";
import { agentConfig } from "src/modules/agent/agent.config";
import { AGENT_TIMEOUT_MS } from "src/modules/agent/constants";
import { AgentInput, AgentStreamEvent } from "src/modules/agent/typedefs";

export class Agent {
  async *stream(input: AgentInput, abortSignal?: AbortSignal): AsyncGenerator<AgentStreamEvent> {
    const result = streamText({
      model: agentConfig.model,
      instructions: input.systemPrompt,
      messages: input.messages,
      tools: input.tools,
      stopWhen: isStepCount(agentConfig.maxSteps),
      abortSignal,
      timeout: AGENT_TIMEOUT_MS,
    });

    for await (const delta of result.textStream) {
        yield {type: "delta", delta};
    }

    const [text, usage, responseMessages] = await Promise.all([
      result.text,
      result.usage,
      result.responseMessages,
    ]);

    console.dir({ responseMessages }, { depth: null });

    yield {type: "finish", text, completionTokens: usage.outputTokens ?? 0}

  }
}
