import { useMutation } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import useAuthStore from "../store/authStore";
import { toast } from "react-toastify";

const useCreateMemecoin = () => {
  return useMutation({
    mutationFn: async ({
      name,
      ticker,
      coinAddress,
      creator,
      image,
      desc,
      totalCoins,
      xSocial,
      telegramSocial,
      discordSocial,
      creatorAddress,
    }) => {
      try {
        // Use new Moonbags v2 endpoints
        const coinData = {
          sender: creatorAddress || creator,
          name: name,
          symbol: ticker,
          description: desc,
        };
        const response = await axiosInstance.post("/tokens/create-v2", coinData);
        return response.data;
      } catch (error) {
        toast.error(error?.response?.data?.error || "Error Creating Coin.");
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Coin creation steps prepared!");
    },
  });
};

export default useCreateMemecoin;
