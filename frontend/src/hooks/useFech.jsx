// import { useState, useEffect, useContext, useCallback } from "react";
// import api from "../utils/api";
// import { UserContext } from "../context/UserContext";

// const useDataFetching = (url) => {
//   const [loading, setLoading] = useState(false);
//   const [data, setData] = useState([]);
//   const { currentUser } = useContext(UserContext);
//   const [error, setError] = useState("");

//   const fetchData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await api.get(url, {
//         headers: {
//           Authorization: `Bearer ${currentUser.data.token}`,
//         },
//       });
//       setData(response.data);
//       setLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   }, [url, currentUser]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const response = await api.get(url, {
//           headers: {
//             Authorization: `Bearer ${currentUser.data.token}`,
//           },
//         });
//         setData(response.data);
//         setLoading(false);
//       } catch (e) {
//         setError(e.message);
//         setLoading(false);
//       }
//     };

//     fetchData();

//     // No return statement or cleanup needed with useEffect
//   }, [url, currentUser]);

//   return [loading, error, data, fetchData];
// };

// export default useDataFetching;

import { useState, useEffect, useContext, useCallback } from "react";
import api from "../utils/api";
import { UserContext } from "../context/UserContext";

const useDataFetching = (initialUrl) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const { currentUser } = useContext(UserContext);
  const [error, setError] = useState("");
  const [url, setUrl] = useState(initialUrl);

  const fetchData = useCallback(
    async (newUrl = url) => {
      if (!newUrl || typeof newUrl !== "string" || !newUrl.trim()) {
        setError("Missing API endpoint");
        return;
      }

      const token = currentUser?.data?.token || currentUser?.token;
      try {
        setLoading(true);
        setError("");
        const response = await api.get(newUrl, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    },
    [url, currentUser]
  );

  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [fetchData]);

  const refetch = useCallback(
    (newUrl) => {
      const targetUrl = newUrl || url;
      if (!targetUrl || typeof targetUrl !== "string" || !targetUrl.trim()) {
        setError("Missing API endpoint");
        return;
      }
      if (newUrl) {
        setUrl(newUrl);
      }
      fetchData(targetUrl);
    },
    [fetchData, url]
  );

  return [loading, error, data, refetch];
};

export default useDataFetching;
