import { STAR_POINTS } from "@/utils/constants";
import { CellValue } from "@/utils/types";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

interface CellProps {
  r: number;
  c: number;
  value: CellValue;
  isLastMove: boolean;
  cellSize: number; // Thêm prop này để tính toán dynamic
  onClick: () => void;
}

const Cell: React.FC<CellProps> = React.memo(
  ({ r, c, value, isLastMove, cellSize, onClick }) => {
    const isStar = STAR_POINTS.some(([sr, sc]) => sr === r && sc === c);

    // Tính toán kích thước quân cờ dựa trên kích thước ô
    const stoneSize = cellSize * 0.9;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onClick}
        style={[styles.cell, { width: cellSize, height: cellSize }]}
      >
        {/* Kẻ đường ngang dọc */}
        <View style={styles.lineH} />
        <View style={styles.lineV} />

        {/* Điểm sao (Hoshi) */}
        {!value && isStar && <View style={styles.hoshi} />}

        {/* Quân cờ */}
        {value && (
          <View
            style={[
              styles.stone,
              value === "black" ? styles.blackStone : styles.whiteStone,
              {
                width: stoneSize,
                height: stoneSize,
                borderRadius: stoneSize / 2,
              },
            ]}
          >
            {/* Đánh dấu nước đi cuối */}
            {isLastMove && (
              <View
                style={[
                  styles.lastMove,
                  {
                    borderColor:
                      value === "black"
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(0,0,0,0.7)",
                  },
                ]}
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  }
);

Cell.displayName = "Cell";

const styles = StyleSheet.create({
  cell: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  lineH: {
    position: "absolute",
    width: "100%",
    height: 1,
    backgroundColor: "#5e4018",
    zIndex: 0,
  },
  lineV: {
    position: "absolute",
    height: "100%",
    width: 1,
    backgroundColor: "#5e4018",
    zIndex: 0,
  },
  hoshi: {
    width: "20%",
    height: "20%",
    backgroundColor: "#5e4018",
    borderRadius: 50,
    zIndex: 1,
  },
  stone: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3, // Bóng đổ cho Android
  },
  blackStone: {
    backgroundColor: "#111", // React Native ko hỗ trợ radial-gradient native tốt, dùng màu đơn giản hoặc thư viện SVG
    borderWidth: 1,
    borderColor: "#000",
  },
  whiteStone: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  lastMove: {
    width: "40%",
    height: "40%",
    borderWidth: 2,
    borderRadius: 50,
  },
});

export default Cell;
