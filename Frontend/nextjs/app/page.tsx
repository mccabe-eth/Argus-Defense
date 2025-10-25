import type { NextPage } from "next";
import { Header } from "~~/components/Header";
import { Footer } from "~~/components/Footer";
import { Hero } from "../components/hero";
import { ThreatMap } from "../components/threat-map";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main>
        <Hero />
        <ThreatMap />
      </main>
      <Footer />
    </div>
  );
};

export default Home;