import { X } from "lucide-react";
import { toast } from "sonner";

const EditModal: React.FC<{
    formData: any;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    setIsEditing: (val: boolean) => void;
  }> = ({ formData, handleInputChange, handleSubmit, setIsEditing }) => {
    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await handleSubmit(e);
        toast.success('Transaction updated successfully');
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating transaction:', error);
        toast.error('Failed to update transaction. Please try again.');
      }
    };
    
    return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white dark:bg-[#1f2226] rounded-xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Transaction</h3>
        <button
          title="edit" 
          onClick={() => setIsEditing(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#16191f] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e05b19] focus:border-transparent"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">₹</span>
              <input
                type="text"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="w-full pl-8 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#16191f] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e05b19] focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#16191f] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e05b19] focus:border-transparent"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#16191f] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e05b19] focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-[#16191f] text-gray-900 dark:text-white focus:ring-2 focus:ring-[#e05b19] focus:border-transparent"
            required
          />
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-[#e05b19] rounded-lg hover:bg-[#d14d0f] transition-colors duration-200"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
  );
};

export default EditModal;