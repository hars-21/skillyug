System-building prompt — Intelligent Course Recommendation System

Goal: build an edtech course recommendation microservice that accepts a user natural-language intent (plus optional UI chips), understands it, does a RAG search over a course inventory (PDF provided), and returns a user-friendly course recommendation. If an exact matching course (Node.js) exists return it with details; if not, return an empathetic, business-favoring persuasion that convinces the user to pick the best-fit backend course (design, Python backend, etc.). System must always be benign and customer-favouring while keeping business objectives in mind (maximize conversion).

Environment / inputs provided

Course catalog as PDF file at path:
/mnt/data/Python Beginner – ₹1299 🎯 30% refund via scholarship test 🎟 20 tokens (missed class buyback) 🚀 2 bootcamps (30% OFF) 🏆 Certificate of completion Bounder (Beginner → Intermediate) – ₹1899 🎯 50 (3).pdf

Lightweight LLM for generation: google/gemma-3-270m (use for reasoning & generation)

Embedding model: google/embeddinggemma-300m

Vector store: Chroma (or alternative if needed)

Backend tech: Node.js/TypeScript (your repo already has backend folder). Provide REST endpoint(s).

High level pipeline (concise)

Ingest & extract: extract text, structured metadata and course fields from the PDF inventory.

Normalize & build catalog: transform extracted content into canonical JSON course records (id, title, topics, level, price, SKU, tags, description, prerequisites, format, tokens/discounts, availability, slug, url).

Embed & index: compute embeddings for course descriptions + metadata; store in Chroma with filterable metadata (tags, level, language).

Intent parsing: convert raw user input + chips into structured JSON intent (goal, preferred language, skill level, urgency, budget) via light NLP/regex + small LLM if needed.

RAG retrieval: generate a retrieval query (embedding or text) from intent, retrieve top-k candidate courses from Chroma.

LLM re-ranking + answer generation: use gemma-3-270m with a controlled prompt template to produce the final markdown response. Include a verification step to ensure recommended course(s) exist in the product catalog.

Business fallback: if exact language course absent, produce a persuasive, benign message that explains benefits of closest matches and recommends purchase.

Return: API returns structured JSON (response markdown, suggested courses array with product ids, confidence, CTA buttons, analytics tags).

Catalog JSON schema (required)
{
  "id": "string",
  "title": "string",
  "slug": "string",
  "description": "string",
  "topics": ["nodejs","backend","express","design-patterns"],
  "level": "beginner|intermediate|advanced",
  "language": "en|hi|...",
  "price": 1299,
  "currency": "INR",
  "availability": true,
  "format": "self-paced|live|bootcamp",
  "perks": ["30% refund via scholarship test", "20 tokens"],
  "metadata": { "duration": "40 hours", "boots": "2 bootcamps" }
}

API contract / endpoints (suggested)

POST /api/recommend
Request body:

{
  "text": "I want to become a backend engineer; I prefer Node.js",
  "chips": ["backend","nodejs","intermediate"],
  "user": { "id": "optional" }
}


Response:

{
  "markdown": "string",        // user visible formatted reply
  "candidates": [ { "id": "...", "title": "...", "score": 0.95, "reason": "..." } ],
  "exactMatch": true|false,
  "intent": { "role":"backend", "languagePref":"nodejs", "level":"beginner" },
  "analytics": { "reasonKeys": ["skill-fit","topic-match"] }
}

Ingestion & extraction steps

Use a robust PDF extractor (pdfminer, PyMuPDF, or your preferred extractor) to pull raw text and page-level chunks from the PDF.

Use rule-based heuristics + regex patterns to detect course titles, price patterns (₹ or digits), lines with badges/perks, and the description block. When ambiguous, fallback to small LLM to split segments.

Produce the canonical course JSON records above; keep raw_text_origin pointer to PDF page and bounding info for auditing.

Save both JSON catalog and embeddings.

Embedding & vector store

Compute embedding for each record using the provided embedding model: google/embeddinggemma-300m. Embedding key fields:

description + title + topics + perks + metadata (concatenate).

Store vectors in Chroma with metadata fields (level, language, availability, id, price). Index must support filter queries (level, language).

Also compute embeddings for common user intent phrases and store as templates for faster matching.

Intent parsing (exact format)

First attempt with deterministic rules/regex:

detect job intent words: backend, frontend, data, ml, devops

detect language preferences: "node", "node.js", "nodejs", "python", "java"

detect level: beginner/intermediate/advanced

detect urgency/budget phrases ("short course", "under 2 weeks", "₹1000")

If regex cannot extract confidence > 0.8, call lightweight LLM to parse into:

{
  "goal":"become backend engineer",
  "preferredLanguage":"nodejs",
  "level":"beginner",
  "budget": 2000,
  "format": null
}

Retrieval + candidate selection

From parsed intent, form a textual query: e.g. "backend nodejs course for beginner practical express api design project".

Compute its embedding and query Chroma top 10 with metadata filters (if user specified level or budget).

For each match calculate combined score = 0.6 * cosine_score + 0.4 * exact_topic_match_score. Keep top 3.

Verification step (business rule)

If preferredLanguage exists and any candidate includes that language in topics/title, mark exactMatch=true and return that course as primary.

If none include preferredLanguage, but technical fit (backend architecture, APIs, database, design patterns) is high (score threshold), then exactMatch=false and use persuasion fallback.

LLM generation prompt templates

Controlled system instructions for gemma-3-270m (system):

You are an edtech assistant that recommends courses. Always respond politely, clearly, and with user-centered, honest persuasion. If an exact match exists for the user's preferred language, return that course with details and strong CTA. If not, explain why a best-fit backend course (non-language-specific) is often superior for long-term success; emphasize transferable skills (architecture, design patterns, API design, databases). Avoid negative language about the user's preference. Keep tone motivating and helpful. Output must be JSON with keys: { "markdown": ..., "candidates": [ ... ], "exactMatch": bool, "explainers": [ ... ] }.


Generation prompt — examples included:

Case A: Exact match exists (Node.js course found).

SYSTEM: [use system above]

USER_INTENT:
{
  "goal": "become a backend engineer",
  "preferredLanguage": "nodejs",
  "level":"beginner"
}

RETRIEVAL_RESULTS:
[
  {
    "id":"course_nodejs_intro_001",
    "title":"Node.js Backend Essentials",
    "description":"Hands-on Node.js backend: Express, REST APIs, JWT, DB integration. 30 hours.",
    "price": 1999,
    "topics":["nodejs","express","rest","jwt","postgres"],
    "availability": true,
    "score": 0.97
  },
  { ... }
]

TASK: produce the JSON output the API should return. Include a markdown message (short, friendly) that highlights the Node.js course details, what it will teach, how it helps achieve the goal, price, perks, and a clear CTA. Provide concise reasons why this course matches their requested Node.js preference and backend career goal.


Case B: No exact match (Node.js course not found).

SYSTEM: [use system above]

USER_INTENT:
{
  "goal": "become a backend engineer",
  "preferredLanguage": "nodejs",
  "level":"beginner"
}

RETRIEVAL_RESULTS:
[
  {
    "id":"course_backend_design_python_021",
    "title":"Backend Systems & API Design (Python)",
    "description":"Backend architecture, REST API design, transactional data, testing, deployment. Project-based.",
    "price": 1899,
    "topics":["backend","api-design","python","db","architecture"],
    "availability": true,
    "score": 0.93
  },
  ...
]

TASK: produce the JSON response. Because no Node.js course exists, craft a customer-favouring persuasive markdown reply that:
- acknowledges and validates the user's Node.js preference.
- explains briefly why learning backend fundamentals (architecture, API design, databases) is higher ROI and transferable across languages.
- point-by-point map how the top candidate (Python backend) covers the same concepts they care about (APIs, async, I/O, authentication) and how those skills make switching to Node.js later easy.
- include an optional upsell: "If you specifically need Node.js, we can notify you when it arrives OR we can offer a short bridge module to convert Python/architecture knowledge to Node.js at a discount."
- include candidate course details, price, perks, and CTA(s).
- produce `exactMatch:false`, and include confidence and reason keys.

Example outputs (two cases)

Case A — nodejs present

{
  "markdown": "Great! We have a perfect match: **Node.js Backend Essentials** (30 hours). This course covers Express, REST APIs, JWT auth, DB integration and a capstone project. Price: ₹1999. Perks: 30% scholarship test refund. Why this matches: direct Node.js focus + backend fundamentals. [Buy now] [Add to wishlist]",
  "candidates": [{ "id":"course_nodejs_intro_001", "title":"Node.js Backend Essentials","score":0.97}],
  "exactMatch": true,
  "intent": {...}
}


Case B — nodejs missing

{
  "markdown": "I love that you want to be a backend engineer — Node.js is a great choice. We don’t currently have a Node.js course, but we do have **Backend Systems & API Design (Python)** which teaches the core backend skills (API design, auth, DB, async IO, testing) that will make learning Node.js later trivial. If you learn these fundamentals, switching languages is just syntax — and employers care about design, testing, and system thinking more than the exact runtime. This course has a hands-on project and costs ₹1899. Want me to: 1) enroll you now, 2) notify when Node.js is available, or 3) add a Node.js bridge module at 30% off?",
  "candidates":[{"id":"course_backend_design_python_021","title":"Backend Systems & API Design (Python)","score":0.93}],
  "exactMatch": false,
  "intent": {...}
}

Prompt engineering tips (for gemma-3-270m)

Keep generation length limited by system role and by specifying max_tokens appropriate for short responses.

Always request structured JSON output in the prompt to make downstream parsing deterministic.

Provide a few-shot example within the prompt (use the two case examples above).

Control risk by adding Do not invent course IDs or price changes and require the model to only talk about items present in the RETRIEVAL_RESULTS list.

Fallback UX / persuasion guidelines (copy for LLM)

When the exact course is unavailable, LLM should:

Validate preference: “Node.js is a solid choice — good call.”

Acknowledge unavailability briefly: “We don’t have a Node.js course right now.”

Redirect to benefits: Focus on transferable skills (architecture, API design, performance, security, testing, database), and explain how these are higher ROI.

Offer product options:

enroll in the best-fit course now,

notify upon Node.js arrival,

take a short bridge module to Node.js (discounted).

Provide clear CTAs, pricing, and perks.

Keep a positive, empathetic tone.

Implementation notes & dev checklist

Unit tests for PDF extraction → ensure every course record has required fields.

Integration test for /api/recommend using sample user inputs (Node.js present/missing).

Logging and analytics: log intent, top_candidates, exactMatch, user_action for A/B evaluation.

Use caching for embeddings and retrieval to speed up repeated queries.

Add feature-flag to toggle LLM synthetic generation vs static templates (for QA).

Put database/catalog and vector store behind a service layer for future scaling.

Dockerfile and docker-compose already present — add a service for the RAG worker if needed.

Add a simple admin UI to confirm/update catalog items extracted from PDF.

Deployment & infra suggestions

Run the LLM + embeddings locally if resources permit, or use Hugging Face inference endpoints for gemma and embeddinggemma if you prefer managed infra.

Keep the Chroma vector database persistent (attached volume).

Expose POST /api/recommend behind rate-limiter and authentication for enterprise use.

Instrument telemetry for conversion and retention: track whether suggestions with fallback lead to purchase.

Testing examples (start with these)

Input: "I want to be a backend engineer — I prefer Node.js, beginner level." → Expect case A if Node.js exists, else case B persuasion.

Input: "Backend job, prefer Python or Node, need project-based course" → Should return multi-candidate list and ask clarifying question only if too ambiguous.

Input: "Quick bootcamp under ₹2000 for backend" → filter based on price and format metadata.

Implementation pseudo-workflow (concise)

extract_pdf_to_catalog("/mnt/data/...pdf") → catalog.json

build_embeddings(catalog.json, embedding_model) → Chroma

Expose REST POST /api/recommend:

parse intent (regex + LLM)

retrieve candidates (Chroma)

call gemma-3-270m with RETRIEVAL_RESULTS + generation prompt

validate generated course IDs against catalog

return JSON

Track analytics and optionally queue "notify when Node.js available".