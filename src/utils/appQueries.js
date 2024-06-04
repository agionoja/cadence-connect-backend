import * as querystring from "node:querystring";

export default class AppQueries {
  constructor(queryObject, query) {
    this.queryObject = queryObject;
    this.query = query;
  }

  filter() {
    const excludedFields = ["limit", "sort", "page", "fields"];
    const copiedQueryObject = { ...this.queryObject };
    excludedFields.forEach((field) => delete excludedFields[field]);

    const queryObject$ = JSON.parse(
      JSON.stringify(copiedQueryObject).replace(
        /\b(gte|gt|lte|lt|in)\b/g,
        (match) => `$${match}`,
      ),
    );

    this.query = this.query.find(queryObject$);
    return this;
  }
  sort() {
    if (this.queryObject.sort) {
      const sortValue = this.queryObject.sort.split(",").join(" ");
      this.query = this.query.sort(sortValue);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  limitFields() {
    if (this.queryObject.fields) {
      const limitValue = this.queryObject.fields.split(",").join(" ");
      this.query = this.query.skip(limitValue);
    }
    return this;
  }
  paginate() {
    if (this.queryObject.page) {
      const limit = this.queryObject.limit || 10;
      const page = this.queryObject.page || 1;
      const skip = (page - 1) * limit;

      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }
}
