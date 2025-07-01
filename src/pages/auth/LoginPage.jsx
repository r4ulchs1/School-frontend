import React, { useState } from "react"
// import { useNavigate } from "react-router-dom";
// import authService from "../../services/authService";
import { useAuth } from "../../contexts/AuthContext";

function LoginPage(){
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error, setError] = useState('');

    const {login}= useAuth();


    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError('');
        try {
            const response=await login(email,password);
            console.log('logeo exitoso ',response);
        } catch (err) {
            if(err.response && err.response.data && err.response.data.message){
                setError(err.response.data.message);
            }else{
                setError('Error al iniciar sesion. Revise sus datos');
            }
            
        console.log(err)
        }
    };

    return(
        <div>
            <h2>Iniciar Sesion</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Usuario (email):</label>
                    <input type="email"
                            id="email"
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                            required
                    />
                    <input type="password"
                            id="password"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            required
                    />
                </div>
                {error && <p>{error}</p>}
                <button type="submit">Entrar</button>
            </form>
        </div>
    )
}

export default LoginPage;