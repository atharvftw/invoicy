import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import fs from "fs";
import path from "path";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/invoice/new");

  const htmlPath = path.join(process.cwd(), "landing", "invoicy-automate-invoices-get-paid-faster.html");
  const htmlContent = fs.readFileSync(htmlPath, "utf-8");

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
