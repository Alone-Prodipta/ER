export default function errorHandler(error, _req, res, _next) {
  console.error(error);
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res
      .status(400)
      .json({ success: false, error: "Request body must contain valid JSON." });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ success: false, error: error.message });
  }
  if (
    error.name === "MongoServerSelectionError" ||
    error.name === "MongooseServerSelectionError"
  ) {
    return res
      .status(503)
      .json({ success: false, error: "MongoDB is unavailable." });
  }
  return res
    .status(500)
    .json({ success: false, error: "An unexpected server error occurred." });
}
