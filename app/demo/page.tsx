"use client";

import { useState } from "react";

type VariantInput = {
  name: string;
  url: string;
};

export default function DemoPage() {
  const [variants, setVariants] = useState<VariantInput[]>([
    { name: "Alpha", url: "" },
    { name: "Beta", url: "" },
    { name: "Gamma", url: "" }
  ]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const handleChange = (i: number, field: keyof VariantInput, value: string) => {
    const updated = [...variants];
    updated[i][field] = value;
    setVariants(updated);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const res = await fetch("/api/scrape-and-parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variants })
    });

    const data = await res.json();
    setResults(data);
    setLoading(false);

    if (typeof window !== "undefined") {
      localStorage.setItem("aiVariants", JSON.stringify(data));
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">AI-Powered Trip Variant Builder</h1>

      {variants.map((v, i) => (
        <div key={i} className="mb-6">
          <label className="block mb-1 font-medium">Variant {i + 1} Name</label>
          <input
            type="text"
            value={v.name}
            onChange={(e) => handleChange(i, "name", e.target.value)}
            className="w-full border px-3 py-2 mb-2 rounded"
            placeholder="e.g. Alpha"
          />
          <input
            type="url"
            value={v.url}
            onChange={(e) => handleChange(i, "url", e.target.value)}
            className="w-full border px-3 py-2 rounded"
            placeholder="https://www.zostel.com/trips/..."
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-zostel-orange text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Loading..." : "Generate Itinerary Pages"}
      </button>

      {results.length > 0 && (
        <>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">AI Results:</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>

          <button
            onClick={() => (window.location.href = "/trip")}
            className="mt-4 bg-black text-white px-4 py-2 rounded"
          >
            View Trip Page with Variants →
          </button>
        </>
      )}
    </div>
  );
}
