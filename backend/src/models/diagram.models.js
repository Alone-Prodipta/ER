import mongoose from 'mongoose';

const diagramSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    // Keep React Flow payloads flexible as the editor adds node and edge properties.
    nodes: { type: [mongoose.Schema.Types.Mixed], default: [] },
    edges: { type: [mongoose.Schema.Types.Mixed], default: [] },
    viewport: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({ x: 0, y: 0, zoom: 1 }),
    },
  },
  { timestamps: true, versionKey: false },
);

const Diagram = mongoose.model('Diagram', diagramSchema);
export default Diagram;
