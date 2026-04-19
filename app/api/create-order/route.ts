import Razorpay from "razorpay"
import { redis } from "@/lib/redis"

export async function POST() {
  await redis.set("demo", "hello from redis")
  const val = await redis.get("demo")
  console.log("Redis value:", val)

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const order = await razorpay.orders.create({
    amount: 100,
    currency: "INR",
  });

  return Response.json(order);
}