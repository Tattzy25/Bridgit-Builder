import { ClerkProvider } from "@clerk/clerk-react";
import { ReactNode } from "react";

interface ClerkAuthProviderProps {
  children: ReactNode;
}

// Step 1: Auth → Clerk setup
export function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error(
      "Missing Clerk Publishable Key. Add VITE_CLERK_PUBLISHABLE_KEY to your environment variables.",
    );
    return (
      <div className="min-h-screen flex items-center justify-center bg-neubg">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            Configuration Error
          </h1>
          <p className="text-muted-foreground">
            Missing authentication configuration. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignInUrl="/"
      afterSignUpUrl="/"
      appearance={{
        baseTheme: undefined,
        elements: {
          formButtonPrimary:
            "bg-bridgit-primary hover:bg-bridgit-primary/90 text-white",
          card: "bg-neubg/90 backdrop-blur-xl border border-white/10 shadow-neu-xl",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton:
            "border border-white/10 hover:bg-white/5 text-foreground",
          formFieldInput:
            "bg-neulight/60 border border-white/10 text-foreground",
          formFieldLabel: "text-foreground",
          footerActionLink: "text-bridgit-primary hover:text-bridgit-secondary",
        },
        variables: {
          colorPrimary: "#8B5CF6",
          colorBackground: "#0F172A",
          colorText: "#F8FAFC",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
