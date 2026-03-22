import mongoose from "mongoose";
import Admin from "../models/admin.model.js";
import Therapist from "../models/therapist.model.js";
import Appointment from "../models/appointment.model.js";
import generateToken from "../utils/generateToken.js";
import { sendEmail } from "../utils/sendGridEmail.js";
import { therapistAccountStatusChangeTemplate } from "../utils/emailTemplates.js";

class AdminService {
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

      const statusOptions = [
        "Pending",
        "Accepted",
        "Declined",
        "Completed",
        "Cancelled",
        "Rescheduled",
        "Waiting for Payment",
      ];

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

  // Pay a therapist
}

export default AdminService;
