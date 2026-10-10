"use server";

import { revalidatePath } from "next/cache";
import { STATUSES, type Status } from "@/lib/filters";
import { updateOrderStatus } from "@/lib/orders";

// A Server Action: a function that runs on the server but can be used as a
// <form action>. No API route, no fetch() call, and with JavaScript disabled
// the browser simply POSTs the form and gets the re-rendered page back.
export async function changeStatus(formData: FormData) {
  const id = Number(formData.get("id"));
  const status = String(formData.get("status")) as Status;
  if (!Number.isInteger(id) || !STATUSES.includes(status)) return;

  updateOrderStatus(id, status);
  revalidatePath(`/ssr/orders/${id}`);
}
