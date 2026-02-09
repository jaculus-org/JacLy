// https://tech.reverse.hr/articles/debounce-function-in-typescript - by Valerio Senneca

export const debounce = <T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number
) => {
  let timeoutTimer: ReturnType<typeof setTimeout>;

  return (...args: T) => {
    clearTimeout(timeoutTimer);

    timeoutTimer = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};
