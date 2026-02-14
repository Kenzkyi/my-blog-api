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

  beforeAll(async () => {
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
  });
  it("Create an article", async () => {
    const data = {
      title: "My First Blog",
      description: "This is my first blog post",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      tags: ["blog", "first", "introduction"],
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
});
