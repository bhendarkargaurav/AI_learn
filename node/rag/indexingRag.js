// phase 1 of rag: indexing:- load doc, chunking, vec embeddeng, store to db(Qdrant)

import dotenv from 'dotenv';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from '@langchain/openai'
import { QdrantVectorStore } from "@langchain/qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import path from 'path';
import { fileURLToPath } from "url";

dotenv.config();

// get current file directory(__dirname equivalent in ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// path to pdf
const pdfPath = path.join(__dirname, "nodejs.pdf");

//load pdf

const loader = new PDFLoader(pdfPath);
const docs = await loader.load();
// print page
// console.log(docs[12]);


// split the doc into smaller chunks(chunking)
const text_splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});
const chunks = await text_splitter.splitDocuments(docs);
// console.log(chunks.length);


// vector Embedding

const client = new QdrantClient({
    url: "http://localhost:6333",
});

//embedding model
const text_embeddings = new OpenAIEmbeddings({  // OpenAIEMbedding locking for the open ai api
    model: 'text-embedding-3-large'
})

// we use Qdrant Db
const vectorStore = await QdrantVectorStore.fromDocuments(
    chunks,
    text_embeddings,
    {
        client,
        collectionName: "Learning_rag"
    }
);


console.log("Indexing is done...")