const app = require("../app");
const db = require("./db");
const request = require("supertest");
const Article = require("../models/article");

beforeAll(async () => {
  await db.connect();
});

afterEach(async () => {
  await db.clear();
});

afterAll(async () => {
  await db.disconnect();
});

describe("Articles Api Tests", () => {
  let token;

  beforeEach(async () => {
    const signupData = {
      email: "test@me.com",
      first_name: "test",
      last_name: "test",
      password: "testING123",
    };
    await request(app).post("/auth/signup").send(signupData);

    const loginData = {
      email: signupData.email,
      password: signupData.password,
    };

    const response = await request(app).post("/auth/login").send(loginData);
    token = response.body.data.token;

    const data = {
      title: "My First Blog",
      description: "This is my first blog post",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      tags: ["blog", "first", "introduction"],
    };
    await request(app)
      .post("/articles")
      .send(data)
      .set("Authorization", "Bearer " + token);
  });
  it("Create an article", async () => {
    const data = {
      title: "My Second Blog",
      description: "This is my second blog post",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      tags: ["blog", "second", "introduction"],
    };
    const response = await request(app)
      .post("/articles")
      .send(data)
      .set("Authorization", "Bearer " + token);

    const article = await Article.find({ title: data.title });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(article[0]).toBeTruthy();
  });
  it("Get all published articles", async () => {
    const response = await request(app).get("/articles");
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
  });

  it("Get one published article", async () => {
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;

    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });

    const response = await request(app).get(`/articles/${articleId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data).toBeTruthy();
  });
  it("Get my articles", async () => {
    const response = await request(app)
      .get("/articles/me")
      .set("Authorization", "Bearer " + token);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
  });

  it("publish an article", async () => {
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;

    const response = await request(app)
      .patch(`/articles/${articleId}/publish`)
      .set("Authorization", "Bearer " + token);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
  });

  it("update an article", async () => {
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;

    const data = {
      title: "Updated Title",
    };

    const response = await request(app)
      .put(`/articles/${articleId}`)
      .send(data)
      .set("Authorization", "Bearer " + token);

    const updatedArticle = await Article.findById(articleId);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(updatedArticle.title).toBe(data.title);
  });

  it("delete an article", async () => {
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;

    const response = await request(app)
      .delete(`/articles/${articleId}`)
      .set("Authorization", "Bearer " + token);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
  });

  it("search articles by title", async () => {
    // Publish an article first
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });
    const response = await request(app).get("/articles?title=My");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("search articles by author (first name)", async () => {
    // Publish an article first
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });

    const response = await request(app).get("/articles?author=test");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("search articles by tags", async () => {
    // Publish an article first
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });

    const response = await request(app).get("/articles?tags=first");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("search articles by multiple tags (comma-separated)", async () => {
    // Publish an article first
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });

    const response = await request(app).get(
      "/articles?tags=first,blog,introduction",
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("filter user articles by state (draft)", async () => {
    const response = await request(app)
      .get("/articles/me?state=draft")
      .set("Authorization", "Bearer " + token);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("filter user articles by state (published)", async () => {
    // Create and publish an article
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });

    const response = await request(app)
      .get("/articles/me?state=published")
      .set("Authorization", "Bearer " + token);

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("sort articles by timestamp descending (newest first)", async () => {
    // Publish the article first
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });

    const response = await request(app).get("/articles?sort=timestamp:desc");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("sort articles by timestamp ascending (oldest first)", async () => {
    // Publish the article first
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });

    const response = await request(app).get("/articles?sort=timestamp:asc");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("sort articles by read_count descending (trending)", async () => {
    // Publish and increment read count
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });
    await Article.findOneAndUpdate(
      { _id: articleId },
      { $inc: { read_count: 5 } },
    );

    const response = await request(app).get("/articles?sort=read_count:desc");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("sort articles by read_count ascending", async () => {
    // Publish the article
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });

    const response = await request(app).get("/articles?sort=read_count:asc");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("sort articles by reading_time descending (longest reads first)", async () => {
    // Publish the article
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });

    const response = await request(app).get("/articles?sort=reading_time:desc");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("sort articles by reading_time ascending (quick reads first)", async () => {
    // Publish the article
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });

    const response = await request(app).get("/articles?sort=reading_time:asc");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("paginate articles with custom limit", async () => {
    // Publish the article
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });

    const response = await request(app).get("/articles?page=1");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it("combine search, filter and sort", async () => {
    // Publish the article
    const allArticles = await Article.find({});
    const articleId = allArticles[0]._id;
    await Article.findOneAndUpdate({ _id: articleId }, { state: "published" });

    const response = await request(app).get(
      "/articles?title=First&author=test&sort=timestamp:desc&page=1",
    );

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});
