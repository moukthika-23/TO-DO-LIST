import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { redis } from "@/lib/redis";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    // Check Redis cache first
    const cachedTasks = await redis.get(`tasks:${userId}`);
    if (cachedTasks) {
      console.log("Serving tasks from Redis cache");
      return NextResponse.json(cachedTasks);
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Cache in Redis for 1 hour
    await redis.set(`tasks:${userId}`, data, { ex: 3600 });
    console.log("Serving tasks from Supabase and caching in Redis");

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Backend API Error in /api/tasks:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch tasks", details: error }, { status: 500 });
  }
}
