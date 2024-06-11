import crypto from "node:crypto";

const generateEtag = (data) => {
  return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex");
};

export default generateEtag;
