import { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import { MessageResponse } from "../types/api-types"
import { SerializedError } from "@reduxjs/toolkit";
import { NavigateFunction } from "react-router-dom";
import toast from "react-hot-toast";
import moment from "moment";

type ResType = {
    data: MessageResponse;
} | {
    error: FetchBaseQueryError | SerializedError
}

export const responseToast = (res: ResType, navigate: NavigateFunction | null, url: string) =>{

    if("data" in res){
        toast.success(res.data.message);
        if(navigate){
            navigate(url);
        }
    }
        else{
            const error = res.error as FetchBaseQueryError;
            const messageResponse = error.data as MessageResponse;
            toast.error(messageResponse.message)

        }
    }

    //chats me hume month wise data dikhana h toh vha is function ki jrurt hogi hume. is function ki help se hum aaj ki date nikale ge aur fir pichle 6 aur 12 months nikal le ge.
    export const getLastMonths = () => {
        //moment 1 package h jisse hum current date le skte h 
        const currentDate = moment();

        currentDate.date(1);

        const last6Months: string[] = [];
        const last12Months: string[] = [];

        for(let i =0; i < 6; i++){
            //clone() ki help se currentDate ka 1 clone ban jaiye jis pr subtract method apply hoga
            //currentMonth - i(for ex => december - 0 = december)
            const monthDate = currentDate.clone().subtract(i, "months");
            const monthName = monthDate.format("MMMM");
            //unshift() month k naam ko starting me add krega
            last6Months.unshift(monthName)
        }
     
        for(let i = 0; i < 12; i++){
            //clone() ki help se currentDate ka 1 clone ban jaiye jis pr subtract method apply hoga
            const monthDate = currentDate.clone().subtract(i, "months");
            const monthName = monthDate.format("MMMM");
            last12Months.unshift(monthName)
        }

        return {
            last12Months,
            last6Months,
        }
    }
