export function obfuscatePhone(
  phone: string | undefined
): string {
  const len = phone?.length ?? 0;
  const cut = 3;

  if (phone === undefined) return '';

  return phone.substring(0, cut) + phone.substring(cut, len-cut).replace(/./g, '.') + phone.substring(len-cut);
}
