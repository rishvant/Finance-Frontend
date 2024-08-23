import { RedirectToSignIn, SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      navigate("/dashboard/home");
    }
  }, [user, navigate]);

  return (
    <header>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </header>
  );
}
