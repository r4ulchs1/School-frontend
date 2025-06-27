import { useState } from "react"
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

function LoginPage(){
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e)=>{
        e.preventDefault();
        setError('');

        try {
            const response=await authService.login(email,password);
            console.log('logeo exitoso ',response);
            navigate('/dashboard');
        } catch (err) {
            console.error('Error al iniciar sesion: ',err);
            if(err.response && err.response.data && err.response.data.message){
                setError(err.response.data.message);
            }else{
                setError('Error al iniciar sesion. Revise sus datos');
            }
        }
    }

    return(
        <div>
            <h2>Iniciar Sesion</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Usuario:</label>
                    <input type="text" id="email" value={email} onChange={(e)=>setEmail(e.target.value)} required/>
                    <input type="text" id="password" value={password} onChange={(e)=>setPassword(e.target.value)} required/>
                </div>
                {error && <p>{error}</p>}
                <button type="submit">Entrar</button>
            </form>
        </div>
    )
}

export default LoginPage;