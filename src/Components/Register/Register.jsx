import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "../Navigation/Navigation";
import Footer from "../../Footer/Footer";
import { useAuth } from "../AuthContext/AuthContext"; // Import useAuth hook

const Register = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register, signInWithGoogle, signInWithGitHub } = useAuth(); // Use the register, signInWithGoogle, signInWithGitHub functions from AuthContext

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    const email = e.target.email.value;
    const password = e.target.password.value;
    const name = e.target.name.value; // Assuming you add a name field

    // Basic password validation (can be enhanced)
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const result = await register(email, password, name);

    if (result.success) {
      alert("Registration successful! You are now logged in.");
      navigate("/dashboard"); // Redirect to dashboard after successful registration and login
    } else {
      setError(result.message);
    }
  };

  // ▶ GOOGLE REGISTER
  const handleGoogleRegister = async () => {
    setError("");
    const result = await signInWithGoogle();
    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  // ▶ GITHUB REGISTER
  const handleGitHubRegister = async () => {
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

      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-6">
            Create an Account
          </h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {/* Google and GitHub buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGoogleRegister}
              className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" className="h-5 w-5 mr-2" />
              Sign up with Google
            </button>
            <button
              onClick={handleGitHubRegister}
              className="w-full flex items-center justify-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
            >
              <img src="https://www.svgrepo.com/show/512317/github-142.svg" alt="GitHub" className="h-5 w-5 mr-2" />
              Sign up with GitHub
            </button>
          </div>

          <div className="text-center my-4 text-slate-500">OR</div>

          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              required
              className="w-full p-3 border rounded-lg"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full p-3 border rounded-lg"
            />

            <input
              type="password"
              name="password"
              placeholder="Password (min 6 chars)"
              required
              className="w-full p-3 border rounded-lg"
            />

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600" >
              Login
            </Link>
          </p>
        </div>
      </div>
       <Footer/>
    </>
  );
};

export default Register;