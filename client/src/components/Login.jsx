import React from 'react'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Login = () => {

    const { setShowLogin, axios, setToken, navigate } = useAppContext()

    const [state, setState] = React.useState("login");
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [errors, setErrors] = React.useState({});
    const [loading, setLoading] = React.useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (state === "register") {
            if (!name.trim()) {
                newErrors.name = "Name is required";
            } else if (name.length < 2) {
                newErrors.name = "Name must be at least 2 characters";
            }
        }

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!email.includes('@')) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 4) {
            newErrors.password = "Password must be at least 4 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmitHandler = async (event) => {
        try {
            event.preventDefault();

            if (!validateForm()) {
                return;
            }

            setLoading(true);
            const { data } = await axios.post(`/api/user/${state}`, { name, email, password })

            if (data.success) {
                navigate('/')
                setToken(data.token)
                localStorage.setItem('token', data.token)
                setShowLogin(false)
                toast.success(state === "login" ? "Login successful!" : "Account created successfully!")
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false);
        }

    }

    return (
        <div onClick={() => setShowLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-100 flex items-center text-sm text-gray-600 bg-black/50'>

            <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white">
                <p className="text-2xl font-medium m-auto">
                    <span className="text-primary">User</span> {state === "login" ? "Login" : "Sign Up"}
                </p>
                {state === "register" && (
                    <div className="w-full">
                        <p className="text-sm font-medium mb-1">Name</p>
                        <input
                            onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) setErrors({ ...errors, name: '' });
                            }}
                            value={name}
                            placeholder="Enter Name"
                            className={`border rounded w-full p-2 mt-1 outline-none transition ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-primary'
                                }`}
                            type="text"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                )}
                <div className="w-full">
                    <p className="text-sm font-medium mb-1">Email</p>
                    <input
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        value={email}
                        placeholder="Enter Email"
                        className={`border rounded w-full p-2 mt-1 outline-none transition ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-primary'
                            }`}
                        type="email"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="w-full">
                    <p className="text-sm font-medium mb-1">Password</p>
                    <input
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: '' });
                        }}
                        value={password}
                        placeholder="Enter Password"
                        className={`border rounded w-full p-2 mt-1 outline-none transition ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-primary'
                            }`}
                        type="password"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
                {state === "register" ? (
                    <p className="text-sm text-gray-600">
                        Already have account? <span onClick={() => { setState("login"); setErrors({}); }} className="text-primary cursor-pointer font-medium">click here</span>
                    </p>
                ) : (
                    <p className="text-sm text-gray-600">
                        Create an account? <span onClick={() => { setState("register"); setErrors({}); }} className="text-primary cursor-pointer font-medium">click here</span>
                    </p>
                )}
                <button
                    disabled={loading}
                    className="bg-primary hover:bg-blue-800 disabled:bg-blue-400 transition-all text-white w-full py-2 rounded-md cursor-pointer font-medium"
                >
                    {loading ? "Processing..." : state === "register" ? "Create Account" : "Login"}
                </button>
            </form>
        </div>
    )
}

export default Login
