import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import AdminService from "../../services/admin.service.js";
import AdminUserFactory from "../../services/adminUserFactory.service.js";
import Therapist from "../../models/therapist.model.js";
import Patient from "../../models/patient.model.js";
import Admin from "../../models/admin.model.js";
import Appointment from "../../models/appointment.model.js";
import Payment from "../../models/payment.model.js";
import EducationContent from "../../models/educationContent.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ensureAdminAccess = (admin) => {
  return (
    admin.role === "super-admin" ||
    admin.role === "admin" ||
    admin.userType === "admin"
  );
};

export const createSuperAdmin = asyncHandler(async (req, res) => {
  console.log("Controller: createSuperAdmin function called");
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { savedSuperAdmin, token } = await AdminService.createSuperAdmin(
      email,
      password,
      res
    );

    process.env.ENABLE_SETUP_ROUTES = "false";

    // Keep setup-route toggle in backend/.env (same env file used by backend app)
    const envFilePath = path.resolve(__dirname, "../../.env");
    let envFileContent = await fs.promises.readFile(envFilePath, "utf8");
    if (/^ENABLE_SETUP_ROUTES=/m.test(envFileContent)) {
      envFileContent = envFileContent.replace(
        /^ENABLE_SETUP_ROUTES=.*/m,
        "ENABLE_SETUP_ROUTES=false"
      );
    } else {
      envFileContent += "\nENABLE_SETUP_ROUTES=false\n";
    }
    await fs.promises.writeFile(envFilePath, envFileContent);

    res.status(201).json({
      message:
        "Super-admin created successfully. Setup routes are now disabled.",
      adminId: savedSuperAdmin._id,
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating super-admin", error: error.message });
  }
});

// create admin account by super admin
export const createAdmin = asyncHandler(async (req, res) => {
  console.log("Controller: createAdmin function called");

  const { email, password } = req.body;
  const creatorId = req.user._id;

  try {
    const newAdmin = await AdminService.createAdmin(creatorId, {
      email,
      password,
    });
    res.status(201).json({
      message: "Admin created successfully",
      admin: {
        id: newAdmin._id,
        email: newAdmin.email,
        role: newAdmin.role,
        createdBy: newAdmin.createdBy,
      },
    });
  } catch (error) {
    if (
      error.message === "Unauthorized: Only super-admin can create an admin"
    ) {
      res.status(403).json({ message: error.message });
    } else {
      res
        .status(500)
        .json({ message: "Error creating admin", error: error.message });
    }
  }
});

// login admin || super-admin
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminData = await AdminService.loginAdmin({ email, password, res });
    res.status(200).json({
      token: adminData.token,
      data: {
        user: adminData.admin,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all therapists
export const getAllTherapists = async (req, res) => {
  try {
    const admin = req.user;

    if (!ensureAdminAccess(admin)) {
      return res.status(403).json({
        message:
          "Unauthorized: You do not have permission to access this resource",
      });
    }

    const therapists = await Therapist.find().select("-password");
    res.json({ status: "success", count: therapists.length, data: therapists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Logout admin
 * @param {*} req
 * @param {*} res
 * @returns
 * @description Logout admin
 */

export const logoutAdmin = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Admin logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get therapist by id
export const getTherapistById = asyncHandler(async (req, res) => {
  try {
    const admin = req.user;
    const therapistId = req.params.id;

    if (!ensureAdminAccess(admin)) {
      return res.status(403).json({
        message:
          "Unauthorized: You do not have permission to access this resource",
      });
    }

    const therapist = await AdminService.getTherapistDetails(
      admin._id,
      therapistId
    );
    res.json({ status: "success", data: therapist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const admin = req.user;
  if (!ensureAdminAccess(admin)) {
    return res.status(403).json({
      message: "Unauthorized: You do not have permission to access this resource",
    });
  }

  const [bookings, successfulPayments, activePatients, pendingTherapists] =
    await Promise.all([
      Appointment.countDocuments({}),
      Payment.aggregate([
        { $match: { status: "success" } },
        {
          $group: {
            _id: "$currency",
            total: { $sum: "$amount" },
          },
        },
      ]),
      Appointment.distinct("patient", {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      Therapist.countDocuments({ isVerified: false }),
    ]);

  res.status(200).json({
    success: true,
    data: {
      bookings,
      revenue: successfulPayments,
      activePatients: activePatients.length,
      pendingTherapists,
    },
  });
});

export const getAdminUsers = asyncHandler(async (req, res) => {
  const admin = req.user;
  if (!ensureAdminAccess(admin)) {
    return res.status(403).json({
      message: "Unauthorized: You do not have permission to access this resource",
    });
  }

  const {
    search = "",
    userType = "all",
    status = "all",
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = req.query;

  const [patients, therapists, admins] = await Promise.all([
    Patient.find({})
      .select(
        "firstName lastName email phoneNumber userType isActive lastLogin createdAt updatedAt"
      )
      .lean(),
    Therapist.find({})
      .select(
        "firstName lastName email phoneNumber userType isVerified active lastLogin createdAt updatedAt"
      )
      .lean(),
    Admin.find({})
      .select(
        "firstName lastName email phoneNumber userType role isActive lastLogin createdAt updatedAt"
      )
      .lean(),
  ]);

  // The factory keeps the controller focused on query behavior
  // (filter/sort/paginate) instead of role-specific field mapping.
  const normalizedUsers = [
    ...patients.map((item) => AdminUserFactory.createListRow(item, "patient")),
    ...therapists.map((item) =>
      AdminUserFactory.createListRow(item, "therapist")
    ),
    ...admins.map((item) => AdminUserFactory.createListRow(item, "admin")),
  ];

  const normalizedSearch = search.trim().toLowerCase();
  const filteredUsers = normalizedUsers.filter((item) => {
    const matchesSearch =
      !normalizedSearch ||
      `${item.name} ${item.email}`.toLowerCase().includes(normalizedSearch);
    const matchesUserType =
      userType === "all" || item.userType === userType;
    const matchesStatus = status === "all" || item.status === status;

    return matchesSearch && matchesUserType && matchesStatus;
  });

  const sortDirection = sortOrder === "asc" ? 1 : -1;
  const sortedUsers = filteredUsers.sort((left, right) => {
    if (sortBy === "name") {
      return left.name.localeCompare(right.name) * sortDirection;
    }
    if (sortBy === "email") {
      return left.email.localeCompare(right.email) * sortDirection;
    }
    return (
      (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) *
      sortDirection
    );
  });

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const total = sortedUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / limitNumber));
  const startIndex = (pageNumber - 1) * limitNumber;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + limitNumber);

  res.status(200).json({
    success: true,
    count: paginatedUsers.length,
    total,
    currentPage: pageNumber,
    totalPages,
    filters: {
      search,
      userType,
      status,
      sortBy,
      sortOrder,
    },
    data: paginatedUsers,
  });
});

export const getAdminUserById = asyncHandler(async (req, res) => {
  const admin = req.user;
  if (!ensureAdminAccess(admin)) {
    return res.status(403).json({
      message: "Unauthorized: You do not have permission to access this resource",
    });
  }

  const { id } = req.params;
  const requestedUserType = req.query.userType;

  if (!id) {
    return res.status(400).json({ message: "User id is required" });
  }

  const getPatientPayload = async () => {
    const patient = await Patient.findById(id)
      .select("-password")
      .lean();

    if (!patient) {
      return null;
    }

    const appointmentCount = await Appointment.countDocuments({ patient: patient._id });

    return {
      ...AdminUserFactory.createDetailPayload(patient, "patient", {
        appointmentCount,
      }),
    };
  };

  const getTherapistPayload = async () => {
    const therapist = await Therapist.findById(id)
      .select("-password")
      .lean();

    if (!therapist) {
      return null;
    }

    const appointmentCount = await Appointment.countDocuments({
      therapist: therapist._id,
    });

    return AdminUserFactory.createDetailPayload(therapist, "therapist", {
      appointmentCount,
    });
  };

  const getAdminPayload = async () => {
    const targetAdmin = await Admin.findById(id)
      .select("-password")
      .lean();

    if (!targetAdmin) {
      return null;
    }

    return AdminUserFactory.createDetailPayload(targetAdmin, "admin");
  };

  let payload = null;
  // When userType is provided by the client we can avoid unnecessary lookups.
  // Otherwise we probe models in a fixed order because ids are stored in
  // separate collections and are not globally typed.
  if (requestedUserType === "patient") {
    payload = await getPatientPayload();
  } else if (requestedUserType === "therapist") {
    payload = await getTherapistPayload();
  } else if (requestedUserType === "admin" || requestedUserType === "super-admin") {
    payload = await getAdminPayload();
  } else {
    payload =
      (await getPatientPayload()) ||
      (await getTherapistPayload()) ||
      (await getAdminPayload());
  }

  if (!payload) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    success: true,
    data: payload,
  });
});

export const updateAdminUserStatus = asyncHandler(async (req, res) => {
  const admin = req.user;
  if (!ensureAdminAccess(admin)) {
    return res.status(403).json({
      message: "Unauthorized: You do not have permission to access this resource",
    });
  }

  const { id } = req.params;
  const { status, userType } = req.body;
  const allowedStatuses = ["active", "inactive", "pending"];

  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Status must be one of active, inactive, or pending",
    });
  }

  if (!userType) {
    return res.status(400).json({ message: "userType is required" });
  }

  if ((userType === "patient" || userType === "admin") && status === "pending") {
    return res.status(400).json({
      message: "Pending status is only supported for therapists",
    });
  }

  let updatedUser = null;

  if (userType === "patient") {
    updatedUser = await Patient.findByIdAndUpdate(
      id,
      { isActive: status === "active" },
      { new: true }
    ).select("-password");
  } else if (userType === "therapist") {
    const existingTherapist = await Therapist.findById(id).select("-password");

    if (!existingTherapist) {
      return res.status(404).json({ message: "User not found" });
    }

    if (status === "active") {
      // Reuse the original approval workflow so document checks and email
      // verification rules stay consistent across the admin module.
      const approvalResult = await AdminService.approveTherapistAccount(
        admin._id,
        id,
        req
      );
      updatedUser = approvalResult.therapist;
    } else if (status === "inactive") {
      if (existingTherapist.isVerified) {
        // Verified therapists must go through the existing deactivation path
        // because that flow already owns the related business rules and email.
        const deactivationResult = await AdminService.deactivateTherapistAccount(
          admin._id,
          id,
          req
        );
        updatedUser = deactivationResult.therapist;
      } else {
        updatedUser = await Therapist.findByIdAndUpdate(
          id,
          { active: false, isVerified: false },
          { new: true }
        ).select("-password");
      }
    } else if (status === "pending") {
      updatedUser = await Therapist.findByIdAndUpdate(
        id,
        {
          active: true,
          isVerified: false,
        },
        { new: true }
      ).select("-password");
    }
  } else if (userType === "admin" || userType === "super-admin") {
    if (status === "inactive") {
      // Prevent admins from removing the last route back into the admin system.
      if (admin._id.toString() === id) {
        return res.status(400).json({
          message: "You cannot deactivate your own admin account",
        });
      }

      if (userType === "super-admin") {
        const activeSuperAdmins = await Admin.countDocuments({
          role: "super-admin",
          isActive: true,
        });

        if (activeSuperAdmins <= 1) {
          return res.status(400).json({
            message: "You cannot deactivate the last active super-admin",
          });
        }
      }
    }

    updatedUser = await Admin.findByIdAndUpdate(
      id,
      { isActive: status === "active" },
      { new: true }
    ).select("-password");
  } else {
    return res.status(400).json({ message: "Unsupported userType" });
  }

  if (!updatedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json({
    success: true,
    message: "User status updated successfully",
    data: {
      id: updatedUser._id,
      userType,
      status: AdminUserFactory.normalizeStatus(updatedUser, userType),
    },
  });
});

export const getAdminContents = asyncHandler(async (req, res) => {
  const admin = req.user;
  if (!ensureAdminAccess(admin)) {
    return res.status(403).json({
      message: "Unauthorized: You do not have permission to access this resource",
    });
  }

  const contentRows = await EducationContent.find({})
    .select("title topic type sourceName isPublished updatedAt createdAt")
    .sort({ updatedAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: contentRows.length,
    data: contentRows,
  });
});

// approve therapist account by admin
export const approveTherapist = asyncHandler(async (req, res) => {
  try {
    // console.log("Request params:", req.params.id);
    // console.log("Request query:", req.query);
    // console.log("Request body:", req.body);

    const therapistId = req.params.id;
    const adminId = req.user._id;

    // console.log(
    //   `Attempting to approve therapist. TherapistId: ${therapistId}, AdminId: ${adminId}`
    // );

    if (!therapistId) {
      throw new Error("TherapistId is required");
    }

    const updatedTherapist = await AdminService.approveTherapistAccount(
      adminId,
      therapistId,
      req
    );

    // console.log(`Therapist approved successfully: ${updatedTherapist.email}`);

    res.status(200).json({
      success: true,
      message: "Therapist account approved successfully",
      data: {
        therapistId: updatedTherapist._id,
        email: updatedTherapist.email,
        isVerified: updatedTherapist.isVerified,
      },
    });
  } catch (error) {
    // console.error(`Error in approveTherapist: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// deactivate therapist account by admin

export const disapproveTherapist = asyncHandler(async (req, res) => {
  try {
    const therapistId = req.params.id;
    const adminId = req.user._id;

    // console.log(
    //   `Attempting to disapprove therapist. TherapistId: ${therapistId}, AdminId: ${adminId}`
    // );

    if (!therapistId) {
      throw new Error("TherapistId is required");
    }

    const updatedTherapist = await AdminService.deactivateTherapistAccount(
      adminId,
      therapistId
    );

    // console.log(
    //   `Therapist disapproved successfully: ${updatedTherapist.email}`
    // );

    res.status(200).json({
      success: true,
      message: "Therapist account disapproved successfully",
      data: {
        therapistId: updatedTherapist.therapistId,
        email: updatedTherapist.email,
        isVerified: updatedTherapist.isVerified,
      },
    });
  } catch (error) {
    console.error(`Error in disapproveTherapist: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// get a therapist stats
export const getTherapistStats = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user._id;
    const therapistId = req.params.id;

    const stats = await AdminService.getTherapistStatistics(
      adminId,
      therapistId
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error(`Error in getTherapistStats: ${error.message}`);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export const getTherapistAppointments = asyncHandler(async (req, res) => {
  try {
    const { therapistId } = req.params;
    let { page, limit } = req.query;

    // Ensure page and limit are valid numbers
    page = Math.max(1, parseInt(page) || 1);
    limit = Math.max(1, Math.min(100, parseInt(limit) || 10));

    const adminId = req.user._id;

    const result = await AdminService.getTherapistAppointments(
      adminId,
      therapistId,
      page,
      limit
    );

    res.status(200).json({
      success: true,
      message: "Therapist appointments retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in getTherapistAppointments controller:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});
