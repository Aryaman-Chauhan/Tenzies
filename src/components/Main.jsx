import GameText from './GameText'
import Die from './Die'
import { useState, useRef, useEffect } from 'react'
import { nanoid } from 'nanoid'
import Confetti from 'react-confetti'

function generateAllNewDice() {
    return new Array(10)
        .fill({value:0, isHeld:false})
        .map((die) => {
            return {
                ...die,
                id: nanoid(),
                value: Math.ceil(Math.random() * 6)
            }
        });
}

export default function Main () {

    // get the values of best roll and best time from local storage. If it's not there yet then set it to null
    const [bestRoll, setBestRoll] = useState(
        parseFloat(localStorage.getItem('best-roll')) || "N/A",
    );
    const [bestTime, setBestTime] = useState(
        parseFloat(localStorage.getItem('best-time')) || "N/A",
    );

    // save bestRoll in local storage, update it every time its value changes
    useEffect(() => {
        localStorage.setItem('best-roll', bestRoll);
    }, [bestRoll]);

    // save bestTime in local storage, update it every time its value changes
    useEffect(() => {
        localStorage.setItem('best-time', bestTime);
    }, [bestTime]);
    
    const [dice, setDice] = useState(() => generateAllNewDice());
    const buttonFocus = useRef(null);
    const [gameTime, setGameTime] = useState();
    const [numOfRolls, setNumOfRolls] = useState(1);
    const [startTimer, setStartTimer] = useState(new Date());
    let gameWon = dice.every(die => die.isHeld) && dice.every(die => die.value === dice[0].value);
    
    function endGame() {
        const endTimer = new Date();
        const timeDifference = endTimer.getTime() - startTimer.getTime();
        setGameTime(timeDifference);
        if (bestTime === 'N/A' || bestTime > timeDifference) {
            setBestTime(timeDifference);
        }
        if (bestRoll === 'N/A' || bestRoll > numOfRolls) {
            setBestRoll(numOfRolls);
        }
    }

    useEffect(() => {
        if(gameWon){
            buttonFocus.current.focus();
            endGame();
        }
    }, [gameWon]);

    const bestTimeInSeconds = parseFloat((bestTime / 1000).toFixed(2));
    const gameTimeInSeconds = parseFloat((gameTime / 1000).toFixed(2));
    
    function handleHold(index) {
        if(!gameWon){
            setDice((prevDice) => {
                return prevDice.map((die) => {
                    if (die.id === index) {
                        return {
                            ...die,
                            isHeld: !die.isHeld
                        };
                    }
                    return die;
                });
            });
        }
    }

    function handleRoll() {
        gameWon ? startNewGame(): rollDice();
    }

    function startNewGame() {
        setDice(() => generateAllNewDice());
        setNumOfRolls(1);
        setStartTimer(new Date());
    }

    function rollDice() {
        if (!gameWon) {
            setDice((prevDice) => {
                return prevDice.map((dice) => {
                    if (!dice.isHeld) {
                        return {
                            ...dice,
                            value: Math.ceil(Math.random() * 6)
                        };
                    }
                    return dice;
                })
            });
            setNumOfRolls((prevNum) => prevNum + 1);
        } else {
            startNewGame();
        }
    }

    const diceList = dice.map((die) => {
        return <Die 
            key={die.id} 
            value={die.value} 
            handleHold={() => {handleHold(die.id)}}
            isHeld={die.isHeld} 
        />
    })

    return (
        <main>
            {gameWon && <Confetti />}
            <div className="sr-only">
                {gameWon && <p>Congratulations! You Won! Press &quot;New Game&quot; to start again</p>}
            </div>
            <h1 className="title">{gameWon ? "🎉 You win! 🎉" : "Tenzies"}</h1>
            <GameText
                bestRoll={bestRoll}
                bestTimeInSeconds={bestTimeInSeconds}
                gameTimeInSeconds={gameTimeInSeconds}
                numOfRolls={numOfRolls}
                tenzies={gameWon}
            />
            <section className="dice-container">
                {diceList}  
            </section>
            <button ref={buttonFocus} className='roll-button' onClick={handleRoll}>{gameWon ? "New Game" : "Roll"}</button>
        </main>
    );
}