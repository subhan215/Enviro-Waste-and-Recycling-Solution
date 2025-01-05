import { useState, useEffect } from "react";

// Custom hook to detect screen size based on media query
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = () => setMatches(mediaQuery.matches);

    // Set initial match status
    handleChange();

    // Add event listener for changes in media query
    mediaQuery.addEventListener("change", handleChange);

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;
