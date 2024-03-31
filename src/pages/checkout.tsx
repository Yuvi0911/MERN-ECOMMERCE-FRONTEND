//ye component stripe se payment krne k liye h

import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useNewOrderMutation } from '../redux/api/orderAPI';
import { NewOrderRequest } from '../types/api-types';
import { resetCart } from '../redux/reducer/cartReducer';
import { responseToast } from '../utils/features';
import { RootState } from '../redux/store';


const stripePromise = loadStripe('pk_test_51OwJo1SBfptToIOgiT7tR7UXt4PRSJDht0aYoW4FTmJRms2uNRFyl5ZVxsY6IFrVhgJZItJbIFSrcAMUX3iRHNRm00H1ht1z6F');

const CheckOutForm = () => {

    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {user} =useSelector((state: RootState) => state.userReducer);

    const {
        shippingInfo,
        cartItems,
        subtotal,
        tax,
        discount,
        shippingCharges,
        total,
    } = useSelector((state: RootState)=> state.cartReducer);

    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const [newOrder] = useNewOrderMutation();

    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
        //ye page ko reload hone se rok deta h jab bhi hum form ko submit krte h button pr click kr k
        e.preventDefault();

        if(!stripe || !elements){
            return 
        }

        setIsProcessing(true);

        const orderData: NewOrderRequest = {
            shippingInfo,
            orderItems: cartItems,
            subtotal,
            tax,
            discount,
            shippingCharges,
            total,
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            user: user?._id!,
        };

        const {paymentIntent, error} = await stripe.confirmPayment({
            elements,
            confirmParams:{return_url: window.location.origin},
            redirect: "if_required", 
        });

        if(error) {
            setIsProcessing(false);
            return toast.error(error.message || "Something Went Wrong");
        }

        if(paymentIntent.status === "succeeded"){
          const res = await newOrder(orderData);
          dispatch(resetCart());
          responseToast(res, navigate, "/orders")
        }
        setIsProcessing(false);
    };


    return (
        <div className='checkout-container'>
            <form onSubmit={submitHandler}> 
                <PaymentElement/>
                <button type='submit' disabled={isProcessing}>{isProcessing ? "Processing..." : "Pay"}</button>
            </form>
        </div>
    )
};

const Checkout = () => {

    const location = useLocation();

    const clientSecret: string | undefined = location.state;

    if(!clientSecret){
        return <Navigate to={"/shipping"} />
    }

  return (  
    <Elements
        options={{
            clientSecret,
        }}
        stripe={stripePromise}>
        <CheckOutForm />
    </Elements>
    )
}

export default Checkout
