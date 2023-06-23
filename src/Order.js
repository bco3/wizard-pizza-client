import { useState, useCallback, useEffect } from "react";
import "./order.css";
import { useOrder } from "./Contexts/OrderContext";
import { useCustomer } from "./Contexts/CustomerContext";
import { useInventory } from "./Contexts/InventoryContext";
// import { useDiscounts } from './Contexts/DiscountsContext';
import Axios from "axios";

export const Order = () => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useOrder();
  const [inventory, setInventory] = useInventory();
  const [dealOrder, setDealOrder] = useState({});
  const [orderId, setOrderId] = useState(0);
  const [customer, setCustomer] = useCustomer();
  const [showWizardProgress, setShowWizardProgress] = useState(0);
  const [showWizardNoPizza, setShowWizardNoPizza] = useState(0);
  const [deals, setDeals] = useState();
  const [totals, setTotals] = useState({
    "sub-total": 0,
    discount: 0,
    tax: 0,
    total: 0,
  });
  const [waitTime, setWaitTime] = useState(0);
  const [timeTillReady, setTimeTillReady] = useState(0);
  const [defaultTime, setDefaultTime] = useState();
  const [inputTimeValue, setInputTimeValue] = useState();
  const [openHours, setOpenHours] = useState();
  const [desserts, setDesserts] = useState();
  const [drinks, setDrinks] = useState();

  useEffect(() => {
    let currentDate = new Date();
    const theHours = () => {
      return `select * from hours where hours_id = ${currentDate.getDay()};`;
    };
    const hours = {
      hours: theHours(),
    };
    // console.log(orderDeal());

    Axios.get(`${process.env.REACT_APP_BACKEND_URL}/currentHours`, {
      params: hours,
    })
      .then((response) => {
        console.log({ params: hours });
        let serveHours = response.data;
        setOpenHours(serveHours);
        console.log(serveHours);
      })
      .catch((error) => console.log(error));
  }, []);

  const orderPriceCalc = useCallback(
    (name) => {
      let price = order[name].price;
      price = price.toString();
      return price.length < 3 ? (
        <div
          className="orderItemPrice"
          id={name + "price"}
          style={{ transform: "translate(-0.25rem, 0rem)" }}
          key={name}
        >
          <span
            style={{
              fontSize: "1.2rem",
              transform: "rotate(10deg) translate(-0.2rem, 0.25rem)",
            }}
          >
            $
          </span>
          {price}
        </div>
      ) : (
        <div className="orderItemPrice" id={name + "price"} key={name}>
          <span
            style={{
              fontSize: "1.2rem",
              transform: "rotate(13deg) translate(-0.2rem, 0.25rem)",
            }}
          >
            $
          </span>
          {price.slice(0, 2)}{" "}
          <span
            style={{
              fontSize: "1.3rem",
              transform: " translate(0rem, 0.2rem)",
            }}
          >
            {price.slice(2)}
          </span>
        </div>
      );
    },
    [order]
  );

  const selectSize = [
    { value: 1, label: "SML" },
    { value: 1.25, label: "MED" },
    { value: 1.5, label: "LRG" },
  ];

  const orderSizes = ["SML", "MED", "LRG"];

  const orderSize = (amount) => {
    let index = selectSize.findIndex((object) => {
      return object.value === amount;
    });
    return orderSizes[index];
  };

  const selectToppingAmount = [
    { value: 0, label: "NO THANKS" },
    { value: 0.7, label: "LIGHT" },
    { value: 1, label: "REGULAR" },
    { value: 2, label: "DOUBLE" },
    { value: 0.75, label: "LEFT HALF" },
    { value: 0.751, label: "RIGHT HALF" },
  ];
  const selectToppingAmountAbbrev = [
    "NON",
    "LGHT",
    "REG",
    "DBL",
    "L HALF",
    "R HALF",
  ];

  const abbreviateAmount = (amount) => {
    let index = selectToppingAmount.findIndex((object) => {
      return object.value === amount;
    });
    return selectToppingAmountAbbrev[index];
  };

  const drinksUpdateStatus = (orderItems) => {
    let id = +orderItems + 1;
    let inventorySold = inventory["drinks"][orderItems];
    // let active = status;
    console.log(id);
    return `UPDATE drinks set inventory = inventory - ${inventorySold} where drink_id = ${id};`;
  };
  const dessertsUpdateStatus = (orderItems) => {
    let id = +orderItems + 1;
    let inventorySold = inventory["desserts"][orderItems];
    // let active = status;
    console.log(id);
    return `UPDATE desserts set inventory = inventory - ${inventorySold} where dessert_id = ${id};`;
  };

  const handleRemoveClick = (e, orderItems) => {
    const newOrder = { ...order };
    const newDealOrder = { ...dealOrder };
    console.log(orderItems);
    console.log(inventory);
    // console.log(dealOrder);
    // console.log(order);
    delete newOrder[orderItems] &&
      setOrder(newOrder) &&
      handleTimeChange(inputTimeValue);
    delete newDealOrder[orderItems] && setDealOrder(newOrder);
    if (order[orderItems]["drink_id"]) {
      setInventory({
        ...inventory,
        drinks: {
          ...inventory["drinks"],
          [order[orderItems]["drink_id"]]:
            inventory["drinks"][order[orderItems]["drink_id"]] - 1,
        },
      });
      // const updateDrinks = {
      //   'status' : drinksUpdateStatus(e, orderItems)
      //  }
      //  Axios.post('${process.env.REACT_APP_BACKEND_URL}/updateDrinks', updateDrinks);
    } else if (order[orderItems]["dessert_id"]) {
      setInventory({
        ...inventory,
        desserts: {
          ...inventory["desserts"],
          [order[orderItems]["dessert_id"]]:
            inventory["desserts"][order[orderItems]["dessert_id"]] - 1,
        },
      });
      // const updateDesserts = {
      //   'status' : dessertsUpdateStatus(e, orderItems)
      //  }
      //  Axios.post('${process.env.REACT_APP_BACKEND_URL}/updateDesserts', updateDesserts);
    }
  };

  const getAsapTime = useCallback(async () => {
    const currentDate = new Date();
    let pizzaCount = 0;
    if (openHours) {
      console.log(
        currentDate.toLocaleTimeString("en-US", { hour12: false }) >
          openHours[0].openTime
      );
      Object.keys(order).map((item, index) => {
        return order[item].toppings ? pizzaCount++ : pizzaCount;
      });
      const asap =
        pizzaCount === 0
          ? new Date(currentDate.getTime())
          : new Date(
              currentDate.getTime() + ((waitTime + pizzaCount) * 4 + 8) * 60000
            );
      return openHours[0].closed === 1 ||
        openHours[0].closeTime <
          currentDate.toLocaleTimeString("en-US", { hour12: false })
        ? "00:00"
        : currentDate.toLocaleTimeString("en-US", { hour12: false }) <
          openHours[0].openTime
        ? setDefaultTime(openHours[0].openTime.replace(/(:\d{2}| [AP]M)$/, ""))
        : setDefaultTime(
            (asap.getHours() < 10 ? "0" + asap.getHours() : asap.getHours()) +
              ":" +
              (asap.getMinutes() < 10
                ? "0" + asap.getMinutes()
                : asap.getMinutes())
          );
    }
  }, [waitTime, order, openHours]);

  const handleTimeChange = useCallback(
    (input) => {
      return input === "00:00" || input === undefined
        ? setInputTimeValue(defaultTime)
        : setInputTimeValue(input);
    },
    [defaultTime]
  );

  useEffect(() => {
    getAsapTime();
    if (
      inputTimeValue === undefined ||
      inputTimeValue.length === 0 ||
      inputTimeValue === "00:00"
    ) {
      handleTimeChange(defaultTime);
    }
    const interval = setInterval(() => {
      getAsapTime();
    }, 60000);

    return () => clearInterval(interval);
  }, [getAsapTime, defaultTime, inputTimeValue, handleTimeChange]);

  const getDeals = useCallback(() => {
    const orderDeal = () => {
      return `select deals_id, deal_title, deal_description, deal_name, discount from wizard_pizza.deals where deal_active = 1 and time_in < "${inputTimeValue}:00" and time_out > "${inputTimeValue}:00" or deal_active = 1 and weekday = dayofweek(curdate()) or deal_active = 1 and date_in <= curdate() and date_out >= curdate() or deal_active = 1 and weekday is null and time_in is null and date_in IS NULL;`;
    };

    const deal = {
      orderdeal: orderDeal(),
    };
    // console.log(orderDeal());

    Axios.get(`${process.env.REACT_APP_BACKEND_URL}/order_deal`, {
      params: deal,
    })
      .then((response) => {
        let serveDeals = response.data;
        setDeals(serveDeals);
        setLoading(false);
        console.log(serveDeals);
      })
      .catch((error) => console.log(error));
  }, [inputTimeValue]);

  useEffect(() => {
    if (inputTimeValue) {
      getDeals();
    }
  }, [inputTimeValue, getDeals]);

  const priceTotal = useCallback(
    (name, discount) => {
      let subTotal = 0;
      let discountTotal = 0;
      let orderSorted = Object.keys(order).sort(
        (a, b) => order[b].price - order[a].price
      );
      if (name === "BOGO") {
        orderSorted.map((pizza, index) => {
          return (
            index % 2 !== 0 &&
            (discountTotal += (order[pizza].price * discount) / 100)
          );
        });
      } else if (name === "SAVE") {
        Object.keys(order).map((pizza, index) => {
          return (discountTotal += (order[pizza].price * discount) / 100);
        });
      } else if (name) {
        Object.keys(order).map((pizza, index) => {
          let regex = new RegExp(name);
          return (
            regex.test(pizza) &&
            (discountTotal += (order[pizza].price * discount) / 100)
          );
        });
      }
      Object.keys(order).map((orderItems, index) => {
        return (subTotal += order[orderItems].price);
      });
      subTotal = Math.round(subTotal * 100) / 100;
      discountTotal += 0;
      let tax = Math.round(subTotal * 0.05 * 100) / 100;
      let total = Math.round((subTotal - discountTotal + tax) * 100) / 100;
      return total;
    },
    [order]
  );

  const priceTotals = useCallback(
    (name, discount) => {
      let subTotal = 0;
      let discountTotal = 0;
      let orderSorted = Object.keys(order).sort(
        (a, b) => order[b].price - order[a].price
      );
      if (name === "BOGO") {
        orderSorted.map((pizza, index) => {
          return order[pizza].toppings && index % 2 !== 0
            ? ((discountTotal += (order[pizza].price * discount) / 100),
              setDealOrder((prevOrder) => ({
                ...prevOrder,
                [pizza]: {
                  ...prevOrder[pizza],
                  discounts: `${order[pizza].price} - ${
                    Math.round(order[pizza].price * discount) / 100
                  }`,
                },
              })))
            : setDealOrder((prevOrder) => ({
                ...prevOrder,
                [pizza]: {
                  ...prevOrder[pizza],
                  discounts: `${order[pizza].price}`,
                },
              }));
        });
      } else if (name === "SAVE") {
        Object.keys(order).map((pizza, index) => {
          return order[pizza].toppings
            ? ((discountTotal += (order[pizza].price * discount) / 100),
              setDealOrder((prevOrder) => ({
                ...prevOrder,
                [pizza]: {
                  ...prevOrder[pizza],
                  discounts: `${order[pizza].price} - ${
                    Math.round(order[pizza].price * discount) / 100
                  }`,
                },
              })))
            : setDealOrder((prevOrder) => ({
                ...prevOrder,
                [pizza]: {
                  ...prevOrder[pizza],
                  discounts: `${order[pizza].price}`,
                },
              }));
        });
      } else if (name) {
        Object.keys(order).map((pizza, index) => {
          let regex = new RegExp(name);
          return regex.test(pizza)
            ? ((discountTotal += (order[pizza].price * discount) / 100),
              setDealOrder((prevOrder) => ({
                ...prevOrder,
                [pizza]: {
                  ...prevOrder[pizza],
                  discounts: `${order[pizza].price} - ${
                    Math.round(order[pizza].price * discount) / 100
                  }`,
                },
              })))
            : setDealOrder((prevOrder) => ({
                ...prevOrder,
                [pizza]: {
                  ...prevOrder[pizza],
                  discounts: `${order[pizza].price}`,
                },
              }));
        });
      }
      Object.keys(order).map((orderItems, index) => {
        return (subTotal += order[orderItems].price);
      });
      subTotal = Math.round(subTotal * 100) / 100;
      discountTotal += 0;
      let tax = Math.round(subTotal * 0.05 * 100) / 100;
      let total = Math.round((subTotal - discountTotal + tax) * 100) / 100;

      setTotals({
        "sub-total": subTotal,
        discount: discountTotal,
        tax: tax,
        total: total,
      });
    },
    [order]
  );

  useEffect(() => {
    let bestDeal = 0;
    let bestIndex = 0;
    if (!loading && deals[0]) {
      deals.forEach((deal, index) => {
        let currentDeal = priceTotal(
          deals[index]["deal_name"],
          deals[index].discount
        );
        return bestDeal === 0
          ? ((bestDeal = currentDeal), (bestIndex = index))
          : bestDeal > currentDeal
          ? ((bestDeal = currentDeal), (bestIndex = index))
          : bestDeal;
        // priceTotal(deals[index].name, deals[index].discount)
      });
      priceTotals(deals[bestIndex]["deal_name"], deals[bestIndex].discount);
      console.log(deals[bestIndex]["deal_name"]);
    } else {
      priceTotals(null, null);
      console.log("not loaded");
    }
  }, [order, deals, priceTotal, priceTotals, loading]);

  useEffect(() => {
    Axios.get(`${process.env.REACT_APP_BACKEND_URL}/pizzas_waiting`)
      .then((response) => {
        let pizzasWaiting = 0;
        response.data.forEach((e) => {
          pizzasWaiting += e["JSON_LENGTH(orderCheckout)"];
        });
        setWaitTime(pizzasWaiting);
        console.log(pizzasWaiting);
      })
      .catch((error) => console.log(error));
  }, []);

  const checkoutOrder = () => {
    let checkout = {};
    Object.keys(order).map((orderItems, index) => {
      let toppingsAndAmount = {};
      let sauceAndAmount = {};
      let cheeseAndAmount = {};
      if (order[orderItems].toppings) {
        Object.entries(order[orderItems].toppings).map(
          ([topping, amount], index) => {
            topping === "cheddar" || topping === "mozarella"
              ? (cheeseAndAmount[topping] = abbreviateAmount(amount))
              : topping === "alfredo sauce" ||
                topping === "bbq sauce" ||
                topping === "ranch sauce" ||
                topping === "tomato sauce"
              ? (sauceAndAmount[topping] = abbreviateAmount(amount))
              : (toppingsAndAmount[topping] = abbreviateAmount(amount));
          }
        );
        Object.assign(checkout, {
          [orderItems]: {
            size: orderSize(order[orderItems].size),
            sauce: sauceAndAmount,
            cheese: cheeseAndAmount,
            toppings: toppingsAndAmount,
          },
        });
      }
    });
    return JSON.stringify(checkout);
  };

  const otherOrders = () => {
    let checkout = {};
    Object.keys(order).map((orderItems, index) => {
      if (!order[orderItems].toppings) {
        Object.assign(checkout, {
          [orderItems]: {
            name: order[orderItems].name,
            size: order[orderItems].size,
          },
        });
      }
    });
    return JSON.stringify(checkout);
  };

  const customerOrder = {
    customer: customer,
    orderCheckout: checkoutOrder(),
    totals: totals,
    scheduledTime: inputTimeValue,
    otherOrders: otherOrders(),
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const submitOrder = () => {
    Axios.post(
      `${process.env.REACT_APP_BACKEND_URL}/orders`,
      customerOrder
    ).then((response) => {
      setOrderId(response.data.insertId);
    });
    // , Object.keys(order).map(item => {if (order[item].toppings){return true} else {return false}}).some(items => items === true)? '' : Axios.post('${process.env.REACT_APP_BACKEND_URL}/orders', `UPDATE orders set orderstatus = 4 where order_id = ${response.data.insertId}`

    // .catch(error => console.log(error));
    //   delay(2000).then(() => {
    //   console.log(orderId);
    //   getOrderProgress();})
  };

  const getDesserts = () => {
    Axios.get(`${process.env.REACT_APP_BACKEND_URL}/desserts`)
      .then((response) => {
        let serveDesserts = response.data;
        setDesserts(serveDesserts);
        console.log(serveDesserts);
      })
      .catch((error) => console.log(error));
  };

  const getDrinks = () => {
    Axios.get(`${process.env.REACT_APP_BACKEND_URL}/drinks`)
      .then((response) => {
        let serveDrinks = response.data;
        setDrinks(serveDrinks);
        console.log(serveDrinks);
      })
      .catch((error) => console.log(error));
  };

  useEffect(() => {
    getDrinks();
    getDesserts();
    const interval = setInterval(() => {
      getDrinks();
      getDesserts();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const updateInventory = () => {
    Object.keys(inventory["drinks"]).forEach((orderItems) => {
      const updateDrinks = {
        status: drinksUpdateStatus(orderItems),
      };
      Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/updateDrinks`,
        updateDrinks
      );
    });

    Object.keys(inventory["desserts"]).forEach((orderItems) => {
      const updateDesserts = {
        status: dessertsUpdateStatus(orderItems),
      };
      Axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/updateDesserts`,
        updateDesserts
      );
    });
  };

  const checkInventory = () => {
    Object.keys(inventory["drinks"]).map((orderItem) => {
      console.log(drinks[orderItem].inventory);
      if (inventory["drinks"][orderItem] <= drinks[orderItem].inventory) {
        return false;
      } else {
        return (
          window.alert(
            `Sorry ${orderItem} has just soldout, please remove item from order.`
          ) && true
        );
      }
    });

    Object.keys(inventory["desserts"]).map((orderItem) => {
      if (inventory["desserts"][orderItem] <= desserts[orderItem].inventory) {
        return true;
      } else {
        return (
          window.alert(
            `Sorry ${orderItem} has just soldout, please remove item from order.`
          ) && true
        );
      }
    });
  };

  const handleSubmitOrder = (e) => {
    getDrinks();
    getDesserts();
    e.preventDefault(e);
    const checkPhoneNumber = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
    const checkEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return !customer["name"]
      ? window.alert("PLEASE REVEAL YOUR NAME")
      : !checkPhoneNumber.test(customer["phone number"])
      ? window.alert("PLEASE ENTER YOUR PHONE NUMBER")
      : !checkEmail.test(customer["email"])
      ? window.alert("PLEASE ENTER EMAIL")
      : Object.keys(inventory["drinks"])
          .map((orderItem) => {
            console.log(drinks[orderItem].inventory);
            if (inventory["drinks"][orderItem] <= drinks[orderItem].inventory) {
              return false;
            } else {
              return window.alert(
                `Sorry ${drinks[orderItem].name} has just soldout, please remove item from order.`
              );
            }
          })
          .some((item) => item === undefined)
      ? ""
      : Object.keys(inventory["desserts"])
          .map((orderItem) => {
            if (
              inventory["desserts"][orderItem] <= desserts[orderItem].inventory
            ) {
              return false;
            } else {
              return window.alert(
                `Sorry ${desserts[orderItem].name} has just soldout, please remove item from order.`
              );
            }
          })
          .some((item) => item === undefined)
      ? ""
      : (submitOrder(),
        updateInventory(),
        Object.keys(order)
          .map((item) => {
            if (order[item].toppings) {
              return true;
            } else {
              return false;
            }
          })
          .some((items) => items === true)
          ? setShowWizardProgress(1)
          : setShowWizardNoPizza(1));
  };

  const getOrderProgress = useCallback(() => {
    const statusCheck = () => {
      return `select orderstatus from orders where order_id = ${orderId};`;
    };
    const updateStatus = {
      status: statusCheck(),
    };

    console.log(statusCheck());

    Axios.get(`${process.env.REACT_APP_BACKEND_URL}/orderStatus`, {
      params: updateStatus,
    })
      .then((response) => {
        let orderStat = response.data[0].orderstatus;
        console.log(response.data);
        setShowWizardProgress(orderStat);
      })
      .catch((error) => console.log(error));
  }, [orderId]);

  const orderStatus = (statusNumber) => {
    const status = {
      1: "WAITING",
      2: "CREATING",
      3: "BAKING",
      4: "READY",
      5: "PICKED UP",
    };
    return status[statusNumber] || "STATUS ERROR";
  };

  useEffect(() => {
    if (orderId !== 0 && showWizardNoPizza === 0) {
      getOrderProgress();
      const interval = setInterval(() => {
        getOrderProgress();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [orderId, getOrderProgress, showWizardNoPizza]);

  const timeStringToSeconds = (hm) => {
    const [hours, minutes] = hm.split(":");
    const totalSeconds = +hours * 60 * 60 + +minutes * 60;
    console.log(totalSeconds);
    return totalSeconds;
  };

  const [progressBar, setProgressBar] = useState({
    inputTimeInSeconds: 0,
    orderTimeInSeconds: 0,
    orderPlacedTime: 0,
    reqCreatingTime: 0,
    reqCookingTime: 0,
    newCreatingTimeSet: 0,
    newCookingTimeSet: 0,
    secondsLeft: 0,
  });

  useEffect(() => {
    const secondsToComplete = (inputTime) =>
      inputTime -
      (new Date().getHours() * 60 * 60 +
        new Date().getMinutes() * 60 +
        new Date().getSeconds());
    // let inputTimeInSeconds = 0;
    if (showWizardProgress === 1) {
      let secondsRemaining = secondsToComplete(
        timeStringToSeconds(inputTimeValue)
      );
      const interval = setInterval(() => {
        if (progressBar.orderTimeInSeconds === 0) {
          let pizzaCount = 0;
          // inputTimeInSeconds = timeStringToSeconds(inputTimeValue);
          setProgressBar((previousProgress) => ({
            ...previousProgress,
            inputTimeInSeconds: timeStringToSeconds(inputTimeValue),
          }));
          setProgressBar((previousProgress) => ({
            ...previousProgress,
            reqCreatingTime:
              (Object.keys(order).forEach((item) => {
                if (order[item].toppings) pizzaCount++;
              }),
              pizzaCount * 4 + 8) * 60,
          }));
          setProgressBar((previousProgress) => ({
            ...previousProgress,
            reqCookingTime: (pizzaCount + 8) * 60,
          }));
          setProgressBar((previousProgress) => ({
            ...previousProgress,
            orderPlacedTime:
              new Date().getHours() * 60 * 60 +
              new Date().getMinutes() * 60 +
              new Date().getSeconds(),
          }));
          // setProgressBar(previousProgress => ({...previousProgress, orderTimeInSeconds : secondsRemaining}))
          setProgressBar((previousProgress) => ({
            ...previousProgress,
            secondsLeft: secondsRemaining,
          }));
          setTimeTillReady(0);
          console.log("seconds r" + secondsRemaining);
          console.log(progressBar.reqCreatingTime);
          console.log(progressBar.orderPlacedTime);
        } else if (secondsRemaining > progressBar.reqCreatingTime) {
          secondsRemaining = secondsToComplete(progressBar.inputTimeInSeconds);
          setProgressBar((previousProgress) => ({
            ...previousProgress,
            secondsLeft: secondsRemaining,
          }));
          const timePassed =
            new Date().getHours() * 60 * 60 +
            new Date().getMinutes() * 60 +
            new Date().getSeconds() -
            progressBar.orderPlacedTime;
          setTimeTillReady(
            Math.round(
              (timePassed /
                (progressBar.inputTimeInSeconds -
                  progressBar.orderPlacedTime)) *
                100
            )
          );
          // console.log(progressBar.orderTimeInSeconds);
          console.log(secondsRemaining);
          console.log(
            Math.round((timePassed / progressBar.orderTimeInSeconds) * 100)
          );
        }
      }, 5000);
      return () => clearInterval(interval);
    } else if (showWizardProgress === 2) {
      // let secondsRemaining = 0;
      let secondsRemaining = secondsToComplete(progressBar.inputTimeInSeconds);
      let newSecondsRemaining = secondsToComplete(
        progressBar.newCreatingTimeSet
      );
      // let newSecondsRemaining = 0;
      console.log(newSecondsRemaining);
      console.log(progressBar.newCreatingTimeSet);
      console.log(progressBar.orderTimeInSeconds);
      const interval = setInterval(() => {
        if (progressBar.newCreatingTimeSet === 0) {
          secondsRemaining = secondsToComplete(progressBar.inputTimeInSeconds);
          newSecondsRemaining = progressBar.reqCreatingTime;
          setProgressBar((previousProgress) => ({
            ...previousProgress,
            secondsLeft: secondsRemaining,
          }));
          setProgressBar((previousProgress) => ({
            ...previousProgress,
            newCreatingTimeSet:
              progressBar.reqCreatingTime +
              progressBar.inputTimeInSeconds -
              secondsRemaining,
          }));
          // setTimeTillReady(Math.round((progressBar.newCreatingTimeSet - progressBar.reqCreatingTime)/progressBar.newCreatingTimeSet * 100));
          // console.log(progressBar.orderTimeInSeconds);
          console.log(progressBar.reqCreatingTime);
          console.log(secondsRemaining);
          console.log(newSecondsRemaining);
          console.log(progressBar.newCreatingTimeSet);
        } else if (newSecondsRemaining > progressBar.reqCookingTime) {
          newSecondsRemaining = secondsToComplete(
            progressBar.newCreatingTimeSet
          );
          setProgressBar((previousProgress) => ({
            ...previousProgress,
            secondsLeft: newSecondsRemaining,
          }));
          const timePassed =
            new Date().getHours() * 60 * 60 +
            new Date().getMinutes() * 60 +
            new Date().getSeconds() -
            progressBar.orderPlacedTime;
          setTimeTillReady(
            Math.round(
              (timePassed /
                (progressBar.newCreatingTimeSet -
                  progressBar.orderPlacedTime)) *
                100
            )
          );
          console.log(
            Math.round(
              (timePassed / secondsToComplete(progressBar.newCreatingTimeSet)) *
                100
            )
          );
          // console.log(progressBar.orderTimeInSeconds);
          console.log(progressBar.reqCreatingTime);
          // console.log(secondsRemaining);
          console.log(progressBar.newCreatingTimeSet);
        }
      }, 5000);
      return () => clearInterval(interval);
    } else if (showWizardProgress === 3) {
      let secondsRemaining = secondsToComplete(progressBar.newCreatingTimeSet);
      let newSecondsRemaining = secondsToComplete(
        progressBar.newCookingTimeSet
      );
      const interval = setInterval(() => {
        if (progressBar.newCookingTimeSet === 0) {
          secondsRemaining = secondsToComplete(progressBar.newCreatingTimeSet);
          setProgressBar((previousProgress) => ({
            ...previousProgress,
            secondsLeft: secondsRemaining,
          }));
          setProgressBar((previousProgress) => ({
            ...previousProgress,
            newCookingTimeSet:
              progressBar.reqCookingTime +
              progressBar.newCreatingTimeSet -
              secondsRemaining,
          }));
          // setTimeTillReady(Math.round((progressBar.newCookingTimeSet - progressBar.reqCookingTime)/progressBar.newCookingTimeSet * 100));
          // console.log(progressBar.orderTimeInSeconds);
          console.log(progressBar.reqCookingTime);
          console.log(secondsRemaining);
          console.log(progressBar.newCookingTimeSet);
        } else if (newSecondsRemaining > 10) {
          newSecondsRemaining = secondsToComplete(
            progressBar.newCookingTimeSet
          );
          setProgressBar((previousProgress) => ({
            ...previousProgress,
            secondsLeft: newSecondsRemaining,
          }));
          const timePassed =
            new Date().getHours() * 60 * 60 +
            new Date().getMinutes() * 60 +
            new Date().getSeconds() -
            progressBar.orderPlacedTime;
          setTimeTillReady(
            Math.round(
              (timePassed /
                (progressBar.newCookingTimeSet - progressBar.orderPlacedTime)) *
                100
            )
          );
          console.log(
            Math.round(
              (timePassed /
                (progressBar.newCookingTimeSet - progressBar.orderPlacedTime)) *
                100
            )
          );
          // console.log(progressBar.orderTimeInSeconds);
          console.log(progressBar.reqCookingTime);
          // console.log(secondsRemaining);
          console.log(progressBar.newCookingTimeSet);
        }
      }, 5000);
      return () => clearInterval(interval);
    } else if (showWizardProgress > 3) {
      setTimeTillReady(100);
      setProgressBar((previousProgress) => ({
        ...previousProgress,
        secondsLeft: 0,
      }));
    }
  }, [showWizardProgress, order, inputTimeValue, progressBar]);

  return (
    <>
      <h1 id="bannerOrder">THANK YOU FOR CHOOSING YOUR LOCAL WIZARD!</h1>
      <div className="orderContainer">
        <div className="order">
          {Object.keys(order).map((orderItems, index) => {
            return (
              <section
                className="orderItem"
                id={orderItems + "container"}
                key={orderItems + index}
              >
                {order[orderItems].toppings ? (
                  <>
                    <img
                      src={`./img/${order[orderItems].name}.webp`}
                      className="orderPicture"
                      alt={`${orderItems}`}
                      key={orderItems + "BGimage" + index}
                    ></img>
                    <div
                      className="imageDimmer"
                      key={"imageDimmer" + index}
                    ></div>
                    <h2 className="orderTitle" key={"orderTitle" + index}>
                      {orderItems}
                      <span className="orderSize" key={"orderSize" + index}>
                        {" "}
                        {orderSize(order[orderItems].size)}
                      </span>
                    </h2>
                  </>
                ) : (
                  <>
                    <img
                      src={`./img/${order[orderItems].image}.webp`}
                      className="orderPictureDrink"
                      alt={`${orderItems}`}
                      key={orderItems + "BGimage" + index}
                    ></img>
                    <div
                      className="imageDimmer"
                      key={"imageDimmer" + index}
                    ></div>
                    <h2 className="orderTitle" key={"orderTitle" + index}>
                      {order[orderItems].name}
                    </h2>
                  </>
                )}

                <div
                  className="editOrder"
                  key={index + orderItems + "toppings"}
                >
                  {order[orderItems].toppings ? (
                    Object.entries(order[orderItems].toppings).map(
                      ([topping, amount], index) => {
                        return (
                          <div
                            className="orderTopping"
                            key={topping + orderItems + index}
                          >
                            {topping}
                            <div
                              className="orderToppingAmount"
                              key={topping + "toppingAmount" + index}
                            >
                              {" "}
                              {abbreviateAmount(amount)}
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="orderTopping" key={orderItems + index}>
                      {order[orderItems].size}
                    </div>
                  )}
                </div>
                <div
                  className="editOrderContainer"
                  key={"editOrderContainer" + index}
                  onClick={(e) => handleRemoveClick(e, orderItems)}
                ></div>
                {orderPriceCalc(orderItems)}
              </section>
            );
          })}
        </div>
        <div className="yourOrder">
          <h2>YOUR WIZARD ORDER</h2>
          {Object.keys(dealOrder).map((pizza, index) => {
            return (
              <>
                <div className="tally" key={"tally" + index}>
                  {pizza}
                </div>
                <div className="tallyPrice" key={"tallyPrice" + index}>
                  ${dealOrder[pizza]["discounts"]}
                </div>
              </>
            );
          })}
          <div className="sub-total">Sub-Total</div>
          <span>${totals["sub-total"]}</span>
          <div className="discount">Discounts</div>
          <span>-${totals.discount}</span>
          <div className="tax">Tax 5% GST</div>
          <span>+${totals.tax}</span>
          <div className="total">Total</div>
          <span>${totals.total}</span>
          {/* !showWizardProgress */}
          {!showWizardProgress && openHours !== undefined ? (
            openHours[0].closed === 0 ? (
              <form
                className="customerInfo"
                onSubmit={(e) => handleSubmitOrder(e)}
              >
                <input type="submit" id="submitOrder" value="CAST ORDER" />
                <input
                  type="text"
                  className="customerInputs"
                  id="name"
                  name="name"
                  placeholder="name"
                  onChange={(e) =>
                    setCustomer({ ...customer, name: e.target.value })
                  }
                ></input>
                <input
                  type="text"
                  className="customerInputs"
                  id="phone"
                  name="phone number"
                  placeholder="phone number"
                  onChange={(e) =>
                    setCustomer({ ...customer, "phone number": e.target.value })
                  }
                ></input>
                <input
                  type="text"
                  className="customerInputs"
                  id="email"
                  name="email"
                  placeholder="email"
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                ></input>
                <input
                  id="scheduledTime"
                  type="time"
                  name="scheduledTime"
                  defaultValue={defaultTime}
                  min={openHours[0].openTime}
                  max={openHours[0].closeTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                ></input>
                <label id="pickupTime">PICK-UP TIME</label>
                <div id="scheduleText">
                  Edit above time for scheduled pick-up!
                </div>
              </form>
            ) : (
              <div id="scheduleText">Sorry, we are closed</div>
            )
          ) : !showWizardProgress && openHours === undefined ? (
            <div id="scheduleText">Loading available pick-up time!</div>
          ) : showWizardNoPizza === 1 ? (
            <div className="progress">PROGRESS = READY WHEN YOU ARE</div>
          ) : (
            <>
              <div className="progress">
                PROGRESS = {orderStatus(showWizardProgress)}
                <div className="progressTime">
                  {Math.ceil(progressBar.secondsLeft / 60)}
                  <span style={{ fontWeight: 300 }}> min</span>
                </div>
              </div>
              <div className="progressBar">
                <div
                  className="progressInner"
                  style={{ width: timeTillReady + "%" }}
                ></div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};
