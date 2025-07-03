import { useState, useEffect } from "react";

// Mock Clerk auth - TODO: Replace with actual Clerk integration
interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  planId?: string;
}

interface AuthState {
  user: User | null;
  isLoaded: boolean;
  isSignedIn: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoaded: false,
    isSignedIn: false,
  });

  useEffect(() => {
    // Mock authentication - TODO: Replace with Clerk's useAuth
    const loadAuth = async () => {
      try {
        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock user data - TODO: Get from Clerk
        const mockUser: User = {
          id: "user_123456789", // This would come from Clerk
          email: "user@example.com",
          firstName: "John",
          lastName: "Doe",
          planId: "plan_basic", // Get from users table
        };

        setAuthState({
          user: mockUser,
          isLoaded: true,
          isSignedIn: true,
        });
      } catch (error) {
        console.error("Auth loading error:", error);
        setAuthState({
          user: null,
          isLoaded: true,
          isSignedIn: false,
        });
      }
    };

    loadAuth();
  }, []);

  return authState;
}

// TODO: Replace with actual Clerk auth implementation
// Uncomment and use this when Clerk is integrated:
/*
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';

export function useAuth() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user } = useUser();

  return {
    user: user ? {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      planId: user.publicMetadata.planId as string
    } : null,
    isLoaded,
    isSignedIn: !!isSignedIn
  };
}
*/
