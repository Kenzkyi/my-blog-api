const app = require("../app");
const User = require("../models/user");
const db = require("./db");
const request = require("supertest");

beforeAll(async () => {
  await db.connect();
});

afterEach(async () => {
  await db.clear();
});

afterAll(async () => {
  await db.disconnect();
});

describe("Auth Api Tests", () => {
  it("User should register", async () => {
    const data = {
      email: "test@me.com",
      first_name: "test",
      last_name: "test",
      password: "testING123",
    };
    const response = await request(app).post("/auth/signup").send(data);

    const newUser = await User.find({ email: data.email });

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(newUser.length).toBeTruthy();
  });

  it("User should login", async () => {
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

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.data.token).toBeTruthy();
  });
});
