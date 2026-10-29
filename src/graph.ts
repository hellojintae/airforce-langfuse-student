import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { startActiveObservation } from '@langfuse/tracing';
import { runAgent } from './agent.js';
import type { Input, Result, Variant } from './types.js';

const State = Annotation.Root({
  input: Annotation<Input>(), variant: Annotation<Variant>(), live: Annotation<boolean>(), result: Annotation<Result>(),
});
// Non-operational training example: StateGraph and manual observation boundaries.
const workflow = new StateGraph(State)
  .addNode('validate-input', async state => {
    if (!state.input.caseId || !state.input.tenant || !Array.isArray(state.input.evidence)) throw new Error('INPUT_CONTRACT');
    return {};
  })
  .addNode('execute-agent', async state => ({ result: await runAgent(state.input,state.variant,state.live) }))
  .addNode('prepare-review', async state => ({ result: { ...state.result, events:[...state.result.events,'prepare-review'] } }))
  .addEdge(START,'validate-input').addEdge('validate-input','execute-agent')
  .addEdge('execute-agent','prepare-review').addEdge('prepare-review',END)
  .compile();

export async function runWorkflow(input: Input, variant: Variant, live=false) {
  return startActiveObservation('langgraph-workflow', async span => {
    const state = await workflow.invoke({input,variant,live});
    span.update({input:{caseId:input.caseId},output:state.result,metadata:{framework:'langgraph',synthetic:true}});
    return state.result;
  });
}
