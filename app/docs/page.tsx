import { builder } from "@builder.io/sdk";
import { RenderBuilderSection } from "../../components/builder";

// Replace with your Public API Key
builder.init(process.env.NEXT_PUBLIC_BUILDER_KEY!);

// A coded (non-Builder) page. Same ISR window as the Builder pages.
export const revalidate = 60;

export default async function DocsPage() {
  // The sidebar is a Builder section model; urlPath lets you target
  // different sidebars to different docs paths (e.g. "/docs/*").
  const sidebar = await builder
    .get("sidebar", { userAttributes: { urlPath: "/docs" }, prerender: false })
    .toPromise();

  return (
    <div className="mx-auto flex max-w-5xl gap-8 px-6 py-12">
      <aside className="w-64 shrink-0">
        <RenderBuilderSection model="sidebar" content={sidebar} />
      </aside>
      <main className="min-w-0 flex-1">
        <h1 className="mb-4 text-3xl font-bold">Docs</h1>
        <p>
          This page is built in code. The sidebar on the left is a Builder
          section model, so it can be edited and published from Builder without
          a deploy.
        </p>
      </main>
    </div>
  );
}
