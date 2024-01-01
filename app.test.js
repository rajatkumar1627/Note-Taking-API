const request = require("supertest");
const { app, server } = require("./app.js");

// Defining basic authentication credentials
const credentials = Buffer.from("admin:Password123").toString("base64");

describe("Note-Taking API", () => {
  let createdNoteId;

  it("should create a new note", async () => {
    const res = await request(app)
      .post("/notes")
      .set("Authorization", `Basic ${credentials}`)
      .send({
        title: "Test Note",
        content: "This is a test note",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("_id");
    createdNoteId = res.body._id;
  });

  it("should retrieve all notes", async () => {
    const res = await request(app)
      .get("/notes")
      .set("Authorization", `Basic ${credentials}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it("should retrieve a single note", async () => {
    const res = await request(app)
      .get(`/notes/${createdNoteId}`)
      .set("Authorization", `Basic ${credentials}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("_id", createdNoteId);
  });

  it("should update a note", async () => {
    const res = await request(app)
      .put(`/notes/${createdNoteId}`)
      .set("Authorization", `Basic ${credentials}`)
      .send({
        title: "Updated Test Note",
        content: "This note has been updated",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("title", "Updated Test Note");
    expect(res.body).toHaveProperty("content", "This note has been updated");
  });

  it("should delete a note", async () => {
    const res = await request(app)
      .delete(`/notes/${createdNoteId}`)
      .set("Authorization", `Basic ${credentials}`);

    expect(res.statusCode).toBe(204);
  });

  afterAll((done) => {
    // Close the server
    server.close(done);
  });
});
