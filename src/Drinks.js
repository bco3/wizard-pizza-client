import {useState, useEffect} from 'react';
import { useOrder } from './Contexts/OrderContext';
import { useInventory } from './Contexts/InventoryContext';
import './drinks.css'
import Axios from 'axios';

export const Drinks = () => {

  const [order, setOrder]  = useOrder();
  const [inventory, setInventory]  = useInventory();
  const [drinks, setDrinks] = useState()
  const [rollCart, setRollCart] = useState('none');
  const [cartCheck, setCartCheck] = useState('none');

    const delay = ms => new Promise(
      resolve => setTimeout(resolve, ms)
    );

    const getDrinks = () => {
      Axios.get('http://localhost:5000/drinks').then(response => {
       let serveDrinks = response.data;
        setDrinks(serveDrinks);
      console.log(serveDrinks)})
      .catch(error => console.log(error));
  }

  useEffect(() =>{
    getDrinks();
  // const interval = setInterval(() => {
  //   getDrinks();
  // }, 30000);
  // return () => clearInterval(interval);
  },[])

  useEffect(() =>{
    const timer = setTimeout(() => {
      setRollCart('null');
    }, 700);
    return () => clearTimeout(timer);
},[rollCart])

// const drinksUpdateStatus = (e, drink) => {
//   let id = drinks[drink]['drink_id'];
//   // let active = status;
//   console.log(id);
// return `UPDATE drinks set inventory = inventory - 1 where drink_id = ${id};`
// }

  const handleAddToOrder = (e, drink) => {
    console.log(drinks[drink].inventory);
    let count = 1;
    let serverName = drinks[drink].name;
    let drinkName = drinks[drink].name;
    let newdrinkName = () => { while (order.hasOwnProperty(drinkName)){
     count++; 
     drinkName = serverName+' '+count}
     return drinkName}
       let size =  drinks[drink].size;
       let price = drinks[drink].price;
       let image = drinks[drink].image;
       let id = drinks[drink]['drink_id'] - 1;
       // setdrinks({...drinks, [drink]:{...drinks[drink], 'price': price}});
   let addItem = {'name': drinkName, 'size': size , 'price': price , 'image': image, 'drink_id': id};
  //  addItem = {...addItem, 'price': price}
   setInventory({...inventory, 'drinks':{...inventory['drinks'], [id]: !inventory['drinks'][id] ? 1 : inventory['drinks'][id] + 1 }})
   setOrder({...order, [newdrinkName()]:addItem});
   setRollCart('cartRollClick')
   setCartCheck(drinks[drink]['drink_id'])
  //  const updateDrinks = {
  //   'status' : drinksUpdateStatus(e, drink)
  //  }
  //  Axios.post('http://localhost:5000/updateDrinks', updateDrinks).then(async() => {
  //    await delay(500);
  //    getDrinks();
  // })
}


    return (
      <>
        <h1 id = 'bannerDrinks'>RECYCLING DEPOSITS ARE INCLUDED IN PRICES</h1>
        <div className="drinks">
          { drinks !== undefined && drinks[0] ? Object.keys(drinks).map((drink, index) => { if((!inventory['drinks'][drinks[drink]['drink_id'] - 1] && drinks[drink].inventory > 0) | (drinks[drink].inventory > inventory['drinks'][drinks[drink]['drink_id'] - 1])) return(
              <section className='drink' key={drink + index} onClick={(e)=>handleAddToOrder(e, drink)}>
                    <img src={`./img/${drinks[drink]['image']}.webp`} className='drinkPicture'  alt={`${drink} drink`} ></img>
                    {/* <h2 className='drinkTitle' >{drinks[drink]['name']}</h2> */}
                    <div className="drinkDescription"><span style={{fontSize:"1.3rem" ,transform:'rotate(11deg) translate(-0.25rem, 0.2rem)'}}>$</span>{drinks[drink]['price']}</div>
                          <div className='cartOrderClickDrink' style={{animation:`${cartCheck === drinks[drink]['drink_id']? rollCart + 'Drink 0.7s forwards' : '0'}`}}></div>
                       
              </section>
              )
          }) : <h2 className='noDrinks'>SORRY OUR SERVER IS DOWN, CALL US AT 604-626-7038 FOR AVAILABLE DRINKS</h2> }
        </div>
      </>
)
}