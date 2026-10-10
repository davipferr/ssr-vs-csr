// What a client-rendered page looks like before its JavaScript has run.
// This is ALL that "View Page Source" shows for the CSR pages.
export function AppLoading() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-sm text-black/50 dark:text-white/50">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      Loading app…
      <noscript>
        <p className="max-w-sm text-center text-rose-600">
          You need to enable JavaScript to run this app. (This is the classic SPA message. Try the /ssr pages: they
          work without it.)
        </p>
      </noscript>
    </div>
  );
}
