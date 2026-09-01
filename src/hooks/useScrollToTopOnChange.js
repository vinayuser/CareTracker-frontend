import { useEffect } from 'react';
import { scrollAppToTop } from '../utils/scrollAppToTop';

/** Scroll to top whenever a wizard step / active form / page key changes. */
export default function useScrollToTopOnChange(value) {
  useEffect(() => {
    scrollAppToTop();
  }, [value]);
}
