import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
  const {searchParams} = new URL(req.url);
  const slug = searchParams.get("slug");
  const route = `/profiles/${slug}`;
  const projectId = process.env.POSTHOG_PROJECT_ID;

  const response = await fetch(`https://app.posthog.com/api/projects/${projectId}/insights/trend`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.POSTHOG_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      events: [
        {
          id: "$pageview",
          name: "$pageview",
          type: "events",
          math: "total",
          properties: [
            {
              key: "$pathname",
              value: route,
              type: "event",
            },
          ],
        },
      ],
      interval: "day",
      date_from: "-7d",
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
}
