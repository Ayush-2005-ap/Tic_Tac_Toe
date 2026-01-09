import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useState, useRef, useEffect } from "react";
import { Audio } from "expo-av";
import ConfettiCannon from "react-native-confetti-cannon";

export default function HomeScreen() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // 🏆 Score
  const [score, setScore] = useState({ X: 0, O: 0 });

  // 🎬 Animations
  const scaleAnim = useRef(Array(9).fill(0).map(() => new Animated.Value(1))).current;
  const scoreAnim = useRef(new Animated.Value(1)).current;

  // 🔊 Sounds
  const clickSound = useRef<Audio.Sound | null>(null);
  const winSound = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    loadSounds();
    return () => {
      unloadSounds().then(() => {});
    };
  }, []);

  const loadSounds = async () => {
    clickSound.current = new Audio.Sound();
    winSound.current = new Audio.Sound();

    await clickSound.current.loadAsync(
      require("../../assets/click.mp3")
    );
    await winSound.current.loadAsync(
      require("../../assets/win.mp3")
    );
  };

  const unloadSounds = async () => {
    await clickSound.current?.unloadAsync();
    await winSound.current?.unloadAsync();
  };

  const playClick = async () => {
    await clickSound.current?.replayAsync();
  };

  const playWin = async () => {
    await winSound.current?.replayAsync();
  };

  // 🤖 Simple AI (O plays)
  const aiMove = (currentBoard: string[]) => {
    const emptyIndexes = currentBoard
      .map((v, i) => (v === "" ? i : null))
      .filter(v => v !== null) as number[];
  
    if (emptyIndexes.length === 0 || winner) return;
  
    const randomIndex =
      emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
  
    const newBoard = [...currentBoard];
    newBoard[randomIndex] = "O";
  
    setBoard(newBoard);
  
    checkWinner(newBoard);
  };
  

  const checkWinner = (newBoard: string[]) => {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6],
    ];
  
    for (let [a,b,c] of lines) {
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      ) {
        setWinner(newBoard[a]);
        onWin(newBoard[a]);
        return newBoard[a];   // 👈 return winner
      }
    }
  
    if (!newBoard.includes("")) {
      setWinner("Draw");
      return "Draw";
    }
  
    return null;
  };
  

  const onWin = async (player: string) => {
    setShowConfetti(true);
    playWin();

    setScore(prev => ({
      ...prev,
      [player]: prev[player as "X" | "O"] + 1,
    }));

    animateScore();
  };

  const animateScore = () => {
    Animated.sequence([
      Animated.timing(scoreAnim, {
        toValue: 1.3,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scoreAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateCell = (index: number) => {
    Animated.sequence([
      Animated.timing(scaleAnim[index], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim[index], {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = (index: number) => {
    if (board[index] || winner) return;
  
    playClick();
    animateCell(index);
  
    const newBoard = [...board];
    newBoard[index] = "X";
  
    setBoard(newBoard);
  
    // check if player won
    const result = checkWinner(newBoard);
    if (result) return;
  
    // 🤖 AI MOVE after small delay
    setTimeout(() => {
      aiMove(newBoard);
    }, 600);
  };
  

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setWinner(null);
    setIsXTurn(true);
    setShowConfetti(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic Tac Toe</Text>

      {/* 🏆 Scoreboard */}
      <Animated.View style={[styles.scoreBox, { transform: [{ scale: scoreAnim }] }]}>
        <Text style={styles.scoreText}>X: {score.X}</Text>
        <Text style={styles.scoreText}>O: {score.O}</Text>
      </Animated.View>

      <Text style={styles.turnText}>
        {winner
          ? winner === "Draw"
            ? "It's a Draw!"
            : `Winner: ${winner}`
          : `Turn: ${isXTurn ? "X" : "O"} (You: X, AI: O)`}
      </Text>

      {/* 🎮 Board */}
      <View style={styles.board}>
        {board.map((value, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cellWrapper}
            onPress={() => handlePress(index)}
            activeOpacity={0.7}
          >
            <Animated.View
              style={[
                styles.cell,
                { transform: [{ scale: scaleAnim[index] }] },
              ]}
            >
              <Text style={styles.cellText}>{value}</Text>
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔄 Reset */}
      <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
        <Text style={styles.resetText}>Restart</Text>
      </TouchableOpacity>

      {/* 🎉 Confetti */}
      {showConfetti && (
        <ConfettiCannon
          count={150}
          origin={{ x: 200, y: 0 }}
          fadeOut
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF5E6",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#9A4020",
  },
  scoreBox: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  turnText: {
    fontSize: 16,
    marginBottom: 15,
  },
  board: {
    width: 300,
    height: 300,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cellWrapper: {
    width: "33.33%",
    height: "33.33%",
  },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  cellText: {
    fontSize: 36,
    fontWeight: "bold",
  },
  resetBtn: {
    marginTop: 25,
    backgroundColor: "#9A4020",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  resetText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
