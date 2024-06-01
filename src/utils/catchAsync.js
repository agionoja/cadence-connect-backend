const catchAsync = (cb) => (req, res, next) => cb(req, res, next).catch(next);

export default catchAsync;
