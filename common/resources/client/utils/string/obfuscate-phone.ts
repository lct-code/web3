export function obfuscatePhone(
  phone: string | undefined
): string | undefined {
  const len = phone?.length ?? 0;
  const cut = 3;

  if (typeof phone === undefined) return phone;

  return phone.substring(0, cut) + phone.substring(cut, len-cut).replace(/./g, '.') + phone.substring(len-cut);
}
