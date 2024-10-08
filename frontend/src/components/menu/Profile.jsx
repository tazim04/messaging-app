import { userContext } from "../../context/UserContext";
import { useState, useContext } from "react";
import AvatarIcon from "../AvatarIcon";
import { format, isToday } from "date-fns";

function Profile() {
  const { user } = useContext(userContext);

  const formatBirthday = (birthday) => {
    const date = new Date(birthday);

    return format(date, "MMMM d, yyyy");
  };

  return (
    <div className="overflow-auto overflow-x-hidden h-[21rem] scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-gray-300 scrollbar-track-transparent">
      <link
        rel="stylesheet"
        href="https://cdn.materialdesignicons.com/6.5.95/css/materialdesignicons.min.css"
      ></link>

      <div className="mr-1 w-[20rem] pt-2 pb-4 text-gray-50 px-2">
        <div className="flex flex-col items-center">
          <div className="relative h-12 w-12 mb-1">
            <AvatarIcon name={user.username} showStatus={false} />
          </div>
          <p className="font-bold">{user.username}</p>
          <p className="text-[0.8rem]">{user.email}</p>

          {/* Social Media Links */}
          <div className="flex flex-row my-2 space-x-3">
            {user.socials?.instagram && (
              <a
                href={user.socials.instagram}
                className="flex rounded-full bg-orange-100 bg-opacity-100 hover:bg-opacity-80 transition-all duration-200 ease-in-out h-10 w-10"
              >
                <i className="mdi mdi-instagram text-orange-300 mx-auto mt-2"></i>
              </a>
            )}
            {user.socials?.facebook && (
              <a
                href={user.socials.facebook}
                className="flex rounded-full bg-blue-100 bg-opacity-100 hover:bg-opacity-80 transition-all duration-200 ease-in-out h-10 w-10"
              >
                <i className="mdi mdi-facebook text-blue-300 mx-auto mt-2"></i>
              </a>
            )}
            {user.socials?.linkedin && (
              <a
                href={user.socials.linkedin}
                className="flex rounded-full bg-indigo-100 bg-opacity-100 hover:bg-opacity-80 transition-all duration-200 ease-in-out h-10 w-10"
              >
                <i className="mdi mdi-linkedin text-indigo-300 mx-auto mt-2"></i>
              </a>
            )}
          </div>
        </div>
        <div className="grid grid-rows-2 text-center mt-2">
          <div className="row">
            <p className="font-semibold text-[0.9rem]">My Interests</p>
            <div className="w-full flex flex-wrap justify-center">
              {user.interests &&
                user?.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-gray-300 text-gray-800 rounded-full px-2 py-1 m-1 text-[0.7rem]"
                  >
                    {interest}
                  </span>
                ))}
            </div>
          </div>
          <div className="row pt-5">
            <p className="font-semibold text-[0.9rem]">My Birthday</p>
            <p className="text-[0.8rem]">
              {user.birthday && formatBirthday(user.birthday)}
            </p>
          </div>
        </div>
        <div className="flex justify-center mt-5 text-gray-100 text-sm cursor-pointer opacity-100 underline hover:opacity-60">
          <p>edit profile</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
