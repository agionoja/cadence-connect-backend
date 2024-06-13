import { generateEtag } from "../utils/utils.js";

export const cacheControl = (req, res, next) => {
  res.sendResponse = res.json;

  res.json = (body) => {
    const etag = generateEtag(body);

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).send();
    }

    res.set({
      "cache-control": "max-age=3600 must-revalidate",
      etag,
    });

    return res.sendResponse(body);
  };

  next();
};
