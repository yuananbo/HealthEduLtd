/**
 * Factory Pattern: AdminUserFactory centralizes how different user models
 * (patient, therapist, admin) are transformed into admin-facing payloads.
 *
 * Why this pattern is used here:
 * The admin module needs to display several user types through one unified UI,
 * but each type has different fields and status rules.
 *
 * What problem it solves:
 * Without a factory, the controller would keep growing with repeated
 * conditional mapping logic for each user type in both list and detail views.
 *
 * How it improves extensibility and maintainability:
 * New user roles such as care coordinator can be added by introducing one new
 * factory branch instead of rewriting controller logic across multiple routes.
 */
class AdminUserFactory {
  static normalizeStatus(user, userType) {
    // The admin UI works with one shared status vocabulary even though
    // underlying models store status differently across user types.
    if (userType === "patient") {
      return user.isActive === false ? "inactive" : "active";
    }

    if (userType === "therapist") {
      return user.active ? (user.isVerified ? "active" : "pending") : "inactive";
    }

    return user.isActive ? "active" : "inactive";
  }

  static createListRow(user, userType) {
    // Admin rows must be role-aware so "super-admin" is not flattened into
    // a generic "admin" label in the management table.
    const normalizedType =
      userType === "admin" ? user.role || user.userType || "admin" : userType;

    return {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      userType: normalizedType,
      status: this.normalizeStatus(user, userType),
      lastLoginAt: user.lastLogin || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static createDetailPayload(user, userType, metadata = {}) {
    // Each branch exposes a common page contract while preserving the fields
    // that matter to that specific user type.
    if (userType === "patient") {
      return {
        id: user._id,
        userType: "patient",
        fullName: `${user.firstName} ${user.lastName}`,
        basicInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          alternativePhoneNumber: user.guardianPhoneNumber || "",
          profilePicture: user.profilePicture || "",
          address: user.address || {},
          userType: "patient",
        },
        accountInfo: {
          status: this.normalizeStatus(user, "patient"),
          isActive: user.isActive !== false,
          isVerified: true,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLogin || null,
        },
        businessInfo: {
          patientId: user.patientId,
          appointmentCount: metadata.appointmentCount || 0,
          savedContentCount: user.savedEducationContents?.length || 0,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          age: user.age,
          height: user.height,
          weight: user.weight,
          bloodType: user.bloodType,
          medicalHistory: user.medicalHistory || [],
        },
      };
    }

    if (userType === "therapist") {
      return {
        id: user._id,
        userType: "therapist",
        fullName: `${user.firstName} ${user.lastName}`,
        basicInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          alternativePhoneNumber: user.alternativePhoneNumber || "",
          profilePicture: user.profilePicture || "",
          address: user.address || {},
          userType: "therapist",
        },
        accountInfo: {
          status: this.normalizeStatus(user, "therapist"),
          isActive: user.active,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLoginAt: user.lastLogin || null,
        },
        businessInfo: {
          therapistId: user.therapistId,
          profession: user.profession,
          specialization: user.specialization,
          bio: user.bio,
          numOfYearsOfExperience: user.numOfYearsOfExperience,
          licenseNumber: user.licenseNumber,
          licenseDocument: user.licenseDocument || "",
          cv: user.cv || "",
          appointmentCount: metadata.appointmentCount || 0,
          documentUploadStatus: {
            hasProfilePicture: Boolean(user.profilePicture),
            hasCv: Boolean(user.cv),
            hasLicenseDocument: Boolean(user.licenseDocument),
          },
        },
      };
    }

    return {
      id: user._id,
      userType: user.role || "admin",
      fullName: `${user.firstName} ${user.lastName}`,
      basicInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        alternativePhoneNumber: "",
        profilePicture: user.profilePicture || "",
        address: {},
        userType: user.role || "admin",
      },
      accountInfo: {
        status: this.normalizeStatus(user, "admin"),
        isActive: user.isActive,
        isVerified: true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLogin || null,
      },
      businessInfo: {
        adminId: user.admindId,
        role: user.role,
        permissions: user.permissions || [],
      },
    };
  }
}

export default AdminUserFactory;
