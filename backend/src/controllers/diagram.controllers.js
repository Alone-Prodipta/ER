import mongoose from 'mongoose';
import Diagram from '../models/diagram.models.js';
import { serializeDiagram } from '../utilities/diagram.serializer.js';

export async function saveDiagram(req, res, next) {
  try {
    const { id, title, nodes, edges, viewport } = req.body ?? {};
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, error: 'title must be a non-empty string.' });
    }
    if (title.trim().length > 120) {
      return res.status(400).json({ success: false, error: 'title must be 120 characters or fewer.' });
    }
    if (!Array.isArray(nodes) || !Array.isArray(edges)) {
      return res.status(400).json({ success: false, error: 'nodes and edges must be arrays.' });
    }
    if (viewport !== undefined && (
      !viewport || typeof viewport !== 'object' ||
      !Number.isFinite(viewport.x) || !Number.isFinite(viewport.y) ||
      !Number.isFinite(viewport.zoom) || viewport.zoom <= 0
    )) {
      return res.status(400).json({ success: false, error: 'viewport must contain finite x, y, and positive zoom values.' });
    }
    if (id && !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, error: 'id must be a valid diagram ID.' });
    }

    const values = { owner: req.user._id, title: title.trim(), nodes, edges, ...(viewport ? { viewport } : {}) };
    const diagram = id
      ? await Diagram.findOneAndUpdate({ _id: id, owner: req.user._id }, values, { new: true, runValidators: true })
      : await Diagram.create(values);
    if (!diagram) return res.status(404).json({ success: false, error: 'Diagram not found.' });
    return res.json({ success: true, diagram: serializeDiagram(diagram) });
  } catch (error) {
    return next(error);
  }
}

export async function listDiagrams(req, res, next) {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 100) : 50;
    const diagrams = await Diagram.find({ owner: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('-nodes -edges');
    return res.json({ success: true, diagrams: diagrams.map(serializeDiagram) });
  } catch (error) {
    return next(error);
  }
}

export async function getDiagram(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'id must be a valid diagram ID.' });
    }
    const diagram = await Diagram.findOne({ _id: req.params.id, owner: req.user._id });
    if (!diagram) return res.status(404).json({ success: false, error: 'Diagram not found.' });
    return res.json({ success: true, diagram: serializeDiagram(diagram) });
  } catch (error) {
    return next(error);
  }
}

export async function deleteDiagram(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'id must be a valid diagram ID.' });
    }
    const diagram = await Diagram.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!diagram) return res.status(404).json({ success: false, error: 'Diagram not found.' });
    return res.json({ success: true, message: 'Diagram deleted.' });
  } catch (error) {
    return next(error);
  }
}
