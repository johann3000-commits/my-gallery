import { client } from "@/lib/sanity";

export default async function Page() {
  const galleries = await client.fetch(`
    *[_type == "gallery"] | order(order asc) {
      title,
      "slug": slug.current
    }
  `);

  return (
    <pre style={{ padding: 20 }}>
      {JSON.stringify(galleries, null, 2)}
    </pre>
  );
}