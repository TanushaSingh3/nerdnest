import Cite from "citation-js";
import "@citation-js/plugin-csl"; // ✅ this enables MLA, Chicago, etc.


// --- name parser + metadata builder from before ---
function parseAuthorName(name) {
  if (!name) return null;

  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { family: parts[0] };

  const particles = ["van", "von", "de", "del", "da", "di", "la", "du", "der"];
  let splitIndex = parts.length - 1;

  for (let i = parts.length - 2; i >= 0; i--) {
    if (particles.includes(parts[i].toLowerCase())) {
      splitIndex = i;
      break;
    }
  }

  return {
    given: parts.slice(0, splitIndex).join(" "),
    family: parts.slice(splitIndex).join(" "),
  };
}

function buildMeta(work) {
  return {
    id: work.id,
    DOI: work.doi?.replace("https://doi.org/", ""),
    title: work.title,
    author: work.authorships
      .map((a) => parseAuthorName(a.author.display_name))
      .filter(Boolean),
    issued: { "date-parts": [[work.publication_year]] },
    "container-title": work.host_venue?.display_name,
    volume: work.biblio?.volume || undefined,
    issue: work.biblio?.issue || undefined,
    page: work.biblio?.first_page
      ? `${work.biblio.first_page}-${work.biblio.last_page || ""}`
      : undefined,
    publisher: work.host_venue?.publisher || undefined,
  };
}

function classifyInput(input) {
    if (input.startsWith("10.")) return "doi";          // bare DOI
    if (input.startsWith("http")) {
      if (input.includes("doi.org")) return "doi-url";  // DOI URL
      if (input.includes("arxiv.org")) return "arxiv";  // ArXiv
      return "publisher-url";                           // try DOI extract
    }
    return "search"; // keyword fallback
  }
  

  function extractDOIFromURL(url) {
    // DOI regex (covers most publishers)
    const doiRegex = /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i;
    const match = url.match(doiRegex);
    if (match) {
      return match[0];
    }
    return null;
  }
  

export async function POST(req) {
  try {
    const { query, style = "apa", output = "bibliography" } = await req.json();

    if (!query) {
      return new Response(JSON.stringify({ error: "Missing query" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const type = classifyInput(query);
    let work;

    if (type === "doi") {
        const res = await fetch(`https://api.openalex.org/works/https://doi.org/${query}`);
        work = await res.json();
      } else if (type === "doi-url") {
        const doi = query.split("doi.org/")[1];
        const res = await fetch(`https://api.openalex.org/works/https://doi.org/${doi}`);
        work = await res.json();
      } else if (type === "arxiv") {
        const id = query.split("/abs/")[1];
        const res = await fetch(`https://api.openalex.org/works/https://doi.org/arxiv:${id}`);
        work = await res.json();
      } else if (type === "publisher-url") {
        const doi = extractDOIFromURL(query);
        if (doi) {
          const res = await fetch(`https://api.openalex.org/works/https://doi.org/${doi}`);
          work = await res.json();
        } else {
          // fallback → last path segment as keyword
          const keyword = query.split("/").pop();
          const res = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(keyword)}`);
          const data = await res.json();
          work = data.results[0];
        }
      } else {
        // keyword search
        const res = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(query)}`);
        const data = await res.json();
        work = data.results[0];
      }
  
     

    if (!work || work.error) {
      return new Response(JSON.stringify({ error: "Work not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const meta = buildMeta(work);
    const cite = new Cite(meta);

    let result;

    console.log('style&&&&&&&&&&&&&&&&&&&&&&'+style)
    if (output === "bibtex") {
      result = cite.format("bibtex"); // BibTeX format
    } else {
      result = cite.format("bibliography", { format: "text", style });
    }

    const cite1 = new Cite({
        title: "Explaining and Harnessing Adversarial Examples",
        author: [
          { given: "Ian", family: "Goodfellow" },
          { given: "Jonathon", family: "Shlens" },
          { given: "Christian", family: "Szegedy" },
        ],
        issued: { "date-parts": [[2014]] },
        DOI: "10.48550/arXiv.1412.6572",
        "container-title": "arXiv",
      });
      
   
    return new Response(JSON.stringify({ citation: result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Citation API error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

    async function fetchCSL(styleId) {
  const url = `https://raw.githubusercontent.com/citation-style-language/styles/master/${styleId}.csl`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch CSL style: ${styleId}`);
  }
  return await res.text();
}
  }
}
