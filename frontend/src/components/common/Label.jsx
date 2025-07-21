import { twMerge } from "tailwind-merge";

const Label = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        // Classes par défaut qui s'appliquent de base
        "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400",

        // className défini par l'utilisateur qui peut remplacer la marge par défaut
        className
      )}
    >
      {children}
    </label>
  );
};

export default Label;
