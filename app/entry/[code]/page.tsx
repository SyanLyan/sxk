import { notFound } from "next/navigation";
import DistanceCalculator from "@/components/DistanceCalculator";

export default function EntryPage({
  params,
}: {
  params: { code: string };
}) {
  const allowedCode = process.env.ENTRY_CODE;

  if (!allowedCode || params.code !== allowedCode) {
    notFound();
  }

  return <DistanceCalculator sessionCode={params.code} />;
}
