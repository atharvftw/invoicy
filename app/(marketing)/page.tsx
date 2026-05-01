import { readFile } from "node:fs/promises";
import path from "node:path";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Script from "next/script";

const LANDING_PAGE_PATH = path.join(
  process.cwd(),
  "landing",
  "invoicy-automate-invoices-get-paid-faster.html"
);
const LANDING_FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');";

function extractMatches(input: string, pattern: RegExp) {
  return Array.from(input.matchAll(pattern), (match) => match[1]?.trim()).filter(Boolean) as string[];
}

function rewriteLandingLinks(html: string) {
  return html
    .replace(
      /<a href="#" class="btn btn-ghost">Sign in<\/a>/,
      '<a href="/sign-in" class="btn btn-ghost">Sign in</a>'
    )
    .replace(/href="(?:#cta|#)"(?=[^>]*\bdata-cta="[^"]+")/g, 'href="/sign-up"')
    .replace(/<a class="brand" href="#">/g, '<a class="brand" href="/">');
}

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/invoice/new");
  }

  const rawHtml = await readFile(LANDING_PAGE_PATH, "utf8");
  const landingHtml = rewriteLandingLinks(rawHtml);

  const styleBlocks = extractMatches(landingHtml, /<style[^>]*>([\s\S]*?)<\/style>/gi);
  const jsonLdBlocks = extractMatches(
    landingHtml,
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  const inlineScripts = extractMatches(
    landingHtml,
    /<script(?![^>]*src=)(?![^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi
  ).filter((script) => !script.includes("gtag("));

  const bodyMatch = landingHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = (bodyMatch?.[1] ?? landingHtml).replace(/<script[\s\S]*?<\/script>/gi, "");

  return (
    <>
      {styleBlocks.map((style, index) => (
        <style
          key={`landing-style-${index}`}
          dangerouslySetInnerHTML={{
            __html: index === 0 ? `${LANDING_FONT_IMPORT}\n${style}` : style,
          }}
        />
      ))}

      {jsonLdBlocks.map((jsonLd, index) => (
        <script
          key={`landing-jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ))}

      <div dangerouslySetInnerHTML={{ __html: bodyContent }} />

      {inlineScripts.map((script, index) => (
        <Script
          key={`landing-script-${index}`}
          id={`landing-script-${index}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: script }}
        />
      ))}
    </>
  );
}
