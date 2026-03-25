import { Suspense } from "react";
import ThankYouInner from "./ThankYouInner";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThankYouInner />
    </Suspense>
  );
}