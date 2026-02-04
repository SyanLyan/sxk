"use client";

import { useState } from "react";
import HeartGate from "./HeartGate";

export default function ClientGate() {
  const [isLocked, setIsLocked] = useState(true);

  if (!isLocked) return null;

  return <HeartGate onUnlock={() => setIsLocked(false)} />;
}
