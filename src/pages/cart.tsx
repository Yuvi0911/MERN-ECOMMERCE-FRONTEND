import { useEffect, useState } from "react";
import { VscError } from "react-icons/vsc";
import CartItemCard from "../components/cart-item";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CartReducerInitialState } from "../types/reducer-types";
import { CartItem } from "../types/types";
import { addToCart, calculatePrice, discountApplied, removeCartItem } from "../redux/reducer/cartReducer";
import axios from "axios";
import { server } from "../redux/store";


const Cart = () => {

  const {cartItems, subtotal, tax, total, shippingCharges, discount} = useSelector(
    (state:{cartReducer: CartReducerInitialState })=>state.cartReducer
    );

    const dispatch = useDispatch();

  const [couponCode,setCouponCode] = useState<string>("");
  const [isValidCouponCode,setIsValidCouponCode] = useState<boolean>(false);

  //incrementHandler ki help se hum cart vale page me stock ko increase kr skte h + sign pr click kr k
  const incrementHandler = (cartItem: CartItem) => {
    //yadi cart me product ki value stock me jitne available h uske equal ho gyi toh hum return kr dege
    if(cartItem.quantity >= cartItem.stock){
      return;
    }
    //jab bhi hum + pr click kre ge toh us item ki value 1 badh jaiye gi
    dispatch(addToCart({...cartItem, quantity: cartItem.quantity + 1}));
  }
  
  //decrementHandler ki help se hum cart vale page me stock ko decrease kr skte h - sign pr click kr k
  const decrementHandler = (cartItem: CartItem) => {
    if(cartItem.quantity <= 1){
      return;
    }
    
    dispatch(addToCart({...cartItem, quantity: cartItem.quantity - 1}));
  }

  //iski help se hum item ko cart me se hta skte h
  const removeHandler = (productId: string) => {
    dispatch(removeCartItem(productId))
  }

  //iski help se hum coupon ko check kre ge ki vaild h ya nhi ydi invalid hoga toh UI pr invalid coupon code dikha dege aur valid hoga hoga toh jitna discount milega vo dikha dege.
  useEffect(()=>{

    const { token: cancelToken, cancel} = axios.CancelToken.source();

    const timeOutId = setTimeout(()=>{

      //axios ki help se hum us api ko le skte h jis pr hum request kr k data bhejna chate h
      axios.get(`${server}/api/v1/payment/discount?coupon=${couponCode}`,{
        cancelToken,
      })
      .then((res)=>{
        dispatch(discountApplied(res.data.message));
        setIsValidCouponCode(true);
        dispatch(calculatePrice());
      })
      .catch(()=>{
        dispatch(discountApplied(0));
        setIsValidCouponCode(false);
        dispatch(calculatePrice());
      })

     if (Math.random()>0.5){
      setIsValidCouponCode(true);
     }
     else{
      setIsValidCouponCode(false);
     }
    },1000);

    
    return () => {
      clearTimeout(timeOutId)
      cancel();
      setIsValidCouponCode(false)
    }
  },[dispatch, couponCode])
  
  useEffect(()=>{
    dispatch(calculatePrice());
  },[dispatch, cartItems]);

  return (
    <div className="cart">
      <main>

       {
        cartItems.length > 0 ?  (
          cartItems.map((i, idx)=>
            <CartItemCard
              incrementHandler={incrementHandler}
              decrementHandler={decrementHandler}
              removeHandler={removeHandler}
              key={idx} cartItem={i}/>
            )
          ) : (
          <h1>No Items Added</h1>
        )
       }

      </main>

      <aside>
        <p>Subtotal: ₹{subtotal}</p>
        <p>Shipping Charges: ₹{shippingCharges}</p>
        <p>Tax: ₹{tax}</p>
        <p>
          Discount: <em className="red"> - ₹{discount}</em>
        </p>
        <p>
          <b>Total: ₹{total}</b>
        </p>

        <input 
          type="text"
          placeholder="Coupon Code"
          value={couponCode}
          onChange={(e)=>setCouponCode(e.target.value)}
        />

        {
          couponCode && (isValidCouponCode ? (<span className="green">₹{discount} off using the <code>{couponCode}</code></span>)  : (<span className="red">Invalid Coupon <VscError /></span>))
        }

        {
          cartItems.length > 0 && <Link to="/shipping">Checkout</Link>
        }
      </aside>
    </div>
  )
}

export default Cart
