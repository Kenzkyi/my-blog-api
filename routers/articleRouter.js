const express = require("express");
const articleRouter = express.Router();

const articleController = require("../controllers/articleController");
const passport = require("passport");
const {
  validateExistingTitle,
  validateArticleOwnership,
} = require("../middlewears/validateArticle");

articleRouter.get("/", articleController.getAllPublishedArticles);

articleRouter.get(
  "/me",
  passport.authenticate("jwt", { session: false }),
  articleController.getMyArticles,
);

articleRouter.get("/:id", articleController.getOnePublishedArticle);

articleRouter.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  validateExistingTitle,
  articleController.createArticle,
);

articleRouter.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  validateArticleOwnership,
  articleController.updateArticle,
);

articleRouter.patch(
  "/:id/publish",
  passport.authenticate("jwt", { session: false }),
  validateArticleOwnership,
  articleController.publishArticle,
);

articleRouter.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  validateArticleOwnership,
  articleController.deleteArticle,
);

module.exports = articleRouter;
