import { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import "./App.css";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";
import { useNavigate, Routes, Route } from "react-router-dom";
import GamePage from "./components/GamePage/GamePage"; 
import ResultPage from "./components/Resullt/ResultPage";

function App() {
  const categories = [
    { name: "Any", value: "" },
    { name: "Art", value: "25" },
    { name: "Animals", value: "27" },
    { name: "Celebrities", value: "26" },
    { name: "Computers", value: "18" },
    { name: "Geography", value: "22" },
    { name: "History", value: "23" },
    { name: "Movies", value: "11" },
    { name: "Sports", value: "21" },
  ];
  const savedTheme = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(savedTheme);
  const [hasError, setHasError] = useState({
    name: false,
    count: false,
    difficulty: false,
  });

  const [gameDetails, setGameDetails] = useState({
    username: "",
    count: null,
    difficulty: null,
    category: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const name = e.target.value;
    setGameDetails((prevDetails) => ({ ...prevDetails, username: name }));
  };

  const handleAttributeSelect = (value, attribute) => {
    setGameDetails((prevDetails) => ({ ...prevDetails, [attribute]: value }));
  };

  const handleSubmit = () => {
    const newErrors = {
      name: gameDetails.username.trim() === "",
      count: gameDetails.count === null,
      difficulty: gameDetails.difficulty === null,
    };

    setHasError(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      setTimeout(() => {
        setHasError({
          name: false,
          count: false,
          difficulty: false,
        });
      }, 700);
    } else {
      const queryString = new URLSearchParams(gameDetails).toString();
      localStorage.setItem("gameConfig", queryString);
      navigate(`/game?${queryString}`);  
    }
  };

  function useClientSideStorage(key, defaultValue) {
    useEffect(() => {
      const value = localStorage.getItem(key) || defaultValue;
      localStorage.setItem(key, value);
    }, [key, defaultValue]);
  }

  useClientSideStorage("theme", "light");

  return (
    <main className="main">
      <div className="description">
        <div className="titleBar">
          <div className="titleText">
            <h1>Quizzzter</h1>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
        <form className="gameForm">
          <div className="formGroup">
            <label htmlFor="username">Name :</label>
            <input
              name="username"
              value={gameDetails.username}
              onChange={handleChange}
              maxLength={20}
              className={hasError.name ? "inputError" : ""}
            />
          </div>
          <div className="formGroup">
            <label>Number of Questions :</label>
            <div className="countsChoice">
              {[5, 10, 15, 20].map((count) => (
                <span
                  key={count}
                  className={`${
                    gameDetails.count === count ? "selectedOption" : ""
                  } ${hasError.count ? "inputError" : ""}`}
                  onClick={() => handleAttributeSelect(count, "count")}
                  role="button"
                >
                  {count}
                </span>
              ))}
            </div>
          </div>
          <div className="formGroup">
            <label>Difficulty :</label>
            <div className="countsChoice">
              {["Easy", "Medium", "Hard"].map((level) => (
                <span
                  key={level}
                  className={`${
                    gameDetails.difficulty === level.toLocaleLowerCase()
                      ? "selectedOption"
                      : ""
                  } ${hasError.difficulty ? "inputError" : ""}`}
                  onClick={() =>
                    handleAttributeSelect(
                      level.toLocaleLowerCase(),
                      "difficulty"
                    )
                  }
                  role="button"
                >
                  {level}
                </span>
              ))}
            </div>
          </div>
          <div className="formGroup">
            <label>Categories :</label>
            <Form.Select
              aria-label="Select Categories"
              variant={theme}
              data-bs-theme={theme}
              name="category"
              className="categories"
              value={gameDetails.category}
              onChange={(e) =>
                setGameDetails((prevDetails) => ({
                  ...prevDetails,
                  category: e.target.value,
                }))
              }
            >
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </div>
        </form>
        <div className="toolbar3" onClick={handleSubmit}>
          Let&apos;s Play
        </div>
      </div>
    </main>
  );
}

// Routing should be placed outside of the main App function
export default function AppWrapper() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/game" element={<GamePage />} />
      <Route path="/game/result" element={<ResultPage />} />
    </Routes>
  );
}
