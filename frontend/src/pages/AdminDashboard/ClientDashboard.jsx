import React,{useEffect,useState} from "react";
const ClientDashboard = () => {
    const [clients,setClients] = useState([]);
    const [loading,setLoading] = useState(true);
    const [error,setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                await new Promise(resolve => setTimeout(resolve,1000));
                setClients([
                    {_id:'1',customerCity:"agadir",customerCountry:"maroc",customerName:"olaya elguarch",
                        customerPhone:"0607521786"
                    },
                    {_id:'2',customerCity:"tantan",customerCountry:"maroc",customerName:"kaoutar ouchen",
                        customerPhone:"065897412"
                    }
                ]);
                setLoading(false);
            }catch(error){
                setError("failed to load dashboard data.");
                setLoading(false);
            }

        };
        fetchDashboardData();
    },[]);
    if(loading){
        return <div className="p-4 text-center">Loading dashboard client ...</div>
    }
    if(error){
        return <div className="p-4 text-center text-red-500">{error}</div>
    }
    return(
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Client Dahsboard</h1>
            <p>Welcome to the client dashboard</p>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Client statistic</h2>
                <p>charts related to clients data</p>
                {/*<DashboardCharts data={dashboardStats} /> */}
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">All clients</h2>
                {clients.length > 0 ? (
                    <ul className="list-disc pl-5">
                        {clients.map(client => (
                            <li key={client._id} className="mb-2">
                                {client.customerName} : ({client.customerPhone}) - {client.customerCity}, {client.customerCountry}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>no client found .</p>
                )}
                {/* <ClientList clients = {clients} /> */}
            </div>
        </div>
    );
};
export default ClientDashboard;