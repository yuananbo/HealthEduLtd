import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import Therapist from "../models/therapist.model.js";
import Appointment from "../models/appointment.model.js";
import AppointmentService from "./appointment.service.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendGridEmail.js";
import { therapistAccountStatusChangeTemplate } from "../utils/emailTemplates.js";

class AdminService {
  static BOOKING_STATUS_OPTIONS = [
    "Pending",
    "Accepted",
    "Declined",
    "Completed",
    "Cancelled",
    "Rescheduled",
    "Waiting for Payment",
  ];

  static ensureValidObjectId(value, label = "resource") {
    if (!mongoose.isValidObjectId(value)) {
      const error = new Error(`Invalid ${label} id`);
      error.status = 400;
      throw error;
    }
  }

  static async createSuperAdmin(email, password, res) {
    try {
      const existingSuperAdmin = await Admin.findOne({ role: "super-admin" });
      if (existingSuperAdmin) {
        throw new Error("Super admin already exists");
      }

      const superAdmin = new Admin({
        email,
        password,
        role: "super-admin",
        userType: "admin",
      });

      const savedSuperAdmin = await superAdmin.save();

      const token = generateToken(
        savedSuperAdmin._id,
        savedSuperAdmin.userType,
        res
      );

      console.log(`Super admin created successfully: ${savedSuperAdmin.email}`);

      return { savedSuperAdmin, token };
    } catch (error) {
      console.log("Error in AdminService.createSuperAdmin", error);
      throw error;
    }
  }

  // create an Admin by a super admin
  static async createAdmin(creatorId, newAdminData) {
    try {
      // Find the creator (should be a super admin)
      const creator = await Admin.findById(creatorId);
      if (!creator || creator.role !== "super-admin") {
        throw new Error("Unauthorized: Only super-admin can create an admin");
      }

      const { email, password } = newAdminData;

      const admin = new Admin({
        email,
        password,
        role: "admin",
        userType: "admin",
        createdBy: creatorId,
      });

      const savedAdmin = await admin.save();

      console.log(`Admin created successfully: ${savedAdmin.email}`);

      return savedAdmin;
    } catch (error) {
      console.log("Error in AdminService.createAdmin", error);
      throw error;
    }
  }

  // login admin || super-admin
  static async loginAdmin({ email, password, res }) {
    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        throw new Error(
          "admin not found. Please check your email and password"
        );
      }

      // Check if the account is locked
      if (admin.lockUntil && admin.lockUntil > Date.now()) {
        const waitTime = Math.ceil((admin.lockUntil - Date.now()) / 1000 / 60);
        throw new Error(
          `Account is locked. Please try again after ${waitTime} minutes.`
        );
      }

      const isPasswordValid = await admin.matchPassword(password);

      if (!isPasswordValid) {
        const nextAttemptCount = (admin.loginAttempts || 0) + 1;

        // Increment login attempts
        await admin.incrementLoginAttempts();

        console.log("Login attempts", nextAttemptCount);

        if (nextAttemptCount >= 5) {
          throw new Error(
            "Too many failed attempts. Account locked for 30 minutes."
          );
        }

        throw new Error(
          "Invalid login credentials. Please check your credentials"
        );
      }

      // Reset login attempts on successful login
      await Admin.updateOne(
        { _id: admin._id },
        {
          $set: { loginAttempts: 0 },
          $unset: { lockUntil: 1 },
        }
      );

      // Update last login
      await Admin.updateOne({ _id: admin._id }, { lastLogin: new Date() });
      // Generate token
      const token = generateToken(admin._id, admin.userType, res);

      return { admin, token };
    } catch (error) {
      console.log("Error in AdminService.loginAdmin", error);
      throw error;
    }
  }

  // approve therapist account by either super-admin or admin after verifying the therapist details
  static async approveTherapistAccount(adminId, therapistId, req) {
    try {
      console.log(
        `Starting approval process. AdminId: ${adminId}, TherapistId: ${therapistId}`
      );

      const admin = await Admin.findById(adminId);
      if (!admin) {
        console.log(`Admin not found with ID: ${adminId}`);
        throw new Error("Admin not found");
      }

      console.log(`Admin found: ${admin.email}`);

      if (
        admin.role !== "super-admin" &&
        admin.role !== "admin" &&
        admin.userType !== "admin"
      ) {
        console.log(`Unauthorized access attempt by admin: ${admin.email}`);
        throw new Error("Unauthorized: Only super-admin or admin can approve");
      }

      console.log(`Searching for therapist with ID: ${therapistId}`);
      const therapist = await Therapist.findById(therapistId);

      if (!therapist) {
        console.log(`Therapist not found with ID: ${therapistId}`);
        throw new Error("Therapist not found");
      }

      console.log(`Therapist found: ${therapist.email}`);

      if (therapist.isVerified) {
        throw new Error("Therapist account is already approved");
      }

      if (therapist.active === false) {
        throw new Error(
          "This therapist haven't verified their email yet. Account can't be approved"
        );
      }

      // check that therapist has uploaded all required documents
      if (
        !therapist.cv ||
        !therapist.licenseDocument ||
        !therapist.profilePicture
      ) {
        throw new Error("Therapist has not uploaded all required documents");
      }

      therapist.isVerified = true;
      await therapist.save();

      const baseURL = `${req.protocol}://${req.get("host")}`;
      const link = `${baseURL}/api/v1/therapist/`;

      // send email to therapist after account approval
      const therapistDetails = await Therapist.findById(therapistId);

      const accountApprovalEmailData = {
        recipientEmail: therapistDetails.email,
        subject: "Account Approval",
        htmlContent: therapistAccountStatusChangeTemplate({
          template_data: {
            isVerified: therapistDetails.isVerified,
            name: therapistDetails.firstName,
            link: link,
          },
        }),
        template_data: {
          isVerified: therapistDetails.isVerified,
          name: therapistDetails.firstName,
        },
      };

      const emailResponse = await sendEmail(accountApprovalEmailData);

      return { therapist, emailResponse };
    } catch (error) {
      console.log("Error in AdminService.approveTherapistAccount", error);
      throw error;
    }
  }

  // deactivate therapist account by either super-admin or admin
  static async deactivateTherapistAccount(adminId, therapistId, req) {
    try {
      const admin = await Admin.findById(adminId);
      if (!admin) {
        throw new Error("Admin not found");
      }

      if (
        admin.role !== "super-admin" &&
        admin.role !== "admin" &&
        admin.userType !== "admin"
      ) {
        throw new Error(
          "Unauthorized: Only super-admin or admin can deactivate"
        );
      }
      const therapist = await Therapist.findById(therapistId);

      if (!therapist) {
        throw new Error("Therapist not found");
      }

      if (!therapist.isVerified) {
        throw new Error("Therapist account is already deactivated");
      }

      therapist.isVerified = false;
      await therapist.save();

      const therapistDetails = await Therapist.findById(therapistId);

      const accountApprovalEmailData = {
        recipientEmail: therapistDetails.email,
        subject: "Account Updates",
        htmlContent: therapistAccountStatusChangeTemplate({
          template_data: {
            isVerified: therapistDetails.isVerified,
            name: therapistDetails.firstName,
          },
        }),
        template_data: {
          isVerified: therapistDetails.isVerified,
          name: therapistDetails.firstName,
        },
      };

      const emailResponse = await sendEmail(accountApprovalEmailData);

      return { therapist, emailResponse };
    } catch (error) {
      console.log("Error in AdminService.deactivateTherapistAccount", error);
      throw error;
    }
  }

  // get Therapist details from their ID by either super-admin or admin
  static async getTherapistDetails(adminId, therapistId) {
    try {
      AdminService.ensureValidObjectId(adminId, "admin");
      AdminService.ensureValidObjectId(therapistId, "therapist");
      const admin = await Admin.findById(adminId);
      if (!admin) {
        throw new Error("Admin not found");
      }

      if (
        admin.role !== "super-admin" &&
        admin.role !== "admin" &&
        admin.userType !== "admin"
      ) {
        throw new Error(
          "Unauthorized: Only super-admin or admin can get Therapist details"
        );
      }

      const therapist = await Therapist.findById(therapistId).select(
        "-password"
      );

      if (!therapist) {
        throw new Error("Therapist not found");
      }

      return therapist;
    } catch (error) {
      console.log("Error in AdminService.getTherapistDetails", error);
      throw error;
    }
  }

  // get a therapist statistics
  static async getTherapistStatistics(adminId, therapistId) {
    try {
      AdminService.ensureValidObjectId(adminId, "admin");
      AdminService.ensureValidObjectId(therapistId, "therapist");
      const admin = await Admin.findById(adminId);
      if (!admin || (admin.role !== "super-admin" && admin.role !== "admin")) {
        throw new Error(
          "Unauthorized: Only super-admin or admin can access this resource"
        );
      }
      const therapistObjectId = new mongoose.Types.ObjectId(
        therapistId.toString()
      );

      const therapistStats = await Appointment.aggregate([
        { $match: { therapist: therapistObjectId } },
        {
          $group: {
            _id: "$therapist",
            totalAppointments: { $sum: 1 },
            appointmentStatusCounts: {
              $push: "$status",
            },
            appointmentIds: { $push: "$_id" },
          },
        },
        {
          $lookup: {
            from: "payments",
            let: { appointmentIds: "$appointmentIds" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $in: ["$appointment", "$$appointmentIds"] },
                      { $eq: ["$status", "success"] },
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: "$currency",
                  totalAmount: { $sum: "$amount" },
                },
              },
              {
                $project: {
                  _id: 0,
                  currency: "$_id",
                  totalAmount: 1,
                },
              },
            ],
            as: "paymentInfo",
          },
        },
        {
          $lookup: {
            from: "therapists",
            localField: "_id",
            foreignField: "_id",
            as: "therapistInfo",
          },
        },
        { $unwind: "$therapistInfo" },
        {
          $project: {
            therapistId: "$therapistInfo.therapistId",
            name: {
              $concat: [
                "$therapistInfo.firstName",
                " ",
                "$therapistInfo.lastName",
              ],
            },
            totalAppointments: 1,
            appointmentStatusCounts: {
              $arrayToObject: {
                $map: {
                  input: [
                    "Pending",
                    "Accepted",
                    "Declined",
                    "Completed",
                    "Cancelled",
                    "Rescheduled",
                    "Waiting for Payment",
                  ],
                  as: "status",
                  in: {
                    k: "$$status",
                    v: {
                      $size: {
                        $filter: {
                          input: "$appointmentStatusCounts",
                          cond: { $eq: ["$$this", "$$status"] },
                        },
                      },
                    },
                  },
                },
              },
            },
            paymentInfo: {
              $cond: {
                if: { $eq: [{ $size: "$paymentInfo" }, 0] },
                then: [{ currency: "N/A", totalAmount: 0 }],
                else: "$paymentInfo",
              },
            },
            averageRating: { $ifNull: [{ $avg: "$therapistInfo.ratings" }, 0] },
            completionRate: {
              $cond: [
                { $eq: ["$totalAppointments", 0] },
                0,
                {
                  $divide: [
                    {
                      $size: {
                        $filter: {
                          input: "$appointmentStatusCounts",
                          cond: { $eq: ["$$this", "Completed"] },
                        },
                      },
                    },
                    "$totalAppointments",
                  ],
                },
              ],
            },
          },
        },
      ]);

      if (therapistStats.length === 0) {
        return {
          therapistId: therapistObjectId,
          name: "Unknown",
          totalAppointments: 0,
          appointmentStatusCounts: {
            Pending: 0,
            Accepted: 0,
            Declined: 0,
            Completed: 0,
            Cancelled: 0,
            Rescheduled: 0,
            "Waiting for Payment": 0,
          },
          paymentInfo: [{ currency: "N/A", totalAmount: 0 }],
          averageRating: 0,
          completionRate: 0,
        };
      }

      return therapistStats[0];
    } catch (error) {
      console.log("Error in AdminService.getTherapistStatistics", error);
      throw error;
    }
  }

  // get therapist appointment
  static async getTherapistAppointments(adminId, therapistId, page, limit) {
    try {
      AdminService.ensureValidObjectId(adminId, "admin");
      AdminService.ensureValidObjectId(therapistId, "therapist");
      const admin = await Admin.findById(adminId);
      if (!admin || (admin.role !== "super-admin" && admin.role !== "admin")) {
        throw new Error(
          "Unauthorized: Only super-admin or admin can access this resource"
        );
      }

      const therapistObjectId = new mongoose.Types.ObjectId(therapistId);

      // Ensure page and limit are valid integers
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));

      const skip = (pageNum - 1) * limitNum;

      const statusOptions = AdminService.BOOKING_STATUS_OPTIONS;

      const [result] = await Appointment.aggregate([
        { $match: { therapist: therapistObjectId } },
        {
          $facet: {
            stats: [
              {
                $group: {
                  _id: null,
                  totalAppointments: { $sum: 1 },
                  statusCounts: {
                    $push: "$status",
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  totalAppointments: 1,
                  statusCounts: {
                    $arrayToObject: {
                      $map: {
                        input: statusOptions,
                        as: "status",
                        in: {
                          k: "$$status",
                          v: {
                            $size: {
                              $filter: {
                                input: "$statusCounts",
                                cond: { $eq: ["$$this", "$$status"] },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            ],
            appointments: [
              {
                $lookup: {
                  from: "patients",
                  localField: "patient",
                  foreignField: "_id",
                  as: "patientInfo",
                },
              },
              { $unwind: "$patientInfo" },
              {
                $project: {
                  _id: 1,
                  date: 1,
                  time: 1,
                  status: 1,
                  patientInfo: {
                    fullName: {
                      $concat: [
                        "$patientInfo.firstName",
                        " ",
                        "$patientInfo.lastName",
                      ],
                    },
                    email: "$patientInfo.email",
                  },
                },
              },
              { $sort: { date: -1, time: -1 } },
              { $skip: skip },
              { $limit: limitNum },
            ],
          },
        },
      ]);

      const totalAppointments = result.stats[0]?.totalAppointments || 0;
      const totalPages = Math.ceil(totalAppointments / limitNum);

      return {
        appointments: result.appointments,
        stats: result.stats[0] || { totalAppointments: 0, statusCounts: {} },
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalAppointments,
          itemsPerPage: limitNum,
        },
      };
    } catch (error) {
      console.log("Error in AdminService.getTherapistAppointments", error);
      throw error;
    }
  }

  static async getAdminBookings(adminId, query = {}) {
    try {
      AdminService.ensureValidObjectId(adminId, "admin");
      const admin = await Admin.findById(adminId);
      if (!admin || (admin.role !== "super-admin" && admin.role !== "admin")) {
        throw new Error(
          "Unauthorized: Only super-admin or admin can access this resource"
        );
      }

      const {
        search = "",
        status = "all",
        page = 1,
        limit = 10,
        sortOrder = "desc",
      } = query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * limitNum;
      const normalizedSearch =
        typeof search === "string" ? search.trim().slice(0, 100) : "";
      const normalizedStatus =
        status === "all" || AdminService.BOOKING_STATUS_OPTIONS.includes(status)
          ? status
          : "all";
      const normalizedSortOrder = sortOrder === "asc" ? "asc" : "desc";

      const filters = {};
      if (normalizedStatus !== "all") {
        filters.status = normalizedStatus;
      }

      const searchRegex = normalizedSearch
        ? new RegExp(normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
        : null;

      const aggregationPipeline = [
        { $match: filters },
        {
          $lookup: {
            from: "patients",
            localField: "patient",
            foreignField: "_id",
            as: "patientInfo",
          },
        },
        {
          $lookup: {
            from: "therapists",
            localField: "therapist",
            foreignField: "_id",
            as: "therapistInfo",
          },
        },
        {
          $unwind: {
            path: "$patientInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: "$therapistInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
      ];

      if (searchRegex) {
        aggregationPipeline.push({
          $match: {
            $or: [
              { service: searchRegex },
              { status: searchRegex },
              { time: searchRegex },
              { purpose: searchRegex },
              { "patientInfo.firstName": searchRegex },
              { "patientInfo.lastName": searchRegex },
              { "patientInfo.email": searchRegex },
              { "therapistInfo.firstName": searchRegex },
              { "therapistInfo.lastName": searchRegex },
              { "therapistInfo.email": searchRegex },
            ],
          },
        });
      }

      const [result] = await Appointment.aggregate([
        ...aggregationPipeline,
        {
          $facet: {
            metadata: [{ $count: "total" }],
            bookings: [
              {
                $sort: {
                  date: normalizedSortOrder === "asc" ? 1 : -1,
                  time: normalizedSortOrder === "asc" ? 1 : -1,
                  createdAt: normalizedSortOrder === "asc" ? 1 : -1,
                },
              },
              { $skip: skip },
              { $limit: limitNum },
              {
                $project: {
                  _id: 1,
                  date: 1,
                  time: 1,
                  status: 1,
                  service: 1,
                  appointmentType: 1,
                  purpose: 1,
                  createdAt: 1,
                  updatedAt: 1,
                  patient: {
                    id: "$patientInfo._id",
                    fullName: {
                      $trim: {
                        input: {
                          $concat: [
                            { $ifNull: ["$patientInfo.firstName", ""] },
                            " ",
                            { $ifNull: ["$patientInfo.lastName", ""] },
                          ],
                        },
                      },
                    },
                    email: "$patientInfo.email",
                  },
                  therapist: {
                    id: "$therapistInfo._id",
                    fullName: {
                      $trim: {
                        input: {
                          $concat: [
                            { $ifNull: ["$therapistInfo.firstName", ""] },
                            " ",
                            { $ifNull: ["$therapistInfo.lastName", ""] },
                          ],
                        },
                      },
                    },
                    email: "$therapistInfo.email",
                  },
                },
              },
            ],
            statusBreakdown: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]);

      const total = result?.metadata?.[0]?.total || 0;
      const totalPages = Math.max(1, Math.ceil(total / limitNum));
      const statusCounts = AdminService.BOOKING_STATUS_OPTIONS.reduce(
        (accumulator, option) => ({
          ...accumulator,
          [option]: 0,
        }),
        {}
      );

      for (const entry of result?.statusBreakdown || []) {
        statusCounts[entry._id] = entry.count;
      }

      return {
        bookings: result?.bookings || [],
        filters: {
          search: normalizedSearch,
          status: normalizedStatus,
          sortOrder: normalizedSortOrder,
        },
        stats: {
          total,
          statusCounts,
        },
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
        },
      };
    } catch (error) {
      console.log("Error in AdminService.getAdminBookings", error);
      throw error;
    }
  }

  static async getAdminBookingById(adminId, bookingId) {
    try {
      AdminService.ensureValidObjectId(adminId, "admin");
      AdminService.ensureValidObjectId(bookingId, "booking");
      const admin = await Admin.findById(adminId);
      if (!admin || (admin.role !== "super-admin" && admin.role !== "admin")) {
        throw new Error(
          "Unauthorized: Only super-admin or admin can access this resource"
        );
      }

      const booking = await Appointment.findById(bookingId)
        .populate("patient", "firstName lastName email phoneNumber")
        .populate(
          "therapist",
          "firstName lastName email phoneNumber specialization"
        )
        .lean();

      if (!booking) {
        const notFoundError = new Error("Booking not found");
        notFoundError.status = 404;
        throw notFoundError;
      }

      if (!booking.statusHistory || booking.statusHistory.length === 0) {
        booking.statusHistory = [
          {
            status: booking.status,
            fromStatus: "",
            changedAt: booking.createdAt || new Date(),
            source: "legacy-record",
            reason: "Status history unavailable for older record",
            changedBy: {
              userId: booking.patient?._id || null,
              userType: "patient",
              name:
                `${booking?.patient?.firstName || ""} ${booking?.patient?.lastName || ""}`.trim() ||
                booking?.patient?.email ||
                "Unknown",
            },
          },
        ];
      }

      return booking;
    } catch (error) {
      console.log("Error in AdminService.getAdminBookingById", error);
      throw error;
    }
  }

  static async updateAdminBookingStatus(adminId, bookingId, status, req) {
    try {
      AdminService.ensureValidObjectId(adminId, "admin");
      AdminService.ensureValidObjectId(bookingId, "booking");
      const admin = await Admin.findById(adminId);
      if (!admin || (admin.role !== "super-admin" && admin.role !== "admin")) {
        throw new Error(
          "Unauthorized: Only super-admin or admin can access this resource"
        );
      }

      const booking = await Appointment.findById(bookingId);
      if (!booking) {
        const notFoundError = new Error("Booking not found");
        notFoundError.status = 404;
        throw notFoundError;
      }

      const result = await AppointmentService.updateAppointmentStatus(
        bookingId,
        status,
        req
      );

      return result;
    } catch (error) {
      console.log("Error in AdminService.updateAdminBookingStatus", error);
      throw error;
    }
  }

  // Pay a therapist
}

export default AdminService;
