import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Kai's wallet</title>
        <meta
          name="description"
          content="Kai's wallet"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
