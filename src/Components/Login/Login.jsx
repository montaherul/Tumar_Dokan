import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "../Navigation/Navigation";
import Footer from "../../Footer/Footer";
import { useAuth } from "../AuthContext/AuthContext"; // Import useAuth hook

/**
 * Login component to handle user authentication.
 *
 * Provides email/password authentication via the backend API.
 * Redirects to the dashboard on successful login.
 * Provides a link to create a new account.
 */
const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, signInWithGoogle, signInWithGitHub } = useAuth(); // Use the login, signInWithGoogle, signInWithGitHub functions from AuthContext

  // ▶ EMAIL LOGIN
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const email = e.target.email.value.trim();
    const password = e.target.password.value.trim();

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  // ▶ GOOGLE LOGIN
  const handleGoogleLogin = async () => {
    setError("");
    const result = await signInWithGoogle();
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  // ▶ GITHUB LOGIN
  const handleGitHubLogin = async () => {
    setError("");
    const result = await signInWithGitHub();
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <>
      <Navigation />
      <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Sign In to Your Account
          </h2>

          {error && <p className="text-red-600 text-center mb-3">{error}</p>}

          {/* Google and GitHub buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="h-5 w-5 mr-2" />
              Sign in with Google
            </button>
            <button
              onClick={handleGitHubLogin}
              className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="h-5 w-5 mr-2" />
              Sign in with GitHub
            </button>
          </div>

          <div className="text-center my-4 text-slate-500">OR</div>

          {/* EMAIL LOGIN FORM */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              className="w-full p-3 border rounded-lg"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              className="w-full p-3 border rounded-lg"
            />

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Sign In
            </button>
          </form>

          {/* CREATE ACCOUNT */}
          <p className="text-center mt-3">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
       <Footer />
    </>
  );
};

export default Login;