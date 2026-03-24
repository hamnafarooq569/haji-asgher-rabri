import { Suspense } from "react";
import AuthInner from "./AuthInner";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthInner />
    </Suspense>
  );
}