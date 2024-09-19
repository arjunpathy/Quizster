import "./Loader.css";

// eslint-disable-next-line react/prop-types
const Loader = ({ theme }) => {
  return (
    <div className="loaderDiv">
      <img src={theme === "light" ? "/loader_light.gif" : "/loader_dark.gif"} />
    </div>
  );
};

export default Loader;
