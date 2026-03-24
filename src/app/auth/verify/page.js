import { Suspense } from "react";
import VerifyInner from "./VerifyInner";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyInner />
    </Suspense>
  );
}