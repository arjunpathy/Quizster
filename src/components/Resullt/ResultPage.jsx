import "../../App.css";
import { useState, useEffect } from "react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";

const ResultPage = () => {
  const [theme, setTheme] = useState("light");
  const [result, setResult] = useState(null);
  const [gifUrl, setGifUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    let storedResult = localStorage.getItem("result");
    if (storedResult) {
      const parsedResult = storedResult.split(":");
      setResult(parsedResult);
    }
  }, []);

  useEffect(() => {
    if (result) {
      const getGifUrl = async () => {
        let query = result[1] > result[2] / 2 ? "happy" : "sad";
        let url = `https://api.giphy.com/v1/gifs/search?api_key=z1Szjikpj7BR2C1EddazrE76tp7IgInk&q=${query}&limit=20`;
        const requestOptions = {
          method: "GET",
          redirect: "follow",
        };
        try {
          const response = await fetch(url, requestOptions);
          const data = await response.json();
          let index = Math.floor(Math.random() * 20);
          setGifUrl(data.data[index].images.downsized.url);
        } catch (error) {
          console.error("Error fetching gif:", error);
          setGifUrl(null);
        }
      };

      getGifUrl();
    }
  }, [result]);

  const redirectToHome = () => {
    window.location = "/";
  };

  const tryAgain = () => {
    let queryString = localStorage.getItem("gameConfig");
    navigate(`/game?${queryString}`);
  };

  return !result ? (
    <Loader theme={theme} />
  ) : (
    <main className="main">
      <div className="topbar">
        <div className="scores"></div>
        <div style={{ display: "flex" }}>
          <div className="emojiIcons">
            <img
              src={theme === "light" ? "/home_dark.png" : "/home_light.png"}
              style={{ width: "85%" }}
              onClick={redirectToHome}
              alt="Home Icon"
              title="Home"
            />
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <div className="description questions result">
        <div>
          Hey {result[0]}👋🏽
          <br />
          You scored {result[1]} out of {result[2]} <br />
        </div>
        {gifUrl && (
          <div className="gifContainer">
            <img src={gifUrl} alt="Gif Result" />
          </div>
        )}
      </div>
      <div className="toolbar3" onClick={tryAgain}>
        Try Again?
      </div>
    </main>
  );
};

export default ResultPage;
