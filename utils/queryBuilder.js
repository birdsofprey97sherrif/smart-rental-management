// utils/queryBuilder.js
class QueryBuilder {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search() {
    if (this.queryString.search) {
      const searchRegex = new RegExp(this.queryString.search, 'i');
      this.query = this.query.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { 'location.county': searchRegex },
          { 'location.town': searchRegex }
        ]
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
}

// Use in controller
exports.searchHouses = async (req, res) => {
  try {
    const features = new QueryBuilder(House.find(), req.query)
      .filter()
      .search()
      .sort()
      .limitFields()
      .paginate();

    const houses = await features.query;
    const total = await House.countDocuments();

    res.json({
      status: 'success',
      results: houses.length,
      total,
      data: houses
    });
  } catch (err) {
    res.status(500).json({ message: 'Search failed' });
  }
};