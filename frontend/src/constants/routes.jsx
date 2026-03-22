export const patientRoutes = [
  { path: "/patient/", name: "Dashboard" },
  { path: "/patient/home-care", name: "Assisted Home Care" },
  { path: "/patient/appointments", name: "Appointments" },
  { path: "/patient/profile", name: "Profile" },
];

export const therapistRoutes = [
  { path: "/therapist/", name: "Dashboard" },
  { path: "/therapist/availability", name: "Availability" },
  { path: "/therapist/appointments", name: "Appointments" },
  // { path: "/therapist/settings", name: "Settings" },
  // { path: "/therapist/profile", name: "Profile" },
];

export const adminRoutes = [
  { path: "/admin/", name: "MainDashboard" },
  { path: "/admin/content", name: "Content" },
  { path: "/admin/users", name: "Users" },
  { path: "/admin/bookings", name: "Bookings" },
  { path: "/admin/therapists", name: "Therapist" },
  // { path: "/therapist/settings", name: "Settings" },
  // { path: "/therapist/profile", name: "Profile" },
];
