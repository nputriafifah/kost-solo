import {
  Wifi, Thermometer, ShowerHead, Car, Tv, Utensils,
  Dumbbell, WashingMachine, Package, Droplets, Coffee,
  Zap, TreePine, BookOpen, Lock, Home, Wind,
} from "lucide-react";

const facilityMap = [
  { keys: ["wifi", "internet"], Icon: Wifi, color: "#2563EB", bg: "#EFF6FF" },
  { keys: ["ac", "kipas", "pendingin"], Icon: Thermometer, color: "#0EA5E9", bg: "#F0F9FF" },
  { keys: ["mandi", "shower", "kamar mandi", "water heater", "water heter", "pemanas air", "toilet", "kloset", "closet duduk", "toilet duduk", "wc", "wastafel", "sink", "bathtub", "bak mandi", "hand shower", "shower head", "bidet"], Icon: ShowerHead, color: "#7C3AED", bg: "#F5F3FF" },
  { keys: ["parkir", "motor", "mobil", "garasi"], Icon: Car, color: "#D97706", bg: "#FFFBEB" },
  { keys: ["tv", "televisi"], Icon: Tv, color: "#DC2626", bg: "#FEF2F2" },
  { keys: ["dapur", "masak", "kompor"], Icon: Utensils, color: "#059669", bg: "#ECFDF5" },
  { keys: ["gym", "olahraga", "fitness"], Icon: Dumbbell, color: "#EA580C", bg: "#FFF7ED" },
  { keys: ["laundry", "cuci", "mesin cuci"], Icon: WashingMachine, color: "#4F46E5", bg: "#EEF2FF" },
  { keys: ["lemari", "kabinet", "almari", "meja", "kasur", "kursi"], Icon: Package, color: "#65A30D", bg: "#F7FEE7" },
  { keys: ["air minum", "galon", "dispenser"], Icon: Droplets, color: "#0284C7", bg: "#F0F9FF" },
  { keys: ["kopi", "cafe"], Icon: Coffee, color: "#92400E", bg: "#FEF3C7" },
  { keys: ["listrik", "token", "pln"], Icon: Zap, color: "#CA8A04", bg: "#FEFCE8" },
  { keys: ["taman", "garden", "hijau", "jemur"], Icon: TreePine, color: "#16A34A", bg: "#F0FDF4" },
  { keys: ["buku", "perpustakaan", "belajar"], Icon: BookOpen, color: "#6D28D9", bg: "#F5F3FF" },
  { keys: ["kunci", "keamanan", "security", "cctv"], Icon: Lock, color: "#374151", bg: "#F9FAFB" },
  { keys: ["ruang tamu", "tamu"], Icon: Home, color: "#0369A1", bg: "#E0F2FE" },
  { keys: ["kulkas"], Icon: Wind, color: "#0891B2", bg: "#ECFEFF" },
];

export function getFacilityStyle(name = "") {
  const n = name.toLowerCase();
  const m = facilityMap.find((f) => f.keys.some((k) => n.includes(k)));
  return m || { Icon: Home, color: "#6B7280", bg: "#F9FAFB" };
}
