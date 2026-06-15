// phase 2 of rag: user chat with llm for response

import dotenv from 'dotenv'
import readlineSync from 'readline-sync';
import OpenAi, { OpenAI } from 'openai';

import { OpenAIEmbeddings } from '@langchain/openai'
import { QdrantVectorStore } from "@langchain/qdrant";
import { VectorStore } from '@langchain/core/vectorstores';
import { QdrantClient } from "@qdrant/js-client-rest";

dotenv.config();

const openai_client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


//embedding model
const text_embeddings = new OpenAIEmbeddings({  // OpenAIEMbedding locking for the open ai api
    model: 'text-embedding-3-small'
})

//quadrant client
const client = new QdrantClient({
    url: "http://localhost:6333",
});

// connect with existing collection
const vector_db = await QdrantVectorStore.fromExistingCollection(
    text_embeddings,
    {
    client,
    collectionName: "Learning_rag",
});

// take user input
const user_query = readlineSync.question("Ask Something: ");

// relevant chunk from the vector db
const search_results = await vector_db.similaritySearch(
    user_query,
    5 // top 5 result chunk
);
console.log("\nRetrieved Chunks:", search_results.length)

// context : meanse the user query related data that we receive (available data)
const context = search_results
    .map((result) => `
        Page Content: ${result.pageContent}
        Page Number: ${result.metadata?.loc?.pageNumber || "Unknown"}
        Source: ${result.metadata?.source || "Unknown"}

`
    ).join("\n---------------\n");

const SYSTEM_PROMPT = `
    You are a helpfull AI assistant
    
    Answer the user query based on the available 
    context retrieved from a PDF file along with Page Content and Page Number..

    return the context while explaining

    You should only ans the user based on the following context and navigate the
    user to open the right page number to know more.
    answer is like that , user can rean somethin from there 

    Context: ${context}

`;


//Generate answer
const response = await openai_client.chat.completions.create({
    model:"gpt-4o-mini",
    messages:[
        {'role': "system", "content": SYSTEM_PROMPT },
        {'role': "user", "content": user_query }
    ],
});

console.log("\nAnswer:\n");
console.log(response.choices[0].message.content)