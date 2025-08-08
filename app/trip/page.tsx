"use client";

export const dynamic = "force-dynamic"; // ⬅️ prevent SSG/SSR pre-render
export const revalidate = 0;            // ⬅️ disable caching for good measure

import { useEffect, useState } from "react";
import CompareVariantsModal from "../../components/CompareVariantsModal";

export default function TripPage() {
  const [variants, setVariants] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isCompareOpen, setCompareOpen] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("aiVariants");
    if (stored) {
      const parsed = JSON.parse(stored);
      const cleaned = parsed.filter((v: any) => v.parsed);
      setVariants(cleaned);
    }
  }, []);

  if (!variants.length) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-semibold">No trip data found</h1>
        <p>
          Go to <a className="text-blue-600 underline" href="/demo">/demo</a> and enter trip details first.
        </p>
      </div>
    );
  }

  const activeData = variants[activeTab].parsed;
  const images = Array.isArray(activeData.images) && activeData.images.length >= 5
    ? activeData.images.slice(0, 5)
    : [
        "https://picsum.photos/seed/hero-left/800/1200",
        "https://picsum.photos/seed/hero1/600/400",
        "https://picsum.photos/seed/hero2/600/400",
        "https://picsum.photos/seed/hero3/600/400",
        "https://picsum.photos/seed/hero4/600/400"
      ];

  return (
    <div className="font-sans">
      {/* Zostel Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <img src="https://i.ibb.co/Z6SHQ7z/Zostel-Logo.png" alt="Zostel Logo" className="h-5 w-auto" />
          <nav className="hidden sm:flex space-x-4 text-sm text-gray-600">
            <span className="hover:text-black cursor-pointer">Zostel ▾</span>
            <span className="hover:text-black cursor-pointer">Zostel Plus ▾</span>
            <span className="hover:text-black cursor-pointer">Zostel Homes ▾</span>
            <span className="hover:text-black cursor-pointer">Zo Trips ▾</span>
            <span className="hover:text-black cursor-pointer">Zo Houses ▾</span>
          </nav>
        </div>
        <div className="hidden md:block w-72">
          <input
            type="text"
            placeholder="Start your trip"
            className="w-full rounded-full border border-gray-300 px-4 py-1.5 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="hidden sm:inline hover:text-black cursor-pointer text-gray-600">Destinations</span>
          <span className="hidden sm:inline hover:text-black cursor-pointer text-gray-600">Franchise</span>
          <button className="border px-3 py-1 rounded-full text-gray-700 hover:bg-gray-100">Share 😀</button>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-lg">👤</div>
        </div>
      </header>

      {/* Sticky Trip Header Bar */}
      <div className="sticky top-[60px] z-40 bg-white border-b border-gray-200 px-4 sm:px-8 pt-4 pb-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Experience {activeData.tierName}
        </h1>
        <div className="flex flex-wrap justify-between items-end">
          <div className="flex space-x-6 text-sm font-medium">
            {variants.map((v, i) => (
              <div
                key={i}
                onClick={() => setActiveTab(i)}
                className={`cursor-pointer ${activeTab === i ? "text-zostel-orange" : "text-gray-700 hover:text-zostel-orange"}`}
              >
                <div>{v.name}</div>
                <div className="text-xs font-normal">
                  {v.parsed.price || "-"} • {v.parsed.duration || "-"}
                </div>
                {activeTab === i && (
                  <div className="h-1 mt-1 bg-zostel-orange rounded-full" />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setCompareOpen(true)}
            className="text-sm px-4 py-2 bg-zostel-orange text-white rounded hover:bg-orange-600 transition"
          >
            Compare Variants
          </button>
        </div>
      </div>

      {/* Hero Image Grid */}
      <div className="flex flex-col sm:flex-row h-[500px] sm:h-[600px] gap-2 overflow-hidden px-4 sm:px-8 pt-4">
        <div className="flex-1 h-full">
          <img src={images[0]} className="w-full h-full object-cover rounded-lg" />
        </div>
        <div className="flex flex-col flex-1 gap-2">
          <div className="flex gap-2 h-1/2">
            <img src={images[1]} className="w-1/2 h-full object-cover rounded-lg" />
            <img src={images[2]} className="w-1/2 h-full object-cover rounded-lg" />
          </div>
          <div className="flex gap-2 h-1/2">
            <img src={images[3]} className="w-1/2 h-full object-cover rounded-lg" />
            <img src={images[4]} className="w-1/2 h-full object-cover rounded-lg" />
          </div>
        </div>
      </div>

      {/* Trip Details & Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 sm:px-8 py-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-gray-700">
            <div><div className="font-bold">Pick Up</div>{activeData.pickup}</div>
            <div><div className="font-bold">Drop</div>{activeData.drop}</div>
            <div><div className="font-bold">Duration</div>{activeData.duration}</div>
          </div>

          {/* Highlights */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Trip Highlights</h2>
            <ul className="list-disc pl-5 space-y-1 text-gray-800">
              {activeData.tripHighlights.map((pt: string, idx: number) => (
                <li key={idx}>{pt}</li>
              ))}
            </ul>
          </div>

          {/* Itinerary Accordion */}
          <div>
            <h2 className="text-lg font-semibold mb-3">What you'll do</h2>
            {activeData.dayPlan.map((day: any, idx: number) => (
              <div key={idx} className="border rounded-md p-4 mb-2">
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="bg-gray-200 text-xs font-semibold px-2 py-1 rounded-full">
                      Day {day.day}
                    </span>
                    <span className="text-sm text-gray-500">{day.date}</span>
                  </div>
                  <button className="text-gray-500 text-lg">
                    {expandedDay === idx ? "▲" : "▼"}
                  </button>
                </div>
                <div className="mt-2 font-medium">{day.title}</div>
                {expandedDay === idx && (
                  <p className="text-sm text-gray-600 mt-2">{day.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-1">Inclusions</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                {activeData.inclusions.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Exclusions</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                {activeData.exclusions.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Booking Sidebar */}
        <aside className="lg:sticky top-28 h-fit border border-gray-200 rounded-lg p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">From</p>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            {activeData.price}
          </h2>
          <label className="block text-sm text-gray-700 mb-1">Package Type</label>
          <select className="w-full border rounded px-3 py-2 text-sm mb-4">
            <option>{variants[activeTab].name}</option>
          </select>
          <div className="mb-4">
            <p className="text-sm text-gray-800 font-medium mb-1">Trip Dates</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {activeData.nextGroupDates?.map((dt: string, idx: number) => (
                <li key={idx}>{dt}</li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-700">Guests</span>
            <div className="flex items-center space-x-3">
              <button className="px-2 text-xl">−</button>
              <span>1</span>
              <button className="px-2 text-xl">+</button>
            </div>
          </div>
          <button className="bg-zostel-orange w-full text-white font-semibold py-2 rounded">
            Book Now
          </button>
        </aside>
      </div>

      {/* Comparison Modal */}
      <CompareVariantsModal
        isOpen={isCompareOpen}
        onClose={() => setCompareOpen(false)}
        variants={variants.map((v) => ({ name: v.name, ...v.parsed }))}
      />
    </div>
  );
}
