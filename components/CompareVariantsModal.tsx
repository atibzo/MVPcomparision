"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import parse from "html-react-parser";
// ❌ remove top-level import of html2pdf.js (breaks on server)
// import html2pdf from "html2pdf.js";

type Variant = {
  name: string;
  tripHighlights: string[];
  whatYouDo: string;
  inclusions: string[];
  exclusions: string[];
  pickup: string;
  drop: string;
  price: string;
  duration: string;
  nextGroupDates?: string[];
};

export default function CompareVariantsModal({
  isOpen,
  onClose,
  variants
}: {
  isOpen: boolean;
  onClose: () => void;
  variants: Variant[];
}) {
  const fields = [
    "Trip Highlights",
    "What You’ll Do",
    "Inclusions",
    "Exclusions",
    "Pickup & Drop",
    "Price / Duration",
    "Next Group Dates"
  ];

  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (field: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // ✅ dynamic import so it only runs in the browser
  const handleDownload = async () => {
    const element = document.getElementById("comparison-content");
    if (!element) return;
    const html2pdf = (await import("html2pdf.js")).default;
    html2pdf().from(element).save("zostel_comparison.pdf");
  };

  const renderCell = (field: string, v: Variant) => {
    const isExpanded = expandedSections[field];

    const renderList = (list: string[]) => {
      const visible = isExpanded ? list : list.slice(0, 6);
      return (
        <ul className="list-disc pl-4 space-y-1 text-sm text-gray-800 transition-all duration-300">
          {visible.map((item, i) => (
            <li key={i}>{parse(item)}</li>
          ))}
          {list.length > 6 && (
            <li>
              <button
                onClick={() => toggleSection(field)}
                className="text-zostel-orange text-sm underline"
              >
                {isExpanded ? "Show less ↑" : "Show more ↓"}
              </button>
            </li>
          )}
        </ul>
      );
    };

    switch (field) {
      case "Trip Highlights":
        return renderList(v.tripHighlights);
      case "What You’ll Do":
        return <p className="text-sm text-gray-700 transition-all duration-300">{v.whatYouDo}</p>;
      case "Inclusions":
        return renderList(v.inclusions);
      case "Exclusions":
        return renderList(v.exclusions);
      case "Pickup & Drop":
        return (
          <p className="text-sm text-gray-700">
            📍 {v.pickup}
            <br />
            🚩 {v.drop}
          </p>
        );
      case "Price / Duration":
        return (
          <p className="text-sm font-medium text-gray-900">
            {v.price} • {v.duration}
          </p>
        );
      case "Next Group Dates":
        return (
          <ul className="list-disc pl-4 text-sm text-gray-800">
            {(v.nextGroupDates || []).map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-7xl rounded-lg bg-white shadow-xl p-6 transition-all duration-300">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Compare Variants</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-black text-xl">✕</button>
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={handleDownload}
                className="text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded px-3 py-1"
              >
                📄 Download PDF
              </button>
              <button
                className="text-sm text-zostel-orange border border-zostel-orange hover:bg-zostel-orange hover:text-white rounded px-3 py-1 transition"
              >
                🔗 Share Comparison (dummy)
              </button>
            </div>

            {/* Table */}
            <div id="comparison-content" className="overflow-x-auto">
              <table className="min-w-full border-t border-gray-200 text-sm">
                <thead className="sticky top-0 bg-white z-10">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-500 w-56">Section</th>
                    {variants.map((v) => (
                      <th
                        key={v.name}
                        className="text-left py-3 px-4 border-l font-semibold text-zostel-orange"
                      >
                        {v.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field) => (
                    <tr key={field} className="border-t border-gray-100 align-top">
                      <td className="py-4 px-4 font-medium text-gray-700">{field}</td>
                      {variants.map((v, i) => (
                        <td key={field + i} className="py-4 px-4 border-l align-top">
                          {renderCell(field, v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
