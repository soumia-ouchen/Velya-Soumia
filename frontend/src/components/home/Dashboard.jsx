import { useState } from 'react';
import "../../style.css";
import {
  IoLogoApple,
  IoHomeOutline,
  IoPeopleOutline,
  IoChatbubbleOutline,
  IoHelpCircleOutline,
  IoSettingsOutline,
  IoLockClosedOutline,
  IoLogOutOutline,
  IoMenuOutline
} from "react-icons/io5";

export default function Dashboard() {
  const [isNavActive, setIsNavActive] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const toggleMenu = () => setIsNavActive(!isNavActive);

  const navItems = [
    { icon: <IoLogoApple />, title: 'Brand Name' },
    { icon: <IoHomeOutline />, title: 'Dashboard' },
    { icon: <IoPeopleOutline />, title: 'Customers' },
    { icon: <IoChatbubbleOutline />, title: 'Messages' },
    { icon: <IoHelpCircleOutline />, title: 'Help' },
    { icon: <IoSettingsOutline />, title: 'Settings' },
    { icon: <IoLockClosedOutline />, title: 'Password' },
    { icon: <IoLogOutOutline />, title: 'Sign Out' }
  ];

  return (
    <div className={`container ${isNavActive ? 'active' : ''}`}>
      <div className={`navigation ${isNavActive ? 'active' : ''}`}>
        <ul>
          {navItems.map((item, index) => (
            <li
              key={index}
              className={hoveredIndex === index ? 'hovered' : ''}
              onMouseOver={() => setHoveredIndex(index)}
            >
              <a href="#">
                <span className="icon">{item.icon}</span>
                <span className="title">{item.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className={`main ${isNavActive ? 'active' : ''}`}>
        <div className="topbar">
          <div className="toggle" onClick={toggleMenu}>
            <IoMenuOutline />
          </div>
        </div>
      </div>
    </div>
  );
}
