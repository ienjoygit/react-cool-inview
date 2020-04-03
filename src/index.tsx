import { RefObject, useState, useRef, useEffect } from 'react';

// FIXME: Make sure URL is correct
export const observerErr =
  "💡react-cool-inview: this browser doesn't support IntersectionObserver, please install polyfill to enable lazy loading. More info: https://github.com/wellyshen/react-cool-inview#intersectionobserver-polyfill";

interface Callback {
  (entry?: IntersectionObserverEntry, observer?: IntersectionObserver): void;
}
interface Options {
  ssr?: boolean;
  root?: Element;
  rootMargin?: string;
  threshold?: number | number[];
  onChange?: Callback;
}
interface Return {
  readonly inView: boolean;
  readonly entry: IntersectionObserverEntry | null;
}

const useInView = (
  ref: RefObject<HTMLElement>,
  { ssr = false, root, rootMargin, threshold, onChange }: Options = {}
): Return => {
  const [inView, setInView] = useState<boolean>(ssr);
  const entryRef = useRef<IntersectionObserverEntry>(null);
  const observerRef = useRef<IntersectionObserver>(null);
  const onChangeRef = useRef<Callback>(null);

  useEffect(() => {
    if (!onChangeRef.current) onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!window.IntersectionObserver) {
      console.error(observerErr);
      return (): void => null;
    }

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      ([entry], observer) => {
        setInView(entry.isIntersecting);
        entryRef.current = entry;
        if (onChangeRef.current) onChangeRef.current(entry, observer);
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    if (ref.current) observerRef.current.observe(ref.current);

    return (): void => {
      observerRef.current.disconnect();
    };
  }, [root, rootMargin, threshold, ref]);

  return { inView, entry: entryRef.current };
};

export default useInView;
