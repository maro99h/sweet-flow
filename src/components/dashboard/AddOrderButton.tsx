
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import OrderFormModal from "@/components/orders/OrderFormModal";

const AddOrderButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex justify-center py-6">
        <Button 
          onClick={handleOpenModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg py-6 px-8 rounded-md shadow-md flex items-center gap-2 transform transition-all hover:scale-105"
        >
          <PlusIcon className="h-5 w-5" /> Add New Order
        </Button>
      </div>

      <OrderFormModal 
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};

export default AddOrderButton;
