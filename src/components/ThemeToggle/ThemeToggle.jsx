import { useEffect } from "react";
import './ThemeToggle.css'; // Correct CSS import

// eslint-disable-next-line react/prop-types
const ThemeToggle = ({ theme, setTheme }) => {
  useEffect(() => {
    setTheme(theme);
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [setTheme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="emojiIcons">
      <img
        src={theme === "light" ? "/mode_dark.png" : "/mode_light.png"}
        style={{ width: "85%", cursor: "pointer" }}
        onClick={toggleTheme}
        alt="Toggle theme"
        title="Toggle Theme"
      />
    </div>
  );
};

export default ThemeToggle;
