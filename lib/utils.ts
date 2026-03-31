export function buildMapsQueryUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function hasConfiguredValue(value?: string | null) {
  return Boolean(value?.trim());
}
