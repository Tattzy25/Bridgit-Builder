import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";

// Step 1: Auth → Clerk (User must be logged in first)
interface User {
  id: string;
  email: string;
  plan: "free" | "basic" | "pro" | "enterprise";
  tokens: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  planId?: string;
}

interface AuthState {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
  tokens: number;
  plan: string;
}

export function useAuth(): AuthState {
  const { isLoaded, isSignedIn, userId } = useClerkAuth();
  const { user } = useUser();

  // Step 1: Auth → Clerk (User must be logged in first)
  if (!isLoaded) {
    return {
      user: null,
      isLoaded: false,
      isSignedIn: false,
      tokens: 0,
      plan: "free",
    };
  }

  if (!isSignedIn || !user) {
    return {
      user: null,
      isLoaded: true,
      isSignedIn: false,
      tokens: 0,
      plan: "free",
    };
  }

  // Clerk checks: user ID, plan, tokens
  const clerkUser: User = {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    plan: (user.publicMetadata?.plan as any) || "free",
    tokens: (user.publicMetadata?.tokens as number) || 50,
    name: user.fullName || undefined,
    firstName: user.firstName || undefined,
    lastName: user.lastName || undefined,
    planId: (user.publicMetadata?.planId as string) || "plan_free",
  };

  return {
    user: clerkUser,
    isLoaded: true,
    isSignedIn: true,
    tokens: clerkUser.tokens,
    plan: clerkUser.plan,
  };
}

// Token management with real Clerk integration
export function useTokens() {
  const { tokens, user, isSignedIn } = useAuth();

  const deductTokens = async (amount: number) => {
    if (!isSignedIn || !user) {
      throw new Error("Must be authenticated to use tokens");
    }

    // TODO: Update user metadata in Clerk and Neon DB
    console.log(`Deducting ${amount} tokens for user ${user.id}`);

    // This would update Clerk user metadata:
    // await user.update({
    //   publicMetadata: {
    //     ...user.publicMetadata,
    //     tokens: tokens - amount
    //   }
    // });
  };

  const hasEnoughTokens = (required: number) => {
    return isSignedIn && tokens >= required;
  };

  const requireAuth = () => {
    if (!isSignedIn) {
      throw new Error("Authentication required. Please sign in to continue.");
    }
  };

  return { tokens, deductTokens, hasEnoughTokens, requireAuth };
}
