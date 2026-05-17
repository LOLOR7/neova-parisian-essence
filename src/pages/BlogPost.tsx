import { Link, useParams, Navigate } from "react-router-dom";
import { SiteShell } from "@/components/layout/SiteShell";
import { Section } from "@/components/site/Section";
import { Seo } from "@/components/site/Seo";
import { blogPosts, getBlogPost } from "@/data/blogPosts";

const BlogPost = () => {
  const { slug } = useParams();
  const post = slug ? getBlogPost(slug) : undefined;
  if (!post) return <Navigate to="/blog" replace />;

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <SiteShell>
      <Seo
        title={post.seoTitle}
        description={post.seoDescription}
        path={`/blog/${post.slug}`}
        type="article"
        image={post.image}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.seoDescription,
          datePublished: post.date,
          dateModified: post.date,
          articleSection: post.category,
          author: { "@type": "Organization", name: "Neova" },
          publisher: {
            "@type": "Organization",
            name: "Neova",
            url: "https://www.neovaspace.com",
          },
          mainEntityOfPage: `https://www.neovaspace.com/blog/${post.slug}`,
        }}
      />

      <article>
        <header className="pt-32 md:pt-40 pb-12 md:pb-16">
          <div className="container-editorial max-w-4xl">
            <div className="flex items-center gap-4 text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground mb-8 reveal">
              <span>{post.category}</span>
              <span className="h-px w-6 bg-hairline" />
              <span>{post.dateLabel}</span>
              <span className="h-px w-6 bg-hairline" />
              <span>{post.readTime}</span>
            </div>
            <h1 className="display-xl text-balance reveal">{post.title}</h1>
            <p className="mt-10 body-lg max-w-2xl reveal">{post.excerpt}</p>
          </div>
        </header>

        <div className="container-editorial">
          <div className="aspect-[16/9] overflow-hidden bg-stone reveal-image">
            <img
              src={post.image}
              alt={post.imageAlt}
              className="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </div>

        <Section>
          <div className="max-w-2xl mx-auto">
            {post.content.map((p, i) => (
              <p
                key={i}
                className="body-lg mb-7 reveal"
                style={{ transitionDelay: `${i * 40}ms` }}
              >
                {p}
              </p>
            ))}

            <div className="mt-16 pt-10 border-t border-hairline">
              <Link
                to="/blog"
                className="text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground hover:text-foreground link-underline"
              >
                ← Back to Insights
              </Link>
            </div>
          </div>
        </Section>

        {related.length > 0 && (
          <Section className="bg-bone">
            <p className="eyebrow mb-10">Related insights</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
              {related.map((r) => (
                <Link key={r.slug} to={`/blog/${r.slug}`} className="group flex flex-col reveal">
                  <div className="aspect-[4/5] overflow-hidden bg-stone mb-5">
                    <img
                      src={r.image}
                      alt={r.imageAlt}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <p className="text-[10.5px] uppercase tracking-[0.28em] text-muted-foreground mb-3">
                    {r.category}
                  </p>
                  <h3 className="font-display text-xl leading-[1.25] text-balance">
                    {r.title}
                  </h3>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </article>
    </SiteShell>
  );
};

export default BlogPost;