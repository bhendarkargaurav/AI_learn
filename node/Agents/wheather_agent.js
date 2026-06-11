import OpenAI from "openai";
import dotenv from "dotenv";
import promptSync from "prompt-sync"; // Takes input from terminal

dotenv.config();
const prompt = promptSync(); //to take input from the terminal.

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  try {
    const user_query = prompt("> ");

    //Send Request to OpenAI
    const response = await client.responses.create({
      model: "gpt-4o",
      input: user_query,
    });
    console.log(response.output_text);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
main();


// run the model using node main.js