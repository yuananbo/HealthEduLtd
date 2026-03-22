import assert from "node:assert/strict";
import test from "node:test";
import {
  getAdminBookings,
  getAdminBookingById,
  updateAdminBookingStatus,
} from "../../controllers/admin/admin.controller.js";
import AdminService from "../../services/admin.service.js";

const createResponse = () => {
  const response = {
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
  };

  return response;
};

test("getAdminBookings returns 403 for non-admin user", async () => {
  const req = {
    user: {
      role: "viewer",
      userType: "patient",
    },
    query: {},
  };
  const res = createResponse();

  await getAdminBookings(req, res, () => {});

  assert.equal(res.statusCode, 403);
  assert.equal(
    res.body.message,
    "Unauthorized: You do not have permission to access this resource"
  );
});

test("getAdminBookings returns list payload from admin service", async () => {
  const original = AdminService.getAdminBookings;
  AdminService.getAdminBookings = async () => ({
    bookings: [{ _id: "booking-1", status: "Pending" }],
    filters: { search: "", status: "all", sortOrder: "desc" },
    stats: { total: 1, statusCounts: { Pending: 1 } },
    pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 10 },
  });

  try {
    const req = {
      user: {
        _id: "admin-1",
        role: "admin",
        userType: "admin",
      },
      query: {},
    };
    const res = createResponse();

    await getAdminBookings(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0]._id, "booking-1");
    assert.equal(res.body.stats.total, 1);
  } finally {
    AdminService.getAdminBookings = original;
  }
});

test("getAdminBookingById returns booking details", async () => {
  const original = AdminService.getAdminBookingById;
  AdminService.getAdminBookingById = async () => ({
    _id: "booking-2",
    status: "Accepted",
    statusHistory: [],
  });

  try {
    const req = {
      params: { id: "booking-2" },
      user: {
        _id: "admin-1",
        role: "admin",
        userType: "admin",
      },
    };
    const res = createResponse();

    await getAdminBookingById(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data._id, "booking-2");
  } finally {
    AdminService.getAdminBookingById = original;
  }
});

test("updateAdminBookingStatus validates missing status", async () => {
  const req = {
    params: { id: "booking-3" },
    body: {},
    user: {
      _id: "admin-1",
      role: "admin",
      userType: "admin",
    },
  };
  const res = createResponse();

  await updateAdminBookingStatus(req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "status is required");
});

test("updateAdminBookingStatus returns updated booking payload", async () => {
  const original = AdminService.updateAdminBookingStatus;
  AdminService.updateAdminBookingStatus = async () => ({
    appointment: {
      _id: "booking-4",
      status: "Cancelled",
    },
    patientEmailResponse: null,
  });

  try {
    const req = {
      params: { id: "booking-4" },
      body: { status: "Cancelled", reason: "Duplicate booking" },
      user: {
        _id: "admin-1",
        role: "admin",
        userType: "admin",
      },
    };
    const res = createResponse();

    await updateAdminBookingStatus(req, res, () => {});

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.status, "Cancelled");
    assert.equal(res.body.emailSent, false);
  } finally {
    AdminService.updateAdminBookingStatus = original;
  }
});
