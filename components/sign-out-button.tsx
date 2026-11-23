"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button className="nav-signout" onClick={() => signOut({ callbackUrl: "/" })}>
      Sign out
    </button>
  );
}
