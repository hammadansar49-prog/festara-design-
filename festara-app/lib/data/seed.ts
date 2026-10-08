import type { Store } from "./mock";

/** Sample data from the brand book. All sign-ins use the password festara123. */
export function seedStore(store: Store): Store {
  const pw = "festara123";
  store.users.push(
    { id: "u-rashid", fullName: "Rashid Mehmood", email: "rashid@example.com", phone: "0300 1234567", password: pw },
    { id: "u-hamza", fullName: "Hamza Rashid", email: "hamza@example.com", phone: null, password: pw },
    { id: "u-sana", fullName: "Sana Rashid", email: "sana@example.com", phone: null, password: pw },
    { id: "u-tariq", fullName: "Tariq Mehmood", email: "tariq@example.com", phone: null, password: pw },
    { id: "u-areeba", fullName: "Areeba Khan", email: "areeba@example.com", phone: null, password: pw },
  );
  const at = "2026-10-01T09:00:00.000Z";
  store.events.push(
    { id: "e-mehndi", name: "Ayesha's Mehndi", type: "mehndi", eventDate: "2026-12-14", location: "Lahore",
      description: "Family only. Dholki at 7, dinner at 9.", totalBudget: 500000, coverColor: "mehndi", createdBy: "u-rashid", createdAt: at },
    { id: "e-naran", name: "Naran Trip", type: "trip", eventDate: "2027-06-20", location: "Naran, Khyber Pakhtunkhwa",
      description: null, totalBudget: 150000, coverColor: "sky", createdBy: "u-hamza", createdAt: at },
    { id: "e-fest", name: "Spring Tech Fest 2027", type: "university_event", eventDate: "2027-03-20", location: "Main Hall, Multan",
      description: null, totalBudget: 350000, coverColor: "night", createdBy: "u-areeba", createdAt: at },
  );
  store.members.push(
    { eventId: "e-mehndi", userId: "u-rashid", role: "admin", joinedAt: at },
    { eventId: "e-mehndi", userId: "u-hamza", role: "member", joinedAt: at },
    { eventId: "e-mehndi", userId: "u-sana", role: "member", joinedAt: at },
    { eventId: "e-mehndi", userId: "u-tariq", role: "guest", joinedAt: at },
    { eventId: "e-naran", userId: "u-hamza", role: "admin", joinedAt: at },
    { eventId: "e-naran", userId: "u-rashid", role: "member", joinedAt: at },
    { eventId: "e-fest", userId: "u-areeba", role: "admin", joinedAt: at },
    { eventId: "e-fest", userId: "u-rashid", role: "member", joinedAt: at },
  );
  return store;
}
