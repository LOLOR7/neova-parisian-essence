import { Link } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { Seo } from "@/components/site/Seo";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  return (
    <SiteShell>
      <Seo
        title="Insights — Neova"
        description="Editorial notes from Neova on real estate, renovation, property search and private advisory in Paris."
        path="/blog"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Neova Insights",
          url: "https://www.neovaspace.com/blog",
          blogPost: blogPosts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            datePublished: p.date,
            url: `https://www.neovaspace.com/blog/${p.slug}`,
          })),
        }}
      />
      <PageHero
        eyebrow="Neova — Insights"
        index="VII"
        title={
          <>
            Insights<br />
            <em className="display-italic">from the atelier.</em>
          </>
        }
        intro="Real estate, renovation, and private advisory notes from Neova."
      />

      <Section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 md:gap-x-10 md:gap-y-20">
          {blogPosts.map((post, i) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className={`reveal group flex flex-col ${i % 2 === 1 ? "lg:mt-16" : ""}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground">
                  {post.category}
                </p>
                <p className="numeral text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </p>
              </div>
              <div className="aspect-[4/5] overflow-hidden bg-stone mb-7">
                <img
                  src={post.image}
                  alt={post.imageAlt}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                />
              </div>
              <h2 className="font-display text-2xl md:text-[26px] leading-[1.2] text-balance group-hover:text-foreground transition-colors">
                {post.title}
              </h2>
              <p className="mt-4 text-[15px] leading-[1.7] text-slate-soft">
                {post.excerpt}
              </p>
              <div className="mt-6 flex items-center gap-4 text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground">
                <span>{post.dateLabel}</span>
                <span className="h-px w-6 bg-hairline" />
                <span>{post.readTime}</span>
              </div>
              <span className="mt-6 text-[10.5px] uppercase tracking-[0.28em] text-foreground link-underline w-fit">
                Read article →
              </span>
            </Link>
          ))}
        </div>
      </Section>
    </SiteShell>
  );
};

export default Blog;