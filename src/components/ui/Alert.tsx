export default function Alert({
  title,
  message,
  type = "warning",
}: {
  title: string;
  message: string;
  type: "warning";
}) {
  const alertStyles = {
    warning: {
      backgroundColor: "#FFF9EB",
      borderColor: "#FFC233",
      color: "#8A6100",
    },
  };
  const currentStyle = alertStyles[type];

  return (
    <div
      className="p-3.5 border-l-2 rounded-md rounded-l-none"
      style={{
        backgroundColor: currentStyle.backgroundColor,
        borderColor: currentStyle.borderColor,
        color: currentStyle.color,
      }}>
      <div className="flex gap-2">
        <div className="pt-0.5">
          <svg
            width="16"
            height="16"
            viewBox="4 4 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 9C11 8.44772 11.4477 8 12 8C12.5523 8 13 8.44772 13 9C13 9.55228 12.5523 10 12 10C11.4477 10 11 9.55228 11 9ZM12 12C12.5523 12 13 12.4477 13 13V15C13 15.5523 12.5523 16 12 16C11.4477 16 11 15.5523 11 15V13C11 12.4477 11.4477 12 12 12Z"
              fill="#FFC233"
            />
          </svg>
        </div>

        <div className="space-y-1  grow">
          <p className="font-medium text-sm">{title}</p>
          <ul className="text-sm">
            <li>{message}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
