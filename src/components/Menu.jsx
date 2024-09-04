import { useState, useEffect } from "react";
import CreateRoom from "./menu/CreateRoom";
import ThemeMenu from "./menu/ThemeMenu";
import LogoutMenu from "./menu/LogoutMenu";
import { useSocket } from "../context/SocketContext";

function Menu({
  showMenu,
  setShowMenu,
  createRoomOpen,
  allUsers,
  username,
  rooms,
  openChat,
}) {
  const [currentMenu, setCurrentMenu] = useState("createRoom");
  const socket = useSocket(); // Use custom hook to get the socket object from the context

  const openMenu = (menu) => {
    setCurrentMenu(menu);
  };

  return (
    <div
      className="absolute left-[20.5rem] bg-indigo-400 w-72 h-[25rem] mx-auto mt-3 rounded-xl opacity-90 shadow-md transition-all ease-in-out duration-300
    hover:shadow-2xl hover:opacity-100"
    >
      <div className="flex justify-center">
        <h5
          className="font-bold text-white pt-5"
          style={{ fontSize: "1.4rem" }}
        >
          Menu
        </h5>
      </div>

      {/* Each menu conditionally rendered */}
      <div className="flex flex-col h-full">
        {currentMenu === "createRoom" && (
          <CreateRoom
            allUsers={allUsers}
            username={username}
            rooms={rooms}
            openChat={openChat}
            setShowMenu={setShowMenu}
          />
        )}
        {currentMenu === "theme" && <ThemeMenu />}
        {currentMenu === "logout" && <LogoutMenu />}
      </div>

      <div className="bottomBar rounded-b-xl absolute bottom-0 w-full h-11 bg-indigo-500 grid grid-cols-3">
        <div
          className="flex items-center justify-center rounded-bl-xl hover:bg-indigo-600"
          onClick={() => openMenu("createRoom")}
        >
          <img
            src={`${
              currentMenu === "createRoom"
                ? "create_room_active.png"
                : "add_icon.png"
            }`}
            alt="Create Room"
            className={`w-7 ${currentMenu === "createRoom" && "invert"}`}
          />
        </div>
        <div
          className="flex items-center justify-center hover:bg-indigo-600"
          onClick={() => openMenu("theme")}
        >
          <img
            src={`${
              currentMenu === "theme" ? "theme_active.png" : "theme.png"
            }`}
            alt="Theme"
            className="w-7 invert"
          />
        </div>
        <div
          className="flex items-center justify-center rounded-br-xl hover:bg-indigo-600"
          onClick={() => openMenu("logout")}
        >
          <img
            src={`${
              currentMenu === "logout" ? "logout_active.png" : "logout.png"
            }`}
            alt="Logout"
            className="w-7 invert"
          />
        </div>
      </div>
    </div>
  );
}

export default Menu;
