
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ClientsLayout from "@/components/clients/ClientsLayout";
import ClientList from "@/components/clients/ClientList";
import AddClientForm from "@/components/clients/AddClientForm";

const ClientsPage = () => {
  const { user } = useAuth();

  return (
    <ClientsLayout>
      <Routes>
<Route index element={<Navigate to="list" replace />} />
<Route path="list" element={<ClientList />} />
<Route path="add" element={<AddClientForm />} />
        <Route path="/:id" element={<div>Client Details (Coming soon)</div>} />
      </Routes>
    </ClientsLayout>
  );
};

export default ClientsPage;
