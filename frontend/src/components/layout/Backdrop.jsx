import { useSidebar } from "./SidebarContext";

const Backdrop = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className=" inset-0 z-40 bg-black dark:bg-red bg-opacity-50 lg:hidden  "
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
