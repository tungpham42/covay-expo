import { BOARD_SIZE } from "@/utils/constants";
import { BoardState } from "@/utils/types";
import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Cell from "./Cell";

interface BoardProps {
  board: BoardState;
  lastMove: [number, number] | null;
  onCellClick: (r: number, c: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, lastMove, onCellClick }) => {
  // Tính toán kích thước bàn cờ dynamic theo màn hình
  const screenWidth = Dimensions.get("window").width;
  // Trừ padding 2 bên (ví dụ 20)
  const boardWidth = Math.min(screenWidth - 20, 600);
  const cellSize = boardWidth / BOARD_SIZE;

  return (
    <View
      style={[styles.boardContainer, { width: boardWidth, height: boardWidth }]}
    >
      {board.map((row, r) => (
        <View key={`row-${r}`} style={styles.row}>
          {row.map((cell, c) => (
            <Cell
              key={`${r}-${c}`}
              r={r}
              c={c}
              value={cell}
              cellSize={cellSize}
              isLastMove={
                lastMove ? lastMove[0] === r && lastMove[1] === c : false
              }
              onClick={() => onCellClick(r, c)}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    backgroundColor: "#dcb35c",
    padding: 2, // Viền gỗ bao ngoài
    borderWidth: 2,
    borderColor: "#5e4018",
    alignSelf: "center",
  },
  row: {
    flexDirection: "row",
  },
});

export default Board;
