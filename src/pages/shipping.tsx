import axios from "axios";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiArrowBack } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { server } from "../redux/store";
import { CartReducerInitialState } from "../types/reducer-types";
import { saveShippingInfo } from "../redux/reducer/cartReducer";


const Shipping = () => {

    const { cartItems, total } = useSelector(
      (
        state: {cartReducer: CartReducerInitialState}
      ) => state.cartReducer
    )

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [shippingInfo, setShippingInfo] = useState({
        address:"",
        city:"",
        state:"",
        country:"",
        pinCode:"",
    });

    const changeHandler = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setShippingInfo((prev) => ({...prev, [e.target.name]: e.target.value}))
    };

    //jab address fill kr k pay now button pr click kr ge toh ye function execute hoga
    const submitHandler = async (e: FormEvent<HTMLFormElement>) =>{
      e.preventDefault();

      dispatch(saveShippingInfo(shippingInfo));

      try{
        const {data} = await axios.post(`${server}/api/v1/payment/create`,{
          amount: total,
        },{
          headers:{
            "Content-Type": "application/json",
          }
        })

        //ye line hume is http://localhost:5173/pay is page pr le jaiye gi.
        navigate("/pay",{
          // clientSecret ek key h jo ki generate hogi jab hum cart me se order ko placed krege. isme order ki information store hogi (jaise ki total amount) jiski help se hum stripe me ish clientSecret ki help se payment kr paye ge
          state: data.clientSecret,
        })
      }
      catch(error){
        console.log(error);
        toast.error("Something Went Wrong");
      }
    }

  useEffect(()=>{
      //yadi cart me koi product nhi h aur user shipping page ko access krta h toh hum ushe cart page pr bhej dege
      if(cartItems.length <= 0){
        return navigate("/cart")
      }
  }, [navigate, cartItems]);

  return (
    <div className="shipping">
      <button className="back-btn" onClick={() => navigate("/cart")}>
        <BiArrowBack />
      </button>

      <form onSubmit={submitHandler}>
        <h1>Shipping Address</h1>

        <input 
            required
            type="text" 
            placeholder="Address" 
            name="address" 
            value={shippingInfo.address}
            onChange={changeHandler}
            />
        <input 
            required
            type="text" 
            placeholder="City" 
            name="city" 
            value={shippingInfo.city}
            onChange={changeHandler}
            />
        <input 
            required
            type="text" 
            placeholder="State" 
            name="state" 
            value={shippingInfo.state}
            onChange={changeHandler}
            />

            <select 
                name="country" 
                required 
                value={shippingInfo.country}
                onChange={changeHandler}
            >
                <option value="">Choose Country</option>
                <option value="india">India</option>
            </select>
        <input 
            required
            type="number" 
            placeholder="Pin Code" 
            name="pinCode" 
            value={shippingInfo.pinCode}
            onChange={changeHandler}
            />

            <button type="submit">Pay Now</button>

      </form>
    </div>
  )
}

export default Shipping
