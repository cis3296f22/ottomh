import Button from 'react-bootstrap/Button';
import { useState, useRef, useEffect } from 'react'


export const GamePageTimer = (setLoading, time_picked ) => {

    const Ref = useRef(null);
    const [timer, setTimer] = useState(time_picked);

    const split_time = time_picked.split(':',2);
    const minutes_picked = Number(split_time[0]) 
    const seconds_picked = Number(split_time[1])

    let full_time_seconds = minutes_picked*60
    full_time_seconds+=seconds_picked;


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
        
        if (minutes == 0 && seconds == 0){
            clearInterval(Ref.current)
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
        
        setTimer(time_picked);

        const id = setInterval(() => {

            startTimer(e);

        }, 1000)
       
        Ref.current = id;
        
    }
    

    const getDeadTime = () => {
        let deadline = new Date();
       
        deadline.setSeconds(deadline.getSeconds() + full_time_seconds);
        return deadline;
    }


    useEffect(() => {

        clearTimer(getDeadTime());      
    
    }, []);

    
  
    return (
        <div>
            <Button> Timer <h2>{timer}</h2> </Button>

        </div>
    )
}