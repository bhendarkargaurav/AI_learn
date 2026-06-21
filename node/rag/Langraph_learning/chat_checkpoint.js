import dotenv from 'dotenv'
import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph"
import { ChatOpenAI } from "@langchain/openai"
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb"
import { MongoClient } from "mongodb";
import { Threads } from 'openai/resources/beta/chatkit/threads.mjs';


dotenv.config();

const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
})

// create graph
const graph_builder = new StateGraph(MessagesAnnotation);

// defining node/fun
async function chatbot(state) {
    //  console.log("\n===== CHATBOT NODE =====");
    console.log("\n\nInside chatbot node", state);

    const response = await llm.invoke(state.messages);
    return {
        messages: [response],
    }
}




//add node
graph_builder.addNode("chatbot", chatbot)  //("name", code)


//define edge
graph_builder.addEdge(START, "chatbot")
graph_builder.addEdge("chatbot", END)



//MongoDB Checkpointer
const DB_URI = "mongodb://localhost:27017";

const client = new MongoClient(DB_URI);

await client.connect();

const checkpointer = new MongoDBSaver({
  client,
  dbName: "langgraph",
});

//compile graph with checkpointer
const graph = graph_builder.compile({
    checkpointer,
})

//thread configuration
const config = {
    configurable: {
        Thread_id: "gaurav",
    }
};

//first runconst 
const result = await graph.invoke(
    {
        messages: [
            {
                role: "user",
                content: "Hey, my name is Gaurav Bhendarkar",
            },
        ],
    },
    config
);

console.log("\nResult :");
console.log(result);


//StateGraph is the main class used to create a graph/workflow.
// MessagesAnnotation This defines the structure of your state. append the response
//START is a special built-in node.  //startoing node
//END is a special built-in node.    //ending node

//state = {message: ["Hey there"]}
// node runs: chatbot(state: [Hey there])  -> ["hii, this is a message from chatbot"]
// staet = {mesages: ["Hey There", "hii, this is a message from chatbot"]}   -> here both messages append bec of Anotation says

//edge
// (START) -> chatbot -> (END)





// from typing_extensions import TypedDict
// from typing import Annotated
// from BaseLangGraphError.graph.message import add_messages
// from BaseLangGraphError.graph import StateGraph

// class State(TypedDict) ;
// messages: Annotated[List, add_messages]

// defining node/fun
// const chatbot(state: State)
// return {"messages": ["hii this is a message from chatbot Node"]}


// graph_builder.addEdge

// graph_builder = StateGraph(State)