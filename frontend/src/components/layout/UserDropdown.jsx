/* eslint-disable tailwindcss/no-contradicting-classname */
import { useState } from "react";
import { DropdownItem } from "../home/DropdownItem";
import { Dropdown } from "../home/Dropdown";

export default function UserDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  // User data
  const initials = user?.fname ? `${user.fname.charAt(0)}` : '?';
  const displayName = user?.lname && user?.fname ? `${user.lname} ${user.fname}` : 'Utilisateur inconnu';
  const email = user?.email; 

  return (
    <div className="relative  ">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-[#64FF07] hover:text-[#64FF07] focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="ml-2 mr-1 block flex size-11 items-center justify-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/10">
          {initials}
        </span>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-[#64FF07] dark:border-[#64FF07] overflow-hidden z-50"
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
             {email}
          </p>
        </div>

        <ul className="py-1">
          <li>
            <DropdownItem
              
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Mon profil
            </DropdownItem>
          </li>
        </ul>

        <div className="border-t border-gray-200 dark:border-gray-700">
          <DropdownItem
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Déconnexion
          </DropdownItem>
        </div>
      </Dropdown>
    </div>
  );
}