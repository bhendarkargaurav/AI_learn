import OpenAI from "openai";
import dotenv from "dotenv";
import readlineSync from "readline-sync";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

dotenv.config();

const execAsync = promisify(exec);

//OpenAI Client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ====================================
// TOOLS
// ====================================

async function createFolder(folderPath) {
  fs.mkdirSync(folderPath, { recursive: true });
  return `Folder created: ${folderPath}`;
}

async function createFile(filePath) {
  fs.writeFileSync(filePath, "");
  return `File created: ${filePath}`;
}

async function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  return `Written to ${filePath}`;
}

async function readFile(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

async function listFiles(dir = ".") {
  const files = [];

  function walk(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);

      if (fs.statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  walk(dir);

  return files.join("\n");
}

async function runCommand(command) {
  try {
    const { stdout, stderr } = await execAsync(command);

    return stdout || stderr;
  } catch (err) {
    return err.message;
  }
}

// ====================================
// TOOL REGISTRY
// ====================================

const TOOL_MAP = {
  createFolder,
  createFile,
  writeFile,
  readFile,
  listFiles,
  runCommand,
};

// ====================================
// TOOL DEFINITIONS
// ====================================

const tools = [
  {
    type: "function",
    function: {
      name: "createFolder",
      description: "Create a new folder",
      parameters: {
        type: "object",
        properties: {
          folderPath: {
            type: "string",
          },
        },
        required: ["folderPath"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "createFile",
      description: "Create a new file",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
          },
        },
        required: ["filePath"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "writeFile",
      description: "Write content into a file",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
          },
          content: {
            type: "string",
          },
        },
        required: ["filePath", "content"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "readFile",
      description: "Read a file",
      parameters: {
        type: "object",
        properties: {
          filePath: {
            type: "string",
          },
        },
        required: ["filePath"],
      },
    },
  },

  {
    type: "function",
    function: {
      name: "listFiles",
      description: "List all project files",
      parameters: {
        type: "object",
        properties: {
          dir: {
            type: "string",
          },
        },
      },
    },
  },

  {
    type: "function",
    function: {
      name: "runCommand",
      description: "Run a terminal command",
      parameters: {
        type: "object",
        properties: {
          command: {
            type: "string",
          },
        },
        required: ["command"],
      },
    },
  },
];

// ====================================
// SYSTEM PROMPT
// ====================================

const SYSTEM_PROMPT = `
You are an autonomous coding agent.

Your abilities:

- Create folders
- Create files
- Write code
- Read code
- Execute terminal commands
- Inspect project structure

Rules:

1. Always use tools when required.
2. Never hallucinate file contents.
3. Read files before modifying them.
4. Use terminal commands whenever necessary.
5. Finish the user's task completely.
`;

// ====================================
// MEMORY
// ====================================

const messages = [
  {
    role: "system",
    content: SYSTEM_PROMPT,
  },
];

// ====================================
// AGENT LOOP
// ====================================

async function startAgent() {
  console.log("\nCLI Coding Agent Started\n");

  while (true) {
    const userInput = readlineSync.question("You > ");

    if (userInput.toLowerCase() === "exit") {
      process.exit(0);
    }

    messages.push({
      role: "user",
      content: userInput,
    });

    while (true) {
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        tools,
      });

      const message = response.choices[0].message;

      if (!message.tool_calls) {
        console.log("\nAgent >", message.content, "\n");

        messages.push({
          role: "assistant",
          content: message.content,
        });

        break;
      }

      messages.push(message);

      for (const toolCall of message.tool_calls) {
        const toolName = toolCall.function.name;

        const args = JSON.parse(
          toolCall.function.arguments
        );

        console.log(`\nUsing Tool: ${toolName}`);

        const result =
          await TOOL_MAP[toolName](...Object.values(args));

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: String(result),
        });
      }
    }
  }
}

startAgent();