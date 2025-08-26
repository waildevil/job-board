import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

function OAuthButtons() {
  return (
    <div className="space-y-3 mt-4">
      <button
        className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition"
        onClick={() => console.log("Google OAuth")}
      >
        <FcGoogle className="mr-2 text-xl" />
        Continue with Google
      </button>
      <button
        className="w-full flex items-center justify-center bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        onClick={() => console.log("Facebook OAuth")}
      >
        <FaFacebook className="mr-2 text-xl" />
        Continue with Facebook
      </button>
    </div>
  );
}

export default OAuthButtons;
