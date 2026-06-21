// with conditional edges

import dotenv from 'dotenv'
import { StateGraph, MessagesAnnotation, START, END } from '@langchain/langgraph'
import { ChatOpenAI } from '@langchain/openai'

dotenv.config();

const llm = new ChatOpenAI({
    model: "gpt-4o-mini"
})

//create graph
const graph_builder = new StateGraph(MessagesAnnotation);

//chatbot node
async function chatbot(state) {
    console.log("\n===== CHATBOT NODE =====");
  console.log(state.messages);

  const response = await llm.invoke(state.messages);

  console.log("\nLLM Response:");
  console.log(response.content);

  return {
    messages: [response],
  }
}

//review Node response
function review(state) {
     console.log("\n===== REVIEW NODE =====");

    const lastMessage =
    state.messages[state.messages.length - 1];

    console.log("Reviewing:");
  console.log(lastMessage.content);
  
  return{};

}


// conditonal function

function routeDecision(state) {
    const lastMessage = state.messages[state.messages.length - 1];

    const content = lastMessage.content.toLowerCase();

    console.log("\n===== ROUTER =====");

      // Demo condition
  if (
    content.includes("don't know") ||
    content.includes("not sure")
  ) {
    console.log("Decision: RETRY");
    return "retry";
  }

  console.log("Decision: APPROVED");
  return "approved";

}

//add Nodes
graph_builder.addNode("chatbot", chatbot);
graph_builder.addNode("review", review);

//edge
graph_builder.addEdge(START, 'chatbot');

graph_builder.addEdge('chatbot', 'review');

//conditional edges
graph_builder.addConditionalEdges(
    "review", 
    routeDecision,
    {
        retry: "chatbot",
        approved: END,
    }
);

//compile graph
const graph = graph_builder.compile();

//run graph
const updates_state= await graph.invoke({
    messages: [
    {
      role: "user",
      content: "my name is gaurav",
    },
  ],
})

console.log("\n===== FINAL STATE =====");
console.log(updated_state.messages);