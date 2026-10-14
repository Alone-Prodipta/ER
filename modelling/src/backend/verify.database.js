import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
dotenv.config({
    path:'./.env',
});

async function checkDatabase() {
  await mongoose.connect(process.env.DATABASE_URL);
  
  const Diagram = mongoose.model("Diagram", new mongoose.Schema({
    title: String,
    nodes: Array,
    edges: Array,
    updatedAt: Date.now()
  }));

  const savedDiagrams = await Diagram.find();
  console.log(" Total Diagrams Saved:", savedDiagrams.length);
  console.log(" Latest Diagram Details:", JSON.stringify(savedDiagrams[savedDiagrams.length - 1], null, 2));

  await mongoose.disconnect();
}

checkDatabase();