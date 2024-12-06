import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

const MenuButton = ({ isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <button
      className="sm:hidden p-4 bg-custom-green text-white fixed top-18 left-4 z-50 rounded-full"
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} size="lg" />
    </button>
  );
};

export default MenuButton;
