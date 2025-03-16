import { LoadingSpinner } from "../../components/loading-spinner/LoadingSpinner";
import Scheduler from "../../components/scheduler/Scheduler";
import useStore from "../../hooks/useStore";

const MyShifts = () => {
    //Gets userId for the fetchAPI request 
    const { decodedToken } = useStore(state => state);

    if (!decodedToken) {
        return <LoadingSpinner/>; 
      }

    const { id } = decodedToken;
    // console.log('id of a user', id)


    return (
        <Scheduler url={`/shifts/my-shifts/${id}`} />
    )

};

export default MyShifts