import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph"

// create graph
const graph_builder = new StateGraph(MessagesAnnotation);

// defining node/fun
function chatbot(state) {
    //  console.log("\n===== CHATBOT NODE =====");
    console.log("\n\nInside chatbot node", state)
    return {
        messages: ["hii, this is a message from chatbot Node"],
    }
}

// def second node
function samplenode(state) {
     console.log("\n\nInside samplenode", state)
    return {
        messages: ["Hii, this is the message from sampleNode"],
    }
}


//add node
graph_builder.addNode("chatbot", chatbot)  //("name", code)
graph_builder.addNode("samplenode", samplenode)


//define edge
graph_builder.addEdge(START, "chatbot")
graph_builder.addEdge("chatbot", "samplenode")
graph_builder.addEdge("samplenode", END)


// console.log(graph_builder);

//comple the graph
const graph = graph_builder.compile();

// run graph
const updates_state = await graph.invoke({
    messages: ["Hii, My name is Gaurav Bhendarkar"],
})
console.log("\nupdated state", updates_state)


//state = {message: ["Hey there"]}
// node runs: chatbot(state: [Hey there])  -> ["hii, this is a message from chatbot"]
// staet = {mesages: ["Hey There", "hii, this is a message from chatbot"]}   -> here both messages append bec of Anotation says

//edge
// (START) -> chatbot -> samplenode -> (END)





// from typing_extensions import TypedDict
// from typing import Annotated
// from BaseLangGraphError.graph.message import add_messages
// from BaseLangGraphError.graph import StateGraph

// class State(TypedDict) ;
// messages: Annotated[List, add_messages]

// defining node/fun
// const chatbot(state: State)
// return {"messages": ["hii this is a message from chatbot Node"]}


graph_builder.addEdge

// graph_builder = StateGraph(State)