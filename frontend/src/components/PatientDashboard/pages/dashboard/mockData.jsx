import { FaHeart, FaRunning, FaAppleAlt, FaBed } from "react-icons/fa";

export const mockPatient = {
  firstName: "Jane",
  lastName: "Doe",
  age: 32,
  bloodType: "A+",
  height: 165,
  weight: 60,
  city: "New York",
  country: "USA",
  profilePic: "https://randomuser.me/api/portraits/women/65.jpg",
  upcomingAppointments: [
    {
      id: 1,
      date: "2024-08-15",
      time: "10:00 AM",
      doctor: "Dr. Smith",
      specialty: "General Practitioner",
    },
    {
      id: 2,
      date: "2024-08-22",
      time: "2:30 PM",
      doctor: "Dr. Johnson",
      specialty: "Cardiologist",
    },
  ],
  appointmentHistory: [
    {
      id: 3,
      date: "2024-07-01",
      doctor: "Dr. Brown",
      specialty: "Dermatologist",
      notes: "Annual skin check",
    },
    {
      id: 4,
      date: "2024-06-15",
      doctor: "Dr. Davis",
      specialty: "Dentist",
      notes: "Routine cleaning",
    },
  ],
  medications: [
    { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
  ],
};

export const healthTips = [
  {
    title: "Stay Hydrated",
    content: "Drink at least 8 glasses of water daily for optimal health.",
    icon: <FaHeart className="text-3xl" />,
  },
  {
    title: "Exercise Regularly",
    content: "Aim for 30 minutes of moderate exercise 5 days a week.",
    icon: <FaRunning className="text-3xl" />,
  },
  {
    title: "Eat a Balanced Diet",
    content:
      "Include a variety of fruits, vegetables, whole grains, and lean proteins in your meals.",
    icon: <FaAppleAlt className="text-3xl" />,
  },
  {
    title: "Get Enough Sleep",
    content:
      "Aim for 7-9 hours of quality sleep each night for optimal health and recovery.",
    icon: <FaBed className="text-3xl" />,
  },
];
