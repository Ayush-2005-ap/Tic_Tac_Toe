import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { useState, useRef, useEffect } from "react";

export default function HomeScreen() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [isXTurn, setIsXTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);

  // 🔥 Animation values
  const scaleAnim = useRef(Array(9).fill(0).map(() => new Animated.Value(1))).current;
  const winAnim = useRef(new Animated.Value(0)).current;

  const checkWinner = (newBoard: string[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (let [a, b, c] of lines) {
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      ) {
        setWinner(newBoard[a]);
        animateWinner();
        return;
      }
    }

    if (!newBoard.includes("")) {
      setWinner("Draw");
      animateWinner();
    }
  };

  // 🎯 Winner animation
  const animateWinner = () => {
    winAnim.setValue(0);
    Animated.spring(winAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  // ✨ Cell press animation
  const animateCell = (index: number) => {
    Animated.sequence([
      Animated.timing(scaleAnim[index], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim[index], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePress = (index: number) => {
    if (board[index] || winner) return;

    animateCell(index);

    const newBoard = [...board];
    newBoard[index] = isXTurn ? "X" : "O";

    setBoard(newBoard);
    setIsXTurn(!isXTurn);
    checkWinner(newBoard);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(""));
    setIsXTurn(true);
    setWinner(null);
    winAnim.setValue(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tic Tac Toe</Text>

      {/* 🎯 Animated Status */}
      <Animated.Text
        style={[
          styles.turnText,
          {
            transform: [
              {
                scale: winAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.2],
                }),
              },
            ],
            opacity: winAnim,
          },
        ]}
      >
        {winner
          ? winner === "Draw"
            ? "It's a Draw!"
            : `Winner: ${winner}`
          : `Turn: ${isXTurn ? "X" : "O"}`}
      </Animated.Text>

      {/* 🎮 Game Board */}
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

      {/* 🔄 Reset Button */}
      <TouchableOpacity style={styles.resetBtn} onPress={resetGame}>
        <Text style={styles.resetText}>Restart Game</Text>
      </TouchableOpacity>
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
  turnText: {
    fontSize: 18,
    marginBottom: 20,
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
