import { useEffect } from "react";

/* Handles closing of UI element when user clicks off the component. 
   - isActive is the useState state representing the component's show/hide state.
   - ref refers to the UI component to show/hide 
   - excludeRef refers to a UI component to exclude from click outside detection. */

export const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  onClickOutside: () => void,
  isActive: boolean,
  excludeRef?: React.RefObject<HTMLElement>,
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (excludeRef?.current?.contains(event.target as Node)) {
        return;
      }
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    /* Add event listener only if the element is being shown. This ensures that
       we are not polluting the page with many global event listeners at the same time. */
    if (isActive) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, onClickOutside, isActive]);
};
