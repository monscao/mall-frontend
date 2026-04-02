import { useCallback, useEffect, useMemo, useState } from "react";

function parseLocation() {
  const { pathname, search } = window.location;
  return {
    pathname,
    search,
    searchParams: new URLSearchParams(search)
  };
}

function matchDynamicRoute(pathname, pattern) {
  const match = pathname.match(pattern);
  return match ? decodeURIComponent(match[1]) : null;
}

export function useRouter() {
  const [route, setRoute] = useState(() => parseLocation());

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseLocation());
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = useCallback(
    (to) => {
      if (to === `${route.pathname}${route.search}`) {
        return;
      }

      window.history.pushState({}, "", to);
      setRoute(parseLocation());
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [route.pathname, route.search]
  );

  const params = useMemo(
    () => ({
      productSlug: matchDynamicRoute(route.pathname, /^\/product\/([^/]+)$/),
      orderId: matchDynamicRoute(route.pathname, /^\/orders\/([^/]+)$/)
    }),
    [route.pathname]
  );

  return {
    route,
    navigate,
    ...params
  };
}
