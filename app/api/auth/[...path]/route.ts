import { auth } from "@/lib/auth";

export const { GET, POST, PUT, DELETE, PATCH } = auth.handler();
