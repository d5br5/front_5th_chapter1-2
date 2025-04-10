import { BASE_PATH } from "../constants";
import { createObserver } from "./createObserver";

export const createRouter = (routes) => {
  const { subscribe, notify } = createObserver();

  const getPath = () => {
    const pathname = window.location.pathname;
    const pathnameWithoutBasePath = pathname.replace(BASE_PATH, "");
    return pathnameWithoutBasePath;
  };

  const getTarget = () => routes[getPath()];

  const push = (path) => {
    const pathnameWithBasePath = `${BASE_PATH}${path}`;
    window.history.pushState(null, null, pathnameWithBasePath);
    notify();
  };

  window.addEventListener("popstate", () => notify());

  return {
    get path() {
      return getPath();
    },
    push,
    subscribe,
    getTarget,
  };
};
