const Joi = require("joi");
const Article = require("../models/article");
const { formatResponse } = require("../utilis/dataFormatter");

const getAllPublishedArticles = async (req, res) => {
  const query = req.query;

  const numberToSkip = ((query?.page || 1) - 1) * 20;

  const tags = query.tags
    ? query.tags.includes(",")
      ? query.tags.split(",").map((tag) => tag.trim())
      : [query.tags]
    : null;

  const filter = {};

  if (query?.title) {
    filter.title = { $regex: query.title, $options: "i" };
  }

  if (query?.author) {
    filter.$or = [
      { "author.first_name": { $regex: query.author, $options: "i" } },
      { "author.last_name": { $regex: query.author, $options: "i" } },
    ];
  }

  if (tags) {
    filter.tags = {
      $in: tags.map((tag) => new RegExp(tag.trim(), "i")),
    };
  }

  const schema = Joi.object({
    page: Joi.number().integer().min(1),
    author: Joi.string(),
    title: Joi.string(),
    tags: Joi.string(),
    sort: Joi.string().valid(
      "timestamp:asc",
      "timestamp:desc",
      "read_count:asc",
      "read_count:desc",
      "reading_time:asc",
      "reading_time:desc",
    ),
  });

  const validationResult = schema.validate(query);

  if (validationResult.error) {
    return res.status(400).json(formatResponse(validationResult.error.message));
  }
  if (query?.sort) {
    const [field, order] = query.sort.split(":");
    if (field === "timestamp") {
      query.sort = { createdAt: order === "asc" ? 1 : -1 };
    } else if (field === "read_count") {
      query.sort = { read_count: order === "asc" ? 1 : -1 };
    } else if (field === "reading_time") {
      query.sort = { reading_time_minutes: order === "asc" ? 1 : -1 };
    } else {
      query.sort = { [field]: order === "asc" ? 1 : -1 };
    }
  }
  try {
    const allPublishedArticles = await Article.find({
      state: "published",
      ...filter,
    })

      .skip(numberToSkip)
      .limit(20)
      .sort(query.sort);
    const toBeReturnedArticles = allPublishedArticles.map((article) => {
      const { author, __v, ...rest } = article._doc;
      return {
        ...rest,
      };
    });
    res
      .status(200)
      .json(
        formatResponse(
          null,
          toBeReturnedArticles,
          "All Published Articles Retrieved Successfully",
        ),
      );
  } catch (error) {
    console.log(error);
    res.status(500).json(formatResponse("Internal Server Error"));
  }
};

const getOnePublishedArticle = async (req, res) => {
  const articleId = req.params.id;
  if (!articleId) {
    return res.status(400).json(formatResponse("Enter a valid ID"));
  }
  try {
    const updatedPublishedArticle = await Article.findOneAndUpdate(
      { _id: articleId, state: "published" },
      { $inc: { read_count: 1 } },
      { returnDocument: "after" },
    );

    if (!updatedPublishedArticle) {
      return res.status(400).json(formatResponse("Article not found"));
    }

    res
      .status(200)
      .json(
        formatResponse(
          null,
          updatedPublishedArticle,
          "Article Retrieved Successfully",
        ),
      );
  } catch (error) {
    console.log(error);
    res.status(500).json(formatResponse("Internal Server Error"));
  }
};

const getMyArticles = async (req, res) => {
  const user = req.user;
  const query = req.query;

  const numberToSkip = ((query?.page || 1) - 1) * 20;

  const schema = Joi.object({
    state: Joi.string().valid("draft", "published"),
    page: Joi.number().integer().min(1),
  });

  const validationResult = schema.validate(query);

  if (validationResult.error) {
    return res.status(400).json(formatResponse(validationResult.error.message));
  }
  try {
    const myArticles = await Article.find({
      "author.email": user.email,
      ...(query.state ? { state: query.state } : {}),
    })
      .skip(numberToSkip)
      .limit(20);
    const toBeReturnedArticles = myArticles.map((article) => {
      const { author, __v, ...rest } = article._doc;
      return {
        ...rest,
      };
    });
    res
      .status(200)
      .json(
        formatResponse(
          null,
          toBeReturnedArticles,
          "User Articles retrieved successfully",
        ),
      );
  } catch (error) {
    console.log(error);
    res.status(500).json(formatResponse("Internal server error"));
  }
};

const createArticle = async (req, res) => {
  const data = req.body;
  const user = req.user;
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  const validationResult = schema.validate(data);

  if (validationResult.error) {
    return res.status(400).json(formatResponse(validationResult.error.message));
  }

  try {
    await Article.create({
      ...data,
      author: {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
    res
      .status(200)
      .json(formatResponse(null, null, "Article created successfully"));
  } catch (error) {
    console.log(error);
    res.status(500).json(formatResponse("Internal Server Error"));
  }
};

const updateArticle = async (req, res) => {
  const articleId = req.params.id;
  const data = req.body;
  const schema = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  const validationResult = schema.validate(data);

  if (validationResult.error) {
    return res.status(400).json(formatResponse(validationResult.error.message));
  }

  try {
    await Article.findOneAndUpdate({ _id: articleId }, { $set: data });
    res
      .status(200)
      .json(formatResponse(null, null, "Article updated successfully"));
  } catch (error) {
    console.log(error);
    res.status(500).json(formatResponse("Internal Server Error"));
  }
};

const publishArticle = async (req, res) => {
  const articleId = req.params.id;
  try {
    const singlePublishedArticle = await Article.findById(articleId);

    if (singlePublishedArticle.state === "published") {
      return res.status(400).json(formatResponse("Article already published"));
    }

    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });
    res
      .status(200)
      .json(formatResponse(null, null, "Article Published Successfully"));
  } catch (error) {
    console.log(error);
    res.status(500).json(formatResponse("Internal Server Error"));
  }
};

const deleteArticle = async (req, res) => {
  const articleId = req.params.id;
  try {
    await Article.findOneAndDelete({ _id: articleId });
    res
      .status(200)
      .json(formatResponse(null, null, "Article deleted successfully"));
  } catch (error) {
    console.log(error);
    res.status(500).json(formatResponse("Internal Server Error"));
  }
};

module.exports = {
  getAllPublishedArticles,
  getOnePublishedArticle,
  createArticle,
  updateArticle,
  publishArticle,
  deleteArticle,
  getMyArticles,
};
