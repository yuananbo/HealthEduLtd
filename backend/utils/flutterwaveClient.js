import axios from "axios";

const FLUTTERWAVE_BASE_URL = "https://api.flutterwave.com/v3";

class FlutterwaveClient {
  constructor(publicKey, secretKey) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;

    if (!secretKey) {
      throw new Error("Flutterwave secret key is required");
    }

    this.http = axios.create({
      baseURL: FLUTTERWAVE_BASE_URL,
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });

    this.MobileMoney = {
      rwanda: async (payload) => {
        const response = await this.http.post(
          "/charges?type=mobile_money_rwanda",
          payload
        );
        return response.data;
      },
    };

    this.Transaction = {
      verify: async ({ id }) => {
        if (!id) {
          throw new Error("Flutterwave transaction id is required");
        }

        const response = await this.http.get(
          `/transactions/${encodeURIComponent(id)}/verify`
        );
        return response.data;
      },
    };
  }
}

export default FlutterwaveClient;
