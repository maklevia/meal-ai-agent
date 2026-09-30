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
      onStepEnd: (step) => {
        console.log(`\n===== AGENT STEP ${step.stepNumber} =====`);
        console.dir(step, { depth: null });
      },
    });

    for await (const delta of result.textStream) {
        yield {type: "delta", delta};
    }

    const [text, usage] = await Promise.all([
      result.text,
      result.usage,
    ]);

    yield {type: "finish", text, completionTokens: usage.outputTokens ?? 0}

  }
}
