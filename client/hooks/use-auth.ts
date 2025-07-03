import { useState, useEffect } from "react";

// Simple auth without Clerk
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
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoaded: false,
    isSignedIn: false,
    tokens: 0,
    plan: "free",
  });

  useEffect(() => {
    // Auto-login after 1 second
    const timer = setTimeout(() => {
      const mockUser: User = {
        id: "user_123456789",
        email: "user@bridgit.ai",
        plan: "basic",
        tokens: 247,
        name: "AI User",
        firstName: "AI",
        lastName: "User",
        planId: "plan_basic",
      };

      setAuthState({
        user: mockUser,
        isLoaded: true,
        isSignedIn: true,
        tokens: mockUser.tokens,
        plan: mockUser.plan,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return authState;
}

// Token management
export function useTokens() {
  const { tokens, user, isSignedIn } = useAuth();

  const deductTokens = async (amount: number) => {
    if (!isSignedIn || !user) {
      throw new Error("Must be authenticated to use tokens");
    }
    console.log(`Deducting ${amount} tokens for user ${user.id}`);
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
