import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { lazy,Suspense, useEffect } from "react"
import Loader from "./components/loader"
import Header from "./components/header"

//toaster ko hum dusri file me import krege jha humne toast use kiya h
import { Toaster } from "react-hot-toast"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"
import { userExist, userNotExist } from "./redux/reducer/userReducer"
import { useDispatch, useSelector } from "react-redux"
import { getUser } from "./redux/api/userAPI"
import { UserReducerInitialState } from "./types/reducer-types"
import ProtectedRoute from "./components/protected-route"

//lazy function dynamic import krta h
//lazy function ka use kr k hum keval us page ko network me reload krege jis page pr hum h

//import Home from "./pages/home"
const Home = lazy(() => import("./pages/home"))
//import Search from "./pages/search"
const Search = lazy(() => import("./pages/search"))
const ProductDetails = lazy(() => import("./pages/product-details"))
//import Cart from "./pages/cart"
const Cart = lazy(() => import("./pages/cart"))
//import Shipping from "./pages/shipping"
const Shipping = lazy(() => import("./pages/shipping"))
//import Login from "./pages/login"
const Login = lazy(() => import("./pages/login"))
//import Orders from "./pages/orders"
const Orders = lazy(() => import("./pages/orders"))
//import OrderDetails from "./pages/order-details"
const OrderDetails = lazy(() => import("./pages/order-details"))
// import NotFound from "./pages/not-found"
const NotFound = lazy(()=>import("./pages/not-found"))
// import Checkout from "./pages/checkout"
const Checkout = lazy(()=>import("./pages/checkout"))
// import NewDiscount from "./pages/admin/management/newdiscount"
const NewDiscount = lazy(()=>import("./pages/admin/management/newdiscount"))


//Admin Routes importing => Sass ki help se bnaye gye h ye routes
const Dashboard = lazy(() => import("./pages/admin/dashboard"));
const Products = lazy(() => import("./pages/admin/products"));
const Customers = lazy(() => import("./pages/admin/customers"));
const Transaction = lazy(() => import("./pages/admin/transaction"));
const Barcharts = lazy(() => import("./pages/admin/charts/barcharts"));
const Piecharts = lazy(() => import("./pages/admin/charts/piecharts"));
const Linecharts = lazy(() => import("./pages/admin/charts/linecharts"));
const Coupon = lazy(() => import("./pages/admin/apps/coupon"));
const Stopwatch = lazy(() => import("./pages/admin/apps/stopwatch"));
const Toss = lazy(() => import("./pages/admin/apps/toss"));
const NewProduct = lazy(() => import("./pages/admin/management/newproduct"));
const ProductManagement = lazy(
  () => import("./pages/admin/management/productmanagement")
);
const TransactionManagement = lazy(
  () => import("./pages/admin/management/transactionmanagement")
);
const Discount = lazy(
  () => import("./pages/admin/discount")
);

const DiscountManagement = lazy(() => import("./pages/admin/management/discountmanagement"))


const App = () => {

  const {user, loading} =useSelector((state:{userReducer: UserReducerInitialState})=> state.userReducer)
  // console.log(user);

  const dispatch = useDispatch();

  useEffect(()=>{
    onAuthStateChanged(auth, async (user)=>{
      if(user){
        // console.log(user);
        const data = await getUser(user.uid)
        dispatch(userExist(data.user));
      }
      else{
        dispatch(userNotExist());
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  return loading? <Loader /> : <Router>

  {/* Header */}
  <Header user={user} />

  
    {/* Suspense function me hum loader ko de skte h kyoki ye function page pr tab show hoga jab page pr kuch bhi data nhi aaya hoga */}
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />

      {/* Not Logged In Route */}
        {/*ProtectedRoute ki help se hum route ko unaythorized access se bacha skte h jaise ki ek user ne login kr rkha h aur vo /login pr jaata h toh hum ushe login page pr bhejne ki vjah vapas se home page pr redirect kr dege*/}
        <Route path="/login" element={<ProtectedRoute isAuthenticated={user ? false : true}>
          <Login />
        </ProtectedRoute>} />
      

      {/* Logged In User Routes */}

        <Route element = {<ProtectedRoute isAuthenticated={user ? true : false}/>}>
      {/*yadi user login h toh vo in pages ko access kr skta h jo ki <Route></Route> k ander h  */}

        <Route path="/shipping" element={<Shipping />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/pay" element={<Checkout />} />

        </Route>
        




        {/* Admin Routes => in chejo ko keval admin access kr skta h */}
        <Route element={
  <ProtectedRoute isAuthenticated={true} adminOnly={true} admin={user?.role === "admin" ? true : false} />
 }
>
<Route path="/admin/dashboard" element={<Dashboard />} />
<Route path="/admin/product" element={<Products />} />
<Route path="/admin/customer" element={<Customers />} />
<Route path="/admin/transaction" element={<Transaction />} />
<Route path="/admin/discount" element={<Discount />} />

{/* Charts */}
<Route path="/admin/chart/bar" element={<Barcharts />} />
<Route path="/admin/chart/pie" element={<Piecharts />} />
<Route path="/admin/chart/line" element={<Linecharts />} />
{/* Apps */}
<Route path="/admin/app/coupon" element={<Coupon />} />
<Route path="/admin/app/stopwatch" element={<Stopwatch />} />
<Route path="/admin/app/toss" element={<Toss />} />

{/* Management */}
<Route path="/admin/product/new" element={<NewProduct />} />

<Route path="/admin/product/:id" element={<ProductManagement />} />

<Route path="/admin/transaction/:id" element={<TransactionManagement />} />
<Route path="/admin/discount/new" element={<NewDiscount />} />
  <Route path="/admin/discount/:id" element={<DiscountManagement />}/>
</Route>;

    <Route path="*" element={<NotFound/>}/>
      </Routes>

    </Suspense>

    <Toaster position="bottom-center" />
</Router>
}

export default App
