const filterObject = (object, ...keys) =>
  Object.keys(object).reduce((filtered, key) => {
    if (keys.includes(key)) {
      filtered[key] = object[key];
    }
    return filtered;
  }, {});

export default filterObject;
