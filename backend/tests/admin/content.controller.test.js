import assert from "node:assert/strict";
import test from "node:test";
import EducationContent from "../../models/educationContent.model.js";
import {
  createAdminContent,
  getAdminContentById,
  getAdminContents,
  updateAdminContent,
  updateAdminContentStatus,
} from "../../controllers/admin/admin.controller.js";

const originalCountDocuments = EducationContent.countDocuments;
const originalFind = EducationContent.find;
const originalFindById = EducationContent.findById;
const originalFindByIdAndUpdate = EducationContent.findByIdAndUpdate;
const originalCreate = EducationContent.create;

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test.afterEach(() => {
  EducationContent.countDocuments = originalCountDocuments;
  EducationContent.find = originalFind;
  EducationContent.findById = originalFindById;
  EducationContent.findByIdAndUpdate = originalFindByIdAndUpdate;
  EducationContent.create = originalCreate;
});

test("getAdminContents denies non-admin access", async () => {
  const req = {
    user: { role: "viewer", userType: "patient" },
    query: {},
  };
  const res = createResponse();

  await getAdminContents(req, res, () => {});

  assert.equal(res.statusCode, 403);
});

test("getAdminContents applies filters and returns paginated rows", async () => {
  let receivedQuery = null;
  EducationContent.countDocuments = async (query) => {
    receivedQuery = query;
    return 1;
  };
  EducationContent.find = (query) => {
    receivedQuery = query;
    return {
      select() {
        return this;
      },
      sort() {
        return this;
      },
      skip() {
        return this;
      },
      limit() {
        return this;
      },
      lean: async () => [
        {
          _id: "content-1",
          title: "Healthy Eating",
          isPublished: true,
        },
      ],
    };
  };

  const req = {
    user: { role: "admin", userType: "admin" },
    query: {
      search: "healthy",
      topic: "nutrition",
      type: "article",
      status: "published",
      page: "2",
      limit: "5",
    },
  };
  const res = createResponse();

  await getAdminContents(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(receivedQuery.topic, "nutrition");
  assert.equal(receivedQuery.type, "article");
  assert.equal(receivedQuery.isPublished, true);
  assert.equal(res.body.currentPage, 2);
  assert.equal(res.body.data[0]._id, "content-1");
});

test("getAdminContentById returns 404 when content does not exist", async () => {
  EducationContent.findById = () => ({
    select() {
      return this;
    },
    lean: async () => null,
  });

  const req = {
    user: { role: "admin", userType: "admin" },
    params: { id: "missing" },
  };
  const res = createResponse();

  await getAdminContentById(req, res, () => {});

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Content not found");
});

test("getAdminContentById returns content payload when found", async () => {
  EducationContent.findById = () => ({
    select() {
      return this;
    },
    lean: async () => ({
      _id: "content-1",
      title: "Healthy Eating",
    }),
  });

  const req = {
    user: { role: "admin", userType: "admin" },
    params: { id: "content-1" },
  };
  const res = createResponse();

  await getAdminContentById(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.title, "Healthy Eating");
});

test("createAdminContent validates required fields", async () => {
  const req = {
    user: { role: "admin", userType: "admin" },
    body: {
      topic: "nutrition",
      type: "article",
      title: "",
    },
  };
  const res = createResponse();

  await createAdminContent(req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /summary is required|title is required/);
});

test("createAdminContent persists normalized payload", async () => {
  let createdPayload = null;
  EducationContent.create = async (payload) => {
    createdPayload = payload;
    return { _id: "content-2", ...payload };
  };

  const req = {
    user: { role: "admin", userType: "admin" },
    body: {
      topic: "nutrition",
      type: "article",
      title: "  New content  ",
      summary: "  Summary  ",
      duration: " 5 min ",
      body: "  Body  ",
      sourceName: " WHO ",
      sourceUrl: " https://example.com ",
      order: "3",
      isPublished: true,
    },
  };
  const res = createResponse();

  await createAdminContent(req, res, () => {});

  assert.equal(res.statusCode, 201);
  assert.equal(createdPayload.title, "New content");
  assert.equal(createdPayload.order, 3);
  assert.equal(createdPayload.isPublished, true);
});

test("updateAdminContentStatus rejects non-boolean payload", async () => {
  const req = {
    user: { role: "admin", userType: "admin" },
    params: { id: "content-1" },
    body: { isPublished: "yes" },
  };
  const res = createResponse();

  await updateAdminContentStatus(req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "isPublished must be provided as a boolean");
});

test("updateAdminContentStatus returns updated content", async () => {
  EducationContent.findByIdAndUpdate = () => ({
    select() {
      return this;
    },
    lean: async () => ({
      _id: "content-1",
      isPublished: false,
    }),
  });

  const req = {
    user: { role: "admin", userType: "admin" },
    params: { id: "content-1" },
    body: { isPublished: false },
  };
  const res = createResponse();

  await updateAdminContentStatus(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.isPublished, false);
  assert.equal(res.body.message, "Content unpublished successfully");
});

test("updateAdminContentStatus returns 404 when content is missing", async () => {
  EducationContent.findByIdAndUpdate = () => ({
    select() {
      return this;
    },
    lean: async () => null,
  });

  const req = {
    user: { role: "admin", userType: "admin" },
    params: { id: "missing" },
    body: { isPublished: true },
  };
  const res = createResponse();

  await updateAdminContentStatus(req, res, () => {});

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Content not found");
});

test("updateAdminContent validates invalid order payload", async () => {
  const req = {
    user: { role: "admin", userType: "admin" },
    params: { id: "content-1" },
    body: {
      topic: "nutrition",
      type: "article",
      title: "Title",
      summary: "Summary",
      duration: "5 min",
      body: "Body",
      sourceName: "WHO",
      sourceUrl: "https://example.com",
      order: "abc",
    },
  };
  const res = createResponse();

  await updateAdminContent(req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "order must be a number");
});

test("updateAdminContent returns updated content on success", async () => {
  let updatedPayload = null;
  EducationContent.findByIdAndUpdate = (id, payload) => {
    updatedPayload = { id, payload };
    return {
      select() {
        return this;
      },
      lean: async () => ({
        _id: id,
        ...payload,
      }),
    };
  };

  const req = {
    user: { role: "admin", userType: "admin" },
    params: { id: "content-1" },
    body: {
      topic: "nutrition",
      type: "article",
      title: " Updated Title ",
      summary: " Updated summary ",
      duration: " 6 min ",
      body: " Updated body ",
      sourceName: " WHO ",
      sourceUrl: " https://example.com ",
      order: "4",
      isPublished: false,
    },
  };
  const res = createResponse();

  await updateAdminContent(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(updatedPayload.payload.title, "Updated Title");
  assert.equal(updatedPayload.payload.order, 4);
  assert.equal(res.body.data._id, "content-1");
});
