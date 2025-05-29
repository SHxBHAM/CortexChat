import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 700,
    chunkOverlap: 100,
});

export async function splitText(text) {
    const chunks = await textSplitter.splitText(text);
    return chunks;
} 