const Article = require("../models/article");
const { formatResponse } = require("../utilis/dataFormatter");

const validateExistingTitle = async (req, res, next) => {
  const { title } = req.body;
  if (typeof title !== "string" || !title) {
    return res
      .status(400)
      .json(formatResponse("Title is required and must be a string"));
  }
  try {
    const article = await Article.findOne({ title });
    if (article) {
      return res
        .status(400)
        .json(formatResponse("An article with the same title already exists"));
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(formatResponse("Internal Server Error"));
  }
};

const validateArticleOwnership = async (req, res, next) => {
  const articleId = req.params.id;
  const user = req.user;
  if (!articleId) {
    return res.status(400).json(formatResponse("Enter a valid ID"));
  }
  try {
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(400).json(formatResponse("Article not found"));
    }
    if (article.author._id.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json(formatResponse("You are not authorized to perform this action"));
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json(formatResponse("Internal Server Error"));
  }
};

module.exports = {
  validateExistingTitle,
  validateArticleOwnership,
};
