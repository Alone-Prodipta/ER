import mongoose from "mongoose";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
dotenv.config({
    path:'./.env',
});

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// ER Diagram Document Schema
const DiagramSchema = new mongoose.Schema({
  title: {
    type: String,
    default: "Untitled Diagram",
  },
  nodes: {
    type: Array,
    required: true,
  },
  edges: {
    type: Array,
    required: true,
  }, // Relationships between tables
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Diagram = mongoose.model("Diagram", DiagramSchema);

// Save or Update Diagram
app.post("/api/diagrams/save", async (req, res) => {
  try {
    const { id, title, nodes, edges } = req.body;
    let diagram;
    if (id) {
      diagram = await Diagram.findByIdAndUpdate(
        id,
        {
          title,
          nodes,
          edges,
          updatedAt: Date.now(),
        },
        {
          new: true,
        },
      );
    } else {
      diagram = new Diagram({ title, nodes, edges });
      await diagram.save();
    }
    res.status(200).json({ success: true, diagram });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch Saved Diagram
app.get("/api/diagrams/:id", async (req, res) => {
  try {
    const diagram = await Diagram.findById(req.params.id);
    res.status(200).json(diagram);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(process.env.PORT, () =>
  console.log(`Server running on port ${process.env.PORT}`),
);
