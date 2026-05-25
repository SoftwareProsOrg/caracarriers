import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import {
  LoadStatus, CarrierStatus, InsuranceStatus, AuthorityStatus,
  EquipmentType, InvoiceStatus, DocumentType, DocumentStatus,
  LoadEventType, CarrierPaymentMethod,
} from "@prisma/client";

faker.seed(12345);

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function ri(min: number, max: number) { return faker.number.int({ min, max }); }
function pick<T>(arr: readonly T[]): T { return arr[ri(0, arr.length - 1)]; }
function pickDiff<T>(arr: readonly T[], exclude?: T): T {
  const f = exclude ? arr.filter((x) => x !== exclude) : arr;
  return pick(f);
}

const CARRIER_SUFFIXES = ["Trucking", "Transport", "Logistics", "Freight", "Hauling", "Carriers", "Express", "Distribution", "Lines", "Solutions"];
const SHIPPER_SUFFIXES = ["Inc", "LLC", "Corp", "Co", "Group", "Industries", "Enterprises", "Partners", "Supply", "Distributors"];
const EQUIPMENT = Object.values(EquipmentType);

const FREIGHT_HUBS = [
  { city: "Houston", state: "TX" }, { city: "Dallas", state: "TX" }, { city: "Chicago", state: "IL" },
  { city: "Atlanta", state: "GA" }, { city: "Los Angeles", state: "CA" }, { city: "Memphis", state: "TN" },
  { city: "Savannah", state: "GA" }, { city: "Newark", state: "NJ" }, { city: "Seattle", state: "WA" },
  { city: "Denver", state: "CO" }, { city: "Phoenix", state: "AZ" }, { city: "Portland", state: "OR" },
  { city: "Indianapolis", state: "IN" }, { city: "Nashville", state: "TN" }, { city: "Charlotte", state: "NC" },
  { city: "Columbus", state: "OH" }, { city: "Kansas City", state: "MO" }, { city: "Louisville", state: "KY" },
  { city: "Jacksonville", state: "FL" }, { city: "San Antonio", state: "TX" }, { city: "Philadelphia", state: "PA" },
  { city: "Mobile", state: "AL" }, { city: "Birmingham", state: "AL" }, { city: "Cleveland", state: "OH" },
  { city: "Long Beach", state: "CA" }, { city: "St. Louis", state: "MO" }, { city: "Tampa", state: "FL" },
  { city: "Raleigh", state: "NC" }, { city: "Salt Lake City", state: "UT" }, { city: "Omaha", state: "NE" },
  { city: "Richmond", state: "VA" }, { city: "Oklahoma City", state: "OK" }, { city: "Tulsa", state: "OK" },
  { city: "Des Moines", state: "IA" }, { city: "Boulder", state: "CO" }, { city: "Oakland", state: "CA" },
  { city: "Austin", state: "TX" }, { city: "Orlando", state: "FL" }, { city: "Miami", state: "FL" },
  { city: "Detroit", state: "MI" }, { city: "Milwaukee", state: "WI" }, { city: "Minneapolis", state: "MN" },
];

const COMMODITIES = [
  "General freight", "Fresh produce", "Electronics", "Auto parts", "Lumber",
  "Steel coils", "Furniture", "Packaged food", "Chemicals", "Pharmaceuticals",
  "Building materials", "Textiles", "Machinery", "Dairy products", "Frozen food",
  "Pet supplies", "Beverages", "Paper products", "Plastic resins", "Aerospace components",
  "Medical devices", "Appliances", "Tires", "Agricultural supplies",
  "Construction equipment", "Office supplies", "Solar panels", "Wine",
  "Canned goods", "Household goods", "Industrial equipment", "Craft beer",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const INDUSTRIES = [
  "Manufacturing", "Food & Beverage", "Retail", "Chemicals", "Construction",
  "Agriculture", "Automotive", "Electronics", "Pharmaceuticals", "Textiles",
  "Aerospace", "Medical", "Energy", "Steel & Metals", "Packaging",
  "Plastics", "Paper & Forest", "Wine & Spirits", "Furniture", "Appliances",
];

interface CarrierSeed {
  id: string; name: string; mcNumber: string; dotNumber: string;
  email: string; phone: string; address: string; city: string; state: string; zip: string;
  status: CarrierStatus; insuranceStatus: InsuranceStatus; insuranceExpiry?: Date;
  authorityStatus: AuthorityStatus; safetyRating?: string; rating: number; equipment: EquipmentType[];
}

function generateCarriers(count: number): CarrierSeed[] {
  const carriers: CarrierSeed[] = [];
  for (let i = 0; i < count; i++) {
    const idx = String(i + 1).padStart(3, "0");
    const lastName = faker.person.lastName();
    const suffix = pick(CARRIER_SUFFIXES);
    const st = pick(US_STATES);
    const statusRoll = Math.random();
    const status = statusRoll < 0.85 ? CarrierStatus.APPROVED
      : statusRoll < 0.93 ? CarrierStatus.PENDING
      : statusRoll < 0.98 ? CarrierStatus.SUSPENDED
      : CarrierStatus.REJECTED;
    const insRoll = Math.random();
    const insuranceStatus = insRoll < 0.80 ? InsuranceStatus.ACTIVE
      : insRoll < 0.92 ? InsuranceStatus.EXPIRING_SOON
      : InsuranceStatus.EXPIRED;
    const authRoll = Math.random();
    const authorityStatus = authRoll < 0.88 ? AuthorityStatus.ACTIVE
      : authRoll < 0.94 ? AuthorityStatus.INACTIVE
      : authRoll < 0.98 ? AuthorityStatus.SUSPENDED
      : AuthorityStatus.REVOKED;
    const safety = status === CarrierStatus.APPROVED
      ? (Math.random() < 0.7 ? "Satisfactory" : "Conditional")
      : undefined;
    const rating = status === CarrierStatus.APPROVED
      ? Number((3.0 + Math.random() * 2.0).toFixed(1))
      : 0;
    const numEquip = ri(1, 4);
    const shuffled = [...EQUIPMENT].sort(() => Math.random() - 0.5).slice(0, numEquip);
    carriers.push({
      id: `demo-carrier-${idx}`, name: `${lastName} ${suffix}`,
      mcNumber: `MC-${ri(100000, 999999)}`, dotNumber: `DOT-${ri(1000000, 9999999)}`,
      email: `dispatch@${lastName.toLowerCase()}${suffix.toLowerCase().replace(/\s/g, "")}.com`,
      phone: `(${ri(200, 999)}) 555-${String(ri(1000, 9999)).padStart(4, "0")}`,
      address: `${ri(100, 9999)} ${faker.location.street()}`, city: faker.location.city(), state: st, zip: faker.location.zipCode(),
      status, insuranceStatus,
      insuranceExpiry: insuranceStatus === InsuranceStatus.EXPIRING_SOON ? daysFromNow(ri(3, 45))
        : insuranceStatus === InsuranceStatus.EXPIRED ? daysAgo(ri(5, 90))
        : undefined,
      authorityStatus, safetyRating: safety, rating, equipment: shuffled,
    });
  }
  return carriers;
}

interface ShipperSeed {
  id: string; name: string; contactName: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string;
  creditLimit: number; paymentTerms: number; industry: string;
}

function generateShippers(count: number): ShipperSeed[] {
  const shippers: ShipperSeed[] = [];
  for (let i = 0; i < count; i++) {
    const idx = String(i + 1).padStart(3, "0");
    const industry = pick(INDUSTRIES);
    const companyName = `${faker.company.name()} ${pick(SHIPPER_SUFFIXES)}`;
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const st = pick(US_STATES);
    shippers.push({
      id: `demo-shipper-${idx}`, name: companyName,
      contactName: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      phone: `(${ri(200, 999)}) 555-${String(ri(1000, 9999)).padStart(4, "0")}`,
      address: `${ri(100, 9999)} ${faker.location.street()}`, city: faker.location.city(), state: st, zip: faker.location.zipCode(),
      creditLimit: pick([10000, 15000, 25000, 30000, 50000, 75000, 100000, 150000, 200000]),
      paymentTerms: pick([15, 30, 30, 30, 45, 60]), industry,
    });
  }
  return shippers;
}

interface LoadSeed {
  id: string; loadNumber: string; carrierIdx: number | null; shipperIdx: number;
  status: LoadStatus; equipmentType: EquipmentType;
  originCity: string; originState: string; destCity: string; destState: string;
  pickupDate: Date; deliveryDate: Date; shipperRate: number; carrierRate: number | null;
  miles: number; weight: number; commodity: string; hazmat?: boolean;
  pieces?: number; bolNumber?: string; poNumber?: string; proNumber?: string; notes?: string;
}

function generateLoads(count: number): LoadSeed[] {
  const loads: LoadSeed[] = [];
  const statusDistribution: { status: LoadStatus; pct: number }[] = [
    { status: LoadStatus.AVAILABLE, pct: 0.12 },
    { status: LoadStatus.BOOKED, pct: 0.10 },
    { status: LoadStatus.DISPATCHED, pct: 0.09 },
    { status: LoadStatus.IN_TRANSIT, pct: 0.14 },
    { status: LoadStatus.DELIVERED, pct: 0.45 },
    { status: LoadStatus.CANCELLED, pct: 0.07 },
    { status: LoadStatus.PROBLEM, pct: 0.03 },
  ];
  for (let i = 0; i < count; i++) {
    const idx = String(i + 1).padStart(3, "0");
    const roll = Math.random();
    let cum = 0;
    let status: LoadStatus = LoadStatus.AVAILABLE;
    for (const s of statusDistribution) { cum += s.pct; if (roll <= cum) { status = s.status; break; } }
    const origin = pick(FREIGHT_HUBS);
    const dest = pickDiff(FREIGHT_HUBS, origin);
    const eq = pick(EQUIPMENT);
    const miles = ri(50, 2500);
    const weight = ri(5000, 48000);
    const ratePerMile = 1.50 + Math.random() * 2.50;
    const shipperRate = Math.round(miles * ratePerMile);
    let pickupDate: Date, deliveryDate: Date;
    switch (status) {
      case LoadStatus.IN_TRANSIT: pickupDate = daysAgo(ri(0, 2)); deliveryDate = daysFromNow(ri(0, 2)); break;
      case LoadStatus.DISPATCHED: pickupDate = daysFromNow(0); deliveryDate = daysFromNow(ri(1, 3)); break;
      case LoadStatus.BOOKED: pickupDate = daysFromNow(ri(1, 3)); deliveryDate = daysFromNow(ri(3, 7)); break;
      case LoadStatus.AVAILABLE: pickupDate = daysFromNow(ri(1, 5)); deliveryDate = daysFromNow(ri(3, 10)); break;
      case LoadStatus.DELIVERED: pickupDate = daysAgo(ri(3, 60)); deliveryDate = daysAgo(ri(1, 55)); if (deliveryDate >= pickupDate) { deliveryDate = new Date(pickupDate.getTime() - ri(1, 3) * 86400000); } break;
      case LoadStatus.CANCELLED: pickupDate = daysAgo(ri(5, 60)); deliveryDate = daysAgo(ri(2, 55)); break;
      case LoadStatus.PROBLEM: pickupDate = daysAgo(ri(0, 3)); deliveryDate = daysFromNow(ri(0, 3)); break;
      default: pickupDate = daysFromNow(ri(1, 5)); deliveryDate = daysFromNow(ri(3, 10));
    }
    if (deliveryDate <= pickupDate) { deliveryDate = new Date(pickupDate.getTime() + ri(1, 5) * 86400000); }
    const assigned = status !== LoadStatus.AVAILABLE && status !== LoadStatus.CANCELLED;
    const carrierRate = assigned ? Math.round(shipperRate * (0.60 + Math.random() * 0.25)) : null;
    const hazmat = Math.random() < 0.05;
    const commodity = pick(COMMODITIES);
    const pieces = eq === EquipmentType.BOX_TRUCK ? ri(1, 50) : eq === EquipmentType.FLATBED ? ri(1, 20) : ri(100, 1500);
    loads.push({
      id: `demo-load-${idx}`, loadNumber: `LD-${String(1000 + i + 1).slice(1)}`,
      carrierIdx: assigned ? ri(0, 59) : null, shipperIdx: ri(0, 324),
      status, equipmentType: eq,
      originCity: origin.city, originState: origin.state,
      destCity: dest.city, destState: dest.state,
      pickupDate, deliveryDate, shipperRate, carrierRate,
      miles, weight, commodity, hazmat, pieces,
      bolNumber: Math.random() < 0.7 ? `BOL-${String(ri(10000, 99999)).padStart(5, "0")}` : undefined,
      poNumber: Math.random() < 0.5 ? `PO-${new Date().getFullYear()}-${String(ri(100, 9999)).padStart(4, "0")}` : undefined,
      proNumber: Math.random() < 0.3 ? `PRO-${String(ri(100000, 999999)).padStart(6, "0")}` : undefined,
      notes: status === LoadStatus.PROBLEM ? pick(["Breakdown awaiting repairs", "Driver HOS violation", "Weather delay", "Customer refused delivery", "Paperwork issues at pickup"]) : status === LoadStatus.CANCELLED ? pick(["Shipper cancelled order", "No carrier found", "Weather cancellation", "Customer changed plans"]) : Math.random() < 0.15 ? pick(["Drop trailer at dock 7", "Appointment required", "Lumper fee applies", "Team drive preferred", "Live load/unload"]) : undefined,
    });
  }
  return loads;
}

async function main() {
  const companyArg = process.argv.find(a => a.startsWith("--company="));
  const companyId = companyArg ? companyArg.split("=")[1] : null;
  const userIdArg = process.argv.find(a => a.startsWith("--user="));
  const userId = userIdArg ? userIdArg.split("=")[1] : null;

  if (!companyId) {
    const companies = await prisma.company.findMany({ take: 1, orderBy: { createdAt: "asc" } });
    if (companies.length === 0) {
      console.error("No companies found. Create a user first or pass --company=<id>");
      process.exit(1);
    }
    console.log("Using company:", companies[0].id, companies[0].name);
    var targetCompanyId = companies[0].id;
  } else {
    var targetCompanyId = companyId;
  }

  if (!userId) {
    const users = await prisma.user.findMany({ where: { companyId: targetCompanyId }, take: 1 });
    if (users.length === 0) {
      console.error("No users found in company. Pass --user=<id>");
      process.exit(1);
    }
    console.log("Using user:", users[0].id, users[0].email);
    var targetUserId = users[0].id;
  } else {
    var targetUserId = userId;
  }

  console.log("Generating seed data...");
  const carrierData = generateCarriers(60);
  const shipperData = generateShippers(325);
  const loadData = generateLoads(200);

  const createdCarriers: Record<string, string> = {};
  for (const c of carrierData) {
    const carrier = await prisma.carrier.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id, companyId: targetCompanyId, name: c.name,
        mcNumber: c.mcNumber, dotNumber: c.dotNumber,
        email: c.email, phone: c.phone,
        address: c.address, city: c.city, state: c.state, zip: c.zip,
        status: c.status, insuranceStatus: c.insuranceStatus,
        insuranceExpiry: c.insuranceExpiry ?? null,
        authorityStatus: c.authorityStatus,
        safetyRating: c.safetyRating ?? null, rating: c.rating,
        equipment: { create: c.equipment.map((t) => ({ type: t })) },
      },
    });
    createdCarriers[c.id] = carrier.id;
  }
  console.log(`Created ${Object.keys(createdCarriers).length} carriers`);

  const createdShippers: Record<string, string> = {};
  for (const s of shipperData) {
    const shipper = await prisma.shipper.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id, companyId: targetCompanyId, name: s.name,
        contactName: s.contactName, email: s.email, phone: s.phone,
        address: s.address, city: s.city, state: s.state, zip: s.zip,
        creditLimit: s.creditLimit, paymentTerms: s.paymentTerms,
      },
    });
    createdShippers[s.id] = shipper.id;
  }
  console.log(`Created ${Object.keys(createdShippers).length} shippers`);

  const createdLoads: string[] = [];
  for (const l of loadData) {
    const carrierId = l.carrierIdx !== null ? createdCarriers[carrierData[l.carrierIdx].id] : null;
    const shipperId = createdShippers[shipperData[l.shipperIdx].id];
    const load = await prisma.load.upsert({
      where: { loadNumber: l.loadNumber },
      update: {},
      create: {
        id: l.id, companyId: targetCompanyId, loadNumber: l.loadNumber,
        createdById: targetUserId, carrierId, shipperId,
        dispatcherId: targetUserId, status: l.status,
        equipmentType: l.equipmentType,
        originCity: l.originCity, originState: l.originState,
        destCity: l.destCity, destState: l.destState,
        pickupDate: l.pickupDate, deliveryDate: l.deliveryDate,
        shipperRate: l.shipperRate, carrierRate: l.carrierRate ?? null,
        miles: l.miles, weight: l.weight, commodity: l.commodity,
        hazmat: l.hazmat ?? false, pieces: l.pieces ?? null,
        bolNumber: l.bolNumber ?? null, poNumber: l.poNumber ?? null,
        proNumber: l.proNumber ?? null, notes: l.notes ?? null,
      },
    });
    createdLoads.push(load.id);
  }
  console.log(`Created ${createdLoads.length} loads`);

  await prisma.$disconnect();
  console.log("Seed complete!");
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
