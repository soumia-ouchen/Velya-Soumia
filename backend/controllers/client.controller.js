import Client from "../models/Client.model.js";
export const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find().select('-__v');
        res.status(200).json(clients);
    } catch (error) {
        console.error("error in getAllClients : " + error);
        res.status(500).json({ message: 'Error fetching clients ', error: error.message });
    }
};
export const getClientsById = async (req, res) => {
    try {
        const clientsId = req.params.id;
        const client = await Client.findById(clientsId).select('-__v');
        if (!client) {
            return res.status(404).json({ message: "client not found" });

        }
        res.status(200).json(client);
    }
    catch (error) {
        console.error('Error in getClientById :', error);
        res.status(500).json({ message: 'Error fetching client details :', error: error.message });
    }

};