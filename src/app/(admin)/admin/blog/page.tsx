import { getAllPosts } from "@/lib/blog";
import Link from "next/link";
import styles from "./page.module.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog — Admin" };

export default function AdminBlogPage() {
  const posts = getAllPosts();

  return (
    <div>
      <h1 className={styles.heading}>Blog Posts</h1>
      <p className={styles.hint}>
        Blog posts are stored as <code>.mdx</code> files in the{" "}
        <code>content/blog/</code> folder. To add a new post, create a new{" "}
        <code>.mdx</code> file with frontmatter fields:{" "}
        <code>title</code>, <code>date</code>, and <code>excerpt</code>.
      </p>

      {posts.length === 0 ? (
        <p className={styles.empty}>No posts yet.</p>
      ) : (
        <div className={styles.list}>
          {posts.map((post) => (
            <div key={post.slug} className={styles.postCard}>
              <div>
                <h2 className={styles.postTitle}>{post.title}</h2>
                <time className={styles.postDate}>{post.date}</time>
                <p className={styles.postExcerpt}>{post.excerpt}</p>
              </div>
              <Link
                href={`/blog/${post.slug}`}
                className={styles.viewLink}
                target="_blank"
              >
                View post ↗
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
