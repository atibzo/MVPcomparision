import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import puppeteer from "puppeteer";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { variants } = req.body;

  const browser = await puppeteer.launch({ headless: true });

  const results = await Promise.all(
    variants.map(async ({ name, url }: { name: string; url: string }) => {
      try {
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        // Extract visible text
        const visibleText = await page.evaluate(() =>
          document.body.innerText.replace(/\s+/g, " ").trim()
        );

        // ✅ Extract image URLs with safe type cast
        const imageUrls = (await page.evaluate(() => {
          const imgs = Array.from(document.querySelectorAll("img"));
          return imgs
            .map((img) => img.getAttribute("src") || img.getAttribute("data-src"))
            .filter((src): src is string =>
              typeof src === "string" &&
              src.startsWith("https://") &&
              !src.includes("svg") &&
              !src.includes("icons") &&
              !src.includes("logo")
            )
            .slice(0, 5);
        })) as string[];

        await page.close();

        // GPT prompt
        const prompt = `
You are a travel content parser. Convert this raw trip content into structured JSON.

✦ Use the schema below.
✦ Each bullet point (highlights, inclusions, exclusions) must be under 100 characters.
✦ Use clean, crisp language. Avoid fluff or repetition.
✦ Return only valid JSON — no markdown, no comments.

Schema:
{
  "tierName": "${name}",
  "tripHighlights": [ "string (≤100 chars)", ... ],
  "whatYouDo": "1-paragraph summary",
  "dayPlan": [
    {
      "day": number,
      "date": "string",
      "title": "string",
      "description": "string"
    }
  ],
  "inclusions": [ "string (≤100 chars)", ... ],
  "exclusions": [ "string (≤100 chars)", ... ],
  "pickup": "string",
  "drop": "string",
  "price": "string",
  "duration": "string",
  "nextGroupDates": [ "string", ... ],
  "images": [ "imageURL1", "imageURL2", ... ]
}

Trip images:
${imageUrls.join(", ")}

Trip content:
""" ${visibleText.slice(0, 6000)} """
`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.4,
        });

        const raw = response.choices[0].message.content || "";
        const cleanJson = raw.trim().replace(/^```json|```$/g, "").trim();
        const parsed = JSON.parse(cleanJson || "{}");

        return { name, url, parsed };
      } catch (err: any) {
        return { name, url, error: err.message || "Scrape/Parse failed" };
      }
    })
  );

  await browser.close();
  res.status(200).json(results);
}
