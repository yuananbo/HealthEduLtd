import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";
import { login } from "../../services/AuthServices";
import { loginFields } from "../../constants/formFields";
import { toast } from "react-hot-toast";
import Input from "../common/forms/Input";
import { FormExtra } from "../common/forms/FormExtra";
import FormAction from "../common/forms/FormAction";

const fields = loginFields;
let fieldsState = {};
fields.forEach((field) => (fieldsState[field.id] = ""));

export default function LoginForm({ API_ENDPOINT, place }) {
  const [loginState, setLoginState] = useState(fieldsState);
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginState({ ...loginState, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await authenticateUser();
    // console.log(loginState);
    setLoading(false);
  };

  // Handle Login API Integration here
  const authenticateUser = async () => {
    let loginFields = {
      email: loginState["email-address"],
      password: loginState["password"],
    };

    // console.log("Fields", loginFields.email, loginFields.password);

    try {
      const userData = await login(
        loginFields.email,
        loginFields.password,
        API_ENDPOINT
      );
      if (userData) {
        setCurrentUser(userData);
        toast.success("Logged in successfully");

        if (userData.data.user.userType === "patient") {
          navigate("/patient/", { replace: true });
        }
        if (userData.data.user.userType === "therapist") {
          navigate("/therapist/", { replace: true });
        }
      } else {
        toast.error("Login failed");
      }
    } catch (err) {
      if (!err.message || !err.message.includes("Login failed")) {
        if (err.response) {
          toast.error(`Login failed: ${err.response.data.message}`);
        } else {
          toast.error("An error occurred. Please try again later.");
        }
      }
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="-space-y-px">
        {fields.map((field) => (
          <Input
            customClass="mb-5"
            key={field.id}
            handleChange={handleChange}
            value={loginState[field.id]}
            labelText={field.labelText}
            labelFor={field.labelFor}
            id={field.id}
            name={field.name}
            type={field.type}
            isRequired={field.isRequired}
            placeholder={field.placeholder}
          />
        ))}
      </div>

      <FormExtra goTo={place} />
      <FormAction
        handleSubmit={handleSubmit}
        text={loading ? "Loading..." : "Login"}
        disabled={loading ? true : false}
      />
    </form>
  );
}
