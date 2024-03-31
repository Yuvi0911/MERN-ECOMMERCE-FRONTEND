import { signInWithPopup } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import  { useState } from 'react'
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { auth } from '../firebase';
import { useLoginMutation } from '../redux/api/userAPI';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import { MessageResponse } from '../types/api-types';

const Login = () => {

    const [gender, setGender] = useState("");
    const [date, setDate] = useState("");

    const [login] = useLoginMutation();


    // is function ki help se hum firebase ka use kr k user ka authentication krvaye ge, yadi user nhi hoga toh hume firebase me googgle se sign in vale method ko enable kiya hua h us se information aa jaiye gi aur database me naya user ban jaiye ga
    const loginHandler = async () => {
        try {
            const provider = new GoogleAuthProvider();
            
            // await signInWithPopup(auth, provider);
            
            const {user} = await signInWithPopup(auth, provider);

            const res = await login({
                name: user.displayName!,
                email: user.email!,
                photo: user.photoURL!,
                gender,
                role:"user",
                dob:date,
                _id: user.uid,
            })

            if("data" in res){
                toast.success(res.data.message);
            }else{
                const error = res.error as FetchBaseQueryError;
                const message =( error.data as MessageResponse).message;
                toast.error(message)
            }
            // console.log(user);
        }
        catch(error){
            console.log("catch block");
            toast.error("Sign In Fail");
        }
    } 
   

  return (
    <div className='login'>
        <main>
            <h1 className="heading">Login</h1>

            <div>
                <label>Gender</label>
                <select 
                    value={gender}
                    onChange={(e)=>setGender(e.target.value)}>
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
            </div>

            <div>
                <label>Date of birth</label>
                <input
                    type='date'
                    value={date}
                    onChange={(e)=>setDate(e.target.value)}
                />
            </div>

            <div>
                <p>Already Signed In Once</p>
                <button onClick={loginHandler}>
                    <FcGoogle /><span>Sign in with Google</span>
                </button>
            </div>

        </main>
      
    </div>
  )
}

export default Login
