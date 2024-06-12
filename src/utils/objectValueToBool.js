const objectValueToBool = (object) => {
  return Object.keys(object).reduce((acc, key) => {
    if (object[key] === "true") {
      acc[key] = true;
    } else if (object[key] === "false") {
      acc[key] = false;
    } else {
      acc[key] = object[key];
    }

    return acc;
  }, {});
};

export default objectValueToBool;
