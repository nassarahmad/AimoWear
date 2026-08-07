import { useState, type ReactNode } from "react";
import { loginUser, registerUser, isLoggedIn, type AuthUser } from "@/lib/auth";
import { getCurrentUserRole, type Role } from "@/lib/permissions";
import { Lock, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface AuthGateModalProps {
  actionName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: AuthUser) => void;
}

export function AuthGateModal({ actionName = "continue", isOpen, onClose, onSuccess }: AuthGateModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "register") {
        registerUser({ username, email, password });
        const user = loginUser({ username, password });
        if (user) {
          onSuccess?.(user);
          onClose();
        }
      } else {
        const user = loginUser({ username, password });
        if (user) {
          onSuccess?.(user);
          onClose();
          if (user.role === "admin") {
            navigate({ to: "/admin" });
          }
        } else {
          setError("Invalid username or password.");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication error.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-md bg-surface border border-border p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-white p-2"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="size-12 rounded-full bg-primary/10 border border-primary/30 mx-auto grid place-items-center mb-3">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-bold">Sign In Required</p>
          <h2 className="font-display text-3xl italic mt-1">Join Studio</h2>
          <p className="text-xs text-muted-foreground mt-2">
            You need an account to <span className="text-white font-medium">{actionName}</span>. Guests can only browse the catalog.
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setMode("login"); setError(""); }}
            className={`flex-1 py-2 text-[10px] uppercase tracking-[0.2em] font-bold border transition-colors ${mode === "login" ? "bg-primary border-primary text-white" : "border-border text-muted-foreground"}`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode("register"); setError(""); }}
            className={`flex-1 py-2 text-[10px] uppercase tracking-[0.2em] font-bold border transition-colors ${mode === "register" ? "bg-primary border-primary text-white" : "border-border text-muted-foreground"}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Username</label>
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          {mode === "register" && (
            <div>
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 block">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-transparent border border-border px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>

          {error && <p className="text-xs text-primary">{error}</p>}

          <button
            type="submit"
            className="w-full bg-primary text-white py-4 text-xs uppercase tracking-[0.3em] font-bold hover:brightness-110 transition-all mt-2"
          >
            {mode === "register" ? "Create Account & Continue" : "Sign In & Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface AuthGateWrapperProps {
  children: ReactNode;
  allowedRoles?: Role[];
  title?: string;
  description?: string;
}

export function AuthGate({
  children,
  allowedRoles = ["user", "admin"],
  title,
  description,
}: AuthGateWrapperProps) {
  const [showModal, setShowModal] = useState(false);
  const role = getCurrentUserRole();
  const authorized = allowedRoles.includes(role);
  const isGuest = role === "guest";

  if (authorized) {
    return <>{children}</>;
  }

  const actionLabel = isGuest ? "Sign In / Register" : "Switch Account";
  const defaultTitle = isGuest
    ? "Sign in to access this page"
    : "Insufficient permissions";
  const defaultDescription = isGuest
    ? "Guests are permitted to browse the catalog only. To customize items, place orders, and manage checkout, please sign in or create an account."
    : "Your account does not have permission to access this area. Sign in with a different account if you need access.";

  return (
    <div className="px-8 py-16 max-w-2xl mx-auto min-h-[60vh] text-center flex flex-col justify-center items-center">
      <div className="size-16 rounded-full bg-primary/10 border border-primary/30 grid place-items-center mb-6">
        <Lock className="h-8 w-8 text-primary" />
      </div>
      <p className="text-[10px] uppercase tracking-[0.4em] text-primary mb-2 font-bold">Access Restricted</p>
      <h1 className="font-display text-4xl md:text-5xl italic mb-4">
        {title || "Sign in to access this page"}
      </h1>
      <p className="text-sm text-muted-foreground max-w-md mb-8">
        {description || "Guests are permitted to browse the catalog only. To customize items, place orders, and manage checkout, please sign in or create an account."}
      </p>

      <button
        onClick={() => setShowModal(true)}
        className="bg-primary text-white px-8 py-4 text-xs uppercase tracking-[0.3em] font-bold hover:brightness-110 transition-all"
      >
        {actionLabel}
      </button>

      <AuthGateModal
        isOpen={showModal}
        actionName="access checkout and studio features"
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
        }}
      />
    </div>
  );
}
