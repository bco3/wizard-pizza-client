import { useState, useEffect } from "react";
import "./deals.css";
import Axios from "axios";

export const Deals = () => {
  const [deals, setDeals] = useState();

  useEffect(() => {
    Axios.get(`${process.env.REACT_APP_BACKEND_URL}/deals`)
      .then((response) => {
        let serveDeals = response.data;
        setDeals(serveDeals);
        console.log(serveDeals);
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <>
      <h1 id="bannerDeal">
        THE DEAL THAT SAVES YOU THE MOST IS AUTOMATICALLY APPLIED
      </h1>
      <div className="deals">
        {deals !== undefined && deals[0] ? (
          Object.keys(deals).map((deal, index) => {
            return (
              <section className="deal" key={deal + index}>
                <img
                  src={`./img/${deals[deal]["img_name"]}.webp`}
                  className="dealPicture"
                  alt={`${deal} deal`}
                ></img>
                <h2 className="dealTitle3">{deals[deal]["deal_title"]}</h2>
                <h2 className="dealTitle2">{deals[deal]["deal_title"]}</h2>
                <h2 className="dealTitle">{deals[deal]["deal_title"]}</h2>
                <div className="description">
                  {deals[deal]["deal_description"]}
                </div>
              </section>
            );
          })
        ) : (
          <h2 className="noDeals">
            Sorry there are no deals at this time, however please enjoy our
            everyday low prices on premium quality pizzas!!!
          </h2>
        )}
      </div>
      <h2 id="bannerDeal">ONLY ONE PROMOTION APPLICABLE PER ORDER</h2>
    </>
  );
};
