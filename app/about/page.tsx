"use client";

import Image from "next/image";

const values = [
  {
    title: "Integrity",
    description:
      "We believe in honest advice, transparent transactions, and putting our clients' interests first in every deal.",
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
  },
  {
    title: "Excellence",
    description:
      "From property selection to closing, we deliver a premium service experience that exceeds expectations.",
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
        />
      </svg>
    ),
  },
  {
    title: "Partnership",
    description:
      "We build lasting relationships with buyers, sellers, and investors — guiding you at every step of your journey.",
    icon: (
      <svg
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
  },
];

const team = [
  {
    name: "Karim El Amrani",
    role: "Founder & CEO",
    bio: "With over 15 years in Moroccan real estate, Karim founded LaTour Immo to bring transparency and excellence to the market.",
  },
  {
    name: "Salma Benali",
    role: "Head of Sales",
    bio: "Salma leads our sales team with a passion for matching clients with their ideal properties across Morocco's top cities.",
  },
  {
    name: "Youssef Tazi",
    role: "Senior Property Advisor",
    bio: "Youssef specializes in luxury villas and commercial investments, offering expert guidance to discerning buyers and sellers.",
  },
];

const highlights = [
  { value: "10+", label: "Years Experience" },
  { value: "500+", label: "Properties Sold" },
  { value: "1000+", label: "Happy Clients" },
  { value: "24/7", label: "Support" },
];

export default function AboutPage() {
  return (
    <div>
      <section className="bg-[#1a2b4a] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            About LaTour Immo
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-300">
            Your trusted real estate partner in Morocco
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-bold text-[#1a2b4a] sm:text-3xl">
              Our Story
            </h2>
            <div className="mt-2 h-1 w-16 rounded-full bg-[#c9a84c]" />
            <p className="mt-6 leading-relaxed text-gray-600">
              Founded in Casablanca, LaTour Immo was born from a simple belief:
              buying or selling property in Morocco should be a confident,
              transparent experience. What started as a small local agency has
              grown into a trusted name serving clients across Marrakech,
              Rabat, Tangier, Agadir, and beyond.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              <span className="font-semibold text-[#1a2b4a]">Our mission</span>{" "}
              is to connect people with exceptional properties while providing
              honest guidance at every stage.{" "}
              <span className="font-semibold text-[#1a2b4a]">Our vision</span>{" "}
              is to become Morocco&apos;s most respected real estate brand —
              known for integrity, local expertise, and a client-first approach
              that turns every transaction into a lasting partnership.
            </p>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/images/modern-luxury-villa-pool-medulin.jpg"
              alt="Luxury villa with pool in Morocco"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#1a2b4a] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">
            Our Values
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-[#c9a84c]" />

          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1a2b4a] text-[#c9a84c] ring-2 ring-[#c9a84c]/40">
                  {value.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">
                  {value.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-[#1a2b4a] sm:text-3xl">
            Our Team
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-[#c9a84c]" />
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            Meet the dedicated professionals who make LaTour Immo your trusted
            partner in Moroccan real estate.
          </p>

          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-md"
              >
                <div className="mx-auto h-28 w-28 rounded-full bg-gray-200" />
                <h3 className="mt-5 text-lg font-bold text-[#1a2b4a]">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-[#c9a84c]">
                  {member.role}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-bold text-[#1a2b4a] sm:text-3xl">
            Why Choose Us
          </h2>
          <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-[#c9a84c]" />

          <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gray-100 bg-white p-6 text-center shadow-sm"
              >
                <p className="text-3xl font-bold text-[#c9a84c] sm:text-4xl">
                  {item.value}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#1a2b4a] sm:text-base">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
