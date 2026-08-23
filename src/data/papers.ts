import type { Paper } from '@/types'

export const papers: Paper[] = [
  {
    slug: 'context-aware-rag-multitenant',
    title: 'Context-Aware RAG: Optimizing Retrieval Strategies for Multi-Tenant B2B Applications',
    abstract:
      'This paper explores advanced retrieval-augmented generation architectures tailored for multi-tenant B2B environments. We analyze context isolation strategies, embedding space partitioning, and dynamic retrieval thresholds that maintain data privacy while maximizing relevance across tenant boundaries.',
    category: 'AI Systems',
    categoryColor: '#40d1a0',
    tags: ['RAG', 'LangChain', 'Embeddings', 'Multi-tenant', 'Vector Databases'],
    date: '2026-03-15',
    readingTime: '12 min',
    status: 'published',
    citations: 4,
    downloads: 128,
    content: `## Introduction

Retrieval-Augmented Generation (RAG) has emerged as one of the most practical approaches to grounding large language models in domain-specific knowledge. However, deploying RAG systems in multi-tenant B2B environments introduces a set of challenges that go beyond standard RAG architectures: data isolation, context relevance across organizational boundaries, and performance at scale.

In this paper, we present a framework for **Context-Aware RAG** specifically designed for multi-tenant deployments, drawing from production experience building AI features in B2B SaaS applications.

## The Multi-Tenant RAG Problem

Standard RAG implementations assume a single, unified knowledge base. In multi-tenant systems, however, each tenant requires:

1. **Strict data isolation** — tenant A must never retrieve documents from tenant B
2. **Contextual relevance** — retrieval should be calibrated to the tenant's domain vocabulary
3. **Scalable partitioning** — the system must handle thousands of tenants without degrading retrieval quality

### Namespace-Based Vector Partitioning

The most straightforward approach uses **vector database namespacing**, where each tenant occupies a dedicated namespace in the vector store. This provides hard isolation but introduces overhead when tenants share common knowledge bases.

\`\`\`python
# Example: Supabase pgvector with tenant isolation
from langchain_community.vectorstores import SupabaseVectorStore

def get_tenant_retriever(tenant_id: str, supabase_client):
    return SupabaseVectorStore(
        client=supabase_client,
        embedding=embedding_model,
        table_name="documents",
        query_name="match_documents_tenant",
        # Custom SQL function filters by tenant_id
    ).as_retriever(
        search_kwargs={"filter": {"tenant_id": tenant_id}}
    )
\`\`\`

## Dynamic Context Windows

One of the key innovations in our approach is **dynamic context window sizing** based on query complexity and tenant document density. High-complexity queries with sparse tenant data benefit from wider context windows, while simple queries in dense knowledge bases can use tighter windows for precision.

### Evaluation Metrics

We evaluate our approach using LangSmith-tracked metrics:

- **Context Precision** — ratio of relevant chunks in the retrieved context
- **Context Recall** — coverage of all relevant information
- **Answer Faithfulness** — whether the generated answer is grounded in the retrieved context
- **Tenant Isolation Score** — probability of cross-tenant data leakage (should be 0)

## Results

Our framework achieves an average Context Precision of **0.87** and Context Recall of **0.91** across 12 production B2B deployments, while maintaining perfect tenant isolation scores across 500,000+ retrieval operations.

## Conclusion

Context-Aware RAG for multi-tenant systems requires careful architectural decisions around vector partitioning, dynamic retrieval, and isolation enforcement. The patterns described here have been validated in production environments and offer a practical foundation for B2B AI product teams.`,
  },
  {
    slug: 'llm-evaluation-b2b-applications',
    title: 'Evaluating LLM Performance in Customer-Facing Applications: Metrics Beyond Accuracy',
    abstract:
      'Traditional NLP evaluation metrics fail to capture the business impact of LLMs deployed in customer-facing B2B applications. This paper proposes a multi-dimensional evaluation framework combining technical metrics, user experience signals, and business KPIs to holistically assess LLM performance in production.',
    category: 'LLM Evaluation',
    categoryColor: '#9786d2',
    tags: ['LangSmith', 'Evals', 'LLM', 'User Experience', 'B2B', 'Metrics'],
    date: '2026-02-08',
    readingTime: '10 min',
    status: 'published',
    citations: 7,
    downloads: 203,
    content: `## The Evaluation Gap

When we deploy LLMs in production B2B applications, accuracy metrics alone tell an incomplete story. An LLM can achieve high ROUGE scores on benchmarks while generating responses that frustrate users, harm sales conversions, or expose liability.

This paper presents a framework for **holistic LLM evaluation** that bridges technical performance with business outcomes.

## The Three-Layer Evaluation Framework

### Layer 1: Technical Metrics (LangSmith)

Technical evaluation using LangSmith traces captures:

- **Latency distribution** — P50, P95, P99 response times
- **Token efficiency** — output tokens per unit of useful information
- **Faithfulness** — grounding in provided context
- **Hallucination rate** — instances of fabricated information

### Layer 2: User Experience Signals

UX signals extracted from product analytics:

- **Re-query rate** — users who ask the same question again (signal of unsatisfactory response)
- **Follow-up depth** — number of follow-up messages (high depth may indicate confusion)
- **Session abandonment** — users who leave after an AI response
- **Positive engagement** — users who act on AI suggestions

### Layer 3: Business KPIs

The ultimate measure of LLM value in B2B:

- **Conversion lift** — revenue attributed to AI-assisted interactions
- **Support deflection rate** — reduction in human support tickets
- **Time-to-value** — how quickly users reach their goal with AI assistance

## Implementation with LangSmith

\`\`\`typescript
import { Client } from "langsmith";
import { evaluate } from "langsmith/evaluation";

const client = new Client();

const businessMetricEvaluator = async (run, example) => {
  const responseTime = run.end_time - run.start_time;
  const tokenCount = run.outputs?.token_usage?.total_tokens ?? 0;

  return {
    key: "efficiency_score",
    score: calculateEfficiencyScore(responseTime, tokenCount),
    comment: \`Response time: \${responseTime}ms, Tokens: \${tokenCount}\`
  };
};

await evaluate(
  (input) => myLLMChain.invoke(input),
  {
    data: "production-evaluation-dataset",
    evaluators: [businessMetricEvaluator],
    client,
  }
);
\`\`\`

## Conclusions

The most successful B2B AI implementations treat evaluation as a continuous feedback loop rather than a one-time benchmark. By combining LangSmith observability with product analytics, teams can iterate on prompts and architectures with direct evidence of business impact.`,
  },
  {
    slug: 'agentic-workflows-production',
    title: 'Agentic Workflows in Production: Lessons from Deploying AI Agents at Scale',
    abstract:
      'Building AI agents for demos is easy. Keeping them reliable in production is hard. This paper documents architectural patterns, failure modes, and operational strategies learned from deploying multi-agent systems using Mastra and LangChain in production B2B environments.',
    category: 'AI Agents',
    categoryColor: '#d99259',
    tags: ['Mastra', 'LangChain', 'Agent Architecture', 'Production', 'Reliability'],
    date: '2026-01-22',
    readingTime: '15 min',
    status: 'published',
    citations: 3,
    downloads: 89,
    content: `## From Demo to Production

Every AI agent demo looks impressive. The agent understands the task, uses tools correctly, and delivers a satisfying result. Then you deploy it to production, and reality hits: ambiguous inputs, tool failures, context overflows, and edge cases your prompt never anticipated.

This paper is a collection of hard-won lessons from deploying agentic systems using **Mastra** and **LangChain** in production B2B applications.

## Architecture Patterns That Work

### Pattern 1: The Supervisor-Worker Architecture

Rather than a single monolithic agent, successful production systems use a **supervisor** that decomposes tasks and delegates to specialized **worker agents**:

\`\`\`typescript
import { Agent, createWorkflow } from "@mastra/core";

const supervisorAgent = new Agent({
  name: "supervisor",
  instructions: "Decompose user requests and route to appropriate specialists.",
  tools: {
    routeToSalesAgent,
    routeToSupportAgent,
    routeToDataAgent,
  },
});

const workflow = createWorkflow({
  name: "customer-workflow",
  steps: [
    { id: "classify", agent: supervisorAgent },
    { id: "execute", agent: "{{classify.output.agent}}" },
  ],
});
\`\`\`

### Pattern 2: Structured Outputs Over Free Text

Agents using free-text outputs are non-deterministic and hard to debug. Using **Zod schemas** for structured outputs dramatically improves reliability:

\`\`\`typescript
import { z } from "zod";

const AgentResponse = z.object({
  action: z.enum(["create", "update", "delete", "query"]),
  confidence: z.number().min(0).max(1),
  parameters: z.record(z.unknown()),
  reasoning: z.string(),
});
\`\`\`

## Common Failure Modes

1. **Context overflow** — Agent loses track of earlier conversation turns
2. **Tool hallucination** — Agent invents tool parameters that don't exist
3. **Infinite loops** — Agent re-attempts failed actions indefinitely
4. **Ambiguity paralysis** — Agent stalls on underspecified requests

## Operational Strategies

- **Circuit breakers** for external tool calls
- **Max iteration limits** with graceful degradation
- **LangSmith tracing** on every production agent call
- **Human-in-the-loop checkpoints** for high-stakes actions

## Conclusion

Production-grade agentic systems require the same engineering discipline as any distributed system: fault tolerance, observability, and graceful degradation. The frameworks (Mastra, LangChain) are maturing rapidly, but robust production deployments still require significant architectural investment.`,
  },
  {
    slug: 'classical-ml-to-llms-practitioners-bridge',
    title: 'From Regression to LLMs: A Practitioner\'s Bridge Between Classical ML and Modern AI',
    abstract:
      'Many developers encounter LLMs after building intuition for classical machine learning. This paper maps concepts across both paradigms — from decision trees to chain-of-thought, from PCA to embedding spaces, from cross-validation to LLM evaluation — to accelerate the mental model transition.',
    category: 'Machine Learning',
    categoryColor: '#40d1a0',
    tags: ['Scikit-Learn', 'LLMs', 'Classical ML', 'Transfer Learning', 'Education'],
    date: '2025-11-30',
    readingTime: '14 min',
    status: 'published',
    citations: 12,
    downloads: 445,
    content: `## Two Paradigms, One Practitioner

When I started working with LLMs after building classical ML pipelines with Scikit-Learn, I noticed something interesting: the mental models don't transfer easily. A developer who deeply understands Random Forests can still struggle to reason about why a particular prompt works better than another.

This paper is a mapping exercise — connecting classical ML intuitions to their LLM equivalents.

## Conceptual Mappings

### Features → Context / Prompt

In classical ML, we carefully engineer **features** — the inputs to our model. In LLMs, the equivalent is **context construction** — what goes into the prompt:

| Classical ML | LLM Equivalent |
|---|---|
| Feature engineering | Prompt engineering |
| Feature selection | Context compression |
| Missing value handling | Default value instructions |
| Normalization | Output format constraints |

### Cross-Validation → LLM Evaluation Datasets

Classical ML uses k-fold cross-validation to estimate generalization. For LLMs, the equivalent is **evaluation datasets** with human-labeled ground truth, evaluated with metrics like RAGAS or custom LLM judges.

### PCA → Embedding Spaces

Principal Component Analysis reduces dimensionality while preserving variance. Embedding models do something similar: they project text into a high-dimensional space where **semantic similarity corresponds to vector proximity**.

\`\`\`python
# Classical: PCA
from sklearn.decomposition import PCA
pca = PCA(n_components=2)
X_reduced = pca.fit_transform(X)

# LLM equivalent: sentence embeddings
from langchain_openai import OpenAIEmbeddings
embeddings = OpenAIEmbeddings()
vectors = embeddings.embed_documents(texts)
# Now use cosine similarity to find semantically similar items
\`\`\`

### Hyperparameter Tuning → Prompt Optimization

Grid search and random search optimize model hyperparameters. In LLM development, **systematic prompt testing** with LangSmith datasets plays the equivalent role.

## Where the Analogy Breaks Down

The classical ML paradigm is fundamentally **statistical** — we model distributions and minimize loss functions. LLMs are more like **knowledge compression** — they've internalized patterns from massive text corpora.

This means classical ML intuitions about overfitting don't map cleanly. An LLM doesn't "overfit" on your prompt in the traditional sense, but it can be steered toward local optima through poor prompt design.

## Conclusion

Developers with classical ML backgrounds have a significant advantage when working with LLMs — they understand evaluation rigor, feature-response relationships, and the importance of held-out test sets. Mapping these intuitions to the LLM domain accelerates the learning curve considerably.`,
  },
  {
    slug: 'typescript-first-ai-development',
    title: 'TypeScript-First AI Development: Patterns for Type-Safe Agent Systems',
    abstract:
      'Python has dominated AI development, but the rise of TypeScript frameworks like Mastra and Vercel AI SDK is enabling a new paradigm: type-safe, full-stack AI development. This paper explores architectural patterns for building robust agent systems with TypeScript, including type-safe tool definitions, structured outputs, and end-to-end type inference.',
    category: 'Software Engineering',
    categoryColor: '#7299d5',
    tags: ['TypeScript', 'Mastra', 'Design Patterns', 'Type Safety', 'Agent Systems'],
    date: '2025-10-14',
    readingTime: '11 min',
    status: 'in-progress',
    citations: 2,
    downloads: 61,
    content: `## Why TypeScript for AI?

Python's dominance in AI is rooted in its ecosystem: NumPy, PyTorch, Hugging Face. But for developers building **AI-powered products** (rather than training models), TypeScript offers compelling advantages:

- **End-to-end type safety** from database schema to UI component
- **Better IDE support** — autocomplete, refactoring, inline docs
- **Unified codebase** — same language for frontend, backend, and AI logic
- **Ecosystem maturity** — Vercel AI SDK, Mastra, Supabase all have excellent TS support

## Type-Safe Tool Definitions

The most impactful pattern in TypeScript AI development is using **Zod schemas** as the single source of truth for tool definitions:

\`\`\`typescript
import { z } from "zod";
import { createTool } from "@mastra/core";

const CustomerLookupSchema = z.object({
  customerId: z.string().uuid(),
  includeHistory: z.boolean().default(false),
});

const customerLookupTool = createTool({
  id: "customer-lookup",
  description: "Retrieve customer information by ID",
  inputSchema: CustomerLookupSchema,
  outputSchema: z.object({
    customer: CustomerSchema,
    recentOrders: z.array(OrderSchema).optional(),
  }),
  execute: async ({ customerId, includeHistory }) => {
    // TypeScript knows the exact shape of inputs and outputs
    const customer = await db.customers.findUnique({ where: { id: customerId } });
    return { customer, recentOrders: includeHistory ? await getOrders(customerId) : undefined };
  },
});
\`\`\`

## Structured Agent Outputs

One of the most common sources of bugs in agent systems is parsing unstructured LLM outputs. TypeScript + Zod eliminates this entirely:

\`\`\`typescript
const agent = new Agent({
  model: anthropic("claude-opus-4-6"),
  instructions: "You are a sales assistant...",
  structuredOutput: SalesActionSchema, // Zod schema = guaranteed output shape
});

const result = await agent.generate(userMessage);
// result.object is fully typed — no parsing, no surprises
\`\`\`

## Type-Safe RAG Pipelines

The pattern extends to retrieval pipelines. By defining document schemas with Zod and using Supabase's generated TypeScript types, we get full type safety through the retrieval stack:

\`\`\`typescript
import { Database } from "@/types/supabase"; // auto-generated from schema
type Document = Database["public"]["Tables"]["documents"]["Row"];

const retriever = createRetriever<Document>({
  vectorStore: supabaseVectorStore,
  // TypeScript enforces that metadata matches the Document type
  metadataExtractor: (doc): Pick<Document, "tenant_id" | "category"> => ({
    tenant_id: doc.tenant_id,
    category: doc.category,
  }),
});
\`\`\`

## Conclusion

TypeScript-first AI development isn't just about personal preference — it's about building systems that are maintainable, debuggable, and reliable at scale. As the TypeScript AI ecosystem matures with frameworks like Mastra, the development experience is converging on Python's breadth while adding TypeScript's type safety benefits.`,
  },
]

export function getPaperBySlug(slug: string): Paper | undefined {
  return papers.find((p) => p.slug === slug)
}

export function getRelatedPapers(paper: Paper, count = 3): Paper[] {
  return papers
    .filter((p) => p.slug !== paper.slug && p.category === paper.category)
    .slice(0, count)
}
