export function serializeDiagram(diagram) {
  const value = diagram.toObject();
  delete value.owner;
  return value;
}
