export function isMobileOS(): boolean {
  return !!navigator.userAgent.match(/iPhone|Android.+Mobile/);
}
