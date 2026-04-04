import assert from "node:assert/strict";
import test from "node:test";
import Patient from "../../models/patient.model.js";
import Therapist from "../../models/therapist.model.js";
import Admin from "../../models/admin.model.js";
import Appointment from "../../models/appointment.model.js";
import AdminService from "../../services/admin.service.js";
import {
  getAdminUsers,
  getAdminUserById,
  updateAdminUserStatus,
} from "../../controllers/admin/admin.controller.js";

const VALID_THERAPIST_ID = "507f1f77bcf86cd799439012";
const VALID_ADMIN_ID = "507f1f77bcf86cd799439013";

const originalPatientFind = Patient.find;
const originalPatientFindById = Patient.findById;
const originalPatientFindByIdAndUpdate = Patient.findByIdAndUpdate;
const originalTherapistFind = Therapist.find;
const originalTherapistFindById = Therapist.findById;
const originalTherapistFindByIdAndUpdate = Therapist.findByIdAndUpdate;
const originalAdminFind = Admin.find;
const originalAdminFindById = Admin.findById;
const originalAdminFindByIdAndUpdate = Admin.findByIdAndUpdate;
const originalAdminCountDocuments = Admin.countDocuments;
const originalAppointmentCountDocuments = Appointment.countDocuments;
const originalApproveTherapistAccount = AdminService.approveTherapistAccount;
const originalDeactivateTherapistAccount = AdminService.deactivateTherapistAccount;

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

const withSelectLean = (payload) => ({
  select() {
    return this;
  },
  lean: async () => payload,
});

test.afterEach(() => {
  Patient.find = originalPatientFind;
  Patient.findById = originalPatientFindById;
  Patient.findByIdAndUpdate = originalPatientFindByIdAndUpdate;
  Therapist.find = originalTherapistFind;
  Therapist.findById = originalTherapistFindById;
  Therapist.findByIdAndUpdate = originalTherapistFindByIdAndUpdate;
  Admin.find = originalAdminFind;
  Admin.findById = originalAdminFindById;
  Admin.findByIdAndUpdate = originalAdminFindByIdAndUpdate;
  Admin.countDocuments = originalAdminCountDocuments;
  Appointment.countDocuments = originalAppointmentCountDocuments;
  AdminService.approveTherapistAccount = originalApproveTherapistAccount;
  AdminService.deactivateTherapistAccount = originalDeactivateTherapistAccount;
});

test("getAdminUsers returns filtered paginated user rows", async () => {
  Patient.find = () => withSelectLean([
    {
      _id: "patient-1",
      firstName: "Mia",
      lastName: "Wang",
      email: "mia@example.com",
      phoneNumber: "111",
      userType: "patient",
      isActive: true,
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
    },
  ]);
  Therapist.find = () => withSelectLean([
    {
      _id: VALID_THERAPIST_ID,
      firstName: "Jamie",
      lastName: "Chen",
      email: "jamie@example.com",
      phoneNumber: "222",
      userType: "therapist",
      active: true,
      isVerified: false,
      createdAt: "2026-03-02T00:00:00.000Z",
      updatedAt: "2026-03-02T00:00:00.000Z",
    },
  ]);
  Admin.find = () => withSelectLean([]);

  const req = {
    user: { role: "admin", userType: "admin" },
    query: { userType: "therapist", status: "pending", page: "1", limit: "10" },
  };
  const res = createResponse();

  await getAdminUsers(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.total, 1);
  assert.equal(res.body.data[0].email, "jamie@example.com");
  assert.equal(res.body.data[0].status, "pending");
});

test("getAdminUserById returns therapist detail payload when userType hint is supplied", async () => {
  Therapist.findById = () => withSelectLean({
    _id: VALID_THERAPIST_ID,
    firstName: "Jamie",
    lastName: "Chen",
    email: "jamie@example.com",
    phoneNumber: "222",
    userType: "therapist",
    active: true,
    isVerified: false,
    profession: "PT",
    specialization: "Physio",
    numOfYearsOfExperience: 6,
    profilePicture: "avatar.png",
    cv: "cv.pdf",
    licenseDocument: "",
    createdAt: "2026-03-02T00:00:00.000Z",
    updatedAt: "2026-03-02T00:00:00.000Z",
  });
  Appointment.countDocuments = async () => 14;

  const req = {
    user: { role: "admin", userType: "admin" },
    params: { id: VALID_THERAPIST_ID },
    query: { userType: "therapist" },
  };
  const res = createResponse();

  await getAdminUserById(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.userType, "therapist");
  assert.equal(res.body.data.businessInfo.appointmentCount, 14);
  assert.equal(
    res.body.data.businessInfo.documentUploadStatus.hasLicenseDocument,
    false
  );
});

test("updateAdminUserStatus blocks deactivating your own admin account", async () => {
  const req = {
    user: { _id: VALID_ADMIN_ID, role: "admin", userType: "admin" },
    params: { id: VALID_ADMIN_ID },
    body: { userType: "admin", status: "inactive" },
  };
  const res = createResponse();

  await updateAdminUserStatus(req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "You cannot deactivate your own admin account");
});

test("updateAdminUserStatus routes therapist activation through admin service", async () => {
  AdminService.approveTherapistAccount = async () => ({
    therapist: { _id: VALID_THERAPIST_ID, active: true, isVerified: true },
  });
  Therapist.findById = () => ({
    select: async () => ({
      _id: VALID_THERAPIST_ID,
      active: true,
      isVerified: false,
    }),
  });

  const req = {
    user: { _id: VALID_ADMIN_ID, role: "admin", userType: "admin" },
    params: { id: VALID_THERAPIST_ID },
    body: { userType: "therapist", status: "active" },
  };
  const res = createResponse();

  await updateAdminUserStatus(req, res, () => {});

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.userType, "therapist");
  assert.equal(res.body.data.status, "active");
});

test("getAdminUserById rejects invalid user ids", async () => {
  const req = {
    user: { role: "admin", userType: "admin" },
    params: { id: "therapist-1" },
    query: { userType: "therapist" },
  };
  const res = createResponse();

  await getAdminUserById(req, res, () => {});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Invalid user id");
});
