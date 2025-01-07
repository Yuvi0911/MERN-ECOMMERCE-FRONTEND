import axios from "axios";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../../components/admin/AdminSidebar";
import { RootState, server } from "../../../redux/store";

const NewDiscount = () => {
  const {user} = useSelector((state: RootState)=>state.userReducer);
  
  const navigate = useNavigate();

  const [btnLoading, setBtnLoading] = useState<boolean>(false);


  const [codeUpdate, setCodeUpdate] = useState<string>("");
  const [amountUpdate, setAmountUpdate] = useState<number>(0);

  // const codeUpdate = useInputValidation("");
  // const amountUpdate = useInputValidation(0);

  const submitHandler = async(e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setBtnLoading(true);

    try {
      const {data} = await axios.post(`${server}/api/v1/payment/coupon/new?id=${user?._id}`,{
        code: codeUpdate,
        amount: amountUpdate,
      },{
        headers: {
          "Content-Type": "application/json"
        },
        withCredentials: true
      });

      if(data.success){
        setCodeUpdate("");
        setAmountUpdate(0);
        toast.success(data.message);
        navigate("/admin/discount");
      }
    } catch (error) {
      console.log(error);
    }
    finally{
      setBtnLoading(false);
    }
  }




    return (
        <div className="admin-container">
          <AdminSidebar />
          <main className="product-management">
            <article>
          <form onSubmit={submitHandler}>
            <h2>New Coupon</h2>
            <div>
              <label>Coupon Code</label>
              <input
                type="text"
                placeholder="Coupon Code"
                value={codeUpdate}
                onChange={(e) => setCodeUpdate(e.target.value)}
              />
            </div>
            <div>
              <label>Amount</label>
              <input
                type="number"
                placeholder="Amount"
                value={amountUpdate}
                onChange={(e)=>setAmountUpdate(Number(e.target.value))}
              />
            </div>
          

            <button disabled={btnLoading} type="submit">
              {
                btnLoading ? "Creating..." : "Create"
              }
            </button>
          </form>
        </article>
          </main>
        </div>
      );
}

export default NewDiscount;
