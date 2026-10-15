export function isSafeLink(value) {
  return (
    typeof value === "string" && /^(https?:\/\/|mailto:)/i.test(value.trim())
  );
}

export function splitSiteUrl(value = "imsyy.top") {
  try {
    const host = new URL(
      /^https?:\/\//i.test(value) ? value : `https://${value}`,
    ).hostname;
    const [name, ...suffix] = host.split(".");
    return [name, suffix.join(".")];
  } catch {
    return ["imsyy", "top"];
  }
}
