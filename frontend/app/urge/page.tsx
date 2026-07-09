"use client";

import { useRouter } from "next/navigation";
import { UrgeModeScreen } from "../../components/UrgeModeScreen";

export default function UrgePage() {
  const router = useRouter();

  return (
    <div>
      <UrgeModeScreen onComplete={() => router.push("/")} />
    </div>
  );
}
