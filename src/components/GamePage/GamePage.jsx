import "../../App.css";
import { useEffect, useState } from "react";
import { Button, ProgressBar } from "react-bootstrap";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import Loader from "../Loader/Loader";
import he from "he";
import { useSearchParams,useNavigate } from "react-router-dom";

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
  const [lifelines, setLifelines] = useState({
    half: false,
    skip: false,
  });
  const [timer, setTimer] = useState(100);
  const savedTheme = localStorage.getItem("theme") || "light";
  const [theme, setTheme] = useState(savedTheme);
  const [searchParams] = useSearchParams();
  let seconds = 20;
  const navigate = useNavigate();

  useEffect(() => {
    let config = {};
    for (const [key, value] of searchParams.entries()) {
      config[key] = value;
    }
    setGameDetails(config);
  }, [searchParams]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (gameDetails.count && gameDetails.difficulty) {
        let count = parseInt(gameDetails.count) + 1;
        let url = `https://opentdb.com/api.php?type=multiple&amount=${count}&difficulty=${gameDetails.difficulty}`;
        url += gameDetails.category ? `&category=${gameDetails.category}` : "";
        console.log(url);

        try {
          const result = await fetch(url, { cache: "no-store" });
          const data = await result.json();
          const formattedQuestions = formatQuestions(data.results);
          console.log(formattedQuestions);
          setQuestions(formattedQuestions);
        } catch (error) {
          console.error("Error fetching questions:", error);
        }
      }
    };

    fetchQuestions();
  }, [gameDetails]);

  const formatQuestions = (questionsArray) => {
    return questionsArray?.map((ques) => ({
      question: he.decode(ques.question),
      options: getShuffledArr([
        ...ques.incorrect_answers.map((ans) => {
          return he.decode(ans);
        }),
        he.decode(ques.correct_answer),
      ]),
      correctAnswer: he.decode(ques.correct_answer),
    }));
  };

  const getShuffledArr = (arr) => {
    return [...arr].sort(() => Math.random() - 0.5);
  };

  const incrementIndex = () => {
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
  };

  const validateAnswer = (question, chosenOption) => {
    if (selectedOption == null && chosenOption !== "") {
      setSelectedOption(chosenOption);
      setCorrectOption(question.correctAnswer);
      setTimeout(incrementIndex, 1900);
      if (chosenOption === question.correctAnswer) setScore((prev) => prev + 1);
    }
  };
  const fiftyFifty = () => {
    let currentQuestion = questions[index];

    let indexes = currentQuestion.options
      .map((ans, ind) => (ans !== currentQuestion.correctAnswer ? ind : null))
      .filter((ind) => ind !== null);

    const randomIndexToKeep =
      indexes[Math.floor(Math.random() * indexes.length)];

    let arr = currentQuestion.options.map((option, ind) => {
      return ind === randomIndexToKeep ||
        option === currentQuestion.correctAnswer
        ? option
        : ``;
    });

    let updatedQuestions = [...questions];
    updatedQuestions[index] = { ...currentQuestion, options: arr };

    setQuestions(updatedQuestions);
    setLifelines({ ...lifelines, half: true });
    setScore((score) => score - 0.5);
  };

  const replaceQuestion = () => {
    const lastQuestionIndex = questions.length - 1;
    if (index < lastQuestionIndex) {
      let newQuestions = [...questions];
      newQuestions[index] = questions[lastQuestionIndex];
      setQuestions(newQuestions);
      setLifelines({ ...lifelines, skip: true });
      setScore((score) => score - 1);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedOption === null) {
        setTimer((prev) => {
          if (prev <= 0) {
            clearInterval(interval);
            incrementIndex();
            return 100; // Reset the timer
          }
          return prev - 100 / seconds;
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedOption, timer]);

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
    setLifelines({
      half: false,
      skip: false,
    });
    setTimer(100);
    window.location = "/";
  };

  return questions?.length ? (
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
      {questions && (
        <div className="description questions">
          <ProgressBar
            now={timer}
            animated={true}
            variant="success"
            className="progress"
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
                aria-disabled={true}
              >
                {String.fromCharCode(65 + ind)}. {option}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="toolbar">
        <Button
          className='lifelineButton borderR'
          disabled={lifelines.half}
          role="button"
          onClick={fiftyFifty}
          variant={theme}
          title="Remove 2 wrong answers for 0.5 points"
        >
          50 / 50
        </Button>
        <Button
          className='lifelineButton borderR'
          disabled={lifelines.skip}
          onClick={replaceQuestion}
          variant={theme}
          title="Swap this question for a new one for 1 point"
        >
          Skip
        </Button>
      </div>
    </main>
  ) : (
    <Loader theme={theme} />
  );
};

export default GamePage;
