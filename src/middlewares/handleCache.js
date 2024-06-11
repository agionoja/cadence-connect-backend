import generateEtag from "../utils/generateEtag.js";

const handleCache = (req, res, next) => {
  res.sendReponse = res.json;

  res.json = (body) => {
    const etag = generateEtag(body);

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).send();
    }

    res.set({
      "cache-control": "max-age=3600 must-revalidate",
      etag,
    });

    return res.sendReponse(body);
  };

  next();
};

export default handleCache;
