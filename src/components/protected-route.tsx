import { ReactElement } from "react"
import { Navigate, Outlet } from "react-router-dom";

interface Props {
    children ?: ReactElement;
    isAuthenticated : boolean;
    adminOnly ?: boolean;
    admin ?: boolean;
    redirect ?: string; 
}

//ProtectedRoute ki help se hum route ko unaythorized access se bacha skte h jaise ki ek user ne login kr rkha h aur vo /login pr jaata h toh hum ushe login page pr bhejne ki vjah vapas se home page pr redirect kr dege
const ProtectedRoute = ({
        isAuthenticated,
        children,
        adminOnly,
        admin, 
        redirect = "/"
    }: Props) => {

    //yadi user ne login kr rkha h toh ushe "/" pr redirect kr dege jis bhi route me humne ProtectedRoute ko use kr rhka hoga 
    if(!isAuthenticated){
        return <Navigate to={redirect} />
    }

    if(adminOnly && !admin) {
        return <Navigate to = {redirect} />
    }

    //<Outlet /> ki help se hum <Route> k ander directly element ki trh ProtectedRoute ko use kr skte h
    return children ? children : <Outlet />;


}

export default ProtectedRoute
