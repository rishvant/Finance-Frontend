import { RedirectToSignIn, SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Spinner } from "@material-tailwind/react";
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
        <div className="flex flex-col items-center justify-center mt-[20%]">
          <Spinner />
          <p className="text-center text-[1.2rem]">Redirecting to Sign in...</p>
        </div>
        <RedirectToSignIn />
      </SignedOut>
    </header>
  );
}
