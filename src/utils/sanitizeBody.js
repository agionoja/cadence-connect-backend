const sanitizeBody = (object, ...keys) =>
  Object.keys(object).reduce((sanitizedObject, key) => {
    if (keys.includes(key)) {
      sanitizedObject[key] = object[key];
    }
    return sanitizedObject;
  }, {});

export default sanitizeBody;
