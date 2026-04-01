import { Link } from "react-router-dom";

export default function Header({
  heading,
  paragraph,
  linkName,
  linkUrl = "#",
  additionalLinkName,
  additionalLinkUrl = "#",
}) {
  return (
    <div className="mb-10">
      <div className="flex justify-center">
        <img
          alt=""
          className="h-14 w-auto"
          src="https://res.cloudinary.com/da0fkowyd/image/upload/v1716320751/mobirehablogo_z0dywh.png"
        />
      </div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        {heading}
      </h2>
      <p className="text-center text-sm text-gray-600 mt-5">
        {paragraph}
        <Link
          to={linkUrl}
          className="font-medium text-blueColor hover:text-blueHover"
        >
          {linkName}
        </Link>
      </p>
      {additionalLinkName && (
        <p className="text-center text-sm text-gray-600 mt-5">
          <Link
            to={additionalLinkUrl}
            className="font-medium text-blueColor hover:text-blueHover"
          >
            {additionalLinkName}
          </Link>
        </p>
      )}
    </div>
  );
}
