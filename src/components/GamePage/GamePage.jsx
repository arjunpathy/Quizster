import "../../App.css";
import { useEffect, useState, useCallback } from "react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import Loader from "../Loader/Loader";
import { useSearchParams, useNavigate } from "react-router-dom";
import he from "he";
import { ProgressBar } from "react-bootstrap";

const SECONDS = 20;

const GamePage = () => {
  const [gameDetails, setGameDetails] = useState({
    username: "",
    count: null,
    difficulty: null,
    category: "",
  });
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctOption, setCorrectOption] = useState(null);
  const [score, setScore] = useState(0);
  const [lifelines, setLifelines] = useState({ half: false, skip: false });
  const [timer, setTimer] = useState(100);
  const savedTheme = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(savedTheme);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const config = Object.fromEntries(searchParams.entries());
    setGameDetails(config);
  }, [searchParams]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (gameDetails.count && gameDetails.difficulty) {
        const count = parseInt(gameDetails.count) + 1;
        let url = `https://opentdb.com/api.php?type=multiple&amount=${count}&difficulty=${gameDetails.difficulty}`;
        if (gameDetails.category) url += `&category=${gameDetails.category}`;

        try {
          const response = await fetch(url, { cache: "no-store" });
          const data = await response.json();
          setQuestions(formatQuestions(data.results));
        } catch (error) {
          console.error("Error fetching questions:", error);
        }
      }
    };

    fetchQuestions();
  }, [gameDetails]);

  const formatQuestions = (questionsArray) =>
    questionsArray.map((ques) => ({
      question: he.decode(ques.question),
      options: getShuffledArr([
        ...ques.incorrect_answers.map((ans) => he.decode(ans)),
        he.decode(ques.correct_answer),
      ]),
      correctAnswer: he.decode(ques.correct_answer),
    }));

  const getShuffledArr = (arr) => [...arr].sort(() => Math.random() - 0.5);

  const incrementIndex = useCallback(() => {
    if (index < gameDetails.count - 1) {
      setTimer(100);
      setSelectedOption(null);
      setCorrectOption(null);
      setIndex((prev) => prev + 1);
    } else {
      localStorage.setItem(
        "result",
        `${gameDetails.username}:${score}:${gameDetails.count}`
      );
      navigate(`/game/result`);
    }
  }, [index, gameDetails.count, gameDetails.username, score, navigate]);

  const validateAnswer = (question, chosenOption) => {
    if (selectedOption === null && chosenOption !== "") {
      setSelectedOption(chosenOption);
      setCorrectOption(question.correctAnswer);
      setTimeout(incrementIndex, 1900);
      if (chosenOption === question.correctAnswer) setScore((prev) => prev + 1);
    }
  };

  const fiftyFifty = () => {
    if (!lifelines.half) {
      const currentQuestion = questions[index];
      const indexes = currentQuestion.options
        .map((ans, ind) => (ans !== currentQuestion.correctAnswer ? ind : null))
        .filter((ind) => ind !== null);

      const randomIndexToKeep =
        indexes[Math.floor(Math.random() * indexes.length)];

      const updatedOptions = currentQuestion.options.map((option, ind) =>
        ind === randomIndexToKeep || option === currentQuestion.correctAnswer
          ? option
          : ""
      );

      setQuestions((prev) =>
        prev.map((q, i) =>
          i === index ? { ...q, options: updatedOptions } : q
        )
      );
      setLifelines((prev) => ({ ...prev, half: true }));
      setScore((score) => score - 0.5);
    }
  };

  const replaceQuestion = () => {
    if (!lifelines.skip && index < questions.length - 1) {
      setQuestions((prev) => {
        const updatedQuestions = [...prev];
        updatedQuestions[index] = prev[prev.length - 1];
        return updatedQuestions;
      });
      setLifelines((prev) => ({ ...prev, skip: true }));
      setScore((score) => score - 1);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedOption === null && timer > 0) {
        setTimer((prev) => prev - 100 / SECONDS);
      } else {
        clearInterval(interval);
      }
    }, 1000);

    if (timer <= 0) incrementIndex();

    return () => clearInterval(interval);
  }, [timer, selectedOption, incrementIndex]);

  const redirectToHome = () => {
    setGameDetails({
      username: "",
      count: null,
      difficulty: null,
      category: "",
    });
    setQuestions([]);
    setIndex(0);
    setSelectedOption(null);
    setCorrectOption(null);
    setScore(0);
    setLifelines({ half: false, skip: false });
    setTimer(100);
    window.location = "/";
  };

  return questions.length ? (
    <main className="main">
      <div className="topbar">
        <div className="scores">
          <span>Hello {gameDetails.username.toUpperCase()}!</span>
          <span>
            <i>
              <b>Score:</b> {score}
            </i>
          </span>
        </div>
        <div style={{ display: "flex" }}>
          <div className="emojiIcons">
            <img
              src={theme === "light" ? "/home_dark.png" : "/home_light.png"}
              style={{ width: "85%" }}
              onClick={redirectToHome}
              title="Home"
            />
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>
      <div className="description questions">
        <ProgressBar
          now={timer}
          animated
          variant="success"
          className="progresss"
        />
        <div className="questionContainer">
          <p className="questionText">
            {index + 1}. {questions[index]?.question}
          </p>
        </div>
        <div className="optionsGrid">
          {questions[index]?.options.map((option, ind) => (
            <div
              key={ind}
              className={`option ${
                option === selectedOption
                  ? option === questions[index].correctAnswer
                    ? "rightAnswer"
                    : "wrongAnswer"
                  : option === correctOption
                  ? "rightAnswer"
                  : ""
              }`}
              onClick={() => validateAnswer(questions[index], option)}
              role="button"
              aria-disabled="true"
            >
              {String.fromCharCode(65 + ind)}. {option}
            </div>
          ))}
        </div>
      </div>
      <div className="toolbar">
        <span
          className={`lifelineButton borderL ${
            lifelines.half ? "disabled" : ""
          }`}
          disabled={lifelines.half}
          onClick={fiftyFifty}
          title="Remove 2 wrong answers for 0.5 points"
        >
          50 / 50
        </span>
        <span
          className={`lifelineButton borderR ${
            lifelines.skip ? "disabled" : ""
          } `}
          disabled={lifelines.skip}
          onClick={replaceQuestion}
          title="Swap this question for a new one for 1 point"
        >
          Skip
        </span>
      </div>
    </main>
  ) : (
    <Loader theme={theme} />
  );
};

export default GamePage;
