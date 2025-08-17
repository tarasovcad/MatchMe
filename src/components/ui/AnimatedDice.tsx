"use client";

import React, {useEffect, useState} from "react";
import {Dice1, Dice2, Dice3, Dice4, Dice5, Dice6} from "lucide-react";

export default function AnimatedDice({
  size = 16,
  isRolling = false,
}: {
  size?: number;
  isRolling?: boolean;
}) {
  const [currentDice, setCurrentDice] = useState(1);
  const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setCurrentDice(Math.floor(Math.random() * 6) + 1);
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        setCurrentDice(Math.floor(Math.random() * 6) + 1);
      }, 500);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [isRolling]);

  const DiceIcon = diceIcons[currentDice - 1];

  return (
    <DiceIcon
      size={size}
      className={`transition-transform duration-100 ${isRolling ? "animate-spin" : ""}`}
    />
  );
}
