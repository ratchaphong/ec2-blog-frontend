"use client";

import { useBlogData } from "./hooks";
import Link from "next/link";

export default function Home() {
  const {
    users,
    usersLoading,
    usersError,
    posts,
    postsLoading,
    postsError,
    totalUsers,
    totalPosts,
  } = useBlogData();

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-200/70 dark:border-gray-800/70">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">My Blog</h1>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="hover:underline underline-offset-4">
              Home
            </Link>
            <a
              href="/api/swagger"
              className="hover:underline underline-offset-4"
              target="_blank"
              rel="noreferrer"
            >
              API Docs
            </a>
          </nav>
        </div>
      </header>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
          <p className="mt-1 text-3xl font-semibold">
            {usersLoading ? "…" : totalUsers}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">Posts</p>
          <p className="mt-1 text-3xl font-semibold">
            {postsLoading ? "…" : totalPosts}
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-6 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Users list */}
        <section className="lg:col-span-1">
          <h2 className="text-lg font-semibold tracking-tight mb-3">Members</h2>

          {usersLoading && (
            <ul className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <li
                  key={i}
                  className="h-16 rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-gray-100/50 dark:bg-gray-900/40 animate-pulse"
                />
              ))}
            </ul>
          )}

          {usersError && (
            <div className="text-sm text-red-600 dark:text-red-400">
              Failed to load members: {usersError}
            </div>
          )}

          {!usersLoading && !usersError && (
            <ul className="space-y-3">
              {users?.map((u) => (
                <li
                  key={u.id}
                  className="rounded-xl border border-gray-200/70 dark:border-gray-800/70 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full border border-gray-200/70 dark:border-gray-700/70">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {u.profile?.bio && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {u.profile.bio}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Posts grid */}
        <section className="lg:col-span-2">
          <h2 className="text-lg font-semibold tracking-tight mb-3">
            Latest Posts
          </h2>

          {postsLoading && (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 rounded-xl border border-gray-200/70 dark:border-gray-800/70 bg-gray-100/50 dark:bg-gray-900/40 animate-pulse"
                />
              ))}
            </div>
          )}

          {postsError && (
            <div className="text-sm text-red-600 dark:text-red-400">
              Failed to load posts: {postsError}
            </div>
          )}

          {!postsLoading && !postsError && (
            <div className="grid sm:grid-cols-2 gap-4">
              {posts?.map((p) => (
                <article
                  key={p.id}
                  className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 p-5 hover:shadow-sm transition"
                >
                  <header className="flex items-center justify-between">
                    <h3 className="font-semibold leading-tight pr-3 line-clamp-2">
                      {p.title}
                    </h3>
                    <span className="text-[10px] px-2 py-1 rounded-full border border-gray-200/70 dark:border-gray-700/70">
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </header>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {p.content}
                  </p>
                  <footer className="mt-4 text-xs text-gray-500">
                    {new Date(p.createdAt).toLocaleString()}
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/70 dark:border-gray-800/70">
        <div className="mx-auto max-w-6xl px-6 py-10 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} My Blog — Built with Next.js & NestJS
        </div>
      </footer>
    </div>
  );
}
