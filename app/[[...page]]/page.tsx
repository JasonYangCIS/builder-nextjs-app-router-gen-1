import { builder } from "@builder.io/sdk";
import {
  RenderBuilderContent,
  RenderBuilderSection,
} from "../../components/builder";

// Replace with your Public API Key
builder.init(process.env.NEXT_PUBLIC_BUILDER_KEY!);

// Statically generate pages at build time (ISR): a page is rebuilt in the
// background at most once every 60 seconds when it is requested.
export const revalidate = 60;

// Prerender every published Builder page. Paths not returned here are
// rendered on first request and then cached (dynamicParams defaults to true),
// which also covers pages published after the last build.
export async function generateStaticParams() {
  try {
    const pages = await builder.getAll("page", {
      fields: "data.url",
      options: { noTargeting: true },
      limit: 200,
    });
    return pages
      .map((p) => p.data?.url as string | undefined)
      .filter((url): url is string => typeof url === "string")
      .map((url) => ({ page: url.split("/").filter(Boolean) }));
  } catch (error) {
    console.error("generateStaticParams: failed to list Builder pages", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{
    page?: string[];
  }>;
}

export default async function Page(props: PageProps) {
  const { page } = await props.params;
  // Use the page path specified in the URL for Builder targeting
  const userAttributes = { urlPath: "/" + (page?.join("/") || "") };

  // Section models are fetched with the same urlPath, so they can be
  // targeted to specific URLs in Builder.
  const get = (model: string) =>
    builder
      // Set prerender to false to return JSON instead of HTML
      .get(model, { userAttributes, prerender: false })
      .toPromise();

  const [announcementBar, header, content, footer] = await Promise.all([
    get("announcement-bar"),
    get("header"),
    get("page"),
    get("footer"),
  ]);

  return (
    <>
      <RenderBuilderSection model="announcement-bar" content={announcementBar} />
      <RenderBuilderSection model="header" content={header} />
      {/* Render the Builder page */}
      <RenderBuilderContent model="page" content={content} />
      <RenderBuilderSection model="footer" content={footer} />
    </>
  );
}
