import Board from "@/components/Board";
import { BOARD_SIZE } from "@/utils/constants";
import {
  getBestMove,
  hasAnyValidMoves,
  tryPlaceStone,
} from "@/utils/gameLogic";
import { BoardState, Player } from "@/utils/types";
import { Button, Provider, Toast } from "@ant-design/react-native"; // Antd Components
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Import font nếu cần thiết cho Antd, ở đây dùng Provider mặc định

const App: React.FC = () => {
  // --- STATE (Giống hệt ReactJS) ---
  const [board, setBoard] = useState<BoardState>(
    Array(BOARD_SIZE)
      .fill(null)
      .map(() => Array(BOARD_SIZE).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>("black");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState<[number, number] | null>(null);
  const [prisoners, setPrisoners] = useState({ black: 0, white: 0 });
  const [koPos, setKoPos] = useState<string | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  // --- GAME OVER HANDLER ---
  const handleGameOver = (winningPlayer: Player) => {
    setWinner(winningPlayer);
    setIsAiThinking(false);

    const title = winningPlayer === "black" ? "CHIẾN THẮNG!" : "THẤT BẠI";
    const msg =
      winningPlayer === "black"
        ? "Chúc mừng! Bạn đã chiến thắng máy."
        : "Bạn đã hết nước đi hoặc máy đã thắng.";

    Alert.alert(title, msg, [{ text: "Chơi ván mới", onPress: resetGame }]);
  };

  // --- GAME LOGIC (Giống hệt ReactJS) ---
  const handlePlayerMove = (r: number, c: number) => {
    if (winner || isAiThinking || board[r][c] !== null) return;

    const result = tryPlaceStone(r, c, board, "black", koPos);

    if (!result.isValid) {
      if (result.message) {
        // Dùng Toast của Antd Mobile thay cho notification
        Toast.info(result.message, 1);
      }
      return;
    }

    if (result.newBoard) {
      const newBoard = result.newBoard;
      const nextKo = result.nextKoPos ?? null;

      setBoard(newBoard);
      setKoPos(nextKo);
      setLastMove([r, c]);
      setPrisoners((p) => ({
        ...p,
        black: p.black + (result.capturedCount || 0),
      }));

      const aiCanMove = hasAnyValidMoves(newBoard, "white", nextKo);
      if (!aiCanMove) {
        handleGameOver("black");
        return;
      }

      setCurrentPlayer("white");
      setIsAiThinking(true);
    }
  };

  const processAiTurn = useCallback(() => {
    if (winner) return;

    // setTimeout để giả lập thời gian suy nghĩ và không block UI
    setTimeout(() => {
      const move = getBestMove(board, "white", koPos);

      if (!move) {
        Toast.info("AI đã đầu hàng!", 1);
        handleGameOver("black");
        return;
      }

      const [r, c] = move;
      const result = tryPlaceStone(r, c, board, "white", koPos);

      if (result.isValid && result.newBoard) {
        const newBoard = result.newBoard;
        const nextKo = result.nextKoPos ?? null;

        setBoard(newBoard);
        setKoPos(nextKo);
        setLastMove([r, c]);
        setPrisoners((p) => ({
          ...p,
          white: p.white + (result.capturedCount || 0),
        }));

        const humanCanMove = hasAnyValidMoves(newBoard, "black", nextKo);
        if (!humanCanMove) {
          handleGameOver("white");
        } else {
          setCurrentPlayer("black");
        }
      } else {
        setIsAiThinking(false);
        setCurrentPlayer("black");
      }
      setIsAiThinking(false);
    }, 100); // Giảm time xuống chút cho mượt trên mobile
  }, [board, koPos, winner]); // eslint-disable-line

  useEffect(() => {
    if (currentPlayer === "white" && isAiThinking && !winner) {
      processAiTurn();
    }
  }, [currentPlayer, isAiThinking, processAiTurn, winner]);

  const resetGame = () => {
    setBoard(
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => Array(BOARD_SIZE).fill(null))
    );
    setCurrentPlayer("black");
    setIsAiThinking(false);
    setLastMove(null);
    setPrisoners({ black: 0, white: 0 });
    setKoPos(null);
    setWinner(null);
  };

  // --- RENDER ---
  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Cờ Vây</Text>

          {/* Status Bar */}
          <View style={styles.statusCard}>
            <View
              style={[
                styles.playerRow,
                currentPlayer === "black" && styles.activeRow,
              ]}
            >
              <View style={[styles.avatar, styles.avBlack]}>
                <Text style={styles.avTextW}>B</Text>
              </View>
              <Text style={styles.playerText}>Bạn: {prisoners.black}</Text>
            </View>

            <View style={styles.turnInfo}>
              <Text style={styles.turnText}>
                {winner
                  ? "KẾT THÚC"
                  : currentPlayer === "black"
                  ? "Lượt bạn"
                  : "Máy nghĩ..."}
              </Text>
            </View>

            <View
              style={[
                styles.playerRow,
                currentPlayer === "white" && styles.activeRow,
              ]}
            >
              <Text style={styles.playerText}>Máy: {prisoners.white}</Text>
              <View style={[styles.avatar, styles.avWhite]}>
                <Text style={styles.avTextB}>W</Text>
              </View>
            </View>
          </View>

          {/* Board */}
          <View style={styles.boardWrapper}>
            <Board
              board={board}
              lastMove={lastMove}
              onCellClick={handlePlayerMove}
            />
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <Button type="primary" onPress={resetGame} style={styles.btn}>
              Ván mới
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4ecd8",
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: "LexendDeca_700Bold", // Thay thế Kanit
    color: "#5d4037",
    marginBottom: 20,
  },
  statusCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "90%",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 5,
    borderRadius: 8,
  },
  activeRow: {
    backgroundColor: "#fbe9e7",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  avBlack: { backgroundColor: "#333" },
  avWhite: { backgroundColor: "#fff" },
  avTextW: { color: "white", fontWeight: "bold", fontSize: 12 },
  avTextB: { color: "#333", fontWeight: "bold", fontSize: 12 },
  playerText: {
    fontFamily: "LexendDeca_500Medium",
    color: "#333",
    fontSize: 16,
  },
  turnInfo: {
    paddingHorizontal: 10,
  },
  turnText: {
    fontFamily: "LexendDeca_600SemiBold",
    fontSize: 18,
    color: "#8d6e63",
  },
  boardWrapper: {
    marginBottom: 30,
  },
  controls: {
    width: "90%",
    alignItems: "center",
    fontFamily: "LexendDeca_400Regular",
  },
  btn: {
    backgroundColor: "#8d6e63",
    borderColor: "#8d6e63",
    borderRadius: 25,
    width: 150,
    fontFamily: "LexendDeca_400Regular",
  },
  defaultText: {
    fontFamily: "LexendDeca_400Regular",
  },
});

export default App;
