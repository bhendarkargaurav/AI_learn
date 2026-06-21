import dotenv from "dotenv";
import OpenAI from "openai";
import readlineSync from "readline-sync";// take i from terminal
// import { MemoryClient } from "mem0ai";
import { Memory } from "mem0ai/oss";
dotenv.config();

/**
 * OpenAI Client
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Mem0 Configuration
 */
const memoryConfig = {
  version: "v1.1",

  embedder: {
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_API_KEY,
      model: "text-embedding-3-small",
    },
  },

  llm: {
    provider: "openai",
    config: {
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4.1-mini",
    },
  },

  vectorStore: {
    provider: "qdrant",
    config: {
      host: "localhost",
      port: 6333,
      collectionName: "mem0",
    },
  },
};

/**
 * Initialize Memory
 */
const memory = await Memory.fromConfig(memoryConfig);

const USER_ID = "gauravbhe";

console.log("AI Assistant Started...");
console.log("Type 'exit' to stop.\n");

while (true) {
  const userQuery = readlineSync.question("> ");

  if (userQuery.toLowerCase() === "exit") {
    break;
  }

  try {
    /**
     * Search relevant memories
     */
    const searchResults = await memory.search(userQuery, {
      user_id: USER_ID,
      limit: 5,
    });

    const memories = searchResults.map(
      (mem) => `ID: ${mem.id}\nMemory: ${mem.memory}`
    );

    console.log("\nRetrieved Memories:");
    console.log(memories);

    /**
     * Build System Prompt
     */
    const SYSTEM_PROMPT = `
You are a helpful AI assistant.

Relevant memories about the user:

${memories.join("\n\n")}
`;

    /**
     * Generate Response
     */
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userQuery,
        },
      ], 
    });

    const aiResponse = response.choices[0].message.content;

    console.log("\nAI:");
    console.log(aiResponse);

    /**
     * Save Conversation to Memory
     */
    await memory.add(
      [
        {
          role: "user",
          content: userQuery,
        },
        {
          role: "assistant",
          content: aiResponse,
        },
      ],
      {
        user_id: USER_ID,
      }
    );

    console.log("\nMemory Saved\n");
  } catch (error) {
    console.error(error);
  }
}