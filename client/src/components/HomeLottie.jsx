import Lottie from "lottie-react";
import homeAnimation from "../assets/Lottie/home-animation.json";

const HomeLottie = () => {
  return (
    <div className="w-full ms-9">
      <Lottie animationData={homeAnimation} className="w-full h-96" />
    </div>
  );
};

export default HomeLottie;
