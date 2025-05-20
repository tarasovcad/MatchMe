export function getNameInitials(name: string) {
  const names = name?.split(" ");
  const initials = names?.map((name) => name.charAt(0)).join("");
  return initials;
}
