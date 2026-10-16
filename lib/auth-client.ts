"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/** Talks to the same-origin proxy at /api/auth. */
export const authClient = createAuthClient();
