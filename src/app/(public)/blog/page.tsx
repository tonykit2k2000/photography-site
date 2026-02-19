import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Photography tips, session highlights, and behind-the-scenes stories.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.heading}>Blog</h1>
          <p className={styles.subheading}>
            Tips, stories, and highlights from behind the lens.
          </p>
        </header>

        {posts.length === 0 ? (
          <p className={styles.empty}>
            No posts yet — check back soon!
          </p>
        ) : (
          <div className={styles.grid}>
            {posts.map((post) => (
              <article key={post.slug} className={styles.card}>
                {post.coverImage && (
                  <div className={styles.cardImage}>
                    <img src={post.coverImage} alt={post.title} />
                  </div>
                )}
                <div className={styles.cardBody}>
                  <time className={styles.date} dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <h2 className={styles.cardTitle}>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className={styles.excerpt}>{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                    Read more &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
