import Button from 'react-bootstrap/Button';
import { useState, useRef, useEffect } from 'react'
import './GamePageTimer.css';

export const GamePageTimer = (setLoading) => {

    const Ref = useRef(null);
    const [isStart, setIsStart] = useState(false);
    const [timer, setTimer] = useState('00:60');

   const getTimeRemaining = (e) => {
        const total = Date.parse(e) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        return {
            total, minutes, seconds
        };
    }
  
    const startTimer = (e) => {
        let { total, minutes, seconds} 
                    = getTimeRemaining(e);
        if(seconds === 0){
            setLoading(false)
           
        }            
        if (total >= 0) {
            setTimer(
                (minutes > 9 ? minutes : '0' + minutes) + ':'
                + (seconds > 9 ? seconds : '0' + seconds)
            )
        }
    }
   
    
    const clearTimer = (e) => { 
        setTimer('00:60');
        if (Ref.current) clearInterval(Ref.current);

        const id = setInterval(() => {
            startTimer(e);
            
            
        }, 1000)
        
        Ref.current = id;
    }
    

    const getDeadTime = () => {
        let deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 60);
        return deadline;
    }


    useEffect(() => {
        if (isStart){
            clearTimer(getDeadTime());
        }
    }, [isStart]);


  
    return (
        <div>
            <Button onClick={() => setIsStart(true)}>Start Timer <h2>{timer}</h2> </Button>

        </div>
    )

}

