import React from "react";

const Footer = () => {
  return (
    <footer className="w-full border-t bg-white mt-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-600">
        
        {/* Left */}
        <p>
          © {new Date().getFullYear()} ClearBooks Dashboard. All rights reserved.
        </p>

        {/* Right */}
        <div className="flex gap-6 mt-2 md:mt-0">
          <a
            href="#"
            className="hover:text-blue-600 transition"
          >
            Privacy Policy
          </a>

          <a
            href="#"
            className="hover:text-blue-600 transition"
          >
            Terms
          </a>

          <a
            href="#"
            className="hover:text-blue-600 transition"
          >
            Support
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;