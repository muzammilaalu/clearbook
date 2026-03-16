import { Github } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex flex-col">
            <h3 className="text-sm font-semibold text-gray-900">
              ClearBooks Integration Tool
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Data Import & Export Utility
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <nav className="flex items-center gap-6">
              <a
                href="#documentation"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Documentation
              </a>
              <a
                href="#support"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Support
              </a>
              <a
                href="#github"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
            </nav>

            <div className="text-xs text-gray-500 sm:border-l sm:border-gray-200 sm:pl-6">
              © {currentYear} ClearBooks. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
