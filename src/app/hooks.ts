"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/axios";
import { isAxiosError } from "axios";

export interface Profile {
  id: string;
  bio: string | null;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  profile?: Profile | null;
  posts?: Post[]; // optional on user
}

export interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  authorId: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

type State<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useBlogData() {
  const [usersState, setUsersState] = useState<State<User[]>>({
    data: null,
    loading: true,
    error: null,
  });
  const [postsState, setPostsState] = useState<State<Post[]>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let canceled = false;

    async function fetchAll() {
      setUsersState((s) => ({ ...s, loading: true, error: null }));
      setPostsState((s) => ({ ...s, loading: true, error: null }));

      try {
        const [usersRes, postsRes] = await Promise.all([
          api.get<User[]>("/users"),
          api.get<Post[]>("/posts"),
        ]);

        if (canceled) return;
        setUsersState({ data: usersRes.data, loading: false, error: null });
        setPostsState({ data: postsRes.data, loading: false, error: null });
      } catch (err: unknown) {
        if (canceled) return;

        let msg = "Failed to fetch";

        // เคสเป็น AxiosError
        if (isAxiosError(err)) {
          msg = err.response?.data?.message ?? err.message ?? msg;

          // เคสเป็น Error ปกติ
        } else if (err instanceof Error) {
          msg = err.message;
        }

        setUsersState((s) => ({ ...s, loading: false, error: msg }));
        setPostsState((s) => ({ ...s, loading: false, error: msg }));
      }
    }

    fetchAll();
    return () => {
      canceled = true;
    };
  }, []);

  const totalUsers = useMemo(
    () => usersState.data?.length ?? 0,
    [usersState.data]
  );
  const totalPosts = useMemo(
    () => postsState.data?.length ?? 0,
    [postsState.data]
  );

  return {
    users: usersState.data,
    usersLoading: usersState.loading,
    usersError: usersState.error,

    posts: postsState.data,
    postsLoading: postsState.loading,
    postsError: postsState.error,

    totalUsers,
    totalPosts,
  };
}
