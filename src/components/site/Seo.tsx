import { Helmet } from "react-helmet-async";

const SITE_URL = "https://neovaspace.com";
const DEFAULT_OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/5e661c88-601b-4f43-8582-af07586df364/id-preview-41c3f7b8--beab7aae-7cb5-4a91-be1b-94919e3eb46e.lovable.app-1777568839165.png";

type SeoProps = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  image?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

export const Seo = ({
  title,
  description,
  path,
  type = "website",
  image = DEFAULT_OG_IMAGE,
  jsonLd,
}: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  const desc = description.length > 158 ? description.slice(0, 155) + "…" : description;
  const blocks = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  );
};

export default Seo;