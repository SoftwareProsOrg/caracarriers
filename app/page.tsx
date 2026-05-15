import type { Metadata } from "next";
import Link from "next/link";
import {
  Truck, Package, Shield, Clock, Phone, Mail,
  MapPin, CheckCircle2, ArrowRight, Star, ChevronDown,
  Users, Globe, BarChart3, Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CaraCarriers — Freight Brokerage | Nationwide Trucking Solutions",
  description:
    "CaraCarriers is a licensed freight brokerage connecting shippers with reliable carriers across the United States. Get competitive rates, real-time tracking, and dedicated service. Request a quote today.",
  keywords: [
    "freight broker", "freight brokerage", "trucking company", "freight shipping",
    "truckload shipping", "freight rates", "logistics company", "LTL shipping",
    "flatbed freight", "reefer freight", "dry van shipping", "nationwide freight",
    "freight carrier", "shipping quote", "cargo transport", "CaraCarriers",
  ],
  alternates: { canonical: "https://www.caracarriers.com" },
  openGraph: {
    title: "CaraCarriers — Freight Brokerage | Nationwide Trucking Solutions",
    description: "Licensed freight brokerage. Competitive rates, nationwide coverage, real-time tracking. Get a quote in minutes.",
    type: "website",
    siteName: "CaraCarriers",
  },
};

const SERVICES = [
  {
    icon: Truck,
    title: "Dry Van Freight",
    description: "Full truckload and partial loads in 53-foot dry van trailers for general commodity shipping nationwide.",
  },
  {
    icon: Package,
    title: "Flatbed & Step Deck",
    description: "Over-dimensional and heavy freight requiring open-deck equipment. Tarped, strapped, and compliant.",
  },
  {
    icon: Zap,
    title: "Temperature Controlled",
    description: "Refrigerated and frozen freight moved in Reefer trailers with temperature monitoring from origin to delivery.",
  },
  {
    icon: Globe,
    title: "Expedited Shipping",
    description: "Time-critical shipments that can't wait. Direct-drive and team service available 24/7.",
  },
  {
    icon: BarChart3,
    title: "Partial Loads (LTL)",
    description: "Don't pay for a full truck when you don't need it. We consolidate partial loads to reduce your freight costs.",
  },
  {
    icon: Shield,
    title: "Hazmat & Specialized",
    description: "Certified for hazmat freight with fully vetted, licensed carriers who meet all FMCSA requirements.",
  },
];

const WHY_US = [
  {
    title: "Licensed & Bonded",
    description: "We are a federally licensed freight broker (MC authority) with a $75,000 surety bond. Your freight is protected.",
    icon: Shield,
  },
  {
    title: "Vetted Carrier Network",
    description: "Every carrier in our network is vetted for active authority, insurance, and safety rating before they touch your freight.",
    icon: Users,
  },
  {
    title: "Real-Time Tracking",
    description: "Know exactly where your freight is at every stage of transit. Proactive updates — no more chasing status calls.",
    icon: Clock,
  },
  {
    title: "Competitive Rates",
    description: "Our network and volume give us access to capacity other brokers can't match. You get better rates, guaranteed.",
    icon: BarChart3,
  },
];

const TESTIMONIALS = [
  {
    quote: "CaraCarriers moved 50 loads for us last quarter without a single service failure. Their communication and pricing are unmatched.",
    author: "Logistics Director",
    company: "Gulf Coast Manufacturing",
    rating: 5,
  },
  {
    quote: "I tried three brokers before CaraCarriers. None of them tracked loads proactively. These guys call me before I have to call them.",
    author: "Supply Chain Manager",
    company: "Southwest Distribution Co.",
    rating: 5,
  },
  {
    quote: "We had a time-sensitive flatbed load with a short notice. CaraCarriers had a carrier confirmed in under two hours.",
    author: "Operations Manager",
    company: "Industrial Steel Fab",
    rating: 5,
  },
];

const LANES = [
  "Texas ↔ Midwest",
  "Southeast ↔ Northeast",
  "California ↔ Texas",
  "Texas ↔ Southeast",
  "Midwest ↔ Southeast",
  "Nationwide Coverage",
];

export default function LandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": "https://www.caracarriers.com",
        name: "CaraCarriers",
        description: "Licensed freight brokerage providing nationwide truckload, flatbed, reefer, and expedited shipping solutions.",
        url: "https://www.caracarriers.com",
        telephone: "",
        address: { "@type": "PostalAddress", addressCountry: "US" },
        priceRange: "$$",
        openingHours: "Mo-Fr 08:00-18:00",
        serviceArea: { "@type": "Country", name: "United States" },
      },
      {
        "@type": "Service",
        name: "Freight Brokerage Services",
        provider: { "@type": "Organization", name: "CaraCarriers" },
        serviceType: "Freight Brokerage",
        areaServed: "United States",
        description: "Connecting shippers with vetted carriers for truckload, flatbed, reefer, and LTL freight nationwide.",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Is CaraCarriers a licensed freight broker?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yes. CaraCarriers holds active FMCSA broker authority and a $75,000 surety bond as required by federal law.",
            },
          },
          {
            "@type": "Question",
            name: "What types of freight does CaraCarriers move?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "We move dry van, flatbed, step deck, reefer, expedited, partial loads, and hazmat freight anywhere in the United States.",
            },
          },
          {
            "@type": "Question",
            name: "How quickly can CaraCarriers cover a load?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "For standard loads with 24-48 hours notice, we confirm coverage within hours. For expedited freight, we have same-day capacity through our national carrier network.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-background text-foreground">
        {/* ── Navigation ── */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/95 backdrop-blur-sm border-b border-white/10">
          <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Truck className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">CaraCarriers</span>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#why-us" className="hover:text-white transition-colors">Why Us</a>
              <a href="#lanes" className="hover:text-white transition-colors">Coverage</a>
              <a href="#contact" className="hover:text-white transition-colors">Get a Quote</a>
            </nav>
            <div className="flex items-center gap-3">
              <a href="tel:+1" className="hidden md:flex items-center gap-2 text-sm text-white/70 hover:text-white">
                <Phone className="h-4 w-4" />
                Call Now
              </a>
              <a
                href="#contact"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Get a Quote
              </a>
            </div>
          </div>
        </header>

        {/* ── Hero with Video Background ── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
              aria-hidden="true"
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-trucks-driving-on-a-highway-at-sunset-4168-large.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/75 via-[#0f172a]/65 to-[#0f172a]" />
          </div>

          <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs text-white/80 mb-8 backdrop-blur-sm">
              <Shield className="h-3 w-3 text-primary" />
              Licensed &amp; Bonded Freight Broker · FMCSA Authorized
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
              Move Freight
              <br />
              <span className="text-primary">Faster, Smarter,</span>
              <br />
              Nationwide
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
              CaraCarriers is a licensed freight brokerage connecting shippers with vetted, reliable carriers
              across the United States. Competitive rates. Real-time tracking. Dedicated service on every load.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#contact"
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-white hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/30"
              >
                Get a Free Quote
                <ArrowRight className="h-5 w-5" />
              </a>
              <a
                href="#services"
                className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                Our Services
                <ChevronDown className="h-5 w-5" />
              </a>
            </div>

            <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
              {[
                "Vetted carrier network",
                "48-state coverage",
                "24/7 dispatch support",
                "Real-time load tracking",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section id="services" className="py-24 bg-background">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Freight Solutions for Every Shipment
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you&apos;re shipping dry goods, heavy equipment, or temperature-sensitive cargo,
                CaraCarriers has the capacity and expertise to get it there.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service) => (
                <div
                  key={service.title}
                  className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section id="why-us" className="py-24 bg-[#0f172a]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Why Shippers Choose CaraCarriers</h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto">
                We&apos;re not just a brokerage. We&apos;re your dedicated logistics partner.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {WHY_US.map((item) => (
                <div key={item.title} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Coverage / Lanes ── */}
        <section id="lanes" className="py-20 bg-background">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Nationwide Coverage</h2>
            <p className="text-muted-foreground mb-10 text-lg">
              We specialize in high-volume lanes throughout the US with consistent capacity and competitive rates.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {LANES.map((lane) => (
                <div key={lane} className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  {lane}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" className="py-24 bg-[#0f172a]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">What Our Shippers Say</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className="rounded-2xl border border-white/10 bg-white/5 p-8">
                  <div className="flex mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-warning fill-warning" />
                    ))}
                  </div>
                  <blockquote className="text-white/80 leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.author}</p>
                    <p className="text-white/50 text-sm">{t.company}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Contact / Get a Quote ── */}
        <section id="contact" className="py-24 bg-background">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Get a Freight Quote</h2>
              <p className="text-muted-foreground text-lg">
                Tell us about your shipment and we&apos;ll get back to you with competitive rates — usually within the hour.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-8">
              <form
                action="mailto:dispatch@caracarriers.com"
                method="post"
                encType="text/plain"
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5" htmlFor="name">Your Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="John Smith"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5" htmlFor="company">Company</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Acme Corp"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5" htmlFor="email">Email *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@company.com"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5" htmlFor="phone">Phone</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="(555) 000-0000"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5" htmlFor="origin">Origin City, State *</label>
                    <input
                      id="origin"
                      name="origin"
                      type="text"
                      required
                      placeholder="Houston, TX"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5" htmlFor="destination">Destination City, State *</label>
                    <input
                      id="destination"
                      name="destination"
                      type="text"
                      required
                      placeholder="Atlanta, GA"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1.5" htmlFor="equipment">Equipment Type</label>
                    <select
                      id="equipment"
                      name="equipment"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option>Dry Van</option>
                      <option>Flatbed</option>
                      <option>Reefer</option>
                      <option>Step Deck</option>
                      <option>Box Truck</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5" htmlFor="weight">Weight (lbs)</label>
                    <input
                      id="weight"
                      name="weight"
                      type="number"
                      placeholder="42000"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1.5" htmlFor="pickup">Pickup Date</label>
                    <input
                      id="pickup"
                      name="pickup"
                      type="date"
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1.5" htmlFor="notes">Commodity / Special Instructions</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="What are you shipping? Any special requirements?"
                    className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-primary/90 transition-colors"
                >
                  Submit Quote Request
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>

              <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>Call dispatch: <a href="tel:+1" className="text-primary hover:underline font-medium">Available 24/7</a></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <a href="mailto:dispatch@caracarriers.com" className="text-primary hover:underline font-medium">dispatch@caracarriers.com</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 bg-[#0f172a]">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-3xl font-bold text-white text-center mb-10">Common Questions</h2>
            <div className="space-y-3">
              {[
                {
                  q: "Is CaraCarriers a licensed freight broker?",
                  a: "Yes. CaraCarriers holds active FMCSA broker authority and carries a $75,000 surety bond as required by federal law. We are fully licensed to arrange transportation of freight throughout the United States.",
                },
                {
                  q: "How quickly can you cover a load?",
                  a: "For standard loads with 24-48 hours notice, we typically confirm carrier coverage within a few hours. For expedited and hot freight, we have same-day capacity available through our national carrier network.",
                },
                {
                  q: "What happens if there's a problem with my shipment?",
                  a: "Our dispatch team monitors every active load and proactively communicates any delays or issues. In the event of cargo damage, our carriers are required to carry minimum insurance as mandated by FMCSA, and we assist with claims from start to finish.",
                },
                {
                  q: "Do you handle spot loads or do you require contracts?",
                  a: "Both. We work with shippers on a spot basis and also offer contract pricing for shippers with consistent volume on regular lanes. Contact us to discuss what works best for your business.",
                },
              ].map((faq, idx) => (
                <details key={idx} className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <summary className="flex cursor-pointer items-center justify-between p-5 font-semibold text-white hover:bg-white/5 transition-colors list-none">
                    {faq.q}
                    <ChevronDown className="h-5 w-5 text-white/40 shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-5 text-white/60 leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 bg-primary">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Ship?</h2>
            <p className="text-white/80 text-xl mb-8 max-w-xl mx-auto">
              Get competitive freight rates in minutes. No commitment required.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-10 py-4 text-lg font-semibold text-primary hover:bg-white/90 transition-all hover:scale-105 shadow-xl"
            >
              Get a Free Quote
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="bg-[#0a0f1e] border-t border-white/10 py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Truck className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-white">CaraCarriers</span>
              </div>
              <div className="text-center">
                <p className="text-white/40 text-sm">
                  © {new Date().getFullYear()} CaraCarriers · Licensed Freight Broker · FMCSA Authorized
                </p>
                <p className="text-white/20 text-xs mt-1">
                  Website by{" "}
                  <a
                    href="https://www.softwarepros.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/30 hover:text-white/50 transition-colors underline"
                  >
                    SoftwarePros Org
                  </a>
                  {" "}· 200 E Van Buren Ave, Harlingen, TX 78550
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm text-white/50">
                <a href="#contact" className="hover:text-white transition-colors">Get a Quote</a>
                <Link href="/login" className="hover:text-white transition-colors">Broker Login</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
