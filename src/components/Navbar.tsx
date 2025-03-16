import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
  children?: ReactNode;
}

export default function Navbar({ children }: NavbarProps) {
  return (
    <nav className="bg-amber-100 dark:bg-amber-900 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-amber-800 dark:text-amber-200">Contest Tracker</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/admin"
              className="text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100"
            >
              Admin
            </Link>
            {children}
          </div>
        </div>
      </div>
    </nav>
  );
}